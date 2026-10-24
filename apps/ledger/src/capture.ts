import type { Transaction } from "./types";
import { formatDate, inferCategory, inferPaymentMethod } from "./utils";

export type CaptureDraft = Omit<Transaction, "id" | "createdAt">;
function chineseNumber(text: string): number {
  const digits: Record<string, number> = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const [whole, fraction = ""] = text.split("点");
  let total = 0, section = 0, digit = 0;
  for (const c of whole) {
    if (c in digits) digit = digits[c];
    else if (c === "万") { total += (section + digit) * 10000; section = digit = 0; }
    else { section += (digit || 1) * ({ 十: 10, 百: 100, 千: 1000 }[c] || 0); digit = 0; }
  }
  return total + section + digit + Number("0." + [...fraction].map(c => digits[c] ?? c).join(""));
}
function normalized(text: string) {
  return text.replace(/([零〇一二两三四五六七八九十百千万点]+)(?=元|块)/g, (_, n: string) => String(chineseNumber(n)))
    .replace(/(\d+)块([一二两三四五六七八九]|\d)(?:毛)?/g, (_, n: string, d: string) => `${n}.${/[0-9]/.test(d) ? d : chineseNumber(d)}元`)
    .replace(/(\d+)元([一二两三四五六七八九]|\d)角/g, (_, n: string, d: string) => `${n}.${/[0-9]/.test(d) ? d : chineseNumber(d)}元`)
    .replace(/(?<=\d)[,，](?=\d{3}(?:\D|$))/g, "");
}
function dateOf(text: string, now: Date) {
  const m = text.match(/(20\d{2})[-/年](\d{1,2})[-/月](\d{1,2})日?/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) throw Error("日期无法识别，请调整后重试。");
    return formatDate(d);
  }
  const d = new Date(now);
  if (text.includes("前天")) d.setDate(d.getDate() - 2);
  else if (text.includes("昨天")) d.setDate(d.getDate() - 1);
  return formatDate(d);
}
export function parseCapture(text: string, source: "voice" | "image", now = new Date()): CaptureDraft[] {
  const t = normalized(text);
  if (/退款|退回|收入|工资|收款|转账|转入|转出|待支付|支付失败|已关闭/.test(t)) {
    throw Error("检测到收入、退款、转账或未完成交易，请核对交易类型。本版自动记账仅支持已完成的消费支出。");
  }
    const clauses = t.split(/[，,；;。\n]|然后|还有/).map(s => s.trim()).filter(Boolean);
  const parts: string[] = [];
  if (source === "image") parts.push(t);
  else for (const clause of clauses) {
    if (parts.length && !/[¥￥]|\d+(?:\.\d+)?\s*(?:元|块)|(?:花了?|付了?|消费了?|买了?)\s*\d/.test(clause)) parts[parts.length - 1] += "，" + clause;
    else parts.push(clause);
  }
  if (!parts.length) throw Error("没有听到消费内容，请再说一次。");
  return parts.map(part => {
    const amountPattern = "(\\d+(?:\\.\\d{1,2})?)(?![\\d.])";
    const totals = [...part.matchAll(new RegExp("(?:实付|实付款|实际支付|实际付款|合计|总计|支付金额|付款金额|支出金额|金额)[^\\d]{0,12}[¥￥]?\\s*" + amountPattern, "g"))];
    const money = [...part.matchAll(new RegExp("[¥￥]\\s*-?\\s*" + amountPattern + "|" + amountPattern + "\\s*(?:元|块)", "g"))];
    const candidates = totals.length ? totals.map(m => +m[1]) : money.map(m => +(m[1] || m[2]));
    if (!candidates.length && source === "voice") {
      const spoken = part.match(new RegExp("(?:花了?|付了?|消费了?|买了?)\\s*" + amountPattern));
      if (spoken) candidates.push(+spoken[1]);
    }
    const unique = [...new Set(candidates)];
    if (unique.length !== 1 || !Number.isFinite(unique[0]) || unique[0] <= 0 || unique[0] > 10000000) {
      throw Error(unique.length > 1 ? "识别到多个不同金额，请每次上传一笔消费的截图或小票，语音中用“然后”分开每笔。" : "没有识别到明确金额，请说出“午饭花了三十五元”，或上传包含实付金额的清晰图片。");
    }
    return { amount: unique[0], category: inferCategory(part), paymentMethod: inferPaymentMethod(part), note: part.trim().slice(0, 160), date: dateOf(part, now), source };
  });
}
