import React, { useState, useRef, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiUser, FiMail, FiLock, FiMapPin, FiPhone,
  FiCheckCircle, FiAlertCircle, FiChevronRight, FiChevronLeft,
  FiStar, FiGrid, FiArrowLeft, FiLoader, FiZap, FiTrendingUp, FiShield
} from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { BRAND } from '../../constants/brand';

/* ────────────────────────────────────────────────────────────
   Constants
──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: 'Account',    desc: 'Your personal details'   },
  { id: 1, label: 'Restaurant', desc: 'About your restaurant'   },
  { id: 2, label: 'Review',     desc: 'Confirm & submit'         },
];

const DEFAULT_FORM = {
  name: '', email: '', password: '',
  restaurantName: '', description: '', cuisine: '', address: '', phone: '',
};

const PERKS = [
  { icon: <FiZap size={20} />,         title: 'Go Live Fast',         body: 'Start accepting orders within 48 hours of approval.' },
  { icon: <FiTrendingUp size={20} />,  title: 'Grow Your Revenue',    body: 'Reach thousands of new customers in your city every day.' },
  { icon: <FiShield size={20} />,      title: 'Secure Payments',      body: 'Get paid reliably with our trusted payment gateway.' },
];

/* ────────────────────────────────────────────────────────────
   Field — top-level so React never remounts it on re-render
──────────────────────────────────────────────────────────── */
const Field = ({ label, name, type = 'text', placeholder, icon, required, rows, form, fieldErrors, onChange, autoFocusField }) => {
  const err = fieldErrors[name];
  const baseClass = [
    'w-full px-4 py-3.5 pl-11 rounded-2xl border-2 bg-white',
    'text-sm font-medium text-slate-900 placeholder-slate-400',
    'outline-none transition-all duration-200',
    err
      ? 'border-rose-300 focus:border-rose-400'
      : 'border-slate-200 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]',
  ].join(' ');

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
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
            className={`${baseClass} resize-none pt-3.5`}
          />
        ) : (
          <input
            name={name}
            type={type}
            value={form[name]}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={name === autoFocusField}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
            className={baseClass}
          />
        )}
      </div>
      {err && (
        <p className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-1">
          <FiAlertCircle size={12} /> {err}
        </p>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   BecomePartnerPage
════════════════════════════════════════════════════════════ */
const BecomePartnerPage = () => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((f) => ({ ...f, [name]: '' }));
    setError('');
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.name.trim())  errs.name     = 'Full name is required';
      if (!form.email.trim()) errs.email    = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
      if (!form.password)                errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    }
    if (s === 1) {
      if (!form.restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
      if (!form.address.trim())        errs.address        = 'Restaurant address is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => s + 1); };
  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${url}/api/admin/vendor/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        restaurantName: form.restaurantName,
        restaurantDescription: form.description,
        cuisine: form.cuisine,
        address: form.address,
        phone: form.phone,
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
        setError('Connection failed. Please check your internet connection and try again.');
      }
    }
    setLoading(false);
  };

  const fieldProps = { form, fieldErrors, onChange: handleChange };
  const autoFocusField = step === 0 ? 'name' : step === 1 ? 'restaurantName' : undefined;

  /* ── Render step content ── */
  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-5">
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Full Name" name="name" placeholder="John Doe" icon={<FiUser size={15} />} required />
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Email Address" name="email" type="email" placeholder="you@restaurant.com" icon={<FiMail size={15} />} required />
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Password" name="password" type="password" placeholder="Minimum 8 characters" icon={<FiLock size={15} />} required />
      </div>
    );

    if (step === 1) return (
      <div className="space-y-5">
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Restaurant Name" name="restaurantName" placeholder="e.g. The Green Garden" icon={<FiGrid size={15} />} required />
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Description" name="description" placeholder="What makes your restaurant special…" icon={<FiStar size={15} />} rows={4} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field {...fieldProps} autoFocusField={autoFocusField} label="Cuisine Type" name="cuisine" placeholder="e.g. Italian, Indian…" icon={<FiStar size={15} />} />
          <Field {...fieldProps} autoFocusField={autoFocusField} label="Phone Number" name="phone" placeholder="Contact number" icon={<FiPhone size={15} />} />
        </div>
        <Field {...fieldProps} autoFocusField={autoFocusField} label="Restaurant Address" name="address" placeholder="Full address including city" icon={<FiMapPin size={15} />} required />
      </div>
    );

    if (step === 2) return (
      <div className="space-y-0 rounded-2xl border border-slate-200 overflow-hidden">
        {[
          { label: 'Full Name',        value: form.name },
          { label: 'Email Address',    value: form.email },
          { label: 'Restaurant Name',  value: form.restaurantName },
          { label: 'Description',      value: form.description || '—' },
          { label: 'Cuisine',          value: form.cuisine || '—' },
          { label: 'Phone',            value: form.phone   || '—' },
          { label: 'Address',          value: form.address },
        ].map((row, i) => (
          <div key={row.label} className={`flex items-start gap-4 px-5 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} border-b border-slate-100 last:border-0`}>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest w-32 flex-shrink-0 pt-0.5">{row.label}</span>
            <span className="text-sm font-semibold text-slate-800 flex-1">{row.value}</span>
          </div>
        ))}
      </div>
    );
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50"
          >
            <FiCheckCircle size={48} className="text-emerald-500" />
          </motion.div>
          <h1 className="font-poppins font-extrabold text-3xl text-slate-900 mb-3">
            Application Submitted!
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            We've received your registration for{' '}
            <span className="font-bold text-slate-700">{form.restaurantName}</span>.
            Our team will review it and reach out to{' '}
            <span className="font-bold text-slate-700">{form.email}</span>{' '}
            within 1–2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Back to Home
            </Link>
            <Link
              to="/restaurants"
              className="px-8 py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Browse Restaurants
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main page ── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero strip ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 flex flex-col lg:flex-row items-center gap-10">

          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              <FiStar size={13} className="text-amber-300" />
              Partner with {BRAND.NAME}
            </div>
            <h1 className="font-poppins font-extrabold text-4xl sm:text-5xl leading-tight mb-4">
              Grow Your Restaurant<br />
              <span className="text-emerald-200">With {BRAND.NAME}.</span>
            </h1>
            <p className="text-emerald-100 font-medium text-lg leading-relaxed max-w-lg mb-8">
              Join hundreds of restaurants already on our platform. Reach new customers, accept orders online, and grow your revenue — all from one dashboard.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {PERKS.map((p) => (
                <div key={p.title} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-4 border border-white/10">
                  <span className="text-emerald-200 flex-shrink-0 mt-0.5">{p.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-white mb-0.5">{p.title}</p>
                    <p className="text-emerald-100 text-xs leading-snug font-medium">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right decoration (hidden on mobile) */}
          <div className="hidden lg:flex flex-col items-center gap-4 flex-shrink-0">
            <div className="w-64 h-64 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                <FiGrid size={36} className="text-white" />
              </div>
              <p className="font-poppins font-extrabold text-2xl text-white">500+</p>
              <p className="text-emerald-200 text-sm font-semibold">Partner Restaurants</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Form section ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8 focus-visible:outline-none"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

          <div className="p-6 sm:p-10">

            {/* ── Step indicator ── */}
            <div className="flex items-center gap-3 mb-10">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${
                      i < step
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                        : i === step
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 ring-offset-2'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i < step ? <FiCheckCircle size={17} /> : i + 1}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-bold leading-tight ${i === step ? 'text-slate-900' : i < step ? 'text-slate-500' : 'text-slate-300'}`}>
                        {s.label}
                      </p>
                      <p className={`text-xs font-medium ${i === step ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── Step title ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mb-8"
              >
                <h2 className="font-poppins font-extrabold text-2xl text-slate-900 mb-1">
                  {step === 0 && 'Create your account'}
                  {step === 1 && "Tell us about your restaurant"}
                  {step === 2 && 'Review your application'}
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  {step === 0 && 'These credentials will be used to log into your vendor dashboard.'}
                  {step === 1 && 'Help customers discover your restaurant on the Tomato platform.'}
                  {step === 2 && 'Please review all details carefully before submitting.'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ── Form fields ── */}
            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Review step notice */}
              {step === 2 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-sm font-semibold text-amber-700 leading-relaxed">
                    📋 Your application will be reviewed by the Tomato team. You'll receive an email at <strong>{form.email}</strong> within 1–2 business days.
                  </p>
                </div>
              )}

              {/* Global error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold"
                >
                  <FiAlertCircle size={17} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <FiChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <FiArrowLeft size={15} /> Cancel
                  </Link>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-lg shadow-emerald-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  >
                    Continue <FiChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2.5 px-9 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                          className="inline-block"
                        >
                          <FiLoader size={16} />
                        </motion.span>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={16} />
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
        <p className="text-center text-xs text-slate-400 font-medium mt-8">
          Already have a vendor account?{' '}
          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">
            Sign in to the Vendor Portal →
          </a>
        </p>

      </div>
    </div>
  );
};

export default BecomePartnerPage;
