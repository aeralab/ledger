import type { AppState } from "../types";
import { ProgressBar } from "../components/TransactionItem";
import { TransactionItem } from "../components/TransactionItem";
import { calcBudgetStatus } from "../finance";
import { formatMoney, isCurrentMonth } from "../utils";

export function HomePage({ state, onCapture }: { state: AppState; onCapture: (mode: "voice" | "image") => void }) {
  const status = calcBudgetStatus(state.settings, state.transactions);
  const monthTx = state.transactions
    .filter((t) => isCurrentMonth(t.date))
    .slice(0, 5);
  const spentPercent = status.income > 0 ? Math.round((status.spent / status.income) * 100) : 0;
  const alipaySpent = state.transactions
    .filter((t) => isCurrentMonth(t.date) && t.paymentMethod === "alipay")
    .reduce((s, t) => s + t.amount, 0);
  const wechatSpent = state.transactions
    .filter((t) => isCurrentMonth(t.date) && t.paymentMethod === "wechat")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fade-in">
      <div className="card">
        <div className="section-title">说一句，拍一张，自动记账</div>
        <div className="capture-actions">
          <button className="btn btn--primary" onClick={() => onCapture("voice")}>🎙 语音记账</button>
          <button className="btn btn--ghost" onClick={() => onCapture("image")}>📷 图片记账</button>
        </div>
        <p className="capture-hint">自动识别金额、日期和消费分类，确认即可入账。</p>
      </div>
      <div className="card card--accent">
        <div style={{ fontSize: "0.8125rem", opacity: 0.85 }}>本月支出</div>
        <div style={{ fontSize: "2rem", fontWeight: 700, margin: "4px 0" }}>¥{formatMoney(status.spent)}</div>
        <div style={{ fontSize: "0.8125rem", opacity: 0.85 }}>
          预算 ¥{formatMoney(status.income)} · 剩余 ¥{formatMoney(Math.max(0, status.remaining))}
        </div>
        <div className="progress" style={{ marginTop: 12, background: "rgba(255,255,255,0.25)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(spentPercent, 100)}%`,
              background: spentPercent > 90 ? "#ffb4b0" : "#fff",
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      <div className="card">
        <div className="section-title">预算执行</div>
        <ProgressBar label="必要支出" spent={status.needsSpent} budget={status.needsBudget} percent={status.needsPercent} />
        <ProgressBar label="弹性消费" spent={status.wantsSpent} budget={status.wantsBudget} percent={status.wantsPercent} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginTop: 8 }}>
          <span>本月储蓄</span>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>¥{formatMoney(status.savingsActual)}</span>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat__value" style={{ color: "#1677FF", fontSize: "0.9375rem" }}>¥{formatMoney(alipaySpent)}</div>
          <div className="stat__label">支付宝</div>
        </div>
        <div className="stat">
          <div className="stat__value" style={{ color: "#07C160", fontSize: "0.9375rem" }}>¥{formatMoney(wechatSpent)}</div>
          <div className="stat__label">微信</div>
        </div>
        <div className="stat">
          <div className="stat__value">¥{formatMoney(state.settings.totalSavings)}</div>
          <div className="stat__label">总储蓄</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="section-title">最近消费</div>
        {monthTx.length === 0 ? (
          <div className="empty" style={{ padding: "20px 0" }}>暂无记录，说一句消费或上传一张账单开始记账</div>
        ) : (
          monthTx.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
