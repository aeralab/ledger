const assert = {
  equal(actual: unknown, expected: unknown) { if (actual !== expected) throw Error(`Expected ${expected}, got ${actual}`); },
  throws(fn: () => unknown) { let threw = false; try { fn(); } catch { threw = true; } if (!threw) throw Error("Expected rejection"); },
};
import { parseCapture } from "./capture";
const now = new Date(2026, 9, 24, 12);
const voice = parseCapture("昨天午饭三十五元，微信支付", "voice", now);
assert.equal(voice[0].amount, 35);
assert.equal(voice[0].date, "2026-10-23");
assert.equal(voice[0].category, "food");
assert.equal(voice[0].paymentMethod, "wechat");
assert.equal(voice[0].source, "voice");
assert.equal(parseCapture("咖啡二十五块五", "voice", now)[0].amount, 25.5);
assert.equal(parseCapture("房租两千元", "voice", now)[0].amount, 2000);
const multiple = parseCapture("午饭35元然后打车28元", "voice", now);
assert.equal(multiple.length, 2);
assert.equal(multiple[1].category, "transport");
assert.equal(parseCapture("微信支付\n餐饮\n原价 ¥40.00\n实付金额\n￥35.00\n2026-10-23 12:10", "image", now)[0].amount, 35);
assert.equal(parseCapture("支付成功\n房租\n实付 ￥1,250.50", "image", now)[0].amount, 1250.5);
assert.throws(() => parseCapture("订单号202610240001\n2026-10-24", "image", now));
assert.throws(() => parseCapture("退款成功 ￥30", "image", now));
assert.throws(() => parseCapture("实付 ￥10\n实付 ￥20", "image", now));
assert.throws(() => parseCapture("午饭0元", "voice", now));
assert.throws(() => parseCapture("午饭35元 2026-02-31", "voice", now));
assert.throws(() => parseCapture("", "voice", now));
console.log("Capture checks passed: Chinese amounts, multiple expenses, dates, payment, receipt total, ambiguous amounts and unsupported transactions.");
