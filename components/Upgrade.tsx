import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Check, CreditCard, Star, Shield, Zap, Crown, ArrowRight, Layout, History, Palette, MousePointer2, Sparkles, Rocket, Infinity as InfinityIcon } from 'lucide-react';
import { Button, Modal } from './UIComponents';
import { PlanType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Upgrade() {
  const { user, updateUserPlan, isDemo, openAuthModal, notify } = useFinance();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPlanId, setSuccessPlanId] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();

  const handleSubscribe = (plan: PlanType) => {
    if (isDemo) {
        notify('info', 'Please create an account or log in to select a plan.');
        openAuthModal('signup');
        return;
    }
    setSelectedPlan(plan);
  };

  const confirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (selectedPlan) {
          updateUserPlan(selectedPlan);
          setSuccessPlanId(selectedPlan); // Trigger Welcome Screen
      }
      setIsProcessing(false);
      setSelectedPlan(null); // Close Payment Modal
    }, 2000);
  };

  const handleWelcomeClose = () => {
      setSuccessPlanId(null);
      navigate('/dashboard');
  };

  interface PlanFeature {
    text: string;
    included: boolean;
    dimmed?: boolean;
    highlight?: boolean;
  }

  // Plan Definitions
  const PLANS: {
    id: string;
    title: string;
    price: string;
    period: string;
    description: string;
    icon: any;
    isPopular: boolean;
    buttonVariant: string;
    features: PlanFeature[];
  }[] = [
    {
      id: 'FREE',
      title: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Essential tracking for individuals just getting started.',
      icon: Shield,
      isPopular: false,
      buttonVariant: 'outline',
      features: [
        { text: '50 Transactions / Month', included: true },
        { text: 'Add Income & Expenses', included: true },
        { text: 'Current Month History', included: true },
        { text: 'Bill Tracking', included: false },
        { text: 'Standard Theme (Ocean)', included: true },
        { text: 'No Notifications', included: true, dimmed: true },
        { text: 'No Display Name Change', included: true, dimmed: true },
        { text: 'Savings & Analysis', included: false },
      ]
    },
    {
      id: 'PRO',
      title: 'Professional',
      price: billingCycle === 'yearly' ? '$89.99' : '$8.99',
      period: billingCycle === 'yearly' ? '/year' : '/month',
      description: 'Remove limits and gain control over your financial data.',
      icon: Zap,
      isPopular: true,
      buttonVariant: 'primary',
      features: [
        { text: '500 Transactions / Month', included: true, highlight: true },
        { text: '2 Months History', included: true },
        { text: 'Bill Tracking & Reminders', included: true },
        { text: 'Savings & Analysis Page', included: true },
        { text: '6 Pro Themes', included: true },
        { text: 'Toggle Widgets & Layouts', included: true },
        { text: 'Unlimited Name Changes', included: true },
      ]
    },
    {
      id: 'PREMIUM',
      title: 'Ultimate',
      price: billingCycle === 'yearly' ? '$149.99' : '$14.99',
      period: billingCycle === 'yearly' ? '/year' : '/month',
      description: 'AI-powered insights and total customization for power users.',
      icon: Crown,
      isPopular: false,
      buttonVariant: 'premium', // Custom handling
      features: [
        { text: 'Everything in Pro', included: true },
        { text: '5000 Transactions / Month', included: true, highlight: true },
        { text: '5 Months History', included: true },
        { text: 'AI Insights & Forecasting', included: true, highlight: true },
        { text: 'Custom Theme Builder', included: true },
        { text: 'Wealth Growth & 7-Day Trend', included: true },
      ]
    }
  ];

  const successPlanData = PLANS.find(p => p.id === successPlanId);

  // Comparison Data
  const renderValue = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className="flex justify-center"><div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full p-1"><Check size={16} strokeWidth={4} /></div></div>
      ) : (
        <div className="flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /></div>
      );
    }
    return val;
  };

  const COMPARISON_ROWS = [
    { category: 'Usage Limits', items: [
        { name: 'Transactions', free: '50/mo', pro: '500/mo', premium: '5000/mo' },
        { name: 'History Access', free: 'Current Month', pro: '2 Months', premium: '5 Months' },
    ]},
    { category: 'Dashboard & Design', items: [
        { name: 'Layout Control', free: 'Fixed', pro: '3 Layouts', premium: '3 Layouts' },
        { name: 'Theme Selection', free: 'Standard', pro: '6 Themes', premium: '6 Themes' },
        { name: 'Custom Theme Builder', free: false, pro: false, premium: true },
    ]},
    { category: 'Analytics', items: [
        { name: 'Savings Page', free: false, pro: true, premium: true },
        { name: 'Bills Page', free: false, pro: true, premium: true },
        { name: 'Wealth Growth', free: false, pro: false, premium: true },
        { name: '7-Day Trend', free: false, pro: false, premium: true },
        { name: 'Financial Insights Dashboard', free: false, pro: false, premium: true },
        { name: 'AI Insights & Forecasting', free: false, pro: false, premium: true },
    ]},
    { category: 'Account Features', items: [
        { name: 'Bill Notifications', free: false, pro: true, premium: true },
        { name: 'Display Name Updates', free: 'Locked', pro: 'Unlimited', premium: 'Unlimited' },
        { name: 'Avatar Customization', free: 'Locked', pro: 'Unlimited', premium: 'Unlimited' },
    ]}
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="text-center mb-12 pt-8">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-bold text-xs uppercase tracking-wider"
        >
           <Sparkles size={14} /> Upgrade your experience
        </motion.div>
        <motion.h2 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight"
        >
          Simple Pricing, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Powerful Tools</span>
        </motion.h2>
        <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8"
        >
          Choose the plan that fits your financial journey. Upgrade, downgrade, or cancel anytime.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="flex items-center justify-center gap-4"
        >
           <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
           <button 
             onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
             className="relative w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors focus:outline-none"
           >
              <motion.div 
                 className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                 animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
           </button>
           <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Yearly 
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                 Save 17%
              </span>
           </span>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto mb-20">
        {PLANS.map((plan, index) => {
          const isCurrent = !isDemo && user.plan === plan.id;
          const isPremium = plan.id === 'PREMIUM';
          const Icon = plan.icon;
          
          return (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -12 }} // More noticeable lift
              className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 ${
                 isPremium 
                 ? 'bg-slate-900 text-white shadow-2xl shadow-primary-500/30 scale-105 z-10 border border-slate-700 dark:border-slate-700' 
                 : 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-transparent'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                   <Star size={12} fill="currentColor" /> MOST POPULAR
                </div>
              )}
              
              {isPremium && (
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] -z-10" />
              )}

              {/* Header */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl shadow-sm ${
                    isPremium ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                   <Icon size={24} />
                </div>
                <h3 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                   {plan.title}
                </h3>
                <p className={`text-sm mt-2 leading-relaxed ${isPremium ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                   {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800/50">
                 <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-extrabold tracking-tight ${isPremium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                       {plan.price}
                    </span>
                    <span className={`text-sm font-semibold ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
                 </div>
                 {billingCycle === 'yearly' && plan.price !== '$0' && (
                    <p className={`text-xs mt-2 font-medium ${isPremium ? 'text-emerald-400' : 'text-emerald-600'}`}>
                       Billed yearly (Save 17%)
                    </p>
                 )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-4 mb-8">
                 {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-40' : ''}`}>
                       <div className={`mt-0.5 shrink-0 ${
                           feature.included 
                             ? (isPremium ? 'text-primary-400' : 'text-primary-600 dark:text-primary-400') 
                             : 'text-slate-400'
                       }`}>
                          {feature.included ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                       </div>
                       <span className={`font-medium ${
                           feature.highlight 
                             ? (isPremium ? 'text-white' : 'text-slate-900 dark:text-white') 
                             : (isPremium ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300')
                       } ${feature.dimmed ? 'opacity-80 italic' : ''}`}>
                          {feature.text}
                       </span>
                    </li>
                 ))}
              </ul>

              {/* CTA Button */}
              <Button 
                onClick={() => handleSubscribe(plan.id as PlanType)}
                disabled={isCurrent}
                className={`w-full py-4 text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-xl ${
                   isPremium 
                   ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white border-none hover:brightness-110'
                   : isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default shadow-none'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                }`}
              >
                 {isCurrent ? 'Current Plan' : plan.id === 'FREE' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Section */}
      <div className="max-w-7xl mx-auto mt-24 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Compare Plans</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">Find the perfect fit for your financial goals.</p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
             {/* Desktop Table */}
             <div className="hidden md:block">
                <div className="grid grid-cols-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                   <div className="p-8"></div>
                   <div className="p-8 text-center">
                     <span className="block font-bold text-slate-900 dark:text-white text-lg">Starter</span>
                     <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Free</span>
                   </div>
                   <div className="p-8 text-center bg-primary-50/30 dark:bg-primary-900/10">
                     <span className="block font-bold text-primary-600 dark:text-primary-400 text-lg">Professional</span>
                     <span className="block text-xs text-primary-600/70 dark:text-primary-400/70 font-bold uppercase tracking-wider mt-1">Most Value</span>
                   </div>
                   <div className="p-8 text-center bg-amber-50/30 dark:bg-amber-900/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2">
                       <Crown size={14} className="text-amber-500" fill="currentColor" />
                     </div>
                     <span className="block font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 text-lg">Ultimate</span>
                     <span className="block text-xs text-amber-600/70 dark:text-amber-400/70 font-bold uppercase tracking-wider mt-1">Premium</span>
                   </div>
                </div>
                {COMPARISON_ROWS.map((section, idx) => (
                   <div key={idx}>
                      <div className="px-8 py-4 bg-slate-100/50 dark:bg-slate-800/80 font-bold text-xs uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          {section.category}
                      </div>
                      {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                              <div className="p-6 px-8 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</div>
                              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center font-medium">
                                  {renderValue(item.free)}
                              </div>
                              <div className="p-6 text-center text-sm font-bold text-slate-900 dark:text-white bg-primary-50/10 dark:bg-primary-900/5 flex items-center justify-center border-x border-slate-100 dark:border-slate-800">
                                  {renderValue(item.pro)}
                              </div>
                              <div className="p-6 text-center text-sm font-extrabold text-slate-900 dark:text-white bg-amber-50/10 dark:bg-amber-900/5 flex items-center justify-center">
                                  {renderValue(item.premium)}
                              </div>
                          </div>
                      ))}
                   </div>
                ))}
             </div>

             {/* Mobile Table */}
             <div className="md:hidden overflow-x-auto">
                <div className="min-w-[600px]">
                   <div className="grid grid-cols-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                       <div className="p-4"></div>
                       <div className="p-4 text-center font-bold text-slate-900 dark:text-white text-sm">Free</div>
                       <div className="p-4 text-center font-bold text-primary-600 dark:text-primary-400 bg-primary-50/30 dark:bg-primary-900/10 text-sm">Pro</div>
                       <div className="p-4 text-center font-bold text-amber-600 dark:text-amber-500 bg-amber-50/30 dark:bg-amber-900/10 text-sm">Prem</div>
                   </div>
                   {COMPARISON_ROWS.map((section, idx) => (
                     <div key={idx}>
                        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800 sticky left-0">
                            {section.category}
                        </div>
                        {section.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div className="p-3 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center bg-white dark:bg-slate-900 sticky left-0">{item.name}</div>
                                <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center font-medium bg-white dark:bg-slate-900">
                                    {renderValue(item.free)}
                                </div>
                                <div className="p-3 text-center text-xs font-bold text-slate-900 dark:text-white bg-primary-50/20 dark:bg-primary-900/5 flex items-center justify-center">
                                    {renderValue(item.pro)}
                                </div>
                                <div className="p-3 text-center text-xs font-extrabold text-slate-900 dark:text-white bg-amber-50/20 dark:bg-amber-900/5 flex items-center justify-center">
                                    {renderValue(item.premium)}
                                </div>
                            </div>
                        ))}
                     </div>
                   ))}
                </div>
             </div>
          </div>
      </div>
      
      {/* FAQ or Trust Section */}
      <div className="mt-20 text-center max-w-3xl mx-auto">
          <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold">Trusted by savvy budgeters</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos if needed, or simple text stats */}
             <div className="flex flex-col items-center">
                <Shield size={24} className="mb-2 text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Secure</span>
             </div>
             <div className="flex flex-col items-center">
                <InfinityIcon size={24} className="mb-2 text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Unlimited</span>
             </div>
             <div className="flex flex-col items-center">
                <Zap size={24} className="mb-2 text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Fast</span>
             </div>
             <div className="flex flex-col items-center">
                <Layout size={24} className="mb-2 text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Flexible</span>
             </div>
          </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="Secure Checkout">
         {isProcessing ? (
           <div className="flex flex-col items-center justify-center py-12">
             <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-primary-100 dark:border-slate-700 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-t-primary-600 rounded-full animate-spin absolute inset-0"></div>
             </div>
             <p className="text-slate-800 dark:text-white font-bold text-lg animate-pulse">Processing payment...</p>
             <p className="text-slate-500 text-sm mt-2">Please do not close this window</p>
           </div>
         ) : (
           <div className="space-y-6">
             <div className="bg-gradient-to-br from-slate-50 to-primary-50/50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700">
               <div>
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Plan Selected</span>
                  <span className="block font-bold text-2xl text-slate-900 dark:text-white">{PLANS.find(p => p.id === selectedPlan)?.title}</span>
               </div>
               <div className="text-right">
                  <span className="block text-3xl font-extrabold text-primary-600 dark:text-primary-400">{PLANS.find(p => p.id === selectedPlan)?.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{PLANS.find(p => p.id === selectedPlan)?.period}</span>
               </div>
             </div>
             
             <div className="space-y-3">
               <p className="text-sm font-bold text-slate-900 dark:text-white">Select Payment Method</p>
               
               <button onClick={confirmPayment} className="w-full flex items-center gap-4 p-4 border rounded-2xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all bg-white dark:bg-slate-900 group">
                 <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
                   <CreditCard size={24} />
                 </div>
                 <div className="text-left flex-1">
                   <p className="font-bold text-slate-900 dark:text-white">Credit Card</p>
                   <p className="text-xs text-slate-500">Secure encrypted connection</p>
                 </div>
                 <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               </button>
               
               <button onClick={confirmPayment} className="w-full flex items-center gap-4 p-4 border rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all bg-white dark:bg-slate-900 group">
                 <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center text-white text-lg font-bold italic shadow-sm">
                   P
                 </div>
                 <div className="text-left flex-1">
                    <span className="font-bold text-slate-900 dark:text-white block">PayPal</span>
                    <span className="text-xs text-slate-500">Fast and easy checkout</span>
                 </div>
                 <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-blue-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               </button>
             </div>
             
             <p className="text-xs text-center text-slate-400 mt-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
               <Shield size={12} className="inline mr-1 mb-0.5" />
               This is a <strong>simulated transaction</strong> for demo purposes. No real money will be charged.
             </p>
           </div>
         )}
      </Modal>

      {/* SUCCESS WELCOME MODAL */}
      <AnimatePresence>
        {successPlanData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
             {/* Backdrop */}
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
             
             {/* Floating Particles (Confetti) */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {[...Array(6)].map((_, i) => (
                    <motion.div 
                       key={i}
                       initial={{ y: '100vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
                       animate={{ 
                         y: '-20vh', 
                         opacity: [0, 1, 0],
                         rotate: 360 
                       }}
                       transition={{ 
                         duration: 5 + Math.random() * 5, 
                         repeat: Infinity,
                         delay: i * 0.5 
                       }}
                       className="absolute"
                    >
                       <Star size={Math.random() * 20 + 10} className="text-yellow-400 opacity-50" fill="currentColor" />
                    </motion.div>
                 ))}
             </div>

             {/* Modal Content */}
             <motion.div 
               initial={{ scale: 0.8, opacity: 0, y: 50 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.8, opacity: 0, y: 50 }}
               transition={{ type: "spring", damping: 20 }}
               className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
             >
                {/* Decorative Header Background */}
                <div className={`h-32 w-full absolute top-0 left-0 bg-gradient-to-b ${successPlanData.id === 'PREMIUM' ? 'from-slate-800 to-slate-900' : 'from-primary-600 to-primary-800'}`}></div>
                <div className="h-32 w-full absolute top-0 left-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative pt-12 px-8 pb-8 text-center">
                    {/* Icon Bubble */}
                    <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.2 }}
                       className={`w-24 h-24 mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-6 relative z-10 ${successPlanData.id === 'PREMIUM' ? 'ring-4 ring-primary-500/30' : 'ring-4 ring-blue-500/30'}`}
                    >
                       <motion.div
                         animate={{ rotate: [0, 10, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                       >
                         {successPlanData.id === 'PREMIUM' ? (
                            <Crown size={48} className="text-amber-500" fill="currentColor" />
                         ) : (
                            <Zap size={48} className="text-blue-500" fill="currentColor" />
                         )}
                       </motion.div>
                       
                       {/* Sparkle Badge */}
                       <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2 rounded-full shadow-lg">
                          <Sparkles size={16} fill="currentColor" />
                       </div>
                    </motion.div>

                    <motion.div
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                           Welcome to {successPlanData.title}!
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
                           You've unlocked the full power of BudgetQuickly. <br/> Here is what you can do now:
                        </p>
                    </motion.div>

                    {/* Features List (Updated to filter by Included & Highlighted if desired, or just list a few) */}
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 0.4 }}
                       className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 text-left grid grid-cols-1 gap-3"
                    >
                        {successPlanData.features.filter(f => f.included && f.highlight).slice(0, 4).map((feat, i) => (
                           <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                               <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                  <Check size={14} strokeWidth={3} />
                               </div>
                               {feat.text}
                           </div>
                        ))}
                         {/* Fallback if no highlights */}
                         {successPlanData.features.filter(f => f.included && !f.highlight).slice(0, 2).map((feat, i) => (
                           <div key={`fallback-${i}`} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                               <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                  <Check size={14} strokeWidth={3} />
                               </div>
                               {feat.text}
                           </div>
                        ))}
                    </motion.div>

                    <motion.div
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.5 }}
                    >
                       <Button 
                         onClick={handleWelcomeClose}
                         className={`w-full py-4 text-base font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-transform ${successPlanData.id === 'PREMIUM' ? 'bg-gradient-to-r from-primary-600 to-accent-600' : 'bg-primary-600'}`}
                       >
                          Get Started <Rocket size={18} className="ml-2" />
                       </Button>
                    </motion.div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}