import { Transaction, WidgetConfig, Theme } from './types';

export const THEMES: Theme[] = [
  // --- LIGHT THEMES ---
  { 
    id: 'ocean', 
    name: 'Ocean & Sky', 
    isDark: false, 
    requiredPlan: 'FREE',
    primaryColors: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1', // Indigo
      600: '#4f46e5',
      700: '#4338ca',
    },
    accentColors: {
      50: '#ecfeff',
      100: '#cffafe',
      500: '#06b6d4', // Cyan
      600: '#0891b2',
      700: '#0e7490',
    }
  },
  { 
    id: 'nature', 
    name: 'Nature & Water', 
    isDark: false, 
    requiredPlan: 'PRO',
    primaryColors: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#10b981', // Emerald
      600: '#059669',
      700: '#047857',
    },
    accentColors: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6', // Blue
      600: '#2563eb',
      700: '#1d4ed8',
    }
  },
  { 
    id: 'royal', 
    name: 'Royal & Rose', 
    isDark: false, 
    requiredPlan: 'PRO',
    primaryColors: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7', // Purple
      600: '#9333ea',
      700: '#7e22ce',
    },
    accentColors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      500: '#f43f5e', // Rose
      600: '#e11d48',
      700: '#be123c',
    }
  },

  // --- DARK THEMES ---
  { 
    id: 'neon', 
    name: 'Midnight Neon', 
    isDark: true, 
    requiredPlan: 'PRO',
    primaryColors: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1', // Indigo
      600: '#4f46e5',
      700: '#4338ca',
    },
    accentColors: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      500: '#14b8a6', // Teal
      600: '#0d9488',
      700: '#0f766e',
    }
  },
  { 
    id: 'obsidian', 
    name: 'Obsidian Fire', 
    isDark: true, 
    requiredPlan: 'PRO',
    primaryColors: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#8b5cf6', // Violet
      600: '#7c3aed',
      700: '#6d28d9',
    },
    accentColors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      500: '#f43f5e', // Rose
      600: '#e11d48',
      700: '#be123c',
    }
  },
  { 
    id: 'crimson', 
    name: 'Crimson & Gold', 
    isDark: true, 
    requiredPlan: 'PRO',
    primaryColors: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444', // Red
      600: '#dc2626',
      700: '#b91c1c',
    },
    accentColors: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b', // Amber
      600: '#d97706',
      700: '#b45309',
    }
  },
];

