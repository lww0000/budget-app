import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { Button, PlanBadge, Modal } from './UIComponents';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  LayoutDashboard, 
  PlayCircle,
  Receipt, 
  Calendar,
  Target,
  Sliders,
  Sparkles,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  Maximize2,
  Eye,
  Database,
  Lock,
  Cloud,
  PieChart,
  BarChart
} from 'lucide-react';

// --- LANDING VIEW (DEMO) ---
const LandingView = () => {
  const { openAuthModal } = useFinance();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const featureDetails = {
    dashboard: {
      title: "Flexible Dashboard Layouts",
      content: (
        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <p className="text-xl leading-relaxed font-medium">
            Our dashboard adapts to your specific needs. Switch instantly between three professionally designed layouts to find the workflow that suits you best:
          </p>
          
          <div className="grid gap-6">
            <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center shrink-0">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Standard View</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  A balanced mix of recent transactions, charts, and summaries. Perfect for your daily financial check-in.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                <Maximize2 size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Focus Mode</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Prioritizes large visualization charts and trends. Ideal when you want to analyze your spending behavior deeply.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0">
                <ChevronDown size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Minimal Layout</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Shows only the essential numbers—Income, Expenses, and Balance. No clutter, just the bottom line.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
               <Eye size={24} className="text-primary-500" />
               <h4 className="text-xl font-bold text-slate-900 dark:text-white">Widget Visibility</h4>
            </div>
            <p className="text-lg leading-relaxed">
              Don't need to track bills? You can toggle the visibility of individual widgets like 'Upcoming Bills' or 'Expense Breakdown' to create a workspace that helps you make better financial decisions without distractions.
            </p>
          </div>
        </div>
      )
    },
    private: {
      title: "Private by Default",
      content: (
        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <p className="text-xl leading-relaxed font-medium">
            Security is our top priority. We strictly believe your financial data belongs to you and no one else. Here is how we protect you:
          </p>
          
          <div className="grid gap-6">
            <div className="flex gap-5 p-4 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                <Database size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Bank Connections</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  We do not ask for your online banking credentials. You have full control over the data you enter, eliminating the risk of third-party breaches.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Local Storage Mode</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  In our Demo mode, your data never leaves your browser. It persists only on your specific device using secure local storage technologies.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                <Cloud size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Secure Cloud Encryption</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  When you choose to sign up, your data is encrypted at rest and in transit using enterprise-grade security protocols. We never sell your personal information to advertisers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    growth: {
      title: "Growth Analytics",
      content: (
        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <p className="text-xl leading-relaxed font-medium">
            Stop guessing where your money goes. Visualize your path to financial freedom with powerful, professional-grade insights.
          </p>
          
          <div className="grid gap-6">
            <div className="flex gap-5 p-4 rounded-2xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Savings Rate</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automatically calculated based on your income versus expenses. We help you aim for the 20% golden rule of savings.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0">
                <BarChart size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">7-Day Trend Analysis</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Spot spending patterns immediately. See how your daily spending fluctuates over the week before it becomes a long-term habit.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Net Worth Growth</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Track your progress over time with beautiful, easy-to-read area charts that show your accumulated savings month over month.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-4 rounded-2xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
              <div className="mt-1 w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0">
                <PieChart size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Category Breakdown</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  See exactly which categories (like Food, Transport, or Entertainment) are consuming your budget so you can make adjustments where it counts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen overflow-x-hidden relative"
    >
       {/* Background Decoration */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
           <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-primary-500 opacity-10 blur-[130px]"></div>
       </div>

       {/* Hero Section - Optimized Centering with Layout margin removed */}
       {/* Added pt-24 to clear fixed navbar while maintaining center alignment */}
       <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-[1500px] mx-auto px-6 pt-24 lg:pt-32 pb-0 gap-12 xl:gap-20 relative box-border">
          
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left z-10 max-w-3xl">
              <motion.div 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 className="mb-8 inline-flex justify-center lg:justify-start w-full lg:w-auto"
              >
                 <span className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                    </span>
                    v2.0 Now Available
                 </span>
              </motion.div>
              
              <motion.h1 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: 0.1 }}
                 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.05]"
              >
                 Financial Freedom <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Starts Here.</span>
              </motion.h1>
              
              <motion.p 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: 0.2 }}
                 className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
              >
                 Experience the future of personal finance. 
                 Privacy-first tracking, beautiful analytics, and zero bank connections required.
              </motion.p>
              
              <motion.div 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: 0.3 }}
                 className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start"
              >
                 <Button onClick={() => openAuthModal('signup')} className="!py-4 !px-9 !text-lg !rounded-2xl !bg-gradient-to-r !from-primary-600 !to-primary-700 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover:-translate-y-1">
                    Get Started Free <ArrowRight className="ml-2" size={20} />
                 </Button>
                 <Button variant="secondary" onClick={() => navigate('/dashboard')} className="!py-4 !px-9 !text-lg !rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all">
                    <PlayCircle className="mr-2 text-primary-600" size={20} /> Live Demo
                 </Button>
              </motion.div>

              <motion.div
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.5 }}
                 className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-400"
              >
                  <span className="flex items-center gap-2"><CheckCircle size={18} className="text-primary-500" /> No Credit Card Required</span>
                  <span className="flex items-center gap-2"><CheckCircle size={18} className="text-primary-500" /> Privacy Focused</span>
              </motion.div>
          </div>

          {/* Right: Abstract UI Mockup - Visible on Tablet and Desktop */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }} 
             animate={{ opacity: 1, x: 0 }} 
             transition={{ duration: 0.8, type: "spring" }}
             className="flex-1 w-full max-w-xl relative hidden md:block perspective-1000 mt-12 lg:mt-4"
             style={{ perspective: '1200px' }}
          >
             <div 
                className="relative z-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 transform transition-transform duration-500 hover:scale-[1.02]"
                style={{ transform: 'rotateY(-8deg) rotateX(4deg)', transformStyle: 'preserve-3d' }}
             >
                {/* Fake Header */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                      <div className="h-2.5 w-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    </div>
                </div>
                
                {/* Fake Dashboard Content */}
                <div className="space-y-6">
                    <div className="flex gap-6">
                        <div className="w-2/3 p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl shadow-primary-500/20 text-white relative overflow-hidden min-h-[160px]">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                              <div>
                                <div className="h-2.5 w-20 bg-white/30 rounded mb-3"></div>
                                <div className="h-8 w-40 bg-white/50 rounded mb-2"></div>
                              </div>
                              <div className="h-2.5 w-16 bg-white/30 rounded"></div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                        <div className="w-1/3 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                             <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-4"></div>
                             <div>
                               <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                               <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Fake Graph */}
                    <div className="h-48 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-end justify-between px-8 pb-0 pt-8 gap-4 border border-slate-100 dark:border-slate-700 overflow-hidden">
                         {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                             <div key={i} className="w-full bg-gradient-to-t from-primary-500 to-primary-100 dark:from-primary-600 dark:to-primary-500 rounded-t-lg opacity-90 transition-all duration-1000" style={{ height: `${h}%` }}></div>
                         ))}
                    </div>
                    
                    {/* Fake List */}
                    <div className="space-y-4">
                       {[1, 2].map((i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                 <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              </div>
                              <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                           </div>
                       ))}
                    </div>
                </div>
             </div>
             
             {/* Decorative blobs - Synchronized pulsing animation */}
             <motion.div 
               animate={{ 
                 scale: [0.8, 1.4, 0.8],
                 opacity: [0, 0.7, 0] // Fade out completely, then glow
               }}
               transition={{ 
                 duration: 5, 
                 repeat: Infinity, 
                 ease: "easeInOut" 
               }}
               style={{
                 background: 'radial-gradient(circle, var(--color-primary-600) 0%, transparent 50%)',
               }}
               className="absolute -top-12 -right-12 w-[35rem] h-[35rem] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none blur-[80px]"
             />
             <motion.div 
               animate={{ 
                 scale: [0.8, 1.4, 0.8], // Same scale values
                 opacity: [0, 0.7, 0] // Same opacity values for synchronized pulsing
               }}
               transition={{ 
                 duration: 5, // Same duration
                 repeat: Infinity, 
                 ease: "easeInOut" 
               }}
               style={{
                 background: 'radial-gradient(circle, var(--color-accent-600) 0%, transparent 50%)',
               }}
               className="absolute -bottom-12 -left-12 w-[35rem] h-[35rem] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none blur-[80px]"
             />
          </motion.div>

          {/* Scroll Indicator - Pinned lower (bottom-3) */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1, y: [0, 10, 0] }}
             transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="absolute bottom-3 left-0 right-0 hidden lg:flex flex-col items-center gap-2 cursor-pointer z-20 pointer-events-auto"
             onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">How it works</span>
             <ChevronDown className="text-slate-400" size={24} />
          </motion.div>
       </div>

       {/* Features Section */}
       <div className="relative py-32 overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
           <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

           <div className="max-w-[1300px] mx-auto px-6 relative z-10">
               <div className="text-center mb-20 max-w-3xl mx-auto">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                   >
                      Why BudgetQuickly
                   </motion.div>
                   
                   <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight"
                   >
                      Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">thrive.</span>
                   </motion.h2>
                   
                   <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium"
                   >
                      Powerful tools packed into a clean, intuitive interface designed for modern finance.
                      No spreadsheets, no confusion—just clarity.
                   </motion.p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
                   <FeatureCard 
                      icon={LayoutDashboard}
                      title="Flexible Dashboard Layouts"
                      desc="Pick from three dashboard layouts. Hide what you don’t need. See all your finances in one view."
                      color="blue"
                      delay={0.2}
                      onClick={() => setActiveFeature('dashboard')}
                   />
                   <FeatureCard 
                      icon={Shield}
                      title="Private by Default"
                      desc="Your data is stored locally in your browser. We never track your bank credentials or sell your information."
                      color="emerald"
                      delay={0.3}
                      onClick={() => setActiveFeature('private')}
                   />
                   <FeatureCard 
                      icon={TrendingUp}
                      title="Growth Analytics"
                      desc="Visualize your savings rate and net worth growth with professional-grade charts and insights."
                      color="violet"
                      delay={0.4}
                      onClick={() => setActiveFeature('growth')}
                   />
               </div>
           </div>
       </div>

       <Modal 
         isOpen={!!activeFeature} 
         onClose={() => setActiveFeature(null)} 
         title={activeFeature ? featureDetails[activeFeature as keyof typeof featureDetails].title : ""}
         size="2xl"
       >
          <div className="py-2">
             {activeFeature && featureDetails[activeFeature as keyof typeof featureDetails].content}
             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button onClick={() => setActiveFeature(null)}>Close</Button>
             </div>
          </div>
       </Modal>

    </motion.div>
  );
};

