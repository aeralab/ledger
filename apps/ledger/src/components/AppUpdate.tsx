import { useEffect, useState } from "react";

export function AppUpdate() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let disposed = false;
    let lastChecked = 0;
    const changed = () => { if (!disposed) setAvailable(true); };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    const check = async () => {
      if (document.visibilityState !== "visible" || !navigator.onLine || Date.now() - lastChecked < 60000) return;
      lastChecked = Date.now();
      try {
        const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
        await registration?.update();
      } catch { /* Keep offline accounting available. */ }
    };
    void check();
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return <div className="app-update">
    <span>语音图片版 · 2026.10.24.2</span>
    <a href={import.meta.env.BASE_URL + "api/update/"}>{available ? "新版已就绪，点击更新" : "检查更新"}</a>
  </div>;
}
