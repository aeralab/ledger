import { CaptureModal } from "./components/CaptureModal";
import { useState } from "react";
import { AddTxModal, ImportModal } from "./components/Modals";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { InvestPage } from "./pages/InvestPage";
import { PlanPage } from "./pages/PlanPage";
import { RecordsPage } from "./pages/RecordsPage";
import { SetupPage } from "./pages/SetupPage";
import { useLedgerStore } from "./store";
import type { Page } from "./types";
import { updateSavingsGoal, suggestBudget } from "./finance";
import { parseBillImport } from "./utils";

export default function App() {
  const { state, setup, updateSettings, updateBudget, addTransaction, importTransactions, deleteTransaction } =
    useLedgerStore();
  const [page, setPage] = useState<Page>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<"voice" | "image" | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  if (!state.settings.setupComplete) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-header__title">智能记账</h1>
          <p className="app-header__subtitle">收支管理 · 预算规划 · 理财建议</p>
        </header>
        <main className="app-main">
          <SetupPage onComplete={setup} />
        </main>
      </div>
    );
  }

  const subtitles: Record<Page, string> = {
    home: "本月收支概览",
    records: "全部消费记录",
    plan: "预算与储蓄计划",
    invest: "个性化理财方案",
  };

  const handleImport = (text: string) => {
    const rows = parseBillImport(text);
    return importTransactions(rows);
  };

  const handleUpdateIncome = (n: number) => {
    const budget = suggestBudget(n);
    const savingsGoal = updateSavingsGoal(n, budget, state.settings.savingsGoal);
    updateSettings({ monthlyIncome: n, budget, savingsGoal });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-header__title">智能记账</h1>
        <p className="app-header__subtitle">{subtitles[page]}</p>
      </header>

      <main className="app-main">
        {page === "home" && <HomePage state={state} onCapture={setCaptureMode} />}
        {page === "records" && (
          <RecordsPage state={state} onDelete={deleteTransaction} onImportClick={() => setImportOpen(true)} />
        )}
        {page === "plan" && (
          <PlanPage
            settings={state.settings}
            transactions={state.transactions}
            onUpdateIncome={handleUpdateIncome}
            onUpdateSavings={(n) => updateSettings({ totalSavings: n })}
            onUpdateBudget={updateBudget}
          />
        )}
        {page === "invest" && <InvestPage settings={state.settings} transactions={state.transactions} />}
      </main>

      <button className="fab" onClick={() => setCaptureMode("voice")} aria-label="语音记账">🎙</button>
      <Navigation current={page} onChange={setPage} />

      {captureMode && <CaptureModal key={captureMode} mode={captureMode} onClose={() => setCaptureMode(null)} onSave={addTransaction} onManual={() => { setCaptureMode(null); setAddOpen(true); }} />}
      <AddTxModal open={addOpen} onClose={() => setAddOpen(false)} onSave={addTransaction} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
    </div>
  );
}
