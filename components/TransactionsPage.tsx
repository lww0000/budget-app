import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Modal, EmptyState, TransactionModal, PlanBadge, UpgradeTriggerModal, LockOverlay } from './UIComponents';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Receipt, DollarSign, Wallet, Lightbulb, ArrowUpRight, ArrowDownRight, Activity, PieChart as PieIcon, RefreshCw, AlertCircle, Layers, Calendar, Filter, X, Lock, Check, ChevronDown } from 'lucide-react';
import { format, isSameMonth, isSameYear } from 'date-fns';
import { TransactionType, Transaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { PLAN_LIMITS } from '../constants';

interface TransactionsPageProps {
  title?: string;
  type?: TransactionType; // If undefined, show all logic
  description?: string;
}

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#f59e0b', '#22c55e', '#a855f7', '#ec4899', '#ef4444', '#6366f1'];
const EXPENSE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function TransactionsPage({ title = "Income & Expense Tracker", type, description }: TransactionsPageProps) {
  // ... (Keep existing state and hooks exactly as is)
  const { user, transactions, deleteTransaction, incomeSources, expenseCategories, isDemo, justUpgraded } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'income' | 'expense' | 'bill'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Income' | 'Expense' | 'Bill'>('All');
  
  // View All Modal State
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('Premium Features');
  const [lockedFeaturePlan, setLockedFeaturePlan] = useState<'PRO' | 'PREMIUM'>('PRO');
  
  // Date Filtering State
  const [currentFilterDate, setCurrentFilterDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Locked to Current Year
  const currentYear = new Date().getFullYear();
  
  // Tabs within the Modal
  const [modalTab, setModalTab] = useState<'All' | 'Income' | 'Expense' | 'Bill'>('All');

  // Permission Logic
  const canViewAll = true; // Modal is available, but data limited by history
  const isPro = user.plan !== 'FREE' || isDemo;
  const has7DayTrend = PLAN_LIMITS[user.plan].has7DayTrend || isDemo;
  const hasAiInsights = PLAN_LIMITS[user.plan].hasAiInsights || isDemo;
  
  // History Limit Logic
  const historyLimitMonths = PLAN_LIMITS[user.plan].historyMonths || 1;
  const now = new Date();
  // Calculate earliest allowed date based on plan history limit
  const earliestAllowedDate = new Date(now.getFullYear(), now.getMonth() - historyLimitMonths + 1, 1);

  const unlockedGlow = (isLocked: boolean) => !isLocked && justUpgraded ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '';

  // Clear search and reset tab when modal opens/closes
  useEffect(() => {
    if (!isViewAllOpen) {
        setSearchQuery('');
        setCurrentFilterDate(new Date()); // Reset to current month on close/open
        if (type === 'income') setModalTab('Income');
        else if (type === 'expense') setModalTab('Expense');
        else if (type === 'bill') setModalTab('Bill');
        else setModalTab('All');
    }
  }, [isViewAllOpen, type]);

  const handleViewAllClick = () => {
      // Allow opening modal, but modal content will be limited by date picker availability
      if (type === 'income') setModalTab('Income');
      else if (type === 'expense') setModalTab('Expense');
      else if (type === 'bill') setModalTab('Bill');
      else setModalTab('All');
      setIsViewAllOpen(true);
  };

  // ... (Keep calculations: insights, trendData, sortedTransactions, recentTransactions, modalTransactions, searchSuggestions, pageStats)
  const insights = useMemo(() => {
    // Insights should be based on visible history? Or total? 
    // Usually insights are month-based, so they work fine.
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const bills = transactions.filter(t => t.type === 'bill').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses + bills;
    const balance = income - totalExpenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

    const categoryTotals: Record<string, number> = {};
    transactions.filter(t => t.type !== 'income').forEach(t => {
       categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    const recurringCount = transactions.filter(t => t.type === 'bill').length;

    return { income, totalExpenses, balance, savingsRate, topCategory, recurringCount };
  }, [transactions]);

  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const displayDate = format(d, 'MMM d');
      const dateKey = format(d, 'yyyy-MM-dd');

      const dailyTransactions = transactions.filter(t => {
         return format(new Date(t.date), 'yyyy-MM-dd') === dateKey;
      });

      const income = dailyTransactions
        .filter(t => t.type === 'income')
        .reduce((acc: number, curr) => acc + curr.amount, 0);

      const expenses = dailyTransactions
        .filter(t => t.type === 'expense' || t.type === 'bill')
        .reduce((acc: number, curr) => acc + curr.amount, 0);

      data.push({
        name: displayDate,
        Income: income,
        Expenses: expenses
      });
    }
    return data;
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    let data = transactions;
    if (type) {
        data = data.filter(t => t.type === type);
    } else {
        if (activeTab === 'Income') data = data.filter(t => t.type === 'income');
        if (activeTab === 'Expense') data = data.filter(t => t.type === 'expense');
        if (activeTab === 'Bill') data = data.filter(t => t.type === 'bill');
    }
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, type, activeTab]);

  const recentTransactions = useMemo(() => {
    // Show 18 items (3 rows on desktop) for expenses, 6 for others
    const limit = type === 'expense' ? 18 : 6;
    return sortedTransactions.slice(0, limit);
  }, [sortedTransactions, type]);

  const modalTransactions = useMemo(() => {
    let data = transactions;
    
    // 1. Filter by Type
    if (modalTab === 'Income') data = data.filter(t => t.type === 'income');
    else if (modalTab === 'Expense') data = data.filter(t => t.type === 'expense');
    else if (modalTab === 'Bill') data = data.filter(t => t.type === 'bill');
    
    // 2. Filter by Date (Month/Year)
    data = data.filter(t => isSameMonth(new Date(t.date), currentFilterDate));

    // 3. Filter by Search
    if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        data = data.filter(t => 
            t.description.toLowerCase().includes(lower) || 
            t.category.toLowerCase().includes(lower) || 
            t.amount.toString().includes(lower) ||
            t.type.toLowerCase().includes(lower)
        );
    }
    
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, modalTab, searchQuery, currentFilterDate]);

  const searchSuggestions = useMemo(() => {
      const categories = Array.from(new Set(modalTransactions.map(t => t.category)));
      if (modalTab === 'Bill') {
          const descriptions = Array.from(new Set(modalTransactions.map(t => t.description)));
          return [...descriptions.slice(0, 3), ...categories.slice(0, 2)];
      }
      return categories.slice(0, 5);
  }, [modalTransactions, modalTab]);

  const pageStats = useMemo(() => {
     if (!type) return null;
     const now = new Date();
     
     const monthlyTransactions = transactions.filter(t => t.type === type && isSameMonth(new Date(t.date), now));
     const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
        
     const ytdTotal = transactions
        .filter(t => t.type === type && isSameYear(new Date(t.date), now))
        .reduce((sum, t) => sum + t.amount, 0);
     
     const usedCategories = new Set(transactions.filter(t => t.type === type).map(t => t.category));
     const sources = Array.from(usedCategories).sort();
     
     const trend: { name: string; amount: number }[] = [];
     for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTotal = transactions.filter(t => {
              const tDate = new Date(t.date);
              return t.type === type && isSameMonth(tDate, d);
           }).reduce((sum, t) => sum + t.amount, 0);
        trend.push({ name: format(d, 'MMM'), amount: monthTotal });
     }

     const yearlyGroups = transactions.filter(t => t.type === type).reduce((acc: Record<string, number>, t: Transaction) => {
            const year = new Date(t.date).getFullYear().toString();
            const current = acc[year] || 0;
            acc[year] = current + Number(t.amount);
            return acc;
        }, {} as Record<string, number>);

     const yearlyTrend = Object.entries(yearlyGroups).map(([name, amount]) => ({ name, amount: Number(amount) })).sort((a, b) => Number(a.name) - Number(b.name));
     if (yearlyTrend.length === 0) yearlyTrend.push({ name: now.getFullYear().toString(), amount: 0 });

     const categoryBreakdown = Object.entries(
        monthlyTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
           const current = acc[t.category] || 0;
           acc[t.category] = current + Number(t.amount);
           return acc;
        }, {} as Record<string, number>)
     ).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);

     return { monthlyTotal, ytdTotal, sources, trend, yearlyTrend, categoryBreakdown };
  }, [transactions, type, incomeSources, expenseCategories]);

  const openAddModal = (mode: 'income' | 'expense' | 'bill') => {
      // Logic for limitation check
      if (mode === 'bill') {
          // No specific logic needed here as PLAN_LIMITS is checked elsewhere or allowed.
          // But Bills Page access itself is blocked for Free.
      }
      setAddModalType(mode);
      setIsAddModalOpen(true);
  };

  const handleMonthSelect = (date: Date) => {
      // Check History Access
      if (!isDemo && date < earliestAllowedDate) {
          // If trying to access history beyond plan limit
          const required = user.plan === 'FREE' ? 'PRO' : 'PREMIUM';
          setLockedFeatureName("Historical Data");
          setLockedFeaturePlan(required);
          setUpgradeModalOpen(true);
          return;
      }
      setCurrentFilterDate(date);
      setIsDatePickerOpen(false);
  };

  const availableMonths = useMemo(() => {
      const now = new Date();
      const months = [];
      // Look back 6 months (including current)
      for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(d);
      }
      return months.reverse(); // Display chronologically Jan -> Dec
  }, []);

  const datePickerModal = (
      <Modal isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} title="Select Month" size="sm">
          <div className="space-y-6">
              {/* Year Display (Dynamic based on selected filter date) */}
              <div className="flex items-center justify-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{format(currentFilterDate, 'yyyy')}</span>
              </div>

              {/* Month Grid - Dynamic based on available months */}
              <div className="grid grid-cols-3 gap-3">
                  {availableMonths.map((date, i) => {
                      const isSelected = isSameMonth(date, currentFilterDate);
                      const isCurrentMonth = isSameMonth(date, new Date());
                      // Determine if locked
                      const isLockedDate = !isDemo && date < earliestAllowedDate;
                      
                      return (
                          <button
                              key={i}
                              onClick={() => handleMonthSelect(date)}
                              className={`py-3 rounded-xl text-sm font-medium transition-all relative ${
                                  isSelected 
                                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                              } ${isLockedDate ? 'opacity-50' : ''}`}
                          >
                              {format(date, 'MMM')}
                              {isCurrentMonth && !isSelected && (
                                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                              )}
                              {isLockedDate && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
                                      <Lock size={12} className="text-slate-500" />
                                  </div>
                              )}
                          </button>
                      );
                  })}
              </div>
              
              <Button variant="secondary" onClick={() => { setCurrentFilterDate(new Date()); setIsDatePickerOpen(false); }} className="w-full">
                  Jump to Today
              </Button>
          </div>
      </Modal>
  );

  const viewAllModal = (
    <Modal isOpen={isViewAllOpen} onClose={() => setIsViewAllOpen(false)} title={type ? `${type === 'bill' ? 'Bill' : type === 'income' ? 'Income' : 'Expense'} History` : "Transaction History"} size="3xl">
        <div className="space-y-6">
            {!type && (
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
                    {(['All', 'Income', 'Expense', 'Bill'] as const).map(tab => (
                        <button key={tab} onClick={() => setModalTab(tab)} className={`flex-1 min-w-[80px] px-4 py-2.5 text-sm font-bold rounded-lg transition-colors duration-200 ${modalTab === tab ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{tab === 'Expense' ? 'Expenses' : tab === 'Bill' ? 'Bills' : tab}</button>
                    ))}
                </div>
            )}
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder={modalTab === 'Bill' ? "Search by bill name, amount..." : "Search by description, category..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-base" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={16} /></button>}
                </div>
                <button 
                    onClick={() => setIsDatePickerOpen(true)}
                    className="flex items-center gap-2 px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 group"
                >
                    <Calendar size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-primary-500 transition-colors" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">{format(currentFilterDate, 'MMM yyyy')}</span>
                    <ChevronDown size={16} className="text-slate-400" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">{modalTab === 'Bill' ? 'Filter by:' : 'Suggested:'}</span>
                {searchSuggestions.map(s => (<button key={s} onClick={() => setSearchQuery(s)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600">{s}</button>))}
                {!type && ['Income', 'Expense'].map(filterType => (<button key={filterType} onClick={() => { setModalTab(filterType === 'Income' ? 'Income' : 'Expense'); setSearchQuery(''); }} className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-xs font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">Type: {filterType}</button>))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
                <div className="flex justify-between items-end mb-2 px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {format(currentFilterDate, 'MMMM yyyy')} • {modalTransactions.length} Results
                    </span>
                </div>
                {modalTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400"><Search size={24} /></div>
                        <p className="text-slate-500 font-medium">No records found for {format(currentFilterDate, 'MMM yyyy')}</p>
                        <p className="text-xs text-slate-400 mt-1">Try changing the date filter or search term</p>
                        <button onClick={() => { setSearchQuery(''); if (!type) setModalTab('All'); }} className="mt-4 text-sm text-primary-600 font-bold hover:underline">Clear Filters</button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {modalTransactions.map(t => (
                            <div key={t.id} onClick={() => { setEditingTransaction(t); setIsViewAllOpen(false); }} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : t.type === 'bill' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>{t.type === 'income' ? <ArrowUpRight size={22} /> : t.type === 'bill' ? <RefreshCw size={22} /> : <ArrowDownRight size={22} />}</div>
                                    <div><h4 className="font-bold text-slate-900 dark:text-white text-base">{t.description}</h4><div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.category}</span><span className="text-xs text-slate-400">{format(new Date(t.date), 'MMM d, yyyy')}</span></div></div>
                                </div>
                                <div className="text-right"><span className={`block font-bold text-base ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );

  const renderActiveShape = (props: any) => {
    return <Sector {...props} stroke="none" />;
  };

  if (type === 'expense' && pageStats) {
    const CustomExpenseTooltip = ({ active, payload }: any) => {
        const [show, setShow] = useState(false);

        // Delay effect to prevent lag/flicker on fast movement
        useEffect(() => {
            if (active && payload && payload.length) {
                const timer = setTimeout(() => setShow(true), 150);
                return () => clearTimeout(timer);
            }
            setShow(false);
        }, [active, payload]);

        if (show && active && payload && payload.length) {
            const data = payload[0];
            return (
                <div 
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-left min-w-[150px] ring-1 ring-black/5 transition-opacity duration-300 ease-out"
                    style={{ transform: 'translate(-125%, -50%)', opacity: show ? 1 : 0 }}
                >
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-700" style={{ backgroundColor: data.payload.fill }}></div>
                        <p className="text-slate-800 dark:text-white font-bold text-sm">{data.name}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cost</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            ${data.value.toLocaleString()}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
      <div className="space-y-6 pb-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {!isDemo && <PlanBadge plan={user.plan} />}
             </div>
             <p className="text-slate-500 dark:text-slate-400">{description}</p>
           </div>
           <button onClick={() => openAddModal('expense')} className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"><Plus size={20} /> Add Expense</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white p-8 rounded-2xl shadow-lg border border-rose-500/20 flex flex-col justify-center min-h-[260px] relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div><div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white opacity-5"></div>
               <p className="text-rose-100 font-medium mb-2 text-lg">Total Expenses</p><h3 className="text-6xl font-bold mb-4 tracking-tight">${pageStats.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
               <div className="flex items-center gap-3"><span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold text-white flex items-center gap-2"><Calendar size={14} /> This Month</span><span className="text-rose-100 text-sm font-medium">Tracking Active</span></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[260px] flex flex-col">
               <div className="flex justify-between items-start mb-6"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Expense Breakdown</h3><span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">This month</span></div>
               <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                  {pageStats.categoryBreakdown.length > 0 ? (
                      <>
                          <div className="relative w-full sm:w-1/2 h-[180px] [&_.recharts-surface]:outline-none">
                              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pageStats.categoryBreakdown} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} stroke="none" activeShape={renderActiveShape} isAnimationActive={false}>{pageStats.categoryBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />))}</Pie><Tooltip content={<CustomExpenseTooltip />} wrapperStyle={{ outline: 'none' }} /></PieChart></ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</span><span className="text-2xl font-extrabold text-slate-900 dark:text-white">${Math.round(pageStats.monthlyTotal).toLocaleString()}</span></div>
                          </div>
                          <div className="w-full sm:w-1/2 space-y-3 pl-2 sm:pl-4 overflow-y-auto max-h-[180px] custom-scrollbar">{pageStats.categoryBreakdown.map((cat, idx) => { const percentage = ((cat.value / pageStats.monthlyTotal) * 100).toFixed(0); const color = EXPENSE_COLORS[idx % EXPENSE_COLORS.length]; return (<div key={cat.name} className="flex items-center justify-between group"><div className="flex items-center gap-3 min-w-0"><div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></div><span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{cat.name}</span></div><div className="flex items-center gap-3 shrink-0"><span className="text-sm font-bold text-slate-900 dark:text-white">${cat.value.toLocaleString()}</span><div className="w-12 text-right"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${color}20`, color: color }}>{percentage}%</span></div></div></div>)})}</div>
                      </>
                  ) : (<div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><PieIcon size={32} className="mb-2 opacity-50" /><p className="text-sm">No expense data yet</p></div>)}
               </div>
            </div>
         </div>
         <div className="space-y-4">
             <div className="flex items-center justify-between"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Expenses</h3></div>
             {recentTransactions.length === 0 ? (<div className="text-center py-12"><p className="text-slate-400">No expenses found</p></div>) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {recentTransactions.map(t => (
                        <motion.div 
                            layout 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            key={t.id} 
                            onClick={() => setEditingTransaction(t)} 
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group h-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                 <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center shrink-0">
                                     <ArrowDownRight size={20} />
                                 </div>
                                 <span className="font-bold text-rose-500">-${t.amount.toLocaleString()}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={t.description}>{t.description}</h4>
                                <div className="flex flex-col mt-1">
                                     <span className="text-xs text-slate-500 truncate">{t.category}</span>
                                     <span className="text-[10px] text-slate-400 mt-0.5">{format(new Date(t.date), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {sortedTransactions.length > 6 && (
                    <button onClick={handleViewAllClick} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-accent-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-center justify-center gap-2 relative">
                        {!canViewAll && <Lock size={14} className="text-amber-500" />}View All Expenses <ArrowDownRight size={16} />
                    </button>
                )}
                </>
             )}
         </div>
         <TransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} defaultType={addModalType} />
         <TransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} initialData={editingTransaction || undefined} />
         {viewAllModal}
         {datePickerModal}
         <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName={lockedFeatureName} requiredPlan={lockedFeaturePlan} />
      </div>
    );
  }

  // ... (Keep the remaining render blocks for 'income', 'bill', and generic dashboard unchanged)
  if (type === 'income' && pageStats) {
     const accentColor = 'text-emerald-500';
     const barColor = '#10b981';
    return (
      <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1><p className="text-slate-500 dark:text-slate-400">{description}</p></div>
           <button onClick={() => openAddModal('income')} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 shadow-emerald-500/20"><Plus size={20} /> Add Income</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Monthly Income</p><h3 className={`text-3xl font-bold ${accentColor}`}>${pageStats.monthlyTotal.toLocaleString()}</h3></div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Active Sources</p><h3 className="text-3xl font-bold text-slate-900 dark:text-white">{pageStats.sources.length}</h3></div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">YTD Earnings</p><h3 className="text-3xl font-bold text-slate-900 dark:text-white">${pageStats.ytdTotal.toLocaleString()}</h3></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={`lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-500 ${unlockedGlow(!isPro)}`}><h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-6 ${!isPro ? 'blur-sm' : ''}`}>Income Trend</h3><div className="relative rounded-2xl overflow-hidden"><AnimatePresence>{!isPro && <LockOverlay requiredPlan="PRO" title="Income Analytics" />}</AnimatePresence><div className={`h-[250px] w-full transition-all duration-700 ease-in-out ${!isPro ? 'blur-sm opacity-50 pointer-events-none' : ''}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={pageStats.trend} barSize={40} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} /><YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} /><Bar dataKey="amount" fill={barColor} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div></div>
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"><h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Income Sources</h3><div className="flex-1 overflow-y-auto custom-scrollbar pr-2">{pageStats.sources.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-center text-slate-400 pb-8"><Layers size={32} strokeWidth={1.5} className="mb-2 opacity-50" /><p className="text-sm">No income sources yet</p></div>) : (<div className="space-y-3">{pageStats.sources.map((source, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="font-medium text-slate-700 dark:text-slate-300">{source}</span><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div></div>))}</div>)}</div></div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-4">Recent Income</h3>
        
        {recentTransactions.length === 0 ? (
             <div className="text-center py-12"><p className="text-slate-400">No income found</p></div>
        ) : (
            <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-all duration-500`}>
                <div className="transition-all duration-700 ease-in-out">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentTransactions.map(t => (
                            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => setEditingTransaction(t)}>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                        <ArrowUpRight size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t.description}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{t.category} • {format(new Date(t.date), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-lg text-emerald-600 dark:text-emerald-400">+${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {sortedTransactions.length > 5 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <button onClick={handleViewAllClick} className="w-full py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2">
                                {!canViewAll && <Lock size={14} />}View All Income History
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        <TransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} defaultType="income" />
        <TransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} initialData={editingTransaction || undefined} />
        {viewAllModal}
        {datePickerModal}
        <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName={lockedFeatureName} requiredPlan={lockedFeaturePlan} />
      </div>
    );
  }

  if (type === 'bill' && pageStats) {
      const accentColor = 'text-amber-500';
      const barColor = '#f59e0b';
      const hasBillAccess = PLAN_LIMITS[user.plan].hasBillsPage || isDemo;
      if (!hasBillAccess) {
         return (
            <div className="space-y-6 pb-10"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1><p className="text-slate-500 dark:text-slate-400">{description}</p></div></div><div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center px-6"><div className="w-24 h-24 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-slate-50 dark:ring-slate-800/50"><Lock size={40} /></div><h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Bill Tracking is Locked</h2><p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 text-lg leading-relaxed">Upgrade to the <strong>Pro</strong> plan to access the Bills dashboard. Track recurring payments, manage due dates, and get timely reminders.</p><Button onClick={() => setUpgradeModalOpen(true)} className="px-10 py-4 text-lg shadow-xl shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-none text-white rounded-xl">Unlock Bill Tracking</Button></div><UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName="Bill Tracking" requiredPlan="PRO" /></div>
         );
      }
      return (
        <div className="space-y-6 pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1><p className="text-slate-500 dark:text-slate-400">{description}</p></div><button onClick={() => openAddModal(type)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 shadow-amber-500/20"><Plus size={20} /> Add Bill</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Monthly Bills</p><h3 className={`text-3xl font-bold ${accentColor}`}>-${pageStats.monthlyTotal.toLocaleString()}</h3></div><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">YTD Bills</p><h3 className="text-3xl font-bold text-slate-900 dark:text-white">-${pageStats.ytdTotal.toLocaleString()}</h3></div><div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Avg. Per Bill</p><h3 className="text-3xl font-bold text-slate-900 dark:text-white">${sortedTransactions.length > 0 ? (pageStats.ytdTotal / sortedTransactions.length).toFixed(0) : '0'}</h3></div></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-500 ${unlockedGlow(!isPro)}`}><h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-6 ${!isPro ? 'blur-sm' : ''}`}>Spent Per Month</h3><div className="relative rounded-2xl overflow-hidden"><AnimatePresence>{!isPro && <LockOverlay requiredPlan="PRO" title="Monthly Bill Analysis" />}</AnimatePresence><div className={`h-[300px] w-full transition-all duration-700 ease-in-out ${!isPro ? 'blur-sm opacity-50 pointer-events-none' : ''}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={pageStats.trend} barSize={30} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} /><YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} /><Bar dataKey="amount" fill={barColor} radius={[4, 4, 0, 0]} name="Bills" /></BarChart></ResponsiveContainer></div></div></div><div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-500 ${unlockedGlow(!isPro)}`}><h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-6 ${!isPro ? 'blur-sm' : ''}`}>Spent Per Year</h3><div className="relative rounded-2xl overflow-hidden"><AnimatePresence>{!isPro && <LockOverlay requiredPlan="PRO" title="Yearly Bill Trends" />}</AnimatePresence><div className={`h-[300px] w-full transition-all duration-700 ease-in-out ${!isPro ? 'blur-sm opacity-50 pointer-events-none' : ''}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={pageStats.yearlyTrend} barSize={40} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} /><YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} /><Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Yearly Total" /></BarChart></ResponsiveContainer></div></div></div></div>
          <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Bills</h3></div>{recentTransactions.length === 0 ? (<div className="text-center py-12"><p className="text-slate-400">No bills found</p></div>) : (<>{recentTransactions.map(t => (<motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} onClick={() => setEditingTransaction(t)} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 flex items-center justify-center"><RefreshCw size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">{t.description}</h4><p className="text-xs text-slate-500">{t.category} • {format(new Date(t.date), 'MMM d, yyyy')}</p></div></div><span className="font-bold text-amber-600 dark:text-amber-500">-${t.amount.toLocaleString()}</span></motion.div>))}{sortedTransactions.length > 5 && (<button onClick={handleViewAllClick} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-accent-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-center justify-center gap-2 relative">{!canViewAll && <Lock size={14} className="text-amber-500" />}View All Bills <ArrowDownRight size={16} /></button>)}</>)}</div>
          <TransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} defaultType={addModalType} />
          <TransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} initialData={editingTransaction || undefined} />
          {viewAllModal}
          {datePickerModal}
          <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName="Full Bill History" requiredPlan="PRO" />
        </div>
      );
  }

  // Fallback / Default Dashboard
  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* ... (Dashboard view - unchanged) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h1><p className="text-slate-500 dark:text-slate-400">{description || "Log every transaction and build a clear picture of your financial life"}</p></div>
        <div className="flex gap-3"><button onClick={() => openAddModal('income')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"><Plus size={18} /> Add Income</button><button onClick={() => openAddModal('expense')} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"><Plus size={18} /> Add Expense</button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 shadow-sm flex items-center justify-between"><div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Income</p><h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${insights.income.toLocaleString()}</h3></div><div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400"><TrendingUp size={20} /></div></div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-rose-500 shadow-sm flex items-center justify-between"><div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Expenses</p><h3 className="text-3xl font-bold text-rose-600 dark:text-rose-400">${insights.totalExpenses.toLocaleString()}</h3></div><div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400"><TrendingDown size={20} /></div></div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-500 shadow-sm flex items-center justify-between"><div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Net Balance</p><h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{insights.balance >= 0 ? '+' : ''}${insights.balance.toLocaleString()}</h3></div><div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400"><Wallet size={20} /></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">{(['All', 'Income', 'Expense', 'Bill'] as const).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{tab}</button>))}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
              {recentTransactions.length === 0 ? (<EmptyState icon={Receipt} title="No transactions found" description="Start by adding your first income or expense entry above." />) : (
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTransactions.map((t) => (
                       <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => setEditingTransaction(t)}>
                          <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : t.type === 'bill' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>{t.type === 'income' ? <ArrowUpRight size={24} /> : t.type === 'bill' ? <RefreshCw size={24} /> : <ArrowDownRight size={24} />}</div><div><h4 className="font-bold text-slate-900 dark:text-white">{t.description}</h4><div className="flex items-center gap-2 text-xs text-slate-500 mt-1"><span className="capitalize">{t.category}</span><span>•</span><span className={`capitalize font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-500'}`}>{t.type}</span></div></div></div>
                          <div className="text-right"><p className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p><p className="text-xs text-slate-400 mt-1">{format(new Date(t.date), 'MMM d')}</p></div>
                       </motion.div>
                    ))}
                 </div>
              )}
              {sortedTransactions.length > 5 && (<div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><button onClick={handleViewAllClick} className="w-full py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2">{!canViewAll && <Lock size={14} className="text-amber-500" />}View All Transactions</button></div>)}
           </div>
        </div>

        <div className="space-y-6 relative">
           <div className="flex items-center gap-2 mb-2"><Lightbulb size={20} className="text-blue-500" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Insights</h2></div>
           
           <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-6 overflow-hidden ${!hasAiInsights ? 'min-h-[400px]' : ''}`}>
               <AnimatePresence>
                  {!hasAiInsights && <LockOverlay requiredPlan="PREMIUM" title="Premium Insights" />}
               </AnimatePresence>
               <div className={`transition-all duration-500 ${!hasAiInsights ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30"><div className="flex items-start gap-3"><div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Activity size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Cash Flow Status</h4><p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{insights.balance > 0 ? `You're saving $${insights.balance.toLocaleString()} this period. Great job keeping expenses low!` : `You've spent $${Math.abs(insights.balance).toLocaleString()} more than you earned.`}</p></div></div></div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30"><div className="flex items-start gap-3"><div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Savings Rate</h4><p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Your {insights.savingsRate.toFixed(1)}% savings rate is {insights.savingsRate > 20 ? 'excellent!' : 'a good start, try to reach 20%.'}</p></div></div></div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30"><div className="flex items-start gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><PieIcon size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Top Spending Category</h4><p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{insights.topCategory ? `${insights.topCategory[0]} is your biggest expense at $${insights.topCategory[1].toLocaleString()}.` : 'Add expenses to see category insights.'}</p></div></div></div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30"><div className="flex items-start gap-3"><div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><RefreshCw size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Recurring Expenses</h4><p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">You have {insights.recurringCount} recurring bills tracked. Check "Bills" for details.</p></div></div></div>
               </div>
           </div>
        </div>
      </div>
      
      {/* Explicit Spacing for Trend Analysis to Avoid Overlap */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden transition-all duration-500 mt-8 ${unlockedGlow(!has7DayTrend)}`}>
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">7-Day Trend <span className="text-xs font-normal text-slate-400 ml-2">(Premium)</span></h3>
         <div className="relative rounded-2xl overflow-hidden">
            <AnimatePresence>
                {!has7DayTrend && <LockOverlay requiredPlan="PREMIUM" title="Trend Analysis" />}
            </AnimatePresence>
            <div className={`h-[300px] w-full transition-all duration-700 ease-in-out ${!has7DayTrend ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorIncomeTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorExpenseTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} labelStyle={{ color: '#64748b', marginBottom: '4px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomeTrend)" />
                        <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenseTrend)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      <TransactionModal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)} 
         defaultType={addModalType} 
      />
      
      <TransactionModal 
         isOpen={!!editingTransaction} 
         onClose={() => setEditingTransaction(null)} 
         initialData={editingTransaction || undefined}
      />

       {/* Use the new Large Modal */}
       {viewAllModal}
       {datePickerModal}
         
       <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName={lockedFeatureName} requiredPlan={lockedFeaturePlan} />
    </div>
  );
}