// Generate realistic demo data for the last 12 months
const generateDemoTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  const expenseTypes = [
      { cat: 'Food', desc: 'Grocery Store', min: 80, max: 250 },
      { cat: 'Transport', desc: 'Gas Station', min: 40, max: 80 },
      { cat: 'Transport', desc: 'Uber Ride', min: 15, max: 35 },
      { cat: 'Entertainment', desc: 'Cinema', min: 25, max: 60 },
      { cat: 'Food', desc: 'Restaurant', min: 45, max: 120 },
      { cat: 'Other', desc: 'Online Shopping', min: 30, max: 100 },
      { cat: 'Health', desc: 'Pharmacy', min: 15, max: 50 },
  ];

  // 1. Ensure Activity in the Last 7 Days (Critical for Trend Chart)
  for (let d = 0; d < 7; d++) {
     const date = new Date(now);
     date.setDate(now.getDate() - d);
     
     // Add 1-2 expenses per day
     const count = 1 + Math.floor(Math.random() * 2);
     for(let k=0; k<count; k++) {
         const ex = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
         transactions.push({
             id: `recent-${d}-${k}`,
             amount: Math.floor(ex.min + Math.random() * (ex.max - ex.min)),
             category: ex.cat,
             description: ex.desc,
             date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14 + k, 30, 0).toISOString(),
             type: 'expense'
         });
     }
  }

  // 2. Create 12 months of history
  for (let i = 0; i < 12; i++) {
     const year = now.getFullYear();
     const month = now.getMonth() - i;
     
     // Monthly Salary (Income) - 28th of month
     transactions.push({
       id: `inc-salary-${i}`,
       amount: 4800,
       category: 'Salary',
       description: 'Monthly Salary',
       date: new Date(year, month, 28, 9, 0, 0).toISOString(),
       type: 'income'
     });

     // Freelance Work (Income) - Occasional (every 3 months)
     if (i % 3 === 0) {
        transactions.push({
            id: `inc-freelance-${i}`,
            amount: 1250,
            category: 'Freelance',
            description: 'Web Design Project',
            date: new Date(year, month, 15, 14, 0, 0).toISOString(),
            type: 'income'
        });
     }

     // Rent (Bill) - 1st of month
     transactions.push({
        id: `bill-rent-${i}`,
        amount: 1500,
        category: 'Housing',
        description: 'Apartment Rent',
        date: new Date(year, month, 1, 10, 0, 0).toISOString(),
        type: 'bill'
     });
     
     // Utilities (Bill) - 5th of month
     transactions.push({
        id: `bill-util-${i}`,
        amount: 145, 
        category: 'Utilities',
        description: 'Electric & Internet',
        date: new Date(year, month, 5, 10, 0, 0).toISOString(),
        type: 'bill'
     });

     // Subscription (Bill) - 10th
     transactions.push({
        id: `bill-sub-${i}`,
        amount: 15,
        category: 'Entertainment',
        description: 'Netflix',
        date: new Date(year, month, 10, 9, 0, 0).toISOString(),
        type: 'bill'
     });

     // Variable Expenses (Randomized days 1-28)
     const numExpenses = 4 + Math.floor(Math.random() * 4);
     for(let j=0; j<numExpenses; j++) {
         const ex = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
         const day = 1 + Math.floor(Math.random() * 27); 
         
         // Avoid duplicates with the "Last 7 Days" loop if current month is 0
         if (i === 0 && day > now.getDate() - 7) continue;

         transactions.push({
             id: `exp-${i}-${j}`,
             amount: Math.floor(ex.min + Math.random() * (ex.max - ex.min)),
             category: ex.cat,
             description: ex.desc,
             date: new Date(year, month, day, 12, 0, 0).toISOString(),
             type: 'expense'
         });
     }
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const DEMO_TRANSACTIONS = generateDemoTransactions();

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'summary', type: 'summary', title: 'Overview', x: 0, y: 0, w: 12, h: 1, visible: true },
  { id: 'incomeChart', type: 'incomeChart', title: 'Income Analysis', x: 0, y: 1, w: 6, h: 2, visible: true },
  { id: 'expenseChart', type: 'expenseChart', title: 'Expense Breakdown', x: 6, y: 1, w: 6, h: 2, visible: true },
  { id: 'transactions', type: 'transactions', title: 'Recent Activity', x: 0, y: 3, w: 8, h: 2, visible: true },
  { id: 'bills', type: 'bills', title: 'Upcoming Bills', x: 8, y: 3, w: 4, h: 2, visible: true },
];

export const DEFAULT_INCOME_SOURCES = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];
export const DEFAULT_EXPENSE_CATEGORIES = ['Housing', 'Food', 'Utilities', 'Entertainment', 'Transport', 'Health', 'Education', 'Shopping', 'Travel', 'Other'];

export const PLAN_LIMITS = {
  FREE: {
    maxTransactions: 50,
    historyMonths: 1,
    hasBillsWidget: false,
    hasBillsPage: false,
    hasSavingsPage: false,
    canCustomizeAvatar: false,
    canChangeName: false,
    nameChanges: 1,
    canToggleVisibility: false,
    canResize: false,
    canMove: false,
    has7DayTrend: false,
    hasWealthGrowth: false,
    hasAiInsights: false,
    hasCustomTheme: false,
    canUseNotifications: false,
    maxIncome: Infinity,
    maxExpense: Infinity,
    maxBills: 0,
  },
  PRO: {
    maxTransactions: 500,
    historyMonths: 2,
    hasBillsWidget: true,
    hasBillsPage: true,
    hasSavingsPage: true,
    canCustomizeAvatar: true,
    canChangeName: true,
    nameChanges: Infinity,
    canToggleVisibility: true,
    canResize: false,
    canMove: false, // REMOVED
    has7DayTrend: false,
    hasWealthGrowth: false,
    hasAiInsights: false,
    hasCustomTheme: false,
    canUseNotifications: true,
    maxIncome: Infinity,
    maxExpense: Infinity,
    maxBills: Infinity,
  },
  PREMIUM: {
    maxTransactions: 5000,
    historyMonths: 5,
    hasBillsWidget: true,
    hasBillsPage: true,
    hasSavingsPage: true,
    canCustomizeAvatar: true,
    canChangeName: true,
    nameChanges: Infinity,
    canToggleVisibility: true,
    canResize: false,
    canMove: false,
    has7DayTrend: true,
    hasWealthGrowth: true,
    hasAiInsights: true,
    hasCustomTheme: true,
    canUseNotifications: true,
    maxIncome: Infinity,
    maxExpense: Infinity,
    maxBills: Infinity,
  }
};