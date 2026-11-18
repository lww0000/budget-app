
export type PlanType = 'FREE' | 'PRO' | 'PREMIUM';

export type TransactionType = 'income' | 'expense' | 'bill';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
  isRecurring?: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  plan: PlanType;
  trialEndsAt: string | null; // ISO Date string
  joinedAt: string;
  nameChangeCount: number;
  deletedAt?: string | null; // Track when account was deleted
  notificationsEnabled: boolean;
}

export interface ThemeColors {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
}

export interface Theme {
  id: string;
  name: string;
  primaryColors: ThemeColors;
  accentColors: ThemeColors;
  isDark: boolean;
  requiredPlan: PlanType;
}

export interface WidgetConfig {
  id: string;
  type: 'summary' | 'incomeChart' | 'expenseChart' | 'transactions' | 'bills' | 'savings' | 'planStatus';
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  visible?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppState {
  isDemo: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  transactions: Transaction[];
  theme: string; // Theme ID
  widgets: WidgetConfig[];
  notifications: AppNotification[];
  incomeSources: string[];
  expenseCategories: string[];
}