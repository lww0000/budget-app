import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, PlanBadge, UpgradeTriggerModal, Modal } from './UIComponents';
import { THEMES, PLAN_LIMITS } from '../constants';
import { Lock, User, Settings, Palette, Check, Wallet, TrendingUp, Crown, AlertTriangle, Smile, Glasses, UserCircle, RefreshCw, X, Hash, Moon, Sun, Bell, Shield, LogOut, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- MODERN COLOR PICKER COMPONENT ---
const ModernColorPicker = ({ title, color, onChange, onClose }: any) => {
  const [inputColor, setInputColor] = useState(color);
  
  useEffect(() => { setInputColor(color); }, [color]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const cleanVal = val.replace(/[^0-9A-F]/ig, '');
      setInputColor('#' + cleanVal);
      if (cleanVal.length === 6) {
          onChange('#' + cleanVal);
      }
  };

  const PRESETS = [
      '#64748b', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', 
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
      '#0f172a', '#ffffff'
  ];

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette size={18} className="text-primary-500" /> {title}
                  </h3>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <X size={20} />
                  </button>
              </div>

              {/* Preview & Hex Input */}
              <div className="flex gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div 
                    className="w-16 h-16 rounded-2xl shadow-sm ring-2 ring-white dark:ring-slate-700 shrink-0 transition-colors" 
                    style={{ backgroundColor: inputColor }} 
                  />
                  <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hex Color</label>
                      <div className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg group-focus-within:text-primary-500 transition-colors">#</span>
                          <input 
                              type="text" 
                              value={inputColor.replace('#', '')} 
                              onChange={handleHexChange}
                              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base tracking-wider"
                              maxLength={6}
                          />
                      </div>
                  </div>
              </div>

              {/* Presets */}
              <div className="mb-8">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Modern Presets</label>
                  <div className="grid grid-cols-5 gap-3">
                      {PRESETS.map(p => (
                          <button
                              key={p}
                              onClick={() => { onChange(p); setInputColor(p); }}
                              className={`w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110 shadow-sm ${inputColor.toLowerCase() === p.toLowerCase() ? 'ring-2 ring-offset-2 ring-primary-500 ring-offset-white dark:ring-offset-slate-900 scale-110 z-10' : 'hover:shadow-md'}`}
                              style={{ backgroundColor: p }}
                              title={p}
                          />
                      ))}
                  </div>
              </div>

              <Button onClick={onClose} className="w-full py-3.5 text-base shadow-lg shadow-primary-500/20">
                  Confirm Selection
              </Button>
          </motion.div>
      </div>
  );
};

