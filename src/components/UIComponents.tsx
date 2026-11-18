import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Info, Plus, Calendar, Lock, ArrowRight, Zap, Trash2, ChevronDown, Crown, Check, Sparkles, ArrowLeft, ArrowDownRight, Mail, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_INCOME_SOURCES, DEFAULT_EXPENSE_CATEGORIES, PLAN_LIMITS } from '../constants';
import { format, getDaysInMonth, isSameDay } from 'date-fns';

// --- BUTTON ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button', isLoading = false, ...props }: ButtonProps) => {
  const baseStyle = "relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 transform flex items-center justify-center gap-2 overflow-hidden";
  
  const variants = {
    // Primary: Gradient from Primary to Accent
    primary: "bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white shadow-lg shadow-primary-500/20 disabled:opacity-70",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-transparent",
    outline: "border border-primary-100 dark:border-slate-700 text-primary-600 dark:text-primary-400 hover:border-primary-200 dark:hover:border-slate-600 bg-transparent",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
  };

  return (
    <motion.button 
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled || isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : children}
    </motion.button>
  );
};

// --- CARD ---
export const Card = ({ children, title, action, className = '', noPadding = false }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col ${className}`}
  >
    {(title || action) && (
      <div className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0">
        {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-1 min-h-0`}>
      {children}
    </div>
  </motion.div>
);

