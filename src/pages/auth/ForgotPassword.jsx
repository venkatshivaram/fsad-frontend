import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, apiFetch } from '../../config/api';
import ThemeToggle from '../../components/ThemeToggle';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 5; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const initialIdentifier = searchParams.get('identifier');
    if (initialIdentifier && !resetToken) {
      setIdentifier(initialIdentifier);
    }
  }, [searchParams, resetToken]);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (captchaInput.toUpperCase() !== captchaText) {
      setError('Incorrect CAPTCHA. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'If an account exists, a reset link has been sent.');
      } else {
        setError(data.message || 'Failed to send reset link.');
        generateCaptcha();
      }
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Password reset successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const activeStep = resetToken ? 2 : 1;
  const stepCards = [
    {
      title: 'Request link',
      description: 'Enter your registered email or username and pass the security check.'
    },
    {
      title: 'Create password',
      description: 'Set a new password and return to login securely.'
    }
  ];

  const passwordChecks = [
    {
      label: 'At least 4 characters',
      valid: newPassword.length >= 4
    },
    {
      label: 'Passwords match',
      valid: confirmPassword.length > 0 && newPassword === confirmPassword
    }
  ];

  return (
    <div className="min-h-screen flex">
      <ThemeToggle className="fixed right-6 top-6 z-50" />
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-12 text-white">
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="absolute top-[-80px] right-[-80px] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 self-start inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 py-2.5 shadow-xl shadow-cyan-500/20 backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl shadow-lg backdrop-blur">
            C
          </div>
          <span className="text-xl font-bold tracking-tight">CourseCrafter</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="mb-4 text-5xl font-extrabold leading-tight">
              Recover Your
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Account Access
              </span>
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-slate-300">
              Use the secure reset flow to regain access without contacting support. We will guide you step by step.
            </p>
          </div>

          <div className="space-y-3">
            {stepCards.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = activeStep === stepNumber;
              const isComplete = activeStep > stepNumber;

              return (
                <div
                  key={step.title}
                  className={`rounded-2xl border px-4 py-4 backdrop-blur-sm transition-all duration-300 ${
                    isActive
                      ? 'border-white/30 bg-white/15 shadow-lg'
                      : isComplete
                        ? 'border-emerald-400/30 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        isComplete
                          ? 'bg-emerald-400 text-emerald-950'
                          : isActive
                            ? 'bg-white text-slate-900'
                            : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {isComplete ? 'OK' : `0${stepNumber}`}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs italic text-slate-500">"Security is not a product, but a process."</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 transition-colors duration-300 dark:from-slate-950 dark:to-slate-900 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-indigo-700">C</span>
              <span className="text-2xl font-extrabold text-indigo-700">CourseCrafter</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-indigo-100">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-700">
                Step {activeStep} of 2
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                {resetToken ? 'Create New Password' : 'Reset Password'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Remember it?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  Back to Login
                </Link>
              </p>
            </div>

            <div className="mb-6 flex gap-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    activeStep >= step ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {!resetToken ? (
              <form onSubmit={handleSendResetLink} className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Need help signing in?</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Enter the email address or username linked to your account. If it exists, we will email a secure reset link.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email or Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="you@example.com or username"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Security Code
                  </label>
                  <div className="flex gap-3">
                    <div
                      onClick={generateCaptcha}
                      title="Click to refresh CAPTCHA"
                      className="relative flex w-2/5 cursor-pointer select-none items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-200 font-mono text-xl font-black tracking-widest text-slate-800 shadow-inner"
                      style={{ background: 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #cbd5e1 10px, #cbd5e1 20px)' }}
                    >
                      <span className="relative z-10 rotate-[-2deg] opacity-80 drop-shadow-md">{captchaText}</span>
                      <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-3 bg-slate-400/50" />
                      <div className="absolute left-0 top-1/3 h-[1px] w-full -translate-y-1/2 -rotate-6 bg-slate-500/30" />
                    </div>
                    <div className="relative w-3/5">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">#</span>
                      <input
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm uppercase tracking-widest text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter code"
                        maxLength={5}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Click the code box to refresh it.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:scale-[1.02] hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-300 active:scale-100 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Reset link verified. Choose a new password for your account.
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Password Checklist</p>
                  <div className="mt-3 space-y-2">
                    {passwordChecks.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                            item.valid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.valid ? 'OK' : '..'}
                        </span>
                        <span className={item.valid ? 'text-emerald-700' : 'text-slate-500'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-green-200 transition-all duration-200 hover:scale-[1.02] hover:from-green-500 hover:to-emerald-500 hover:shadow-green-300 active:scale-100 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
