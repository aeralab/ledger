import type { Transaction } from "../types";
import { getCategory, getPaymentMethod } from "../types";
import { formatShortDate } from "../utils";

export function TransactionItem({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete?: () => void;
}) {
  const cat = getCategory(tx.category);
  const pay = getPaymentMethod(tx.paymentMethod);

  return (
    <div className="tx-item">
      <div className="tx-item__icon" style={{ background: `${pay.color}18` }}>
        {cat.icon}
      </div>
      <div className="tx-item__main">
        <div className="tx-item__title">{tx.note || cat.label}</div>
        <div className="tx-item__meta">
          <span className="pay-badge" style={{ background: pay.color }}>{pay.icon}</span>
          {cat.label} · {formatShortDate(tx.date)}
          {tx.source === "import" && " · 导入"}
          {tx.source === "voice" && " · 语音"}
          {tx.source === "image" && " · 图片"}
        </div>
      </div>
      <div className="tx-item__amount">-¥{tx.amount.toFixed(2)}</div>
      {onDelete && (
        <button onClick={onDelete} style={{ color: "var(--text-muted)", fontSize: "1.125rem", padding: "0 4px" }}>×</button>
      )}
    </div>
  );
}

function ProgressBar({ percent, label, spent, budget }: { percent: number; label: string; spent: number; budget: number }) {
  const cls = percent > 100 ? "over" : percent > 80 ? "warn" : "ok";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
        <span>{label}</span>
        <span style={{ color: "var(--text-muted)" }}>¥{spent.toFixed(0)} / ¥{budget.toFixed(0)}</span>
      </div>
      <div className="progress">
        <div className={`progress__fill progress__fill--${cls}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

export { ProgressBar };
