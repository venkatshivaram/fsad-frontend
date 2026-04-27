import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getDashboardPath } from '../../components/PrivateRoute';
import { API_URL, apiFetch } from '../../config/api';
import ThemeToggle from '../../components/ThemeToggle';

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const res = await apiFetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password, 
          email: formData.email,
          role: selectedRole 
        })
      });
      
      if (res.ok) {
        const authData = await res.json();
        const userData = authData.user || authData;
        await login(userData, authData.token);
        navigate(getDashboardPath(userData.role));
      } else {
        const errData = await res.json();
        setErrors({ username: errData.message || 'Signup failed' });
      }
    } catch (err) {
      setErrors({ name: 'Failed to connect to server.' });
    }
  };

  const inputBase = 'w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all';
  const inputClass = (field) =>
    `${inputBase} ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300 bg-red-50'
        : 'border-slate-200 focus:ring-indigo-400 focus:border-transparent'
    }`;

  return (
    <div className="min-h-screen flex">
      <ThemeToggle className="fixed right-6 top-6 z-50" />

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 inline-flex items-center gap-2.5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 shadow-xl shadow-cyan-500/20">
          <div className="w-10 h-10 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center text-2xl shadow-lg">🎓</div>
          <span className="text-xl font-bold tracking-tight">CourseCrafter</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight mb-4">
              Begin Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">B.Tech Journey</span><br />
              With Confidence.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Join thousands of students managing their semesters effortlessly with CourseCrafter.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: '01', text: 'Create your student or admin account' },
              { step: '02', text: 'Browse and register for your courses' },
              { step: '03', text: 'Build a conflict-free weekly schedule' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <span className="text-xs font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 rounded-lg px-2 py-1 shrink-0">{step}</span>
                <span className="text-sm text-slate-200 font-medium">{text}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500 italic">"The beautiful thing about learning is that no one can take it away."</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 overflow-y-auto transition-colors duration-300 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎓</span>
              <span className="text-2xl font-extrabold text-indigo-700">CourseCrafter</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-3xl font-extrabold text-slate-900">Create Account 🚀</h2>
              <p className="text-slate-500 text-sm mt-1.5">
                Already registered?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">Sign in</Link>
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4" noValidate>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Arjun Sharma" className={inputClass('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="arjun@college.edu" className={inputClass('email') + ' pl-11'} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}
                    placeholder="arjun_sharma" className={inputClass('username') + ' pl-9'} />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleChange} placeholder="Min. 6 chars" className={inputClass('password') + ' pr-10'} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Confirm</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} placeholder="Re-enter" className={inputClass('confirmPassword') + ' pr-10'} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'student', icon: '🎓', label: 'Student', desc: 'Browse & register courses' },
                    { value: 'admin', icon: '🛡️', label: 'Admin', desc: 'Approve registrations & drop requests' },
                  ].map(({ value, icon, label, desc }) => (
                    <label key={value}
                      className={`relative flex flex-col items-center gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center ${
                        selectedRole === value
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <input type="radio" name="role" value={value} checked={selectedRole === value}
                        onChange={(e) => setSelectedRole(e.target.value)} className="sr-only" />
                      {selectedRole === value && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px] font-black">✓</span>
                        </span>
                      )}
                      <span className="text-2xl">{icon}</span>
                      <span className="font-bold text-slate-800 text-sm">{label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-100 transition-all duration-200 text-sm tracking-wide mt-1"
              >
                Create My Account →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