// --- AVATAR CUSTOMIZER MODAL ---
const AvatarCustomizerModal = ({ isOpen, onClose, onSave, currentName }: any) => {
  const [activeTab, setActiveTab] = useState<'bg' | 'text'>('bg');
  const [bgColor, setBgColor] = useState('#6366f1');
  const [textColor, setTextColor] = useState('#ffffff');
  
  // Vibrant, modern color presets
  const PRESETS = [
      '#6366f1', '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
      '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', 
      '#d946ef', '#ec4899', '#f43f5e', '#0f172a', '#1e293b', 
      '#334155', '#475569', '#64748b', '#94a3b8', '#ffffff'
  ];

  if (!isOpen) return null;

  const previewUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=${bgColor.replace('#', '')}&color=${textColor.replace('#', '')}&length=1&size=256&bold=true`;
  
  const currentColor = activeTab === 'bg' ? bgColor : textColor;
  const handleColorChange = (c: string) => {
      if (activeTab === 'bg') setBgColor(c);
      else setTextColor(c);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Design Your Avatar">
       <div className="flex flex-col gap-6">
          {/* Preview Section */}
          <div className="flex justify-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <motion.img 
                key={previewUrl}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                src={previewUrl} 
                alt="Preview" 
                className="w-32 h-32 rounded-full shadow-xl ring-4 ring-white dark:ring-slate-800" 
              />
          </div>

          {/* Controls */}
          <div>
              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                  <button 
                    onClick={() => setActiveTab('bg')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'bg' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Background
                  </button>
                  <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'text' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Letter Color
                  </button>
              </div>

              {/* Color Grid */}
              <div className="mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                     Select {activeTab === 'bg' ? 'Background' : 'Letter'} Color
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                      {PRESETS.map(color => (
                          <button
                              key={color}
                              onClick={() => handleColorChange(color)}
                              className={`w-full aspect-square rounded-full transition-all hover:scale-110 border border-black/5 dark:border-white/10 relative group ${currentColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 z-10' : ''}`}
                              style={{ backgroundColor: color }}
                              title={color}
                          >
                              {color === '#ffffff' && <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-600"></div>}
                              {currentColor.toLowerCase() === color.toLowerCase() && <motion.div layoutId="check" className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference"><Check size={12} strokeWidth={4} /></motion.div>}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Custom Hex Input */}
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm" style={{ backgroundColor: currentColor }}></div>
                 </div>
                 <input 
                    type="text" 
                    value={currentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                    placeholder="#HEXCODE"
                 />
                 <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer">
                        <Palette size={16} className="text-slate-500" />
                        <input 
                           type="color" 
                           value={currentColor} 
                           onChange={(e) => handleColorChange(e.target.value)} 
                           className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0 opacity-0" 
                        />
                    </div>
                 </div>
              </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
               <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
               <Button onClick={() => onSave(bgColor, textColor)} className="flex-1">Save Changes</Button>
          </div>
       </div>
    </Modal>
  );
};

export default function Profile() {
  const { user, updateUser, theme, setTheme, isDemo, openAuthModal, setCustomThemeSettings, customPrimaryHex, customAccentHex, customIsDark, justUpgraded, deleteAccount, isGuestUser, changePassword, notify } = useFinance();
  const [newName, setNewName] = useState(user.name);
  const [msg, setMsg] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  const [requiredPlan, setRequiredPlan] = useState<'PRO' | 'PREMIUM'>('PRO');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [pickerOpen, setPickerOpen] = useState<'primary' | 'accent' | null>(null);
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState(false);
  const navigate = useNavigate();
  
  // Password State
  const [passwordData, setPasswordData] = useState({ newPass: '', confirmPass: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Local state for theme builder
  const [localPrimary, setLocalPrimary] = useState(customPrimaryHex);
  const [localAccent, setLocalAccent] = useState(customAccentHex);
  const [localIsDark, setLocalIsDark] = useState(customIsDark);

  const isNameChangeLocked = isDemo || user.plan === 'FREE';

  const handleNameChange = () => {
    // Automatically update avatar to reflect new name (first letter)
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random&length=1`;
    
    const success = updateUser({ name: newName, avatar: newAvatar });
    if (success) setMsg('Name updated successfully!');
    else if (!isDemo) setMsg('Limit reached. Upgrade plan to change name again.');
    
    setTimeout(() => setMsg(''), 3000);
  };
  
  const handlePasswordUpdate = async () => {
      if (passwordData.newPass !== passwordData.confirmPass) {
          notify('error', 'Passwords do not match');
          return;
      }
      if (passwordData.newPass.length < 6) {
          notify('error', 'Password must be at least 6 characters');
          return;
      }
      
      setIsChangingPass(true);
      const success = await changePassword(passwordData.newPass);
      setIsChangingPass(false);
      
      if (success) {
          setPasswordData({ newPass: '', confirmPass: '' });
      }
  };

  const applyCustomTheme = () => {
     setCustomThemeSettings(localPrimary, localAccent, localIsDark);
  };

  const handleThemeSelect = (themeId: string, isLocked: boolean, reqPlan: string) => {
      if (isLocked) {
          setLockedFeatureName(`${reqPlan === 'PRO' ? 'Pro' : 'Premium'} Theme`);
          setRequiredPlan(reqPlan as 'PRO' | 'PREMIUM');
          setUpgradeModalOpen(true);
      } else {
          setTheme(themeId);
      }
  };

  const handleDeleteSubmit = () => {
      if (deleteInput === 'DELETE') {
          deleteAccount();
          setDeleteConfirmOpen(false);
      }
  };

  const toggleNotifications = async () => {
      if (isDemo || user.plan === 'FREE') {
          setLockedFeatureName("Notifications");
          setRequiredPlan("PRO");
          setUpgradeModalOpen(true);
          return;
      }

      if (!user.notificationsEnabled) {
          if (!('Notification' in window)) {
              alert("This browser does not support notifications.");
              return;
          }
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
              updateUser({ notificationsEnabled: true });
          } else {
              alert("Notification permission denied. Please reset permissions in your browser settings.");
          }
      } else {
          updateUser({ notificationsEnabled: false });
      }
  };

  const handleAvatarGearClick = () => {
    if (user.plan === 'FREE') {
        setLockedFeatureName("Custom Avatar Colors");
        setRequiredPlan("PRO");
        setUpgradeModalOpen(true);
    } else {
        setIsAvatarCustomizerOpen(true);
    }
  };

  const handleSaveAvatar = (bg: string, text: string) => {
    const cleanBg = bg.replace('#', '');
    const cleanText = text.replace('#', '');
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${cleanBg}&color=${cleanText}&length=1`;
    updateUser({ avatar: newAvatar });
    setIsAvatarCustomizerOpen(false);
    notify('success', 'Profile picture updated');
  };

  const isCustomLocked = !isDemo && user.plan !== 'PREMIUM';
  const isNotificationsLocked = !isDemo && user.plan === 'FREE'; 

  const glowClass = (justUpgraded) ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Account Settings</h1>
         <p className="text-slate-500 dark:text-slate-400">Manage your profile and preferences</p>
      </div>

      {/* --- PROFILE INFO --- */}
      <Card title="Profile Information">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative mx-auto md:mx-0 group">
            <div className={`w-32 h-32 rounded-full p-1 border-2 border-primary-100 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800 shadow-sm overflow-hidden`}>
              {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                  <User size={48} className="text-slate-300 dark:text-slate-500" />
              )}
            </div>
            {!isDemo && (
              <button 
                onClick={handleAvatarGearClick}
                className="absolute top-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 z-10"
                title="Customize Avatar Colors"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <div className="flex gap-4">
                <input 
                  value={isDemo ? "Demo User" : newName}
                  disabled={isNameChangeLocked}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isNameChangeLocked ? 'opacity-70 cursor-not-allowed text-slate-500' : ''}`}
                />
                <div className="relative">
                    <Button 
                        onClick={handleNameChange} 
                        disabled={isNameChangeLocked}
                    >
                        {isNameChangeLocked ? <Lock size={16} /> : 'Update'}
                    </Button>
                    {/* Overlay for Free Users to Trigger Upgrade on Click */}
                    {!isDemo && user.plan === 'FREE' && (
                        <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => {
                                setLockedFeatureName("Display Name");
                                setRequiredPlan("PRO");
                                setUpgradeModalOpen(true);
                            }}
                        />
                    )}
                </div>
              </div>
              {isNameChangeLocked && (
                  <p className="text-sm mt-3 font-medium text-slate-400 flex items-center gap-2">
                     <Lock size={12} /> {isDemo ? 'Identity locked in Demo Mode.' : 'Upgrade to PRO to change display name.'}
                  </p>
              )}
              {msg && <p className={`text-sm mt-3 font-medium ${msg.includes('Limit') ? 'text-red-500' : 'text-emerald-500'}`}>{msg}</p>}
            </div>
            
            {!isDemo && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Settings size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Subscription</p>
                    <div className="mt-1"><PlanBadge plan={user.plan} /></div>
                  </div>
                </div>
                {user.plan !== 'PREMIUM' && (
                  <Button variant="outline" onClick={() => window.location.hash = '#/upgrade'} className="text-sm">Upgrade Plan</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* --- SECURITY / CHANGE PASSWORD --- */}
      {!isGuestUser && !isDemo && (
          <Card title="Security">
              <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                      <div className="flex items-center gap-2 mb-2">
                          <Shield size={20} className="text-primary-500" />
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Change Password</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Update your password to keep your account secure. Use a strong password with at least 6 characters.
                      </p>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                              <input 
                                  type="password"
                                  value={passwordData.newPass}
                                  onChange={(e) => setPasswordData({...passwordData, newPass: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                  placeholder="••••••••"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                              <input 
                                  type="password"
                                  value={passwordData.confirmPass}
                                  onChange={(e) => setPasswordData({...passwordData, confirmPass: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                  placeholder="••••••••"
                              />
                          </div>
                      </div>
                      <div className="flex justify-end">
                          <Button onClick={handlePasswordUpdate} isLoading={isChangingPass} disabled={!passwordData.newPass || !passwordData.confirmPass}>
                              Update Password
                          </Button>
                      </div>
                  </div>
              </div>
          </Card>
      )}

      {/* --- NOTIFICATIONS SETTINGS --- */}
      {!isGuestUser && (
        <Card title="Notifications">
            <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between ${isNotificationsLocked ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-80' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isNotificationsLocked ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Bill & Expense Reminders
                            {isNotificationsLocked && <Lock size={12} className="text-slate-400" />}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get notified about upcoming bills for the current month.</p>
                    </div>
                </div>
                
                <div>
                    {isNotificationsLocked ? (
                        <Button variant="outline" onClick={() => {
                            setLockedFeatureName("Notifications");
                            setRequiredPlan("PRO");
                            setUpgradeModalOpen(true);
                        }} className="text-xs h-9">
                            Upgrade to Enable
                        </Button>
                    ) : (
                        <button 
                            onClick={toggleNotifications}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${user.notificationsEnabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <motion.div 
                                className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md"
                                animate={{ x: user.notificationsEnabled ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    )}
                </div>
            </div>
        </Card>
      )}

      {/* --- APP THEME --- */}
      <Card title="App Theme">
        <p className="text-sm text-slate-500 mb-6">Choose a dual-color theme that fits your style. Advanced themes are available in Pro and Premium plans.</p>
        
        {/* --- STANDARD THEMES GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEMES.map(t => {
                let isLocked = false;
                if (!isDemo) {
                   if (t.requiredPlan === 'PRO' && user.plan === 'FREE') isLocked = true;
                   if (t.requiredPlan === 'PREMIUM' && user.plan !== 'PREMIUM') isLocked = true;
                }

                const isActive = theme === t.id;
                const reqPlanLabel = t.requiredPlan === 'PRO' ? 'Pro' : 'Premium';
                const tooltip = isLocked ? `Unlock with ${reqPlanLabel} Plan` : `${t.name} Theme`;
                
                return (
                <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id, isLocked, t.requiredPlan)}
                    title={tooltip}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 group text-left overflow-hidden ${
                    isActive 
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200 dark:hover:border-slate-700'
                    } ${isLocked ? 'opacity-100' : ''}`}
                >
                    <div className="w-full h-16 rounded-xl mb-3 shadow-sm flex relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.primaryColors[500] }}></div>
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.accentColors[500] }}></div>
                    
                    {t.isDark && <div className="absolute inset-0 bg-slate-950/20"></div>}
                    
                    {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white text-primary-600 rounded-full p-1.5 shadow-lg z-10">
                            <Check size={16} strokeWidth={3} />
                            </div>
                        </div>
                    )}
                    </div>
                    
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                        <p className={`text-sm font-bold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}>{t.name}</p>
                        <p className="text-xs text-slate-500">{t.isDark ? 'Dark Mode' : 'Light Mode'}</p>
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {isLocked && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px]"
                            >
                                <div className="mb-2 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
                                    <Lock size={16} className="text-slate-500 dark:text-slate-400" />
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-white/20 ${
                                    t.requiredPlan === 'PREMIUM'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20'
                                    : 'bg-primary-600 text-white shadow-primary-500/20'
                                }`}>
                                    {reqPlanLabel}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
                );
            })}
        </div>

        {/* --- CUSTOM THEME BUILDER (PREMIUM) --- */}
        <div className={`mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 transition-all duration-700 ease-in-out ${!isCustomLocked && justUpgraded ? 'p-2 -m-2 rounded-2xl ' + glowClass : ''}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <Palette size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Custom Theme Builder</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Design your own personalized interface</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
            {isCustomLocked ? (
                <motion.div
                    key="locked-custom"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl"
                >
                    {/* Background visuals suggesting themes */}
                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-100 dark:ring-slate-700 relative">
                             <div className="absolute -top-2 -right-2">
                                 <span className="flex h-4 w-4">
                                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                   <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                                 </span>
                             </div>
                             <Crown size={32} className="text-amber-500" fill="currentColor" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Unlock Custom Themes</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg font-medium">
                            Express yourself fully. Upgrade to Premium to build and save your own unique interface themes.
                        </p>
                        
                        <Button onClick={() => window.location.hash = '#/upgrade'} className="px-10 py-4 text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 border-none">
                            Get Premium Access
                        </Button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="unlocked-custom"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 ring-4 ring-slate-50 dark:ring-slate-800/50"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Controls Side */}
                        <div className="space-y-8">
                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Primary Color 
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">Brand & Headers</span>
                                </label>
                                <div className="flex items-center gap-4 group">
                                    <button 
                                      onClick={() => setPickerOpen('primary')}
                                      className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-offset-2 ring-slate-100 dark:ring-slate-800 dark:ring-offset-slate-900 transition-transform group-hover:scale-105 cursor-pointer" 
                                      style={{ backgroundColor: localPrimary }}
                                    >
                                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                    </button>
                                    <div className="flex-1">
                                    <div className="font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 uppercase tracking-wider flex justify-between items-center">
                                        {localPrimary}
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: localPrimary }}></div>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Accent Color
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">Actions & Highlights</span>
                                </label>
                                <div className="flex items-center gap-4 group">
                                    <button 
                                      onClick={() => setPickerOpen('accent')}
                                      className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-offset-2 ring-slate-100 dark:ring-slate-800 dark:ring-offset-slate-900 transition-transform group-hover:scale-105 cursor-pointer" 
                                      style={{ backgroundColor: localAccent }}
                                    >
                                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                    </button>
                                    <div className="flex-1">
                                    <div className="font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 uppercase tracking-wider flex justify-between items-center">
                                        {localAccent}
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: localAccent }}></div>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Theme Mode
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">App Appearance</span>
                                </label>
                                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-full relative">
                                    <motion.div 
                                       className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm z-0"
                                       layoutId="theme-toggle"
                                       initial={false}
                                       animate={{ 
                                           left: localIsDark ? '50%' : '4px', 
                                           width: 'calc(50% - 4px)' 
                                       }}
                                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                    <button 
                                        onClick={() => setLocalIsDark(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors relative z-10 ${
                                            !localIsDark 
                                            ? 'text-slate-900 dark:text-white' 
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        <Sun size={18} /> Light
                                    </button>
                                    <button 
                                        onClick={() => setLocalIsDark(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors relative z-10 ${
                                            localIsDark 
                                            ? 'text-slate-900 dark:text-white' 
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        <Moon size={18} /> Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Preview Side */}
                        <div className="flex flex-col h-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Preview</label>
                            <div className={`flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner p-6 flex flex-col justify-between transition-colors duration-300 ${localIsDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: localPrimary }}></div>
                                    <div className={`h-2 w-16 rounded-full ${localIsDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                </div>
                                <div className={`h-24 rounded-xl mb-4 w-full ${localIsDark ? 'bg-slate-800' : 'bg-white'} shadow-sm p-4`}>
                                    <div className={`h-2 w-1/2 rounded-full mb-3 ${localIsDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                    <div className={`h-2 w-3/4 rounded-full ${localIsDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                </div>
                                <Button 
                                   onClick={applyCustomTheme}
                                   className="w-full"
                                   style={{ 
                                       backgroundImage: `linear-gradient(to right, ${localPrimary}, ${localAccent})`,
                                       boxShadow: `0 4px 14px 0 ${localPrimary}40`
                                   }}
                                >
                                   Save Custom Theme
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </Card>

      {/* --- DANGER ZONE --- */}
      {!isGuestUser && (
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <AlertTriangle size={20} className="text-red-500" /> Danger Zone
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                      Permanently delete your account and all associated data. This action is irreversible and cannot be undone.
                  </p>
              </div>
              <div className="w-full md:w-auto">
                   <button 
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="w-full md:w-auto px-6 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-all flex items-center justify-center gap-2"
                   >
                      <Trash2 size={18} /> Delete Account
                   </button>
              </div>
          </div>
      </div>
      )}

      <UpgradeTriggerModal 
          isOpen={upgradeModalOpen} 
          onClose={() => setUpgradeModalOpen(false)} 
          featureName={lockedFeatureName} 
          requiredPlan={requiredPlan} 
      />

      <AvatarCustomizerModal 
          isOpen={isAvatarCustomizerOpen}
          onClose={() => setIsAvatarCustomizerOpen(false)}
          onSave={handleSaveAvatar}
          currentName={user.name}
      />

      {pickerOpen && (
          <ModernColorPicker 
              title={pickerOpen === 'primary' ? 'Primary Color' : 'Accent Color'}
              color={pickerOpen === 'primary' ? localPrimary : localAccent}
              onChange={(c: string) => pickerOpen === 'primary' ? setLocalPrimary(c) : setLocalAccent(c)}
              onClose={() => setPickerOpen(null)}
          />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Delete Account?">
          <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                  This will immediately delete your account, settings, and all transaction history.
                  Please type <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-red-600">DELETE</span> below to confirm.
              </p>
              <input 
                  type="text" 
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type DELETE to confirm"
              />
              <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)} className="flex-1">Cancel</Button>
                  <Button 
                      variant="danger" 
                      onClick={handleDeleteSubmit} 
                      disabled={deleteInput !== 'DELETE'}
                      className="flex-1"
                  >
                      Confirm Delete
                  </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
}