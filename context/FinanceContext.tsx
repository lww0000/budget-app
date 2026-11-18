import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { Transaction, UserProfile, WidgetConfig, AppNotification, PlanType, Theme } from '../types';
import { DEMO_TRANSACTIONS, DEFAULT_WIDGETS, DEFAULT_INCOME_SOURCES, DEFAULT_EXPENSE_CATEGORIES, THEMES, PLAN_LIMITS } from '../constants';
import { isSameMonth, format } from 'date-fns';

interface SignUpResult {
    success: boolean;
    hasSession: boolean;
    message?: string;
}

interface LoginResult {
    success: boolean;
    message?: string;
}

interface FinanceContextType {
  user: UserProfile;
  transactions: Transaction[];
  theme: string;
  widgets: WidgetConfig[];
  notifications: AppNotification[];
  incomeSources: string[];
  expenseCategories: string[];
  
  isDemo: boolean;
  isAuthenticated: boolean;
  isGuestUser: boolean;
  
  customPrimaryHex: string;
  customAccentHex: string;
  customIsDark: boolean;
  currentThemeColors: any;
  currentAccentColors: any;
  
  login: (e: string, p: string) => Promise<LoginResult>;
  signup: (e: string, p: string, n: string) => Promise<SignUpResult>;
  logout: () => Promise<void>;
  recoverPassword: (e: string) => Promise<boolean>;
  verifyRecoveryCode: (e: string, c: string) => Promise<boolean>;
  setNewPassword: (p: string) => Promise<boolean>;
  changePassword: (p: string) => Promise<boolean>;
  
  updateUser: (data: Partial<UserProfile>) => boolean;
  updateUserPlan: (plan: PlanType) => void;
  deleteAccount: () => void;
  resetEverything: (full?: boolean, keepPlan?: boolean) => Promise<void>;
  
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<boolean>;
  editTransaction: (id: string, t: Omit<Transaction, 'id'>) => Promise<boolean>;
  deleteTransaction: (id: string) => void;
  
  addCategory: (type: 'income' | 'expense', name: string) => void;
  deleteCategory: (type: 'income' | 'expense', name: string) => void;
  
  setTheme: (id: string) => void;
  setCustomThemeSettings: (p: string, a: string, isDark: boolean) => void;
  
  moveWidget: (from: number, to: number) => void;
  swapWidgets: (i1: number, i2: number) => void;
  updateWidgets: (newWidgets: WidgetConfig[]) => void;
  resizeWidget: (id: string, w: number) => void;
  toggleWidgetVisibility: (id: string) => void;
  
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  
  isLoginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  
  justUpgraded: boolean;
  isDarkMode: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);
const generateAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&length=1`;

// Helper to generate a simple palette from a base hex color
const generatePalette = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }

  const mix = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, weight: number) => {
    const w1 = weight;
    const w2 = 1 - w1;
    const rgb = [Math.round(r1 * w1 + r2 * w2), Math.round(g1 * w1 + g2 * w2), Math.round(b1 * w1 + b2 * w2)];
    return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
  };

  return {
    50: mix(255, 255, 255, r, g, b, 0.95),
    100: mix(255, 255, 255, r, g, b, 0.8),
    500: hex,
    600: mix(0, 0, 0, r, g, b, 0.1),
    700: mix(0, 0, 0, r, g, b, 0.2),
  };
};

const LOCAL_STORAGE_KEY = 'budget_quickly_data';

export const FinanceProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>({
    name: 'Demo User',
    avatar: '',
    plan: 'FREE',
    trialEndsAt: null,
    joinedAt: new Date().toISOString(),
    nameChangeCount: 0,
    notificationsEnabled: false,
    deletedAt: null
  });

  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [theme, setThemeState] = useState('ocean');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [incomeSources, setIncomeSources] = useState(DEFAULT_INCOME_SOURCES);
  const [expenseCategories, setExpenseCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);

  const [isDemo, setIsDemo] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const [customPrimaryHex, setCustomPrimaryHex] = useState('#6366f1');
  const [customAccentHex, setCustomAccentHex] = useState('#06b6d4');
  const [customIsDark, setCustomIsDark] = useState(false);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  const [justUpgraded, setJustUpgraded] = useState(false);
  const [hasCheckedRecurring, setHasCheckedRecurring] = useState(false);
  
  const hasNotifiedRef = useRef(false);

  const currentThemeColors = theme === 'custom' 
      ? generatePalette(customPrimaryHex)
      : THEMES.find(t => t.id === theme)?.primaryColors || THEMES[0].primaryColors;

  const currentAccentColors = theme === 'custom'
      ? generatePalette(customAccentHex)
      : THEMES.find(t => t.id === theme)?.accentColors || THEMES[0].accentColors;
      
  const isDarkMode = theme === 'custom' 
      ? customIsDark 
      : (THEMES.find(t => t.id === theme)?.isDark || false);

  const notify = useCallback((type: 'success' | 'error' | 'info', message: string) => {
      const id = generateId();
      setNotifications(prev => [...prev, { id, type, message }]);
      setTimeout(() => removeNotification(id), 5000);
  }, []);

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session error detected (possibly offline):", error.message);
          if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
             throw error; 
          }
          if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
             await supabase.auth.signOut();
          }
        }

        const session = data?.session;
        
        if (session?.user) {
          setIsAuthenticated(true);
          setIsDemo(false);
          setIsGuestUser(false);
          await loadUserData(session.user.id);
        } else {
          loadLocalData();
        }
      } catch (e) {
        console.log("Supabase initialization failed (likely network/config issue). Falling back to offline mode.", e);
        loadLocalData();
      } finally {
        setIsInitialized(true);
      }
    };
    
    const loadLocalData = () => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (parsed.user) setUser(parsed.user);
                if (parsed.transactions) setTransactions(parsed.transactions);
                if (parsed.widgets) setWidgets(parsed.widgets);
                if (parsed.theme) setThemeState(parsed.theme);
                if (parsed.incomeSources) setIncomeSources(parsed.incomeSources);
                if (parsed.expenseCategories) setExpenseCategories(parsed.expenseCategories);
                if (parsed.customTheme) {
                   setCustomPrimaryHex(parsed.customTheme.primary);
                   setCustomAccentHex(parsed.customTheme.accent);
                   setCustomIsDark(parsed.customTheme.isDark);
                }
                
                setIsDemo(true);
                setIsGuestUser(true);
            } catch (e) {
                console.error("Failed to parse local data", e);
            }
        }
    };

    initApp();
    
    try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setIsDemo(true);
                setIsGuestUser(true);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    } catch(e) {
        console.warn("Supabase auth listener failed:", e);
    }
  }, []);

  useEffect(() => {
      if (!isInitialized) return;
      
      if (isGuestUser) {
          const dataToSave = {
              user,
              transactions,
              widgets,
              theme,
              incomeSources,
              expenseCategories,
              customTheme: {
                  primary: customPrimaryHex,
                  accent: customAccentHex,
                  isDark: customIsDark
              }
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      }
  }, [user, transactions, widgets, theme, incomeSources, expenseCategories, customPrimaryHex, customAccentHex, customIsDark, isGuestUser, isInitialized]);

  // NEW: Recurring Transaction Logic
  useEffect(() => {
      if (isInitialized && !hasCheckedRecurring && transactions.length > 0) {
          const processMonthlyRollover = async () => {
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();
              
              // Define Previous Month
              const prevDate = new Date(currentYear, currentMonth - 1, 1);
              const prevMonth = prevDate.getMonth();
              const prevYear = prevDate.getFullYear();

              // Get recurring txs from prev month
              const recurringFromPrev = transactions.filter(t => {
                  const d = new Date(t.date);
                  return d.getMonth() === prevMonth && 
                         d.getFullYear() === prevYear && 
                         t.isRecurring;
              });

              if (recurringFromPrev.length === 0) {
                  setHasCheckedRecurring(true);
                  return;
              }

              const currentMonthTxs = transactions.filter(t => {
                  const d = new Date(t.date);
                  return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
              });

              const newTxs: Transaction[] = [];

              for (const prevTx of recurringFromPrev) {
                  // Check duplicate in current month
                  const isAlreadyCarriedOver = currentMonthTxs.some(curr => 
                      curr.description === prevTx.description &&
                      curr.amount === prevTx.amount &&
                      curr.type === prevTx.type &&
                      curr.isRecurring
                  );

                  if (!isAlreadyCarriedOver) {
                      const prevTxDate = new Date(prevTx.date);
                      // Handle month end (e.g. Jan 31 -> Feb 28)
                      const daysInCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
                      const targetDay = Math.min(prevTxDate.getDate(), daysInCurrent);
                      
                      const newDate = new Date(currentYear, currentMonth, targetDay, 12, 0, 0); // Noon to be safe
                      
                      const newTx: any = {
                          ...prevTx,
                          id: isGuestUser ? generateId() : undefined, // Let DB handle ID or temp
                          date: newDate.toISOString(),
                          isRecurring: true
                      };
                      
                      if (!isGuestUser) delete newTx.id; // Remove ID for insertion
                      newTxs.push(newTx);
                  }
              }

              if (newTxs.length > 0) {
                  if (isGuestUser) {
                      setTransactions(prev => [...newTxs, ...prev]);
                      notify('success', `Recurring transactions processed for ${format(now, 'MMMM')}`);
                  } else {
                      // Supabase logic
                      const { data: { user: authUser } } = await supabase.auth.getUser();
                      if (authUser) {
                          // Try to insert recurring logic, but strip field if it fails is handled by try/catch logic usually
                          // But here we construct payload manually.
                          // If schema lacks column, we can't insert is_recurring.
                          // We will just insert without it to avoid crash on rollover.
                          const toInsert = newTxs.map(t => ({
                              amount: t.amount,
                              category: t.category,
                              description: t.description,
                              date: t.date,
                              type: t.type,
                              user_id: authUser.id,
                              // Missing is_recurring support in DB
                          }));
                          
                          const { data, error } = await supabase.from('transactions').insert(toInsert).select();
                          if (data) {
                              // Optimistically set recurring in local state
                              const mappedData = data.map((d: any, index: number) => ({
                                  ...d,
                                  isRecurring: true // Preserve the intent locally
                              }));
                              setTransactions(prev => [...mappedData, ...prev]);
                              notify('success', `Recurring transactions processed for ${format(now, 'MMMM')}`);
                          }
                      }
                  }
              }
              setHasCheckedRecurring(true);
          };
          processMonthlyRollover();
      } else if (isInitialized && transactions.length === 0) {
          setHasCheckedRecurring(true);
      }
  }, [isInitialized, transactions, hasCheckedRecurring, isGuestUser, notify]);

  useEffect(() => {
    // Only use browser Notification API if supported and enabled
    if (!user.notificationsEnabled || isDemo || !('Notification' in window)) return;
    if (hasNotifiedRef.current) return;

    if (Notification.permission === 'granted') {
       const checkUpcoming = () => {
           const now = new Date();
           const currentMonth = now.getMonth();
           const currentYear = now.getFullYear();
           
           const upcoming = transactions.filter(t => {
               const tDate = new Date(t.date);
               return tDate.getMonth() === currentMonth && 
                      tDate.getFullYear() === currentYear && 
                      tDate > now &&
                      (t.type === 'bill' || t.type === 'expense');
           });

           if (upcoming.length > 0) {
               new Notification('BudgetQuickly Reminder', {
                   body: `You have ${upcoming.length} bills/expenses coming up this month totaling $${upcoming.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}.`,
                   icon: '/favicon.ico'
               });
               hasNotifiedRef.current = true;
           }
       };
       checkUpcoming();
    }
  }, [user.notificationsEnabled, transactions, isDemo]);

  const updateProfileSettings = async (updates: any) => {
    if (isGuestUser) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
        await supabase.from('profiles').update(updates).eq('id', authUser.id);
    }
  };

  const loadUserData = async (userId: string) => {
      try {
        const { data: profile, error: profileError } = await supabase
           .from('profiles')
           .select('*')
           .eq('id', userId)
           .single();

        if (profileError) {
            console.error("Error loading profile", profileError);
            if (profileError.code === 'PGRST116') {
               await supabase.from('profiles').insert([{ 
                   id: userId, 
                   name: user.name || 'New User', 
                   joined_at: new Date().toISOString(), 
                   plan: 'FREE',
                   income_sources: [], 
                   expense_categories: [] 
               }]);
            }
        }

        if (profile) {
            setUser({
                name: profile.name || 'User',
                avatar: profile.avatar || generateAvatar(profile.name || 'User'),
                plan: profile.plan as PlanType || 'FREE',
                trialEndsAt: profile.trial_ends_at,
                joinedAt: profile.joined_at,
                nameChangeCount: profile.name_change_count || 0,
                notificationsEnabled: profile.notifications_enabled || false,
                deletedAt: profile.deleted_at
            });

            if (profile.theme) setThemeState(profile.theme);
            if (profile.widgets && Array.isArray(profile.widgets)) setWidgets(profile.widgets);
            
            setIncomeSources(profile.income_sources && Array.isArray(profile.income_sources) ? profile.income_sources : []);
            setExpenseCategories(profile.expense_categories && Array.isArray(profile.expense_categories) ? profile.expense_categories : []);
            
            if (profile.custom_theme) {
                 const ct = profile.custom_theme;
                 setCustomPrimaryHex(ct.primary || '#6366f1');
                 setCustomAccentHex(ct.accent || '#06b6d4');
                 setCustomIsDark(!!ct.isDark);
            }
        } else {
            setIncomeSources([]);
            setExpenseCategories([]);
        }

        const { data: txs, error: txError } = await supabase
           .from('transactions')
           .select('*')
           .eq('user_id', userId)
           .order('date', { ascending: false });

        if (txError) console.error("Error loading transactions", txError);
        
        if (txs) {
            // Map snake_case to camelCase
            // Handle undefined is_recurring if column missing
            const mappedTxs = txs.map((t: any) => ({
                ...t,
                isRecurring: t.is_recurring !== undefined ? t.is_recurring : false
            }));
            setTransactions(mappedTxs as Transaction[]);
        } else {
            setTransactions([]);
        }

      } catch (e) {
        console.error("Load user data exception", e);
      }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
      console.log(`[Email Service] Sending welcome email to ${email} for ${name}`);
      return new Promise(resolve => setTimeout(resolve, 800));
  };

  const signup = async (email: string, password: string, name: string): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
              data: { full_name: name }
          }
      });
      
      if (error) {
          notify('error', error.message);
          return { success: false, hasSession: false, message: error.message };
      }
      
      if (data.user) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);

          const { error: profileError } = await supabase.from('profiles').upsert({
              id: data.user.id,
              name: name,
              avatar: generateAvatar(name),
              plan: 'FREE',
              joined_at: new Date().toISOString(),
              theme: theme,
              widgets: widgets,
              income_sources: [], 
              expense_categories: [],
              custom_theme: { primary: customPrimaryHex, accent: customAccentHex, isDark: customIsDark }
          });

          if (profileError) {
              console.error("Profile creation/update failed", profileError);
          }
          
          if (transactions.length > 0) {
             const realTransactions = transactions.filter(t => !t.id.startsWith('inc-') && !t.id.startsWith('bill-') && !t.id.startsWith('exp-'));
             
             if (realTransactions.length > 0) {
                 const txToUpload = realTransactions.map(t => ({
                     user_id: data.user!.id,
                     amount: t.amount,
                     category: t.category,
                     description: t.description,
                     date: t.date,
                     type: t.type
                     // removed is_recurring here too
                 }));
                 await supabase.from('transactions').insert(txToUpload);
             }
          }

          setTransactions([]); 
          setIncomeSources([]); 
          setExpenseCategories([]);

          await sendWelcomeEmail(email, name);
          
          if (data.session) {
              notify('success', `Welcome to BudgetQuickly!`);
              setUser(prev => ({ ...prev, name, avatar: generateAvatar(name) }));
              setIsAuthenticated(true);
              setIsDemo(false);
              setIsGuestUser(false);
              
              await loadUserData(data.user.id);
              return { success: true, hasSession: true };
          } 
          else {
               const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
               
               if (loginData.session) {
                    notify('success', `Welcome to BudgetQuickly!`);
                    setUser(prev => ({ ...prev, name, avatar: generateAvatar(name) }));
                    setIsAuthenticated(true);
                    setIsDemo(false);
                    setIsGuestUser(false);
                    await loadUserData(data.user.id);
                    return { success: true, hasSession: true };
               }
               
               return { success: true, hasSession: false };
          }
      }
      return { success: false, hasSession: false, message: "Unknown error during signup" };
  };

  const login = async (e: string, p: string): Promise<LoginResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });
      if (error) {
          notify('error', error.message);
          return { success: false, message: error.message };
      }
      if (data.user) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          
          setTransactions([]);
          setIncomeSources([]);
          setExpenseCategories([]);
          
          const metaName = data.user.user_metadata?.full_name || 'User';
          setUser(prev => ({ ...prev, name: metaName, avatar: generateAvatar(metaName) }));
          setIsAuthenticated(true);
          setIsDemo(false);
          setIsGuestUser(false);
          
          notify('success', 'Logged in successfully');
          await loadUserData(data.user.id);
          return { success: true };
      }
      return { success: false, message: "Unknown error during login" };
  };

  const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      setUser({
        name: 'Demo User',
        avatar: '',
        plan: 'FREE',
        trialEndsAt: null,
        joinedAt: new Date().toISOString(),
        nameChangeCount: 0,
        notificationsEnabled: false,
        deletedAt: null
      });

      setIsAuthenticated(false);
      setIsDemo(true);
      setIsGuestUser(true);
      setHasCheckedRecurring(false); // Reset check state
      resetEverything();
      notify('info', 'Logged out');
  };

  const recoverPassword = async (e: string) => { 
      const { error } = await supabase.auth.resetPasswordForEmail(e);
      if (error) {
         notify('error', error.message);
         return false;
      }
      notify('info', 'Recovery email sent'); 
      return true; 
  };
  
  const verifyRecoveryCode = async (e: string, c: string) => { 
      const { error } = await supabase.auth.verifyOtp({ email: e, token: c, type: 'recovery' });
      if (error) {
          notify('error', 'Invalid code');
          return false;
      }
      return true; 
  };

  const setNewPassword = async (p: string) => { 
     const { error } = await supabase.auth.updateUser({ password: p });
     if (error) {
         notify('error', error.message);
         return false;
     }
     notify('success', 'Password updated'); 
     return true; 
  };
  
  const changePassword = async (password: string) => {
      if (isGuestUser) {
          notify('error', 'Action not available in Demo Mode');
          return false;
      }
      try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          notify('success', 'Password changed successfully');
          return true;
      } catch (error: any) {
          notify('error', error.message || 'Failed to update password');
          return false;
      }
  };

  const updateUser = (data: Partial<UserProfile>) => {
      setUser(prev => ({ ...prev, ...data }));
      
      if (!isGuestUser) {
           supabase.auth.getUser().then(({ data: { user: authUser } }) => {
               if (authUser) {
                   const dbData: any = {};
                   if (data.name) dbData.name = data.name;
                   if (data.avatar) dbData.avatar = data.avatar;
                   if (data.plan) dbData.plan = data.plan;
                   if (data.notificationsEnabled !== undefined) dbData.notifications_enabled = data.notificationsEnabled;
                   if (data.nameChangeCount !== undefined) dbData.name_change_count = data.nameChangeCount;

                   supabase.from('profiles').update(dbData).eq('id', authUser.id).then();
               }
           });
      }
      return true;
  };

  const updateUserPlan = async (plan: PlanType) => {
      setUser(prev => ({ ...prev, plan }));
      setJustUpgraded(true);
      setTimeout(() => setJustUpgraded(false), 5000);
      
      if (!isGuestUser) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
              await supabase.from('profiles').update({ plan }).eq('id', authUser.id);
          }
      }
      
      notify('success', `Upgraded to ${plan}`);
  };

  const deleteAccount = async () => {
      if (!isGuestUser) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
              await supabase.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', authUser.id);
              await supabase.auth.signOut();
          }
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsAuthenticated(false);
      setIsDemo(true);
      setIsGuestUser(true);
      resetEverything(true);
      notify('info', 'Account deleted');
  };

  const resetEverything = async (full = false, keepPlan = false) => {
      // 1. Optimistic UI Reset
      setTransactions(full ? [] : DEMO_TRANSACTIONS);
      setWidgets(DEFAULT_WIDGETS);
      setNotifications([]);
      
      const defaultIncome = full && !keepPlan ? [] : DEFAULT_INCOME_SOURCES;
      const defaultExpense = full && !keepPlan ? [] : DEFAULT_EXPENSE_CATEGORIES;
      
      setIncomeSources(defaultIncome);
      setExpenseCategories(defaultExpense);
      
      // Reset Theme to Ocean if doing a full reset
      if (full) {
          setThemeState('ocean');
      }

      if (full && !keepPlan) {
          setUser(prev => ({ ...prev, plan: 'FREE' }));
          localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      // 2. Database Sync (if authenticated)
      if (!isGuestUser && full) {
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                   const userId = session.user.id;
                   
                   // Delete transactions
                   const { error: txError } = await supabase.from('transactions').delete().eq('user_id', userId);
                   if (txError) throw txError;
                   
                   // Reset Profile Columns
                   const updates: any = {
                       widgets: DEFAULT_WIDGETS,
                       income_sources: defaultIncome,
                       expense_categories: defaultExpense,
                       theme: 'ocean',
                       custom_theme: null
                   };
                   
                   if (!keepPlan) updates.plan = 'FREE';
                   
                   const { error: profError } = await supabase.from('profiles').update(updates).eq('id', userId);
                   if (profError) throw profError;
                   
                   // Reset local custom theme state
                   setCustomPrimaryHex('#6366f1');
                   setCustomAccentHex('#06b6d4');
                   setCustomIsDark(false);
              }
          } catch (error) {
              console.error("Reset data error:", error);
              notify('error', 'Failed to delete server data.');
          }
      }
      
      // 3. Notification
      if (full) {
          notify('success', 'All data has been reset.');
      } else {
          notify('info', 'Demo reset to default.');
      }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
      // Check Plan Limits
      if (!isDemo) {
          const limit = PLAN_LIMITS[user.plan].maxTransactions;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const count = transactions.filter(tx => {
              const d = new Date(tx.date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          }).length;

          if (count >= limit) {
              notify('error', `Monthly transaction limit reached (${limit}). Upgrade to add more.`);
              return false;
          }
      }

      if (!isGuestUser) {
           const { data: { user: authUser } } = await supabase.auth.getUser();
           if (authUser) {
               // FIXED: Removed is_recurring from payload to match database schema and prevent error.
               const payload = {
                   amount: t.amount,
                   category: t.category,
                   description: t.description,
                   date: t.date,
                   type: t.type,
                   user_id: authUser.id
               };

               const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
               
               if (error) { 
                   notify('error', error.message); 
                   return false; 
               }
               
               // Optimistically set isRecurring locally so UI updates correctly for this session
               const newTx = { ...data, isRecurring: t.isRecurring };
               setTransactions(prev => [newTx, ...prev]);
               notify('success', 'Transaction added');
               return true;
           }
           return false;
      } else {
          const newT = { ...t, id: generateId() } as Transaction;
          setTransactions(prev => [newT, ...prev]);
          notify('success', 'Transaction added');
          return true;
      }
  };

  const editTransaction = async (id: string, t: Omit<Transaction, 'id'>) => {
      if (!isGuestUser) {
           // FIXED: Strictly define payload without isRecurring to prevent schema error
           const payload = {
               amount: t.amount,
               category: t.category,
               description: t.description,
               date: t.date,
               type: t.type
           };
           
           const { error } = await supabase.from('transactions').update(payload).eq('id', id);
           if (error) {
               notify('error', error.message);
               return false;
           }
           // Update local state with isRecurring so UI reflects change for session
           setTransactions(prev => prev.map(tr => tr.id === id ? { ...t, id } : tr));
           notify('success', 'Transaction updated');
           return true;
      } else {
           setTransactions(prev => prev.map(tr => tr.id === id ? { ...t, id } : tr));
           notify('success', 'Transaction updated');
           return true;
      }
  };

  const deleteTransaction = async (id: string) => {
      if (!isGuestUser) {
          await supabase.from('transactions').delete().eq('id', id);
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      notify('success', 'Transaction deleted');
  };

  const addCategory = (type: 'income' | 'expense', name: string) => {
      if (type === 'income') {
          const newSources = [...incomeSources, name];
          setIncomeSources(newSources);
          updateProfileSettings({ income_sources: newSources });
      } else {
          const newCats = [...expenseCategories, name];
          setExpenseCategories(newCats);
          updateProfileSettings({ expense_categories: newCats });
      }
      notify('success', 'Category added');
  };

  const deleteCategory = (type: 'income' | 'expense', name: string) => {
      if (type === 'income') {
          const newSources = incomeSources.filter(c => c !== name);
          setIncomeSources(newSources);
          updateProfileSettings({ income_sources: newSources });
      } else {
          const newCats = expenseCategories.filter(c => c !== name);
          setExpenseCategories(newCats);
          updateProfileSettings({ expense_categories: newCats });
      }
      notify('success', 'Category deleted');
  };

  const setTheme = (id: string) => {
      setThemeState(id);
      updateProfileSettings({ theme: id });
  };
  
  const setCustomThemeSettings = (p: string, a: string, d: boolean) => {
      setCustomPrimaryHex(p);
      setCustomAccentHex(a);
      setCustomIsDark(d);
      setThemeState('custom');
      
      const customThemeObj = { primary: p, accent: a, isDark: d };
      updateProfileSettings({ theme: 'custom', custom_theme: customThemeObj });
      
      notify('success', 'Custom theme applied');
  };

  const moveWidget = (from: number, to: number) => {
      const copy = [...widgets];
      const [removed] = copy.splice(from, 1);
      copy.splice(to, 0, removed);
      setWidgets(copy);
      updateProfileSettings({ widgets: copy });
  };

  const swapWidgets = (i1: number, i2: number) => {
      const copy = [...widgets];
      if (i1 >= 0 && i1 < copy.length && i2 >= 0 && i2 < copy.length) {
          const temp = copy[i1];
          copy[i1] = copy[i2];
          copy[i2] = temp;
          setWidgets(copy);
          updateProfileSettings({ widgets: copy });
      }
  };

  const updateWidgets = (newWidgets: WidgetConfig[]) => {
      setWidgets(newWidgets);
      updateProfileSettings({ widgets: newWidgets });
  }

  const resizeWidget = (id: string, w: number) => {
      const updated = widgets.map(wi => wi.id === id ? { ...wi, w } : wi);
      setWidgets(updated);
      updateProfileSettings({ widgets: updated });
  };

  const toggleWidgetVisibility = (id: string, visible?: boolean) => {
      const updated = widgets.map(wi => wi.id === id ? { ...wi, visible: visible !== undefined ? visible : !wi.visible } : wi);
      setWidgets(updated);
      updateProfileSettings({ widgets: updated });
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
      setAuthModalMode(mode);
      setLoginModalOpen(true);
  };

  return (
    <FinanceContext.Provider value={{
        user, transactions, theme, widgets, notifications, incomeSources, expenseCategories,
        isDemo, isAuthenticated, isGuestUser,
        customPrimaryHex, customAccentHex, customIsDark, currentThemeColors, currentAccentColors,
        login, signup, logout, recoverPassword, verifyRecoveryCode, setNewPassword, changePassword,
        updateUser, updateUserPlan, deleteAccount, resetEverything,
        addTransaction, editTransaction, deleteTransaction, addCategory, deleteCategory,
        setTheme, setCustomThemeSettings,
        moveWidget, swapWidgets, updateWidgets, resizeWidget, toggleWidgetVisibility,
        notify, removeNotification,
        isLoginModalOpen, setLoginModalOpen, authModalMode, openAuthModal,
        justUpgraded, isDarkMode
    }}>
        {children}
    </FinanceContext.Provider>
  );
};