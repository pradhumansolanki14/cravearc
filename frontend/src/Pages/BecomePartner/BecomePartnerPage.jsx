import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiUser, FiMail, FiLock, FiMapPin, FiPhone,
  FiCheckCircle, FiAlertCircle, FiChevronRight, FiChevronLeft,
  FiArrowLeft, FiLoader, FiZap, FiTrendingUp, FiShield,
  FiGrid, FiStar, FiEye, FiEyeOff,
} from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { BRAND } from '../../constants/brand';
import { BrandLogo } from '../../components/ui';

/* ─── Step definitions ──────────────────────────────────────── */
const STEPS = [
  { id: 0, label: 'Account',    desc: 'Your login details'      },
  { id: 1, label: 'Restaurant', desc: 'About your restaurant'   },
  { id: 2, label: 'Review',     desc: 'Confirm & submit'        },
];

const DEFAULT_FORM = {
  name: '', email: '', password: '',
  restaurantName: '', description: '', cuisine: '', address: '', phone: '',
};

/* ─── Left panel perks ──────────────────────────────────────── */
const PERKS = [
  { icon: <FiZap size={15} />,        title: 'Go live fast',        body: 'Start accepting orders within 48 hours of approval.' },
  { icon: <FiTrendingUp size={15} />, title: 'Grow your revenue',   body: 'Reach new customers in your city every day.' },
  { icon: <FiShield size={15} />,     title: 'Secure payments',     body: 'Reliable payment processing with automatic reconciliation.' },
];

