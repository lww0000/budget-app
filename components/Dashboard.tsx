import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Modal, EmptyState, PlanBadge, TransactionModal, UpgradeTriggerModal, LockOverlay, Drawer } from './UIComponents';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Sector } from 'recharts';
import { Plus, Trash2, GripHorizontal, TrendingUp, TrendingDown, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Layers, Wallet, Calendar, Lock, Move, ChevronUp, ChevronDown, Settings, Eye, EyeOff, Maximize2, Minimize2, Check, Moon, Sun, Crown, Sparkles, Palette, Layout, Zap, CheckCircle, ArrowRight, ArrowLeftRight, Grid, ArrowDownToLine, MousePointerClick, Minimize, Maximize, Smartphone, Tablet, Monitor, LayoutTemplate, X, Receipt, PieChart as PieIcon } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { PLAN_LIMITS, THEMES, DEFAULT_WIDGETS } from '../constants';
import { Transaction, PlanType, WidgetConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryCard = ({ title, amount, icon: Icon, color, subtext }: any) => {
    const colors = {
        primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
        accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        danger: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
        warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    };
    
    const selectedColor = colors[color as keyof typeof colors] || colors.primary;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col items-start justify-between hover:shadow-md transition-shadow">
             <div className={`p-3 rounded-xl mb-4 ${selectedColor}`}>
                 <Icon size={24} strokeWidth={2.5} />
             </div>
             <div className="w-full min-w-0">
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">{title}</p>
                 <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 truncate">
                     ${amount.toLocaleString()}
                 </h3>
                 <p className="text-xs font-medium text-slate-400 truncate">{subtext}</p>
             </div>
        </div>
    )
}

// --- Gap Slot Component ---
interface GapSlotProps {
  w: number;
  index: number;
  hasSelection: boolean;
  onSelect: (id: string, data: { index: number, w: number }) => void;
}

