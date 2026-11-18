import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, PlanBadge, LockOverlay, Button, UpgradeTriggerModal } from './UIComponents';
import { ResponsiveContainer, ComposedChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area } from 'recharts';
import { Lock, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { format } from 'date-fns';
import { PLAN_LIMITS } from '../constants';
import { AnimatePresence } from 'framer-motion';

export default function Savings() {
  const { transactions, user, isDemo, currentThemeColors, justUpgraded } = useFinance();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Logic: "Locked" means user is on FREE plan and NOT in demo.
  // We will apply this lock to specific widgets instead of the whole page.
  const isLocked = !PLAN_LIMITS[user.plan].hasSavingsPage && !isDemo;
  const isAiLocked = !PLAN_LIMITS[user.plan].hasAiInsights && !isDemo;
  
  // Premium feature specific lock
  const isPremium = PLAN_LIMITS[user.plan].hasWealthGrowth || isDemo; 

  const unlockedGlow = (locked: boolean) => !locked && justUpgraded ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '';

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Calculate Real History Data from Transactions
  const historyData = useMemo(() => {
    // Dynamic history length based on plan limits
    const monthsToShow = isDemo ? 12 : (PLAN_LIMITS[user.plan].historyMonths || 1);
    
    const data = [];
    const now = new Date();

    for (let i = monthsToShow - 1; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = format(targetDate, 'MMM yyyy');
        
        // Aggregate data for this specific month
        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === targetDate.getMonth() && tDate.getFullYear() === targetDate.getFullYear();
        });

        const mIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const mExpense = monthlyTransactions
            .filter(t => t.type === 'expense' || t.type === 'bill')
            .reduce((sum, t) => sum + t.amount, 0);

        data.push({
            name: format(targetDate, 'MMM'),
            fullDate: monthLabel,
            income: mIncome,
            expenses: mExpense,
            savings: mIncome - mExpense
        });
    }
    return data;
  }, [transactions, user.plan, isDemo]);

  let suggestion = "";
  if (savingsRate > 20) suggestion = "Excellent! You're saving over 20%. Consider moving excess funds to an investment account.";
  else if (savingsRate > 0) suggestion = "You're in the green. Try cutting dining out to boost your savings rate to 20%.";
  else suggestion = "Alert: Expenses exceed income. Review recurring subscriptions and essential spending.";

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Saving & Analysis</h1>
         <p className="text-slate-500 dark:text-slate-400">Track your financial health and history</p>
      </div>

      <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Widget 1: Net Savings */}
            <div className={`relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 dark:shadow-none overflow-hidden ${unlockedGlow(isLocked)}`}>
               <AnimatePresence>
                   {isLocked && <LockOverlay requiredPlan="PRO" title="Net Savings" />}
               </AnimatePresence>
               <div className={`relative z-10 transition-all duration-300 ${isLocked ? 'blur-sm opacity-50' : ''}`}>
                 <div className="flex items-center gap-3 mb-4 opacity-90">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><PiggyBank size={20} /></div>
                    <span className="font-medium">Net Savings</span>
                 </div>
                 <h2 className="text-4xl font-bold mb-1">${savings.toLocaleString()}</h2>
                 <p className="text-emerald-100 text-sm">Remaining total</p>
               </div>
               <PiggyBank size={120} className="absolute -right-6 -bottom-6 opacity-20 rotate-12" />
            </div>

            {/* Widget 2: Savings Rate */}
            <div className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft dark:shadow-none flex flex-col justify-center overflow-hidden ${unlockedGlow(isLocked)}`}>
               <AnimatePresence>
                   {isLocked && <LockOverlay requiredPlan="PRO" title="Savings Rate" />}
               </AnimatePresence>
               <div className={`transition-all duration-300 ${isLocked ? 'blur-sm opacity-50' : ''}`}>
                 <div className="flex items-center gap-3 mb-2 text-primary-600 dark:text-primary-400">
                    <TrendingUp size={20} />
                    <span className="font-medium">Savings Rate</span>
                 </div>
                 <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{savingsRate.toFixed(1)}%</h2>
                 <p className="text-slate-500 text-sm mt-1">Of total income</p>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-primary-600 h-full rounded-full" style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}></div>
                 </div>
               </div>
            </div>

            {/* Widget 3: AI Insight (PREMIUM LOCKED) */}
            <div className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft dark:shadow-none flex flex-col justify-center overflow-hidden ${unlockedGlow(isAiLocked)}`}>
               <AnimatePresence>
                   {isAiLocked && <LockOverlay requiredPlan="PREMIUM" title="AI Insight" />}
               </AnimatePresence>
               <div className={`transition-all duration-300 ${isAiLocked ? 'blur-sm opacity-50' : ''}`}>
                 <div className="flex items-center gap-3 mb-3 text-purple-600 dark:text-purple-400">
                    <Target size={20} />
                    <span className="font-medium">AI Insight</span>
                 </div>
                 <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">"{suggestion}"</p>
               </div>
            </div>
          </div>

          {/* Advanced Chart */}
          <Card title="Income vs Expenses" className={`relative`}>
            <div className="relative rounded-2xl overflow-hidden">
                 <AnimatePresence>
                    {isLocked && <LockOverlay requiredPlan="PRO" title="History Analysis" />}
                 </AnimatePresence>
                 <div className={`h-80 w-full transition-all duration-700 ease-in-out ${isLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                        <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} 
                        />
                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                        <Bar dataKey="income" fill={currentThemeColors[500]} radius={[6, 6, 0, 0]} name="Income" maxBarSize={50} />
                        <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" maxBarSize={50} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </Card>

          {/* Trend Analysis (Premium Locked) */}
          <Card title="Wealth Growth Trend (Premium)" className={`relative ${unlockedGlow(!isPremium)}`}>
            <div className="relative rounded-2xl overflow-hidden">
                <AnimatePresence>
                   {!isPremium && <LockOverlay requiredPlan="PREMIUM" title="Growth Analysis" />}
                </AnimatePresence>
                <div className={`h-64 w-full transition-all duration-700 ease-in-out ${!isPremium ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={historyData}>
                        <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" dy={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="savings" stroke="none" fill="url(#colorSavings)" />
                        <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{ r: 6 }} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </Card>
      </div>
      
      <UpgradeTriggerModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} featureName="Savings Analytics" requiredPlan="PRO" />
    </div>
  );
}