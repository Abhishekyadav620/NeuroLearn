import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import authService from '../services/authService.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from successful registration
  const prefillEmail = location.state?.registeredEmail || '';
  const initialSuccess = location.state?.successMsg || null;

  // Form State
  const [formData, setFormData] = useState({
    emailOrUsername: prefillEmail,
    password: '',
    rememberMe: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(initialSuccess);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Field validation
  const validate = (values = formData) => {
    const errs = {};

    if (!values.emailOrUsername.trim()) {
      errs.emailOrUsername = 'Please enter your email or username';
    }

    if (!values.password) {
      errs.password = 'Password is required';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (apiError) setApiError(null);

    if (touched[name]) {
      const currentErrs = validate({ ...formData, [name]: val });
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrs[name] || null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentErrs = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: currentErrs[name] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    setTouched({
      emailOrUsername: true,
      password: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.loginUser({
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password,
      });

      setApiSuccess(
        `Welcome back, ${response.data?.user?.fullName || 'Student'}! Signing you in...`
      );

      // Save token & user in localStorage
      if (response.data?.token) {
        localStorage.setItem('neurolearn_token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('neurolearn_user', JSON.stringify(response.data.user));
      }

      // Smooth redirection to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setApiError(
        err.message || 'Invalid credentials. Please verify your email/username and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neuro-bg">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-neuro-border bg-white shadow-card">
        {/* LEFT SECTION: Visual Identity & Benefits */}
        <div className="lg:col-span-5 bg-gradient-to-br from-neuro-lavenderBg via-[#FAF7FF] to-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neuro-border">
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-neuro-purple text-white flex items-center justify-center shadow-purple-btn">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-neuro-text tracking-tight">
                NeuroLearn
              </span>
            </Link>

            <div className="mt-8 space-y-3">
              <Badge variant="purple">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Cognitive System
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neuro-text tracking-tight leading-tight">
                Welcome Back to Smarter Learning.
              </h1>
              <p className="text-sm text-neuro-textMuted leading-relaxed">
                Resume your personalized sessions where interaction telemetry adapts lessons to
                your cognitive capacity in real time.
              </p>
            </div>

            {/* Visual Educational Preview Card */}
            <div className="mt-8 p-4 rounded-2xl bg-white border border-neuro-border shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neuro-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neuro-lavender flex items-center justify-center text-neuro-purple">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-neuro-text">Focus Telemetry</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Optimal Flow (88%)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-neuro-textMuted text-[11px]">
                  <span>Active Module</span>
                  <span className="font-medium text-neuro-text">Neural Network Architecture</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-neuro-purple h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-neuro-textMuted">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-neuro-purple" /> Dynamic Chunking Active
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-600" /> 0 Drift Spikes
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Footnote */}
          <div className="mt-8 pt-6 border-t border-purple-100/60 flex items-center gap-2 text-xs text-neuro-textMuted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted sessions & strict learner data protection.</span>
          </div>
        </div>

        {/* RIGHT SECTION: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neuro-text tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs sm:text-sm text-neuro-textMuted mt-1">
                New to NeuroLearn?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-neuro-purple hover:underline inline-flex items-center gap-1"
                >
                  Create an account <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>

            {/* API Error / Success Banners */}
            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                <span>{apiError}</span>
              </div>
            )}

            {apiSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>{apiSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neuro-text">
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="learner@example.com or username"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl saas-input ${
                      errors.emailOrUsername && touched.emailOrUsername
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-neuro-border'
                    }`}
                  />
                </div>
                {errors.emailOrUsername && touched.emailOrUsername && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.emailOrUsername}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neuro-text">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-neuro-purple hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl saas-input ${
                      errors.password && touched.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-neuro-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-neuro-text"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neuro-textMuted select-none">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-neuro-purple focus:ring-neuro-purple"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Sign In to NeuroLearn
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-neuro-border shadow-card space-y-4">
            <div className="w-10 h-10 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neuro-text">Reset Password</h3>
              <p className="text-xs text-neuro-textMuted mt-1 leading-relaxed">
                Password reset via automated email OTP will be available in the upcoming security milestone.
                For assistance, contact <span className="font-mono text-neuro-purple">support@neurolearn.ai</span>.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setShowForgotModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