const GapSlot: React.FC<GapSlotProps> = ({ w, index, hasSelection, onSelect }) => (
    <div 
      onClick={() => onSelect('gap-slot', { index, w })}
      className={`col-span-12 md:col-[span_var(--w)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer min-h-[180px] group ${
          hasSelection 
          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500 hover:scale-[1.02]' 
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 opacity-40 hover:opacity-100'
      }`}
      style={{ '--w': w } as any}
    >
        <div className={`p-3 rounded-full mb-2 transition-colors ${
            hasSelection 
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' 
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        }`}>
            {hasSelection ? <Minimize size={20} className="animate-bounce" /> : <Maximize size={20} />}
        </div>
        <span className={`text-xs font-bold ${hasSelection ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {hasSelection ? "Fit & Move Here" : "Unused Space"}
        </span>
    </div>
);

// --- Empty Slot Component (End of Grid) ---
interface EmptySlotProps {
  hasSelection: boolean;
  onSelect: (id: string) => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ hasSelection, onSelect }) => (
    <div 
      onClick={() => onSelect('empty-slot')}
      className={`col-span-12 md:col-span-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
          hasSelection 
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500 hover:scale-[1.01]' 
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 hover:opacity-100'
      }`}
    >
        {hasSelection && (
            <div className="absolute inset-0 bg-primary-100/10 dark:bg-primary-900/10 animate-pulse" />
        )}
        <div className={`p-4 rounded-full mb-3 transition-colors ${
            hasSelection 
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400' 
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        }`}>
            <ArrowDownToLine size={24} className={hasSelection ? "animate-bounce" : ""} />
        </div>
        <h4 className={`font-bold text-sm ${hasSelection ? 'text-primary-700 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400'}`}>
            {hasSelection ? "Move to New Row" : "New Row"}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
            {hasSelection 
             ? "Place widget here on a fresh row (full width)." 
             : "Select a widget to move it here."}
        </p>
    </div>
);

export default function Dashboard() {
  const { user, transactions, widgets, deleteTransaction, addTransaction, moveWidget, swapWidgets, updateWidgets, toggleWidgetVisibility, setTheme, isDemo, currentThemeColors, currentAccentColors, theme, justUpgraded } = useFinance();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState<'PRO' | 'PREMIUM'>('PRO');
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  
  // Layout Editing State
  const [isEditMode, setIsEditMode] = useState(false);
  const [swapSelection, setSwapSelection] = useState<string | null>(null);

  // --- CHART COLORS FIX FOR NEON ---
  const activeChartColors = theme === 'neon' ? THEMES.find(t => t.id === 'ocean')?.primaryColors || currentThemeColors : currentThemeColors;
  const activeAccentColors = theme === 'neon' ? THEMES.find(t => t.id === 'ocean')?.accentColors || currentAccentColors : currentAccentColors;

  const BREAKDOWN_COLORS = ['#3b82f6', '#2dd4bf', '#f59e0b', '#22c55e', '#a855f7', '#64748b'];

  // --- Calculations ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const bills = transactions.filter(t => t.type === 'bill').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = expense + bills;
    const balance = income - totalSpent;
    return { income, expense, bills, totalSpent, balance };
  }, [transactions]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string, name: string, income: number, expense: number }>();
    const now = new Date();

    // Initialize last 14 days (including today) with 0
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = format(d, 'yyyy-MM-dd');
        dataMap.set(dateKey, { 
            date: dateKey, 
            name: format(d, 'MMM d'), 
            income: 0, 
            expense: 0 
        });
    }

    // Populate with transaction data
    transactions.forEach(t => {
        const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
        // Only count if within the last 14 days range
        if (dataMap.has(dateKey)) {
             const entry = dataMap.get(dateKey)!;
             if (t.type === 'income') entry.income += t.amount;
             else if (t.type === 'expense' || t.type === 'bill') entry.expense += t.amount;
        }
    });

    return Array.from(dataMap.values());
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), now))
      .reduce((acc: any[], t) => {
        const existing = acc.find(i => i.name === t.category);
        if (existing) existing.value += t.amount;
        else acc.push({ name: t.category, value: t.amount });
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // --- Layout Grid Calculation ---
  const layoutItems = useMemo(() => {
      // Create a working copy of visible widgets with their original indices
      // We map to a new object to avoid mutating the original state during width adjustments
      const visibleWidgets = widgets
          .map((w, i) => ({ ...w, originalIndex: i }))
          .filter(w => w.visible || isEditMode)
          .map(w => ({ ...w })); // Shallow clone for local mutation of 'w'

      if (!isEditMode) {
          // View Mode: Auto-expand logic to fill rows
          // If a widget causes a wrap (meaning it doesn't fit in current row), 
          // we check the previous row. If it has space (width < 12), we expand 
          // the last widget of that row to fill the space.
          const processedItems = [];
          let currentRow: typeof visibleWidgets = [];
          let currentRowWidth = 0;

          for (const widget of visibleWidgets) {
              if (currentRowWidth + widget.w > 12) {
                  // Widget doesn't fit, so current row ends here.
                  // If previous row has space, expand the last item to fill it.
                  if (currentRowWidth > 0 && currentRowWidth < 12) {
                      const lastInRow = currentRow[currentRow.length - 1];
                      lastInRow.w += (12 - currentRowWidth);
                  }
                  
                  // Flush current row
                  processedItems.push(...currentRow);
                  currentRow = [];
                  currentRowWidth = 0;
              }
              
              currentRow.push(widget);
              currentRowWidth += widget.w;
          }

          // Handle the final row
          if (currentRow.length > 0) {
               if (currentRowWidth < 12) {
                   const lastInRow = currentRow[currentRow.length - 1];
                   lastInRow.w += (12 - currentRowWidth);
               }
               processedItems.push(...currentRow);
          }

          return processedItems.map(widget => ({ type: 'widget', widget, index: widget.originalIndex }));
      }

      // Edit Mode: Standard logic with gap calculation
      const items: any[] = [];
      let currentSpan = 0;
      
      visibleWidgets.forEach((widget) => {
          const w = widget.w;
          
          if (currentSpan + w > 12) {
              const gap = 12 - currentSpan;
              if (gap > 0) {
                  // Gap index points to the widget that caused the wrap, effectively "insert before this widget"
                  items.push({ type: 'gap', w: gap, index: widget.originalIndex }); 
              }
              currentSpan = 0;
          }
          
          items.push({ type: 'widget', widget, index: widget.originalIndex });
          currentSpan += w;
      });

      if (currentSpan > 0 && currentSpan < 12) {
          // Gap at the end points to widgets.length (insert at end)
          items.push({ type: 'gap', w: 12 - currentSpan, index: widgets.length });
      }

      return items;
  }, [widgets, isEditMode]);

  // --- Layout Swap & Move Logic ---
  const handleSwapSelect = (id: string, gapData?: { index: number, w: number }) => {
      if (swapSelection === id) {
          setSwapSelection(null); // Deselect
      } else if (swapSelection === null) {
          if (id === 'empty-slot' || id === 'gap-slot') return; // Cannot select empty slot as source
          setSwapSelection(id); // Select first
      } else {
          // Action Phase
          if (id === 'empty-slot') {
              // MOVE TO END
              const currentIndex = widgets.findIndex(w => w.id === swapSelection);
              if (currentIndex !== -1) {
                  const newWidgets = [...widgets];
                  const [removed] = newWidgets.splice(currentIndex, 1);
                  const item = { ...removed }; // Clone to avoid mutation
                  item.w = 12; // Expand to full width for new row
                  newWidgets.push(item);
                  updateWidgets(newWidgets);
              }
          } else if (id === 'gap-slot' && gapData) {
              // MOVE TO GAP & RESIZE
              const currentIndex = widgets.findIndex(w => w.id === swapSelection);
              if (currentIndex !== -1) {
                  const newWidgets = [...widgets];
                  const [removed] = newWidgets.splice(currentIndex, 1);
                  const item = { ...removed }; // Clone to avoid mutation
                  
                  // Update width to fit gap
                  item.w = gapData.w;
                  
                  // Calculate insert index
                  const insertIndex = currentIndex < gapData.index ? gapData.index - 1 : gapData.index;
                  
                  newWidgets.splice(insertIndex, 0, item);
                  updateWidgets(newWidgets);
              }
          } else {
              // SWAP WITH ANOTHER WIDGET
              const idx1 = widgets.findIndex(w => w.id === swapSelection);
              const idx2 = widgets.findIndex(w => w.id === id);
              if (idx1 !== -1 && idx2 !== -1) {
                  swapWidgets(idx1, idx2);
              }
          }
          setSwapSelection(null);
      }
  };

  const applyLayoutPreset = (type: 'default' | 'focus' | 'minimal') => {
      // Use map to create deep copy of objects (1 level deep) to prevent reference mutation of the constant
      const baseWidgets = DEFAULT_WIDGETS.map(w => ({ ...w }));
      let newConfig: WidgetConfig[] = [];

      if (type === 'default') {
          newConfig = baseWidgets;
      } else if (type === 'focus') {
          const order = ['summary', 'incomeChart', 'expenseChart', 'transactions', 'bills'];
          newConfig = order.map(id => {
              const w = baseWidgets.find(x => x.id === id);
              if (id === 'summary') return { ...w!, w: 12, h: 1, visible: true };
              if (id === 'incomeChart') return { ...w!, w: 12, h: 2, visible: true };
              if (id === 'expenseChart') return { ...w!, w: 6, h: 2, visible: true };
              if (id === 'transactions') return { ...w!, w: 6, h: 2, visible: true };
              return { ...w!, w: 6, h: 2, visible: true };
          });
      } else if (type === 'minimal') {
          const order = ['summary', 'transactions', 'bills', 'incomeChart', 'expenseChart'];
          newConfig = order.map(id => {
              const w = baseWidgets.find(x => x.id === id);
              if (id === 'summary') return { ...w!, w: 12, h: 1, visible: true };
              if (id === 'transactions') return { ...w!, w: 6, h: 2, visible: true };
              if (id === 'bills') return { ...w!, w: 6, h: 2, visible: true };
              return { ...w!, w: 6, h: 2, visible: false };
          });
      }
      
      if (newConfig.length > 0) {
          updateWidgets(newConfig);
      }
  };

  const renderActiveShape = (props: any) => {
    return <Sector {...props} stroke="none" />;
  };

  // --- Widget Renderers ---
  const renderWidgetContent = (widget: any) => {
    const isLocked = !isDemo && user.plan === 'FREE';
    const unlockedGlow = !isLocked && justUpgraded ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '';

    if (widget.type === 'summary') {
      const isBillsLocked = !PLAN_LIMITS[user.plan].hasBillsWidget && !isDemo;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 h-full">
           <SummaryCard title="Total Balance" amount={stats.balance} icon={Wallet} color="primary" subtext="Available Funds" />
           <SummaryCard title="Total Income" amount={stats.income} icon={ArrowUpRight} color="accent" subtext="+12% vs last month" />
           <SummaryCard title="Total Expenses" amount={stats.expense} icon={ArrowDownRight} color="danger" subtext="Spend responsibly" />
           
           <div className="relative h-full rounded-2xl">
               <AnimatePresence>
                   {isBillsLocked && <LockOverlay requiredPlan="PRO" title="Pending Bills" />}
               </AnimatePresence>
               <div className={`h-full ${isBillsLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                   <SummaryCard title="Pending Bills" amount={stats.bills} icon={Calendar} color="warning" subtext="Due next 7 days" />
               </div>
           </div>
        </div>
      );
    } else if (widget.type === 'incomeChart') {
      // ... (Chart logic - unchanged)
      const hasData = chartData.some(d => d.income > 0 || d.expense > 0);
      
      const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-left min-w-[140px]">
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-3 text-sm pb-2 border-b border-slate-100 dark:border-slate-700">{label}</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-rose-500">Expenses :</span>
                            <span className="text-xs font-extrabold text-rose-500">{payload.find((p: any) => p.dataKey === 'expense')?.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold" style={{ color: activeChartColors[600] }}>Income :</span>
                            <span className="text-xs font-extrabold" style={{ color: activeChartColors[600] }}>{payload.find((p: any) => p.dataKey === 'income')?.value}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
      };

      return (
         <Card title={widget.title} className={`h-full relative group flex flex-col transition-all duration-500 ${unlockedGlow}`}>
            <AnimatePresence>{isLocked && <LockOverlay requiredPlan="PRO" title="Advanced Analytics" />}</AnimatePresence>
            <div className={`flex-1 w-full min-h-[250px] ${isLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeChartColors[500]} stopOpacity={0.2}/><stop offset="95%" stopColor={activeChartColors[500]} stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" dy={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income" stroke={activeChartColors[500]} strokeWidth={2} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={Activity} title="No Data Yet" description="Add activity to see trends" />}
            </div>
         </Card>
      );
    } else if (widget.type === 'expenseChart') {
      const totalMonthExpense = expenseByCategory.reduce((sum, item) => sum + item.value, 0);

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
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-left min-w-[120px] ring-1 ring-black/5 transition-opacity duration-300 ease-out"
                    style={{ transform: 'translate(10px, -50%)', opacity: show ? 1 : 0 }}
                >
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-2 h-2 rounded-full shadow-sm ring-1 ring-white dark:ring-slate-700" style={{ backgroundColor: data.payload.fill }}></div>
                        <p className="text-slate-800 dark:text-white font-bold text-xs truncate max-w-[100px]">{data.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            ${data.value.toLocaleString()}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
      };

      return (
         <Card title={widget.title} className={`h-full relative group flex flex-col transition-all duration-500 ${unlockedGlow}`}>
            <AnimatePresence>{isLocked && <LockOverlay requiredPlan="PRO" title="Detailed Breakdown" />}</AnimatePresence>
            <div className={`flex-1 flex flex-col sm:flex-row items-center gap-4 pt-2 ${isLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
               <div className="relative w-full sm:w-[45%] h-[200px] shrink-0 flex items-center justify-center [&_.recharts-surface]:outline-none">
                  {expenseByCategory.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={expenseByCategory} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={3} 
                                    dataKey="value" 
                                    activeShape={renderActiveShape}
                                    isAnimationActive={false}
                                >
                                {expenseByCategory.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]} strokeWidth={0} />)}
                                </Pie>
                                <Tooltip content={<CustomExpenseTooltip />} wrapperStyle={{ outline: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total</span>
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">${totalMonthExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </>
                  ) : <EmptyState icon={PieIcon} title="No Data" description="No expenses this month" />}
               </div>
               <div className="w-full sm:w-[55%] space-y-2 pr-2">
                  {expenseByCategory.map((entry, index) => (
                     <div key={index} className="flex items-center text-xs justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2 min-w-0"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length] }}></div><span className="truncate">{entry.name}</span></div>
                        <span className="font-bold whitespace-nowrap">${entry.value.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>
         </Card>
      );
    } else if (widget.type === 'transactions') {
      const recent = transactions.slice(0, 5);
      return (
         <Card title={widget.title} className="h-full relative group flex flex-col" action={!isLocked ? <Button variant="ghost" className="!p-1.5" onClick={() => window.location.hash = '#/tracking'}><ArrowRight size={16}/></Button> : null}>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4 space-y-1">
                {recent.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[150px]">
                        <EmptyState 
                            icon={Receipt} 
                            title="No activity yet" 
                            description="Transactions you add will appear here." 
                        />
                    </div>
                ) : (
                    recent.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer" onClick={() => !isEditMode && setEditingTransaction(t)}>
                            <div className="flex items-center gap-3 min-w-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</div><div className="min-w-0"><p className="font-bold text-slate-900 dark:text-white text-sm truncate">{t.description}</p></div></div>
                            <span className={`font-bold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>
         </Card>
      );
    } else if (widget.type === 'bills') {
      const recentBills = transactions.filter(t => t.type === 'bill').slice(0, 3);
      return (
         <Card title={widget.title} className="h-full relative group flex flex-col" action={!isLocked ? <Button variant="ghost" className="!p-1.5" onClick={() => window.location.hash = '#/bills'}><ArrowRight size={16}/></Button> : null}>
            <AnimatePresence>{isLocked && <LockOverlay requiredPlan="PRO" title="Upcoming Bills" />}</AnimatePresence>
            <div className={`flex-1 flex flex-col justify-center space-y-3 ${isLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                {recentBills.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[150px]">
                        <EmptyState 
                            icon={Calendar} 
                            title="No upcoming bills" 
                            description="Recurring payments will show up here."
                        />
                    </div>
                ) : (
                    recentBills.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                            <div className="flex items-center gap-3 min-w-0"><div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-amber-500 shadow-sm shrink-0"><Calendar size={16} /></div><div className="min-w-0"><p className="font-bold text-slate-900 dark:text-white text-sm truncate">{t.description}</p></div></div>
                            <span className="font-bold text-sm text-amber-600 dark:text-amber-500 whitespace-nowrap">${t.amount.toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>
         </Card>
      );
    }
    return null;
  };

  const renderLayoutItem = (item: any, domIndex: number) => {
      // GAP ITEM
      if (item.type === 'gap') {
          return (isEditMode ? <GapSlot key={`gap-${item.index}`} w={item.w} index={item.index} hasSelection={!!swapSelection} onSelect={handleSwapSelect} /> : <div key={`gap-${item.index}`} style={{ display: 'none' }} />);
      }

      // WIDGET ITEM
      const widget = item.widget;
      const index = item.index;

      const EditOverlay = () => {
        const isSelected = swapSelection === widget.id;

        const handleOverlayClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleSwapSelect(widget.id);
        };

        return (
            <motion.div 
                onClick={handleOverlayClick}
                className={`absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                    isSelected 
                    ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/20 scale-[1.02]' 
                    : 'bg-slate-900/40 border-dashed border-white/50 hover:bg-slate-900/30'
                }`}
                whileHover={{ scale: 1.01 }}
            >
                <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm mb-2 ${
                    isSelected 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-slate-800'
                }`}>
                    {isSelected ? (
                        <><CheckCircle size={16} /> Selected</>
                    ) : (
                        <><ArrowLeftRight size={16} /> {swapSelection ? 'Swap Here' : 'Tap to Swap'}</>
                    )}
                </div>
            </motion.div>
        );
      };

      const isFullWidth = widget.w === 12;
      const heightStyle = widget.id === 'incomeChart' && isFullWidth ? { minHeight: '400px' } : {};

      return (
        <div 
            key={widget.id}
            className={`relative transition-all duration-300 ease-in-out col-span-12 md:col-[span_var(--w)] row-[span_var(--h)] ${isEditMode ? 'z-10' : ''} ${!widget.visible && isEditMode ? 'opacity-50 grayscale' : ''}`}
            style={{ 
                '--w': widget.w,
                '--h': widget.h,
                ...heightStyle
            } as any}
        >
            {isEditMode && <EditOverlay />}
            {renderWidgetContent(widget)}
        </div>
      );
  };

  // --- Render Plan Banner ---
  const renderPlanStatusBanner = () => {
        if (isDemo) return null;
        const isFree = user.plan === 'FREE';
        let planName = user.plan === 'FREE' ? 'Free Plan' : user.plan === 'PRO' ? 'Pro Plan' : 'Premium Plan';
        const bgStyle = user.plan === 'PREMIUM' ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10' : user.plan === 'PRO' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-slate-800/30';
        const iconStyle = user.plan === 'PREMIUM' ? 'bg-gradient-to-tr from-primary-600 to-accent-600 text-white' : user.plan === 'PRO' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
        const glowClass = !isFree && justUpgraded ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '';

        return (
           <div className={`relative w-full rounded-xl overflow-hidden transition-all duration-700 ease-in-out border border-slate-200 dark:border-slate-800 shadow-sm ${glowClass}`}>
              <div className={`py-1.5 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 ${bgStyle}`}>
                 <div className="flex items-center gap-2 shrink-0">
                    <div className={`p-1 rounded-md shadow-sm shrink-0 ${iconStyle}`}>{user.plan === 'PREMIUM' ? <Crown size={12} /> : user.plan === 'PRO' ? <Zap size={12} /> : <CheckCircle size={12} />}</div>
                    <div><div className="flex items-center gap-1.5"><h3 className="font-bold text-slate-900 dark:text-white text-[10px] sm:text-xs">{planName}</h3>{!isFree && <span className="hidden sm:flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1 py-px rounded-full"><Check size={8} strokeWidth={4}/> Active</span>}</div><p className="text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 whitespace-nowrap">{isFree ? 'Limited features' : 'Active Plan'}</p></div>
                 </div>
                 <div className="shrink-0"><Button onClick={() => window.location.hash = '#/upgrade'} variant={isFree ? 'primary' : 'secondary'} className="!py-1 !px-2.5 !text-[10px] !h-7 min-h-0">{isFree ? 'Upgrade' : 'Manage'}</Button></div>
              </div>
           </div>
        );
  };

  const enterEditMode = () => {
    setIsEditMode(true);
    setIsCustomizeOpen(false);
  };

  // Determine if the drawer content is locked for the current user
  const isDrawerLocked = !isDemo && user.plan === 'FREE';
  const canMoveWidgets = PLAN_LIMITS[user.plan].canMove || isDemo;

  return (
    <div className="space-y-6 pb-20 relative">
       {/* Top Banner for Edit Mode */}
       <AnimatePresence>
         {isEditMode && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="sticky top-0 z-40 -mt-4 mb-4"
           >
             <div className="bg-slate-900 text-white shadow-xl rounded-b-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary-600 rounded-lg"><Grid size={20} /></div>
                   <div>
                      <h3 className="font-bold text-sm">Editing Layout</h3>
                      <p className="text-xs text-slate-400">
                          {swapSelection ? "Tap a target to move the selected widget." : "Select a widget to move or swap."}
                      </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="secondary" onClick={() => setIsEditMode(false)} className="!py-1.5 !px-3 !text-xs !bg-slate-800 !text-white !border-slate-700">Cancel</Button>
                   <Button onClick={() => setIsEditMode(false)} className="!py-1.5 !px-4 !text-xs !bg-white !text-slate-900">Done</Button>
                </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Header */}
       {!isEditMode && (
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
                 <p className="text-slate-500 dark:text-slate-400">Overview of your financial activity</p>
             </div>
             
             <div className="flex gap-2">
                 <button onClick={() => setIsCustomizeOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <Layout size={18} /> Customize
                 </button>
                 {!isDemo && user.plan !== 'PREMIUM' && (
                   <button onClick={() => { if (user.plan === 'PRO') { setUpgradeRequiredPlan('PREMIUM'); setLockedFeatureName('Ultimate Experience'); } else { setUpgradeRequiredPlan('PRO'); setLockedFeatureName('Pro Experience'); } setUpgradeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                     {user.plan === 'PRO' ? <Crown size={18} /> : <Zap size={18} />} Upgrade Plan
                   </button>
                 )}
             </div>
         </div>
       )}

       {/* Plan Status Banner */}
       {!isEditMode && renderPlanStatusBanner()}

       {/* Widgets Grid */}
       <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)] transition-all ${isEditMode ? 'gap-6 p-4 border-2 border-dashed border-primary-200 dark:border-primary-900/30 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
          {layoutItems.map((item, index) => renderLayoutItem(item, index))}
          
          {/* Visual Drop Zone for Empty Space (New Row) - Edit Mode Only */}
          {isEditMode && <EmptySlot hasSelection={!!swapSelection} onSelect={(id) => handleSwapSelect(id)} />}
       </div>
       
       {/* Customize Drawer */}
       <Drawer isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} title="Dashboard Layout">
           <div className="relative h-full flex flex-col">
               <AnimatePresence>
                  {isDrawerLocked && (
                      <LockOverlay requiredPlan="PRO" title="Custom Dashboard" />
                  )}
               </AnimatePresence>
               <div className={`flex-1 flex flex-col gap-6 ${isDrawerLocked ? 'blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
                   
                   {/* 1. Quick Layouts */}
                   <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2 mb-4">
                           <LayoutTemplate size={16} className="text-primary-500" />
                           <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Layouts</h3>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                           <button onClick={() => applyLayoutPreset('default')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all">
                               <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-md grid grid-cols-2 gap-0.5 p-0.5">
                                   <div className="col-span-2 bg-slate-300 dark:bg-slate-600 rounded-sm h-1.5"></div>
                                   <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                                   <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                               </div>
                               <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Standard</span>
                           </button>
                           <button onClick={() => applyLayoutPreset('focus')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all">
                               <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-md grid grid-cols-1 gap-0.5 p-0.5">
                                   <div className="bg-slate-300 dark:bg-slate-600 rounded-sm h-1.5"></div>
                                   <div className="bg-primary-400 dark:bg-primary-600 rounded-sm h-full"></div>
                               </div>
                               <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Focus</span>
                           </button>
                           <button onClick={() => applyLayoutPreset('minimal')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all">
                               <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-md grid grid-cols-2 gap-0.5 p-0.5">
                                   <div className="col-span-2 bg-slate-300 dark:bg-slate-600 rounded-sm h-1.5"></div>
                                   <div className="col-span-1 bg-slate-300 dark:bg-slate-600 rounded-sm h-full"></div>
                                   <div className="col-span-1 bg-slate-300 dark:bg-slate-600 rounded-sm h-full"></div>
                               </div>
                               <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Minimal</span>
                           </button>
                       </div>
                   </div>

                   {/* 2. Visibility Toggles */}
                   <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1">
                       <div className="flex items-center gap-2 mb-4">
                           <Eye size={16} className="text-primary-500" />
                           <h3 className="text-sm font-bold text-slate-900 dark:text-white">Widget Visibility</h3>
                       </div>
                       <div className="space-y-3">
                           {widgets.map(w => {
                               // Only show lock if user is FREE (which is handled by parent overlay anyway)
                               // PRO and PREMIUM users should see no lock here.
                               const isToggleLocked = !isDemo && user.plan === 'FREE';
                               return (
                                   <div key={w.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors hover:border-primary-200 dark:hover:border-primary-900/50">
                                       <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{w.title}</span>
                                       <div className="flex items-center gap-2">
                                          {/* Since parent is locked for FREE, we don't strictly need icon, but keep logic clean */}
                                          {isToggleLocked && <Lock size={14} className="text-slate-400" />}
                                          <button onClick={() => toggleWidgetVisibility(w.id)} className={`p-2 rounded-lg transition-colors ${w.visible ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                              {w.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                          </button>
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                   </div>
               </div>
           </div>
       </Drawer>

       <TransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} initialData={editingTransaction || undefined} />
       <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName={lockedFeatureName || "Premium Features"} requiredPlan={upgradeRequiredPlan} />
    </div>
  );
}