interface OcrWorker {
  recognize(image: File): Promise<{ data: { text: string } }>;
  terminate(): Promise<unknown>;
}
interface OcrApi {
  createWorker(language: string, mode: number, options: { logger: (event: { status: string; progress: number }) => void }): Promise<OcrWorker>;
}
let loading: Promise<OcrApi> | undefined;
function loadOcr(): Promise<OcrApi> {
  if (!loading) loading = new Promise<OcrApi>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => { script.remove(); reject(Error("识别组件加载超时，请检查网络后重试。")); }, 30000);
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    script.onload = () => {
      clearTimeout(timer);
      const api = (window as unknown as { Tesseract?: OcrApi }).Tesseract;
      if (api) resolve(api); else reject(Error("识别组件不可用，请重试。"));
    };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(Error("无法加载图片识别组件，请检查网络。")); };
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
export async function recognizeReceipt(file: File, progress: (message: string) => void, signal: AbortSignal) {
  if (!/^image\/(png|jpeg|webp|bmp)$/.test(file.type)) throw Error("请选择 JPG、PNG、WebP 或 BMP 图片。");
  if (file.size > 15 * 1024 * 1024) throw Error("图片请控制在 15MB 以内。");
  const api = await loadOcr();
  if (signal.aborted) throw Error("已取消识别");
  progress("正在准备中文识别，首次使用需要下载语言包…");
  const worker = await api.createWorker("chi_sim+eng", 1, { logger: e => {
    if (!signal.aborted && e.status === "recognizing text") progress(`正在识别图片 ${Math.round(e.progress * 100)}%`);
  } });
  const cancel = () => { void worker.terminate(); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    if (signal.aborted) throw Error("已取消识别");
    const result = await worker.recognize(file);
    if (!result.data.text.trim()) throw Error("没有读到文字，请换一张清晰图片。");
    return result.data.text;
  } finally {
    signal.removeEventListener("abort", cancel);
    await worker.terminate().catch(() => {});
  }
}
