import { useEffect, useRef, useState } from "react";
import type { CaptureDraft } from "../capture";
import { parseCapture } from "../capture";
import { recognizeReceipt } from "../receiptOcr";
import { CATEGORIES, PAYMENT_METHODS } from "../types";

interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function CaptureModal({ mode, onClose, onSave, onManual }: {
  mode: "voice" | "image"; onClose: () => void; onSave: (data: CaptureDraft) => unknown; onManual: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<CaptureDraft[]>([]);
  const speech = useRef<Recognition | null>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const saving = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (speech.current) {
        speech.current.onresult = speech.current.onerror = speech.current.onend = null;
        speech.current.abort();
      }
      controller.current?.abort();
    };
  }, []);
  function parse(value: string) {
    setText(value);
    try { setDrafts(parseCapture(value, mode)); setError(""); }
    catch (e) { setDrafts([]); setError((e as Error).message); }
  }
  function startVoice() {
    const w = window as SpeechWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) { setError("当前浏览器不支持语音识别，请使用 Chrome，或选择图片记账。"); return; }
    if (!window.isSecureContext) { setError("语音记账需要 HTTPS 或本机 localhost 地址。"); return; }
    setError(""); setDrafts([]); setText("");
    const recognition = new Constructor();
    speech.current = recognition;
    recognition.lang = "zh-CN"; recognition.continuous = false; recognition.interimResults = true;
    let finalText = "";
    recognition.onresult = e => {
      const results = Array.from(e.results);
      setText(results.map(r => r[0].transcript).join(""));
      finalText = results.filter(r => r.isFinal).map(r => r[0].transcript).join("");
    };
    recognition.onerror = e => {
      setError(({ "not-allowed": "请允许麦克风权限，再重新开始。", "no-speech": "没有听清，请再说一次。", network: "语音识别连接失败，请检查网络或使用图片记账。", "audio-capture": "没有找到可用麦克风。" } as Record<string, string>)[e.error] || "语音识别失败，请重试。");
    };
    recognition.onend = () => {
      if (!alive.current) return;
      setBusy(false); setStatus("");
      if (finalText.trim()) parse(finalText);
    };
    try { recognition.start(); setBusy(true); setStatus("正在聆听，说完后会自动识别…"); }
    catch { setBusy(false); setError("无法启动麦克风，请检查权限后重试。"); }
  }
  async function image(file?: File) {
    if (!file || busy) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError(""); setDrafts([]); setText(""); setStatus("正在加载图片识别…");
    try {
      const value = await recognizeReceipt(file, message => { if (alive.current) setStatus(message); }, abort.signal);
      if (alive.current && !abort.signal.aborted) parse(value);
    } catch (e) { if (alive.current && !abort.signal.aborted) setError((e as Error).message); }
    finally { if (alive.current) { setBusy(false); setStatus(""); } }
  }
  return <div className="modal-overlay" onClick={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={mode === "voice" ? "语音记账" : "图片记账"} onClick={e => e.stopPropagation()}>
      <div className="modal__header"><h2 className="modal__title">{mode === "voice" ? "语音记账" : "图片记账"}</h2><button className="chip" onClick={onClose}>关闭</button></div>
      <p className="notice">{mode === "voice" ? "例如：昨天午饭三十五元，微信支付。多笔消费用“然后”分开。" : "上传一笔已完成消费的小票或支付截图，自动提取实付金额并分类。图片在设备上识别，首次使用需联网下载识别组件。"}</p>
      {mode === "voice" ? <><button className="btn btn--primary" onClick={busy ? () => speech.current?.stop() : startVoice}>{busy ? "说完了，停止聆听" : "🎙 点击开始说话"}</button><p className="capture-hint">语音由浏览器识别服务处理，可能需要联网。</p></> :
        <label className="capture-upload">📷 {busy ? "识别中…" : "拍照或选择账单图片"}<input aria-label="上传账单图片" type="file" accept="image/png,image/jpeg,image/webp,image/bmp" disabled={busy} onChange={e => { void image(e.target.files?.[0]); e.target.value = ""; }} /></label>}
      <p role="status" aria-live="polite" className="capture-hint">{status}</p>
      {error && <p role="alert" className="capture-error">{error}</p>}
      {text && <details className="capture-hint"><summary>查看识别原文</summary><p style={{ whiteSpace: "pre-wrap" }}>{text}</p></details>}
      {drafts.length > 0 && <><p className="notice">已识别 {drafts.length} 笔支出，确认后记入账本。可直接调整识别结果。</p>
        {drafts.map((draft, index) => <div className="card stack" key={index}>
          <label>金额（元）<input className="input" type="number" min="0.01" step="0.01" value={draft.amount || ""} onChange={e => setDrafts(rows => rows.map((r, i) => i === index ? { ...r, amount: +e.target.value } : r))} /></label>
          <label>分类<select className="input" value={draft.category} onChange={e => setDrafts(rows => rows.map((r, i) => i === index ? { ...r, category: e.target.value as CaptureDraft["category"] } : r))}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></label>
          <label>支付方式<select className="input" value={draft.paymentMethod} onChange={e => setDrafts(rows => rows.map((r, i) => i === index ? { ...r, paymentMethod: e.target.value as CaptureDraft["paymentMethod"] } : r))}>{PAYMENT_METHODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
          <label>日期<input className="input" type="date" value={draft.date} onChange={e => setDrafts(rows => rows.map((r, i) => i === index ? { ...r, date: e.target.value } : r))} /></label>
          <label>备注<input className="input" value={draft.note} onChange={e => setDrafts(rows => rows.map((r, i) => i === index ? { ...r, note: e.target.value } : r))} /></label>
        </div>)}
        <button className="btn btn--primary" disabled={busy || drafts.some(d => !Number.isFinite(d.amount) || d.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(d.date))} onClick={() => { if (saving.current) return; saving.current = true; drafts.forEach(onSave); onClose(); }}>确认记入 {drafts.length} 笔</button>
      </>}
      <button className="btn btn--ghost" style={{ marginTop: 14 }} onClick={onManual} disabled={busy}>需要时手动记账</button>
    </section>
  </div>;
}
