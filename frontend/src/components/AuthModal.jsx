import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, register, demoLogin, forgotPassword, resetPassword } = useAuth();
  
  // Modes: 'login', 'register', 'forgot'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    role: 'customer',
  });

  // Forgot password specific states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setCodeSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'register') {
        const newUser = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          address: {
            street: formData.street || '452 Elm Street',
            city: formData.city || 'San Francisco',
          },
        });
        setSuccessMessage(`Authentication Successful! Account created for ${newUser?.name || formData.name}.`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else if (mode === 'login') {
        const loggedUser = await login(formData.email, formData.password);
        setSuccessMessage(`Authentication Successful! Welcome back, ${loggedUser?.name || 'User'}!`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(`Authentication Failed (Unsuccessful): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const loggedUser = await demoLogin(role);
      setSuccessMessage(`Authentication Successful! Logged in as demo ${role} (${loggedUser?.name}).`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Demo login failed';
      setError(`Authentication Failed (Unsuccessful): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(forgotEmail);
      setCodeSent(true);
      const code = res.code || '123456';
      setDemoCodeHint(code);
      setResetCode(code); // Pre-fill verification code for effortless testing
      setSuccessMessage('Verification code generated successfully! Enter your new password below.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('Please choose a password with at least 4 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(forgotEmail, resetCode, newPassword);
      setSuccessMessage('Password reset successfully! Redirecting to Sign In...');
      setTimeout(() => {
        setFormData((prev) => ({ ...prev, email: forgotEmail, password: newPassword }));
        setMode('login');
        setSuccessMessage('Your password has been updated. Click Sign In to continue.');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'register' && 'Join FoodieFlow'}
            {mode === 'login' && 'Welcome Back'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            {mode === 'register' && 'Order mouthwatering food from top local restaurants'}
            {mode === 'login' && 'Sign in to access your orders and account'}
            {mode === 'forgot' && 'Reset your password in 2 easy steps'}
          </p>
        </div>

        {/* Quick Demo Login Bar (Visible on Login & Register) */}
        {mode !== 'forgot' && (
          <div className="p-4 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              1-Click Demo Login:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-xs flex items-center gap-1"
                title="Instant Login as Customer (Sarah Connor)"
              >
                <User className="w-3 h-3" /> Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs flex items-center gap-1"
                title="Instant Login as Admin (Full Control)"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-900 text-xs font-semibold border-2 border-rose-300 flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <span className="inline-block px-1.5 py-0.2 text-[10px] uppercase font-black tracking-wider bg-rose-200 text-rose-800 rounded mb-1">
                  Authentication Failed (Unsuccessful)
                </span>
                <p className="text-xs text-rose-800 font-medium">
                  {error.replace(/^Authentication Failed \(Unsuccessful\):\s*/i, '')}
                </p>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 text-xs font-semibold border-2 border-emerald-400 flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <span className="inline-block px-1.5 py-0.2 text-[10px] uppercase font-black tracking-wider bg-emerald-200 text-emerald-900 rounded mb-1">
                  Authentication Successful
                </span>
                <p className="text-xs text-emerald-800 font-medium">
                  {successMessage.replace(/^Authentication Successful!\s*/i, '')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODE: LOGIN / REGISTER ================= */}
        {mode !== 'forgot' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Register Name */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Alex Taylor"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="user@foodie.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(formData.email);
                      handleSwitchMode('forgot');
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Register: Role Selection */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      formData.role === 'customer'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Customer Patron
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'admin' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      formData.role === 'admin'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> System Admin
                  </button>
                </div>
              </div>
            )}

            {/* Register: Phone & Street */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="555-0199"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="street"
                      placeholder="452 Elm St"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === 'register' ? 'Create Account' : 'Sign In to FoodieFlow'}</span>
              )}
            </button>
          </form>
        )}

        {/* ================= MODE: FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <div className="p-6 space-y-4">
            
            {/* Step 1: Send Code */}
            {!codeSent ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Enter your registered email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="user@foodie.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Reset Password with Code */
              <form onSubmit={handleResetPassword} className="space-y-4">
                
                {/* Code Hint Banner */}
                {demoCodeHint && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-center justify-between">
                    <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      Verification Code: <strong className="font-mono text-base text-amber-950">{demoCodeHint}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetCode(demoCodeHint)}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Set New Password & Sign In</span>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Footer switch between Login & Register */}
        {mode !== 'forgot' && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
            {mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-bold text-orange-600 hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-bold text-orange-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