/* ─── Field component ───────────────────────────────────────── */
const Field = ({ label, name, type = 'text', placeholder, icon, required, rows, form, fieldErrors, onChange, autoFocusField }) => {
  const [showPwd, setShowPwd] = useState(false);
  const err = fieldErrors[name];
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type;

  const baseClass = [
    'w-full px-4 py-3 pl-10 rounded-xl border bg-white text-xs font-medium text-zinc-800 placeholder-zinc-400',
    'outline-none transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    err
      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
      : 'border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10',
  ].join(' ');

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center transition-colors duration-250 focus-within:text-emerald-500">
          {icon}
        </span>
        {rows ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            autoFocus={name === autoFocusField}
            className={`${baseClass} resize-none pt-3 pl-10`}
          />
        ) : (
          <input
            name={name}
            type={inputType}
            value={form[name]}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={name === autoFocusField}
            autoComplete={isPassword ? 'new-password' : 'off'}
            className={`${baseClass} ${isPassword ? 'pr-10' : ''}`}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
        )}
      </div>
      {err && (
        <p className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium mt-1 animate-pulse">
          <FiAlertCircle size={12} className="flex-shrink-0" /> {err}
        </p>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   VENDOR REGISTER PAGE
════════════════════════════════════════════════════════════ */
const BecomePartnerPage = () => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setFieldErrors(f => ({ ...f, [name]: '' }));
    setError('');
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.name.trim())  errs.name     = 'Full name is required';
      if (!form.email.trim()) errs.email    = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
      if (!form.password)                errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    }
    if (s === 1) {
      if (!form.restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
      if (!form.address.trim())        errs.address        = 'Address is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${url}/api/admin/vendor/register`, {
        name:                  form.name,
        email:                 form.email,
        password:              form.password,
        restaurantName:        form.restaurantName,
        restaurantDescription: form.description,
        cuisine:               form.cuisine,
        address:               form.address,
        phone:                 form.phone,
      });
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setError(res.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Restaurant registrations are currently closed by the admin.');
      } else {
        setError('Connection failed. Please check your internet connection.');
      }
    }
    setLoading(false);
  };

  const fp = { form, fieldErrors, onChange: handleChange };
  const autoFocusField = step === 0 ? 'name' : step === 1 ? 'restaurantName' : undefined;

  /* ── Step content ── */
  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-4">
        <Field {...fp} autoFocusField={autoFocusField} label="Full Name"      name="name"     placeholder="John Doe"              icon={<FiUser size={13} />}  required />
        <Field {...fp} autoFocusField={autoFocusField} label="Email Address"  name="email"    type="email" placeholder="you@restaurant.com" icon={<FiMail size={13} />}  required />
        <Field {...fp} autoFocusField={autoFocusField} label="Password"       name="password" type="password" placeholder="Minimum 8 characters" icon={<FiLock size={13} />}  required />
      </div>
    );

    if (step === 1) return (
      <div className="space-y-4">
        <Field {...fp} autoFocusField={autoFocusField} label="Restaurant Name" name="restaurantName" placeholder="e.g. The Green Garden"    icon={<FiGrid size={13} />}  required />
        <Field {...fp} autoFocusField={autoFocusField} label="Description"     name="description"   placeholder="What makes your restaurant special…" icon={<FiStar size={13} />}  rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Field {...fp} autoFocusField={autoFocusField} label="Cuisine Type"  name="cuisine" placeholder="e.g. Italian, Indian"  icon={<FiStar size={13} />}  />
          <Field {...fp} autoFocusField={autoFocusField} label="Phone Number"  name="phone"   placeholder="Contact number"        icon={<FiPhone size={13} />} />
        </div>
        <Field {...fp} autoFocusField={autoFocusField} label="Restaurant Address" name="address" placeholder="Full address including city" icon={<FiMapPin size={13} />} required />
      </div>
    );

    if (step === 2) return (
      <div className="rounded-xl border border-zinc-200 overflow-hidden text-xs">
        {[
          { label: 'Full Name',       value: form.name },
          { label: 'Email',           value: form.email },
          { label: 'Restaurant',      value: form.restaurantName },
          { label: 'Description',     value: form.description || '—' },
          { label: 'Cuisine',         value: form.cuisine || '—' },
          { label: 'Phone',           value: form.phone   || '—' },
          { label: 'Address',         value: form.address },
        ].map((row, i) => (
          <div key={row.label} className={`flex items-start gap-4 px-4 py-3 border-b border-zinc-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/60'}`}>
            <span className="font-bold text-zinc-400 uppercase tracking-widest w-24 flex-shrink-0 pt-px">{row.label}</span>
            <span className="font-semibold text-zinc-800 flex-1 break-words">{row.value}</span>
          </div>
        ))}
      </div>
    );
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center max-w-md bg-white rounded-2xl border border-zinc-200 shadow-sm p-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100"
          >
            <FiCheckCircle size={30} className="text-emerald-500" />
          </motion.div>
          <h1 className="font-poppins font-extrabold text-xl text-zinc-900 mb-2">Application Submitted</h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">
            We have received your registration for{' '}
            <span className="font-bold text-zinc-700">{form.restaurantName}</span>.
            Our team will review it and reach out to{' '}
            <span className="font-bold text-zinc-700">{form.email}</span>{' '}
            within 1–2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 bg-zinc-950 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/restaurants"
              className="px-6 py-2.5 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-sm hover:bg-zinc-50 transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main two-panel layout ── */
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">

      {/* ══ LEFT — Dark Brand Panel ══════════════════════════════ */}
      <div className="hidden md:flex md:w-[42%] bg-zinc-950 relative overflow-hidden flex-col justify-between p-12">

        {/* Glow orbs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-500/8 rounded-full filter blur-[70px] pointer-events-none" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <BrandLogo size={14} />
          </div>
          <div>
            <span className="text-sm font-mono font-bold uppercase tracking-widest text-white">{BRAND.NAME}</span>
            <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              PARTNER
            </span>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Start selling online<br />
              <span className="text-emerald-400">with {BRAND.NAME}.</span>
            </h2>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed mt-4 max-w-xs">
              Fill in your restaurant details and submit your application. Our team reviews every application to maintain quality.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-px">
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5 leading-snug">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom telemetry */}
        <div className="relative z-10 flex items-center gap-2 text-zinc-600 text-[10px] font-mono">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>Partner Applications: Open</span>
        </div>
      </div>

      {/* ══ RIGHT — Form Panel ═══════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-[#fafafa] overflow-y-auto">
        <div className="mx-auto w-full max-w-md">

          {/* Back link */}
          <button
            onClick={() => navigate('/become-a-partner')}
            className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-widest transition-colors mb-8 focus-visible:outline-none"
          >
            <FiArrowLeft size={13} /> Back to Partner Page
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_2px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

            <div className="p-7 sm:p-9">

              {/* Header */}
              <div className="mb-7">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900">
                  {step === 0 && 'Create your account'}
                  {step === 1 && 'Your restaurant details'}
                  {step === 2 && 'Review your application'}
                </h1>
                <p className="text-xs text-zinc-400 font-semibold mt-1">
                  {step === 0 && 'These credentials will be used to log into your vendor dashboard.'}
                  {step === 1 && `Help customers discover your restaurant on ${BRAND.NAME}.`}
                  {step === 2 && 'Please review all details carefully before submitting.'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8 select-none">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        i < step
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : i === step
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10 ring-4 ring-emerald-500/15'
                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200/40'
                      }`}>
                        {i < step ? <FiCheckCircle size={14} /> : i + 1}
                      </div>
                      <div className="hidden sm:flex flex-col text-left">
                        <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                          i === step ? 'text-emerald-700' : i < step ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium leading-normal mt-0.5">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < step ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} noValidate>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Review notice */}
                {step === 2 && (
                  <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                      Your application will be reviewed by the {BRAND.NAME} team. You will receive a reply at <strong>{form.email}</strong> within 1–2 business days.
                    </p>
                  </div>
                )}

                {/* Global error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold"
                  >
                    <FiAlertCircle size={15} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-7 pt-6 border-t border-zinc-100">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all focus-visible:outline-none"
                    >
                      <FiChevronLeft size={14} /> Back
                    </button>
                  ) : (
                    <Link
                      to="/become-a-partner"
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      <FiArrowLeft size={13} /> Cancel
                    </Link>
                  )}

                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                    >
                      Continue <FiChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                            className="inline-block"
                          >
                            <FiLoader size={13} />
                          </motion.span>
                          Submitting…
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={13} />
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-zinc-400 font-semibold mt-6">
            Already have a vendor account?{' '}
            <a
              href={`${import.meta.env.VITE_VENDOR_APP || "http://localhost:5174"}/partner/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-bold hover:underline"
            >
              Sign in to Vendor Portal
            </a>
          </p>

        </div>
      </div>

    </div>
  );
};

export default BecomePartnerPage;