// --- MODAL ---
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: any) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 350, mass: 0.5 }}
            className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md} overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col text-left my-8`}
            onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
            </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export const Drawer = ({ isOpen, onClose, title, children }: any) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-20">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const LockedPanel = ({ title, requiredPlan = "PRO" }: { title: string, requiredPlan?: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
        <div className="mb-4 text-slate-400 dark:text-slate-500">
           <Lock size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{title}</h3>
        <Button onClick={() => navigate('/upgrade')}>
           Upgrade to {requiredPlan}
        </Button>
    </div>
  );
};

export const LockOverlay = ({ requiredPlan = "PRO", title = "Locked" }: { requiredPlan?: "PRO" | "PREMIUM", title?: string }) => {
  const navigate = useNavigate();
  const isPremium = requiredPlan === 'PREMIUM';
  const planName = requiredPlan.charAt(0) + requiredPlan.slice(1).toLowerCase();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[inherit] overflow-hidden"
    >
       {/* Glass Backdrop */}
       <div className={`absolute inset-0 backdrop-blur-[3px] transition-all duration-500 ${
         isPremium 
           ? 'bg-gradient-to-br from-amber-500/10 via-slate-900/5 to-purple-600/10 dark:from-amber-500/10 dark:via-black/40 dark:to-purple-900/20' 
           : 'bg-white/60 dark:bg-slate-900/60'
       }`} />
       
       {/* Interactive Content - Compact and Centered */}
       <motion.div 
         initial={{ scale: 0.9, y: 10 }}
         animate={{ scale: 1, y: 0 }}
         transition={{ type: "spring", stiffness: 260, damping: 20 }}
         className="relative z-10 flex flex-col items-center justify-center text-center p-4 max-w-[90%]"
       >
           {/* Icon Container */}
           <motion.div 
             whileHover={{ scale: 1.1, rotate: isPremium ? [0, -5, 5, 0] : 0 }}
             className={`mb-3 p-3 rounded-2xl shadow-xl flex items-center justify-center transition-all ${
             isPremium
               ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-white ring-4 ring-white/30 dark:ring-black/30 shadow-orange-500/30'
               : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
           }`}>
              {isPremium ? <Crown size={24} strokeWidth={2.5} fill="rgba(255,255,255,0.2)" /> : <Lock size={20} strokeWidth={2.5} />}
           </motion.div>
           
           <h3 className={`text-sm font-extrabold mb-0.5 tracking-tight ${
             isPremium 
               ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-200 dark:to-orange-200 drop-shadow-sm' 
               : 'text-slate-800 dark:text-slate-100'
           }`}>
             {title}
           </h3>
           
           <p className={`text-[9px] font-bold uppercase tracking-widest mb-3 ${isPremium ? 'text-amber-600/70 dark:text-amber-200/50' : 'text-slate-400'}`}>
             {isPremium ? 'Premium Exclusive' : 'Pro Feature'}
           </p>
           
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={(e) => { e.stopPropagation(); navigate('/upgrade'); }}
             className={`group relative px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center gap-1.5 ${
               isPremium
                 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl'
                 : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-750'
             }`}
           >
             {isPremium ? (
               <>
                 <span>Unlock</span>
                 <Sparkles size={10} className="text-amber-400 dark:text-amber-600" />
               </>
             ) : (
               <>
                 <span>Upgrade</span>
                 <ArrowRight size={10} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
               </>
             )}
           </motion.button>
       </motion.div>
    </motion.div>
  );
};

export const UpgradeTriggerModal = ({ isOpen, onClose, featureName, requiredPlan = "PRO" }: any) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const planConfig = {
    PRO: {
      icon: Zap,
      price: '$8.99/mo',
      benefits: ['Unlimited Transactions', 'Advanced Analytics', 'Custom Themes', '1 Year History'],
      styles: {
        iconGradient: 'from-blue-500 to-indigo-600',
        shadow: 'shadow-blue-500/20',
        checkBg: 'bg-blue-100 dark:bg-blue-900/30',
        checkColor: 'text-blue-600 dark:text-blue-400',
        highlight: 'text-blue-600 dark:text-blue-400',
        button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
      }
    },
    PREMIUM: {
      icon: Crown,
      price: '$14.99/mo',
      benefits: ['AI Insights & Forecasting', 'Lifetime History', 'Custom Theme Builder', 'VIP Support'],
      styles: {
        iconGradient: 'from-amber-400 to-orange-500',
        shadow: 'shadow-orange-500/20',
        checkBg: 'bg-amber-100 dark:bg-amber-900/30',
        checkColor: 'text-amber-600 dark:text-amber-400',
        highlight: 'text-amber-600 dark:text-amber-400',
        button: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-orange-500/25'
      }
    }
  };

  const config = planConfig[requiredPlan as 'PRO' | 'PREMIUM'] || planConfig.PRO;
  const PlanIcon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlock Feature">
       <div className="relative">
          <div className="text-center pt-2 pb-2">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${config.styles.iconGradient} shadow-xl ${config.styles.shadow} flex items-center justify-center text-white relative group`}
              >
                  <PlanIcon size={40} fill="currentColor" className="drop-shadow-sm" />
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-1.5 rounded-full shadow-md border border-slate-100 dark:border-slate-600">
                     <Lock size={14} className="text-slate-400" />
                  </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                 {featureName} is Locked
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                 Unlock this feature and many more by upgrading to the <span className={`font-bold ${config.styles.highlight}`}>{requiredPlan}</span> plan.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 text-left border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Included in {requiredPlan}</span>
                     <span className={`text-xs font-bold ${config.styles.highlight} bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700`}>{config.price}</span>
                  </div>
                  <div className="space-y-3">
                      {config.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                              <div className={`w-5 h-5 rounded-full ${config.styles.checkBg} ${config.styles.checkColor} flex items-center justify-center shrink-0`}>
                                  <Check size={12} strokeWidth={3} /> 
                              </div>
                              {benefit}
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button 
                   onClick={() => navigate('/upgrade')} 
                   className={`w-full py-4 text-base font-bold shadow-xl border-none ${config.styles.button}`}
                 >
                    Upgrade to {requiredPlan}
                 </Button>
                 <button 
                   onClick={onClose}
                   className="py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                 >
                    Maybe Later
                 </button>
              </div>
          </div>
       </div>
    </Modal>
  );
};

