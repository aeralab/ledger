export type PaymentMethod = "alipay" | "wechat" | "cash" | "card" | "other";
export type TransactionSource = "manual" | "import" | "voice" | "image";
export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "education"
  | "investment"
  | "other";

export type Page = "home" | "records" | "plan" | "invest";

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  paymentMethod: PaymentMethod;
  note: string;
  date: string; // YYYY-MM-DD
  source: TransactionSource;
  createdAt: string;
}

export interface BudgetPlan {
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

export interface SavingsGoal {
  targetAmount: number;
  currentAmount: number;
  monthlyTarget: number;
}

export interface AppSettings {
  monthlyIncome: number;
  totalSavings: number;
  budget: BudgetPlan;
  savingsGoal: SavingsGoal;
  setupComplete: boolean;
}

export interface AppState {
  settings: AppSettings;
  transactions: Transaction[];
}

export const STORAGE_KEY = "ledger-app-v1";

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "food", label: "餐饮", icon: "🍜" },
  { id: "transport", label: "交通", icon: "🚇" },
  { id: "shopping", label: "购物", icon: "🛍️" },
  { id: "housing", label: "住房", icon: "🏠" },
  { id: "utilities", label: "水电", icon: "💡" },
  { id: "entertainment", label: "娱乐", icon: "🎬" },
  { id: "health", label: "医疗", icon: "💊" },
  { id: "education", label: "教育", icon: "📚" },
  { id: "investment", label: "理财", icon: "📈" },
  { id: "other", label: "其他", icon: "📦" },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; color: string }[] = [
  { id: "alipay", label: "支付宝", icon: "支", color: "#1677FF" },
  { id: "wechat", label: "微信支付", icon: "微", color: "#07C160" },
  { id: "card", label: "银行卡", icon: "卡", color: "#6366f1" },
  { id: "cash", label: "现金", icon: "¥", color: "#787774" },
  { id: "other", label: "其他", icon: "·", color: "#9b9a97" },
];

export const NEEDS_CATEGORIES: Category[] = ["food", "transport", "housing", "utilities", "health"];
export const WANTS_CATEGORIES: Category[] = ["shopping", "entertainment", "education", "other"];

export function getCategory(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}

export function getPaymentMethod(id: PaymentMethod) {
  return PAYMENT_METHODS.find((p) => p.id === id)!;
}

export const DEFAULT_BUDGET: BudgetPlan = {
  needsPercent: 50,
  wantsPercent: 30,
  savingsPercent: 20,
};
