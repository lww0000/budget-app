import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { NavLink, useLocation, useOutlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Zap, 
  LogOut, 
  X, 
  AlertTriangle, 
  Wallet, 
  Receipt,
  TrendingUp,
  TrendingDown,
  List,
  Home as HomeIcon,
  PiggyBank,
  LineChart,
  Grid,
  Sparkles,
  Mail
} from 'lucide-react';
import { THEMES } from '../constants';
import { Modal, Button, PlanBadge, ToastContainer, LoginModal } from './UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

// Restore all items as requested
const NAV_ITEMS = [
  { to: "/", icon: HomeIcon, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tracking", icon: List, label: "Tracking" },
  { to: "/bills", icon: Receipt, label: "Bills" },
  { to: "/income", icon: TrendingUp, label: "Income" },
  { to: "/expenses", icon: TrendingDown, label: "Expenses" },
  { to: "/analysis", icon: LineChart, label: "Saving & Analysis" },
  { to: "/upgrade", icon: Zap, label: "Pricing" },
];

export default function Layout() {
  const { 
    user, 
    theme, 
    customIsDark, 
    currentThemeColors, 
    currentAccentColors, 
    logout, 
    resetEverything, 
    isDemo, 
    isAuthenticated, 
    login, 
    signup, 
    notifications, 
    removeNotification, 
    isLoginModalOpen,
    setLoginModalOpen,
    authModalMode, 
    openAuthModal
  } = useFinance();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [resetStage, setResetStage] = useState(0); 
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const currentOutlet = useOutlet(); 
  
  const isDarkTheme = theme === 'custom' 
      ? customIsDark 
      : (THEMES.find(t => t.id === theme)?.isDark || false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (currentThemeColors) {
      root.style.setProperty('--color-primary-50', currentThemeColors[50]);
      root.style.setProperty('--color-primary-100', currentThemeColors[100]);
      root.style.setProperty('--color-primary-500', currentThemeColors[500]);
      root.style.setProperty('--color-primary-600', currentThemeColors[600]);
      root.style.setProperty('--color-primary-700', currentThemeColors[700]);
    }

    if (currentAccentColors) {
      root.style.setProperty('--color-accent-50', currentAccentColors[50]);
      root.style.setProperty('--color-accent-100', currentAccentColors[100]);
      root.style.setProperty('--color-accent-500', currentAccentColors[500]);
      root.style.setProperty('--color-accent-600', currentAccentColors[600]);
      root.style.setProperty('--color-accent-700', currentAccentColors[700]);
    }
  }, [currentThemeColors, currentAccentColors]);

  const handleLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
    setProfileOpen(false);
  };

  const handleResetAction = () => {
    setProfileOpen(false);
    if (isDemo) {
      openAuthModal('signup');
    } else {
      setResetStage(1);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-slate-950' : 'bg-slate-50'} font-sans`}>
      
      {/* --- DESKTOP NAVIGATION (Visible on XL screens and up) --- */}
      <div 
        className="hidden xl:flex fixed top-4 left-0 right-0 z-50 w-full justify-center px-4"
        style={{ transform: 'translateZ(0)' }} 
      >
        {/* Adjusted max-width to 1400px as requested */}
        <div className="w-full max-w-[1400px]">
          <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-black/40 rounded-2xl px-3 xl:px-4 h-[72px] flex items-center justify-between transition-colors duration-300">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group shrink-0 mr-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300 ring-2 ring-primary-100 dark:ring-primary-900/30">
                <Wallet size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span className="text-primary-600 dark:text-primary-400">Budget</span>
                <span className="text-slate-900 dark:text-white">Quickly</span>
              </span>
            </NavLink>

            {/* Desktop Items */}
            <div className="flex items-center justify-center gap-1">
               {NAV_ITEMS.map((item) => (
                 <NavLink
                   key={item.label}
                   to={item.to}
                   end={item.to === '/'} 
                   className={({ isActive }) => `
                     relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200
                     ${isActive 
                       ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                       : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                     }
                   `}
                 >
                   <item.icon size={16} strokeWidth={2.5} />
                   <span className="whitespace-nowrap">{item.label}</span>
                 </NavLink>
               ))}
            </div>

            {/* Right: User Actions */}
            <div className="flex-shrink-0 flex items-center gap-3 ml-2">
              {isDemo && (
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => openAuthModal('login')}
                     className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 uppercase tracking-wide"
                   >
                     Log In
                   </button>
                   <Button onClick={() => openAuthModal('signup')} className="!py-2 !px-4 !text-xs !rounded-lg font-bold shadow-primary-500/20 group relative overflow-hidden">
                     <span className="relative z-10 flex items-center gap-1">Get Started <Sparkles size={14} className="group-hover:rotate-12 transition-transform"/></span>
                   </Button>
                </div>
              )}

              {/* Profile Dropdown Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-primary-300 transition-colors overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                         <User size={16} />
                      </div>
                    )}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden py-2 z-50"
                    >
                      <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                         <p className="font-bold text-slate-900 dark:text-white text-base truncate">{isDemo ? "Demo User" : user.name}</p>
                         <div className="mt-1.5 flex items-center justify-between">
                            <PlanBadge plan={user.plan} />
                            {isDemo && <span className="text-[10px] font-bold text-amber-500 uppercase">Demo Mode</span>}
                         </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                          <User size={18} /> Account Settings
                        </NavLink>
                        {!isDemo && (
                           <NavLink to="/upgrade" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                             <Zap size={18} /> Manage Subscription
                           </NavLink>
                        )}
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                      <div className="p-2 space-y-1">
                        <button onClick={handleResetAction} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-colors">
                          <AlertTriangle size={18} /> Reset Data
                        </button>
                        
                        {isAuthenticated && (
                          <button onClick={() => setLogoutConfirmOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <LogOut size={18} /> Log Out
                          </button>
                        )}

                        {!isAuthenticated && (
                          <button onClick={() => { openAuthModal('signup'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-colors">
                            <User size={18} /> Get Started
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* --- MOBILE/TABLET NAVIGATION (Visible up to Large Screens) --- */}
      <div 
        className="xl:hidden fixed top-4 inset-x-0 z-50 flex justify-center px-4"
        style={{ transform: 'translateZ(0)' }}
      >
         <motion.div 
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-black/40 rounded-full px-1.5 py-1.5 flex items-center gap-3"
         >
            {/* Left: Logo */}
            <NavLink to="/" className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white shadow-md ml-1 hover:scale-105 transition-transform">
               <Wallet size={20} strokeWidth={2.5} />
            </NavLink>

            {/* Center: Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 active:scale-95 transition-transform"
            >
              <Grid size={22} strokeWidth={2.5} />
            </button>

            {/* Right: Profile */}
            <button 
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden mr-1"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                   <User size={16} />
                </div>
              )}
            </button>
         </motion.div>
      </div>

      {/* --- MOBILE/TABLET PROFILE DROPDOWN --- */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black/20 z-[60] xl:hidden" // Backdrop
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-20 right-4 z-[70] w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2 xl:hidden"
            >
               <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="font-bold text-slate-900 dark:text-white text-base truncate">{isDemo ? "Demo User" : user.name}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                     <PlanBadge plan={user.plan} />
                     {isDemo && <span className="text-[10px] font-bold text-amber-500 uppercase">Demo Mode</span>}
                  </div>
               </div>
               <div className="p-2 space-y-1">
                 <NavLink to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                   <User size={18} /> Account Settings
                 </NavLink>
                 {!isDemo && (
                    <NavLink to="/upgrade" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <Zap size={18} /> Manage Subscription
                    </NavLink>
                 )}
               </div>
               <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
               <div className="p-2 space-y-1">
                 <button onClick={handleResetAction} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-colors">
                   <AlertTriangle size={18} /> Reset Data
                 </button>

                 {isAuthenticated && (
                   <button onClick={() => { setLogoutConfirmOpen(true); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                     <LogOut size={18} /> Log Out
                   </button>
                 )}

                 {!isAuthenticated && (
                   <button onClick={() => { openAuthModal('signup'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-colors">
                     <User size={18} /> Get Started
                   </button>
                 )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MOBILE GRID MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
               onClick={(e) => e.stopPropagation()}
            >
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h3>
                     <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                     {/* Include all items in mobile menu */}
                     {NAV_ITEMS.map((item) => (
                        <NavLink
                           key={item.label}
                           to={item.to}
                           end={item.to === '/'}
                           onClick={() => setMobileMenuOpen(false)}
                           className={({ isActive }) => `
                              flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-colors duration-200 aspect-square
                              ${isActive 
                                 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                                 : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }
                           `}
                        >
                           {({ isActive }) => (
                             <>
                               <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                               <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                             </>
                           )}
                        </NavLink>
                     ))}
                  </div>

                  {/* Quick Action Footer inside Menu */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                      {!isDemo && (
                         <button 
                           onClick={() => { setMobileMenuOpen(false); window.location.hash = '#/upgrade'; }}
                           className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm"
                         >
                            <Zap size={16} fill="currentColor" /> Upgrade to Premium
                         </button>
                      )}
                      {isDemo && (
                         <button 
                           onClick={() => { setMobileMenuOpen(false); openAuthModal('signup'); }}
                           className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-sm"
                         >
                            <User size={16} /> Get Started
                         </button>
                      )}
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={`flex-1 w-full mx-auto grid transition-all duration-300 ${
          isHomePage 
            ? 'mt-0' // No top margin for homepage to allow full-screen hero
            : 'max-w-[1400px] p-4 lg:p-6 xl:p-8 mt-24 xl:mt-32' // Standard constrained layout for other pages
        }`} 
        style={{ gridTemplateAreas: "'content'" }}
      >
         <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
            <motion.div 
              key={location.pathname}
              style={{ gridArea: 'content' }}
              className="w-full min-w-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
              transition={{ duration: 0.3 }}
            >
              {currentOutlet}
            </motion.div>
         </AnimatePresence>
      </main>

      <ToastContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Reset Confirmation Modals */}
      <Modal isOpen={resetStage === 1} onClose={() => setResetStage(0)} title="Reset Account?">
        <div className="text-center py-2">
           <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you sure?</h3>
           <p className="mb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
             This will wipe all current transaction data and reset widgets to their default layout.
           </p>
           <div className="grid grid-cols-2 gap-3">
             <Button variant="secondary" onClick={() => setResetStage(0)}>Cancel</Button>
             <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 border-none" onClick={() => setResetStage(2)}>Continue</Button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={resetStage === 2} onClose={() => setResetStage(0)} title="Final Warning">
        <div className="text-center py-2">
           <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Irreversible Action</h3>
           <p className="mb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
             This cannot be undone. All your financial data will be permanently deleted.
           </p>
           <div className="grid grid-cols-2 gap-3">
             <Button variant="secondary" onClick={() => setResetStage(0)}>Keep Data</Button>
             <Button variant="danger" onClick={() => { resetEverything(true, true); setResetStage(0); }}>Yes, Delete Everything</Button>
           </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)} title="Log Out">
        <div className="text-center py-4">
           <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
             Are you sure you want to log out of your account?
           </p>
           <div className="grid grid-cols-2 gap-3">
             <Button variant="secondary" onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
             <Button variant="primary" onClick={handleLogout} className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-900">Log Out</Button>
           </div>
        </div>
      </Modal>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={login} onSignup={signup} initialMode={authModalMode} />
    </div>
  );
}