export const TransactionModal = ({ isOpen, onClose, defaultType, initialData }: { isOpen: boolean, onClose: () => void, defaultType?: string, initialData?: Transaction }) => {
  const { addTransaction, editTransaction, deleteTransaction, incomeSources, expenseCategories, addCategory, deleteCategory, isDemo, openAuthModal, user, notify } = useFinance();
  const [formData, setFormData] = useState({ 
    amount: '', 
    description: '', 
    category: 'General', 
    type: defaultType || 'expense',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Custom Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date()); // Tracks the view in the picker (month/year)

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        description: initialData.description,
        category: initialData.category,
        type: initialData.type,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
      setPickerDate(new Date(initialData.date));
    } else {
      const today = new Date();
      setFormData({ 
        amount: '', 
        description: '', 
        category: 'General', 
        type: defaultType || 'expense',
        date: today.toISOString().split('T')[0]
      });
      setPickerDate(today);
    }
  }, [initialData, defaultType, isOpen]);

  // Reset picker state when modal opens/closes
  useEffect(() => {
      if (!isOpen) {
          setShowCategoryPicker(false);
          setShowDatePicker(false);
          setNewCategory('');
      }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemo) {
        onClose();
        openAuthModal('signup');
        return;
    }

    setIsSubmitting(true);
    
    setTimeout(async () => {
      let success;
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(12, 0, 0, 0); 
      const isoDate = selectedDate.toISOString();

      if (initialData) {
        success = await editTransaction(initialData.id, {
           amount: Number(formData.amount),
           description: formData.description,
           category: formData.category,
           type: formData.type as any,
           date: isoDate
        });
      } else {
        success = await addTransaction({
          amount: Number(formData.amount),
          description: formData.description,
          category: formData.category,
          type: formData.type as any,
          date: isoDate
        });
      }

      setIsSubmitting(false);
      if (success) {
        onClose();
        if (!initialData) setFormData({ 
            amount: '', 
            description: '', 
            category: 'General', 
            type: defaultType || 'expense',
            date: new Date().toISOString().split('T')[0]
        });
      }
    }, 600);
  };

  const handleDelete = () => {
    if (isDemo) {
        notify('info', 'Sign up to manage transactions.');
        onClose();
        openAuthModal('signup');
        return;
    }
    if (initialData) {
        deleteTransaction(initialData.id);
        onClose();
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
       // --- NEW LIMIT CHECK LOGIC ---
       const currentCount = formData.type === 'income' ? incomeSources.length : expenseCategories.length;
       const limit = formData.type === 'income' ? PLAN_LIMITS[user.plan].maxIncome : PLAN_LIMITS[user.plan].maxExpense;
       
       if (currentCount >= limit && !isDemo && user.plan === 'FREE') {
           notify('error', `Free plan limited to ${limit} ${formData.type === 'income' ? 'income sources' : 'expense categories'}. Upgrade to add more.`);
           return;
       }
       // ----------------------------

       addCategory(formData.type === 'income' ? 'income' : 'expense', newCategory.trim());
       setFormData({ ...formData, category: newCategory.trim() });
       setNewCategory('');
       setShowCategoryPicker(false);
    }
  };

  const handleDeleteCategory = (e: React.MouseEvent, cat: string) => {
      e.stopPropagation();
      
      if (isDemo) {
          notify('info', 'Sign up to manage categories.');
          openAuthModal('signup');
          return;
      }

      deleteCategory(formData.type === 'income' ? 'income' : 'expense', cat);
      if (formData.category === cat) {
          setFormData({ ...formData, category: 'General' });
      }
  };

  // Date Picker Logic
  const handleDaySelect = (day: number) => {
      const newDate = new Date(pickerDate);
      newDate.setDate(day);
      setFormData({ ...formData, date: format(newDate, 'yyyy-MM-dd') });
      setShowDatePicker(false);
  };

  const daysInMonth = getDaysInMonth(pickerDate);
  const selectedDateObj = new Date(formData.date);

  // Separate default and custom categories
  const { defaultList, customList } = useMemo(() => {
      const userCats = formData.type === 'income' ? incomeSources : expenseCategories;
      const defaults = formData.type === 'income' ? DEFAULT_INCOME_SOURCES : DEFAULT_EXPENSE_CATEGORIES;
      
      const custom = userCats.filter(c => !defaults.includes(c) && c !== 'General').sort();
      const def = ['General', ...defaults];
      
      return { defaultList: def, customList: custom };
  }, [formData.type, incomeSources, expenseCategories]);

  const getTypeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const modalTitle = initialData ? "Edit Transaction" : `New ${getTypeLabel(formData.type)}`;

  // Handle Close behavior: If picker is open, close picker (handled by passing conditional handler to Modal). 
  // If picker closed, close modal.
  const handleSmartClose = () => {
      if (showCategoryPicker) {
          setShowCategoryPicker(false);
      } else if (showDatePicker) {
          setShowDatePicker(false);
      } else {
          onClose();
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSmartClose} title={showCategoryPicker ? "Select Category" : (showDatePicker ? "Select Date" : modalTitle)}>
      {/* ... (Existing Modal Content) ... */}
      <AnimatePresence mode="wait">
        {showCategoryPicker ? (
            <motion.div 
                key="picker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full min-h-[400px]"
            >
                <div className="flex gap-2 mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <input 
                       autoFocus
                       type="text"
                       value={newCategory}
                       onChange={e => setNewCategory(e.target.value)}
                       placeholder="Create new category..."
                       className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none min-w-0"
                       onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory} disabled={!newCategory.trim()} className="shrink-0">Add</Button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {/* Default Categories Column */}
                        <div className="space-y-1">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sticky top-0 bg-white dark:bg-slate-900 z-10">Standard</div>
                            {defaultList.map(cat => (
                                <button 
                                    key={cat}
                                    type="button"
                                    onClick={() => { setFormData({...formData, category: cat}); setShowCategoryPicker(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${formData.category === cat ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <span>{cat}</span>
                                    {formData.category === cat && <Check size={16} className="text-primary-500" />}
                                </button>
                            ))}
                        </div>

                        {/* Custom Categories Column */}
                        <div className="space-y-1 mt-6 sm:mt-0">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sticky top-0 bg-white dark:bg-slate-900 z-10">My Categories</div>
                            {customList.length === 0 ? (
                                <div className="px-4 py-8 text-xs text-slate-400 italic text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                    No custom categories yet. <br/> Use the input above to create one.
                                </div>
                            ) : (
                                customList.map(cat => (
                                    <div 
                                        key={cat}
                                        className={`group relative w-full text-left rounded-xl text-sm font-medium transition-colors ${formData.category === cat ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => { setFormData({...formData, category: cat}); setShowCategoryPicker(false); }}
                                            className="w-full h-full px-4 py-3 flex items-center justify-between"
                                        >
                                            <span className="truncate mr-8">{cat}</span>
                                            {formData.category === cat && <Check size={16} className="text-primary-500" />}
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteCategory(e, cat)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        ) : showDatePicker ? (
            <motion.div
                key="date-picker"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center p-2"
            >
                <div className="flex items-center justify-center w-full mb-6 px-4">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{format(pickerDate, 'MMMM')}</h3>
                        <p className="text-xs font-bold text-slate-400">{format(pickerDate, 'yyyy')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 w-full max-w-sm">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-bold text-slate-400 mb-2">{day}</div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
                        const isSelected = isSameDay(date, selectedDateObj);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <button
                                key={i}
                                onClick={() => handleDaySelect(day)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                                    isSelected 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-bold scale-105' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {day}
                                {isToday && !isSelected && (
                                    <div className="absolute bottom-1.5 w-1 h-1 bg-primary-500 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                <Button variant="secondary" onClick={() => setShowDatePicker(false)} className="mt-6 w-full">Cancel</Button>
            </motion.div>
        ) : (
            <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
            >
                {!defaultType && !initialData && (
                <div className="grid grid-cols-3 gap-3">
                    {['income', 'expense', 'bill'].map(t => (
                        <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t, category: 'General'})}
                        className={`py-3 rounded-xl capitalize text-sm font-medium transition-colors duration-200 border ${
                            formData.type === t 
                            ? t === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : t === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}
                        >
                        {t}
                        </button>
                    ))}
                </div>
                )}
                
                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-semibold text-lg">$</span>
                    <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors font-bold text-xl"
                    placeholder="0.00"
                    />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                    <div 
                        onClick={() => setShowDatePicker(true)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white cursor-pointer flex items-center hover:border-primary-300 dark:hover:border-primary-700 hover:ring-2 hover:ring-primary-100 dark:hover:ring-primary-900/30 transition-all group relative"
                    >
                        <span className="font-medium text-slate-900 dark:text-white">{format(new Date(formData.date), 'MMM d, yyyy')}</span>
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <div 
                        onClick={() => setShowCategoryPicker(true)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white cursor-pointer flex justify-between items-center hover:border-primary-300 dark:hover:border-primary-700 hover:ring-2 hover:ring-primary-100 dark:hover:ring-primary-900/30 transition-all group"
                    >
                        <span className="font-medium truncate mr-2">{formData.category || "Select category"}</span>
                        <div className="bg-white dark:bg-slate-800 p-1 rounded-md shadow-sm text-slate-400 group-hover:text-primary-500 transition-colors">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    </div>
                </div>
                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g. Salary, Rent, Groceries"
                />
                </div>
                <div className="flex gap-3 pt-2">
                    {initialData && (
                        <Button type="button" variant="danger" onClick={handleDelete} className="px-4">
                            <Trash2 size={18} />
                        </Button>
                    )}
                    <Button type="submit" className="flex-1 py-3.5 text-base" isLoading={isSubmitting}>
                    {initialData ? 'Update Transaction' : 'Save Transaction'}
                    </Button>
                </div>
            </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export const LoginModal = ({ isOpen, onClose, onLogin, onSignup, initialMode = 'login' }: any) => {
  const { recoverPassword, verifyRecoveryCode, setNewPassword } = useFinance();
  const [view, setView] = useState<'login' | 'signup' | 'forgot_email' | 'forgot_code' | 'forgot_reset' | 'tos' | 'verify_email_instruction'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false); 
  const tosContentRef = useRef<HTMLDivElement>(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setError('');
      setView(initialMode);
      setVerificationCode('');
      setNewPasswordInput('');
      setConfirmPassword(''); 
      setTosAgreed(false);
      setHasReadTerms(false); 
    }
  }, [isOpen, initialMode]);

  const handleTosScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasReadTerms(true);
    }
  };

  useEffect(() => {
    if (view === 'tos' && tosContentRef.current) {
        const { scrollHeight, clientHeight } = tosContentRef.current;
        if (scrollHeight <= clientHeight) {
            setHasReadTerms(true);
        }
    }
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (view === 'login') {
        const result = await onLogin(email, password);
        if (result.success) { 
            onClose(); 
            setPassword(''); 
            navigate('/', { replace: true }); 
        } else { 
            setError(result.message || 'Authentication failed. Please check credentials.'); 
        }
      } else if (view === 'signup') {
        if (!name.trim()) { setError('Name is required'); setIsLoading(false); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; } 
        if (!tosAgreed) { setError('You must agree to the Terms of Service'); setIsLoading(false); return; }
        
        const result = await onSignup(email, password, name);
        if (result.success) { 
             setPassword(''); 
             setConfirmPassword(''); 
             
             if (result.hasSession) {
                 onClose();
                 navigate('/dashboard', { replace: true });
             } else {
                 setView('verify_email_instruction');
             }
        } else { 
            setError(result.message || 'Signup failed. Please try again.'); 
        }
      } else if (view === 'forgot_email') {
        const success = await recoverPassword(email);
        if (success) setView('forgot_code'); else setError('Could not send verification code.');
      } else if (view === 'forgot_code') {
        const success = await verifyRecoveryCode(email, verificationCode);
        if (success) setView('forgot_reset'); else setError('Invalid verification code.');
      } else if (view === 'forgot_reset') {
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
        const success = await setNewPassword(newPassword);
        if (success) { onClose(); navigate('/', { replace: true }); } else setError('Failed to update password.');
      }
    } catch (err: any) { setError(err.message || 'An unexpected error occurred.'); }
    setIsLoading(false);
  };

  const getTitle = () => {
      switch(view) {
          case 'signup': return "Create Account";
          case 'forgot_email': return "Reset Password";
          case 'forgot_code': return "Check Your Email";
          case 'forgot_reset': return "New Password";
          case 'tos': return "Terms of Service";
          case 'verify_email_instruction': return "Verify Your Email";
          default: return "Welcome Back";
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size={view === 'tos' ? '2xl' : 'md'}>