// --- WELCOME HUB (AUTHENTICATED) ---
const WelcomeView = () => {
  const { user } = useFinance();
  const navigate = useNavigate();

  // Animation variants
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  // Time based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div 
      key="welcome"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pt-32 pb-12 px-6" // Added pt-32 to account for removed layout margin
    >
      {/* Header Section */}
      <motion.div variants={item} className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">{user.name}</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
                  Everything looks good. What would you like to focus on right now?
                </p>
            </div>
            <div className="hidden md:block">
               <PlanBadge plan={user.plan} />
            </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
         <ActionCard 
            variants={item}
            icon={TrendingUp}
            color="emerald"
            title="Log Income"
            desc="Record your salary, freelance work, and other earnings."
            onClick={() => navigate('/income')}
         />
         <ActionCard 
            variants={item}
            icon={Receipt}
            color="rose"
            title="Track Expenses"
            desc="Keep track of daily spending and receipts effortlessly."
            onClick={() => navigate('/expenses')}
         />
         <ActionCard 
            variants={item}
            icon={LayoutDashboard}
            color="primary"
            title="Dashboard"
            desc="Visualize your financial health with real-time charts."
            onClick={() => navigate('/dashboard')}
         />
         <ActionCard 
            variants={item}
            icon={Calendar}
            color="amber"
            title="Upcoming Bills"
            desc="Manage recurring payments and never miss a due date."
            onClick={() => navigate('/bills')}
         />
         <ActionCard 
            variants={item}
            icon={Target}
            color="violet"
            title="Savings Analysis"
            desc="Review your savings rate and get AI-driven insights."
            onClick={() => navigate('/analysis')}
         />
         <ActionCard 
            variants={item}
            icon={Sliders}
            color="slate"
            title="Preferences"
            desc="Customize your theme, profile, and app settings."
            onClick={() => navigate('/profile')}
         />
      </div>

      {/* Pro Tip / Motivation Section */}
      <motion.div variants={item} className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group cursor-default border border-white/10">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700 transform group-hover:scale-110">
             <Sparkles size={140} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="p-5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner shrink-0">
                <Lightbulb size={36} className="text-yellow-300" fill="currentColor" />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Smart Tip</h3>
                <p className="text-primary-50 text-lg leading-relaxed font-medium">
                   Consistently tracking expenses for just 30 days can help you identify up to 15% in potential savings. Keep it up!
                </p>
             </div>
             <Button onClick={() => navigate('/tracking')} className="bg-white text-primary-600 hover:bg-primary-50 border-none shadow-lg whitespace-nowrap px-6 py-3 text-base">
                View History
             </Button>
          </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN HOME COMPONENT ---
export default function Home() {
  const { isDemo } = useFinance();

  return (
    <AnimatePresence mode="wait">
       {isDemo ? <LandingView key="landing" /> : <WelcomeView key="welcome" />}
    </AnimatePresence>
  );
}

// --- SUB COMPONENTS ---
const FeatureCard = ({ icon: Icon, title, desc, color = "blue", delay = 0, onClick }: any) => {
    // Map colors to detailed style objects
    const styles = {
        blue: {
            glow: "from-blue-500 to-cyan-500",
            bg: "bg-blue-500/5 group-hover:bg-blue-500/10",
            iconBox: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            text: "text-blue-600 dark:text-blue-400",
            stitch: "via-blue-500",
            shadow: "shadow-[0_-4px_15px_rgba(59,130,246,0.6)]"
        },
        emerald: {
            glow: "from-emerald-500 to-teal-500",
            bg: "bg-emerald-500/5 group-hover:bg-emerald-500/10",
            iconBox: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
            text: "text-emerald-600 dark:text-emerald-400",
            stitch: "via-emerald-500",
            shadow: "shadow-[0_-4px_15px_rgba(16,185,129,0.6)]"
        },
        violet: {
            glow: "from-violet-500 to-fuchsia-500",
            bg: "bg-violet-500/5 group-hover:bg-violet-500/10",
            iconBox: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
            text: "text-violet-600 dark:text-violet-400",
            stitch: "via-violet-500",
            shadow: "shadow-[0_-4px_15px_rgba(139,92,246,0.6)]"
        }
    };

    const s = styles[color as keyof typeof styles] || styles.blue;

    return (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           whileHover="hover"
           transition={{ delay, duration: 0.5, type: "spring" }}
           className="relative group z-10 h-full cursor-pointer"
           onClick={onClick}
        >
            {/* Glow Border Effect - Moves and expands on hover */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${s.glow} rounded-[2.5rem] opacity-0 group-hover:opacity-75 blur-md transition duration-500 group-hover:duration-200`}></div>
            
            {/* Card Content Container */}
            <div className="relative h-full p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
                
                {/* Subtle gradient blob inside */}
                <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-500 ${s.bg}`}></div>
                
                {/* Glowing Horizontal Stitch Effect (Scanner - Center Expansion) */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 inset-x-0 flex justify-center">
                        <motion.div
                            className={`h-[4px] bg-gradient-to-r from-transparent ${s.stitch} to-transparent ${s.shadow}`}
                            variants={{
                                hover: {
                                    width: ["0%", "80%"], // Expand
                                    transition: {
                                        repeat: Infinity,
                                        repeatType: "mirror", // Return back to center
                                        duration: 2, 
                                        ease: "easeInOut"
                                    }
                                }
                            }}
                            initial={{ width: "0%" }}
                        />
                    </div>
                </div>

                {/* Icon Box with Rotation Effect */}
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${s.iconBox}`}>
                    <Icon size={40} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">
                    {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed relative z-10 font-medium mb-8">
                    {desc}
                </p>

                 {/* "Learn more" appearing at bottom */}
                 <div className={`mt-auto flex items-center ${s.text} font-bold text-base transition-all duration-300 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`}>
                    Learn more <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </motion.div>
    );
};

const ActionCard = ({ icon: Icon, color, title, desc, onClick, variants }: any) => {
  const colorMap: any = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-600 group-hover:text-white",
  };

  return (
    <motion.button
      variants={variants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-300 group text-left w-full h-full relative overflow-hidden"
    >
      <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${colorMap[color] || colorMap.primary}`}>
        <Icon size={28} strokeWidth={2} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
        {desc}
      </p>
      
      {/* Decorative hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/0 to-primary-50/30 dark:from-primary-900/0 dark:to-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
};