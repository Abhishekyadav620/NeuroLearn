import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  AtSign,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import authService from '../services/authService.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules check
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(formData.password),
  };

  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!formData.password) return { label: 'Not entered', color: 'bg-slate-200', text: 'text-slate-400', width: '0%' };
    if (passedCriteriaCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500', width: '33%' };
    if (passedCriteriaCount <= 4) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', width: '100%' };
  };

  const strength = getStrengthMeta();

  // Validate fields
  const validate = (values = formData) => {
    const errs = {};

    if (!values.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (values.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    }

    if (!values.username.trim()) {
      errs.username = 'Username is required';
    } else if (values.username.trim().length < 3 || values.username.trim().length > 20) {
      errs.username = 'Username must be between 3 and 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username.trim())) {
      errs.username = 'Only letters, numbers, and underscores allowed';
    }

    if (!values.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!values.password) {
      errs.password = 'Password is required';
    } else if (passedCriteriaCount < 5) {
      errs.password = 'Password does not meet all security requirements';
    }

    if (!values.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (values.confirmPassword !== values.password) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!values.agreeTerms) {
      errs.agreeTerms = 'You must accept the Terms and Conditions to proceed';
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

    // Dynamic field-level error clearing if touched
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
    setApiSuccess(null);

    // Mark all as touched
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.registerUser({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setApiSuccess(
        response.message || 'Account created successfully! Welcome to NeuroLearn.'
      );

      // Store student auth session in localStorage for development convenience
      if (response.data?.token) {
        localStorage.setItem('neurolearn_token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('neurolearn_user', JSON.stringify(response.data.user));
      }

      // Smooth transition to login or dashboard preview after 1.5 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { registeredEmail: formData.email.trim(), successMsg: 'Account created! Please sign in.' },
        });
      }, 1500);
    } catch (err) {
      setApiError(
        err.message || 'Registration failed. Please check your information and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neuro-bg">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-neuro-border bg-white shadow-card">
        {/* LEFT SECTION: Brand, Visuals & Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-neuro-lavenderBg via-[#F9F6FF] to-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neuro-border">
          <div>
            {/* Header / Brand */}
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
                Start Your Smarter Learning Journey.
              </h1>
              <p className="text-sm text-neuro-textMuted leading-relaxed">
                Join an intelligent education platform that dynamically monitors cognitive flow,
                reduces attention fatigue, and chunks lessons at your personalized pace.
              </p>
            </div>

            {/* Three Feature Highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-neuro-border shadow-subtle">
                <div className="w-8 h-8 rounded-xl bg-neuro-lavender text-neuro-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neuro-text">Personalized Learning</h4>
                  <p className="text-[11px] text-neuro-textMuted mt-0.5 leading-relaxed">
                    Course material and video playback adapt dynamically to your cognitive state.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-neuro-border shadow-subtle">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-neuro-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neuro-text">AI-Powered Insights</h4>
                  <p className="text-[11px] text-neuro-textMuted mt-0.5 leading-relaxed">
                    Identifies attention drift and simplifies complex theories into digestible steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-neuro-border shadow-subtle">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neuro-text">Track Your Progress</h4>
                  <p className="text-[11px] text-neuro-textMuted mt-0.5 leading-relaxed">
                    Interactive formative check-ins keep retention high without burnout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Footer Note */}
          <div className="mt-8 pt-6 border-t border-purple-100/60 flex items-center gap-2 text-xs text-neuro-textMuted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Privacy-First: Zero webcam tracking without explicit student consent.</span>
          </div>
        </div>

        {/* RIGHT SECTION: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neuro-text tracking-tight">
                Create your student account
              </h2>
              <p className="text-xs sm:text-sm text-neuro-textMuted mt-1">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-neuro-purple hover:underline inline-flex items-center gap-1"
                >
                  Sign in here <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>

            {/* API Alerts */}
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
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neuro-text">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Alex Morgan"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl saas-input ${
                      errors.fullName && touched.fullName
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-neuro-border'
                    }`}
                  />
                </div>
                {errors.fullName && touched.fullName && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neuro-text">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <AtSign className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="alex_learner"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl saas-input ${
                        errors.username && touched.username
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-neuro-border'
                      }`}
                    />
                  </div>
                  {errors.username && touched.username && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.username}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neuro-text">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="alex@example.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl saas-input ${
                        errors.email && touched.email
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-neuro-border'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neuro-text">
                  Password <span className="text-rose-500">*</span>
                </label>
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

                {/* Password Strength Indicator Bar */}
                {formData.password && (
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neuro-textMuted">Password Strength:</span>
                      <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Password Checklist */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-neuro-border text-[11px] text-neuro-textMuted space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        passwordCriteria.length ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordCriteria.uppercase ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span>1 Uppercase (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordCriteria.lowercase ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span>1 Lowercase (a-z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordCriteria.number ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span>1 Number (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordCriteria.special ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span>1 Special symbol (@, #, $)</span>
                    </div>
                  </div>
                </div>

                {errors.password && touched.password && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neuro-text">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl saas-input ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-neuro-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-neuro-text"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neuro-textMuted select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-0.5 rounded border-slate-300 text-neuro-purple focus:ring-neuro-purple"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="text-neuro-purple font-medium hover:underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-neuro-purple font-medium hover:underline">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.agreeTerms && touched.agreeTerms && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 pl-6">
                    <AlertCircle className="w-3 h-3" /> {errors.agreeTerms}
                  </p>
                )}
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
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
