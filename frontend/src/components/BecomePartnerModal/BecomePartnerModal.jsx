import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiX, FiUser, FiMail, FiLock, FiMapPin, FiPhone,
  FiCheckCircle, FiAlertCircle, FiChevronRight, FiLoader,
  FiStar, FiGrid
} from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';

const STEPS = ['Account', 'Restaurant', 'Review'];

const DEFAULT_FORM = {
  name: '', email: '', password: '',
  restaurantName: '', description: '', cuisine: '', address: '', phone: '',
};

const BecomePartnerModal = ({ isOpen, onClose }) => {
  const { url } = useContext(StoreContext);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const firstInputRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setForm(DEFAULT_FORM);
      setError('');
      setFieldErrors({});
      setSubmitted(false);
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Trap focus / close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handle = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [e.target.name]: '' }));
    setError('');
  };

  /* ── Validate each step ─────────────────────────────────────── */
  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.name.trim())             errs.name     = 'Full name is required';
      if (!form.email.trim())            errs.email    = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
      if (!form.password)                errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Must be at least 8 characters';
    }
    if (step === 1) {
      if (!form.restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
      if (!form.address.trim())        errs.address        = 'Address is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
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
        setError('Restaurant registrations are currently closed. Please check back later.');
      } else {
        setError('Connection failed. Please make sure you are connected and try again.');
      }
    }
    setLoading(false);
  };

  /* ── Field component ─────────────────────────────────────────── */
  const Field = ({ label, name, type = 'text', placeholder, icon, required, rows }) => {
    const err = fieldErrors[name];
    const baseClass = `w-full px-4 ${rows ? 'py-3' : 'py-3'} pl-10 rounded-xl border-2 bg-slate-50/80 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 ${
      err
        ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
        : 'border-slate-200 focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
    }`;

    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
          {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </span>
          {rows ? (
            <textarea
              name={name}
              value={form[name]}
              onChange={handle}
              placeholder={placeholder}
              rows={rows}
              className={`${baseClass} resize-none`}
              style={{ paddingTop: '12px' }}
            />
          ) : (
            <input
              ref={name === 'name' && step === 0 ? firstInputRef : undefined}
              name={name}
              type={type}
              value={form[name]}
              onChange={handle}
              placeholder={placeholder}
              required={required}
              className={baseClass}
              autoComplete={type === 'password' ? 'new-password' : 'off'}
            />
          )}
        </div>
        {err && (
          <p className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
            <FiAlertCircle size={11} /> {err}
          </p>
        )}
      </div>
    );
  };

  /* ── Step content ────────────────────────────────────────────── */
  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-4">
        <Field label="Full Name" name="name" placeholder="John Doe" icon={<FiUser size={14} />} required />
        <Field label="Email Address" name="email" type="email" placeholder="you@restaurant.com" icon={<FiMail size={14} />} required />
        <Field label="Password" name="password" type="password" placeholder="Min 8 characters" icon={<FiLock size={14} />} required />
      </div>
    );

    if (step === 1) return (
      <div className="space-y-4">
        <Field label="Restaurant Name" name="restaurantName" placeholder="e.g. The Green Garden" icon={<FiGrid size={14} />} required />
        <Field label="Description" name="description" placeholder="Brief description of your restaurant…" icon={<FiStar size={14} />} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cuisine" name="cuisine" placeholder="e.g. Italian" icon={<FiStar size={14} />} />
          <Field label="Phone" name="phone" placeholder="Contact number" icon={<FiPhone size={14} />} />
        </div>
        <Field label="Address" name="address" placeholder="Full restaurant address" icon={<FiMapPin size={14} />} required />
      </div>
    );

    if (step === 2) return (
      <div className="space-y-3">
        {/* Review summary */}
        {[
          { label: 'Your Name', value: form.name },
          { label: 'Email', value: form.email },
          { label: 'Restaurant', value: form.restaurantName },
          { label: 'Cuisine', value: form.cuisine || '—' },
          { label: 'Phone', value: form.phone || '—' },
          { label: 'Address', value: form.address },
        ].map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-28 flex-shrink-0">{row.label}</span>
            <span className="text-sm font-semibold text-slate-800 text-right truncate">{row.value}</span>
          </div>
        ))}

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 leading-relaxed">
            Your registration will be reviewed by the Tomato team. You will receive an email once your restaurant has been approved. This typically takes 1-2 business days.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-semibold">
            <FiAlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Become a Restaurant Partner"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 flex-shrink-0" />

          {/* Success state */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center"
              >
                <FiCheckCircle size={40} className="text-emerald-600" />
              </motion.div>
              <div>
                <h2 className="font-poppins font-extrabold text-2xl text-slate-900 mb-2">Application Submitted!</h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                  Your restaurant registration has been submitted. Our team will review your application and reach out to <span className="font-semibold text-slate-700">{form.email}</span> within 1-2 business days.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-emerald-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-5 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <FiStar size={13} className="text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Become a Partner</span>
                  </div>
                  <h2 className="font-poppins font-extrabold text-xl text-slate-900 leading-tight">
                    List your restaurant
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">
                    Reach thousands of hungry customers daily.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 px-7 pb-5 flex-shrink-0">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                        i < step
                          ? 'bg-emerald-500 text-white'
                          : i === step
                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 ring-offset-2'
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {i < step ? <FiCheckCircle size={14} /> : i + 1}
                      </div>
                      <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-emerald-700' : i < step ? 'text-slate-500' : 'text-slate-300'}`}>
                        {s}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Scrollable form area */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <div className="px-7 pb-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderStep()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer actions */}
                  <div className="sticky bottom-0 bg-white border-t border-slate-100 px-7 py-5 flex items-center justify-between gap-3 mt-4">
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-emerald-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                      >
                        Continue
                        <FiChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-emerald-sm transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                      >
                        {loading ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                              className="inline-block"
                            >
                              <FiLoader size={15} />
                            </motion.span>
                            Submitting…
                          </>
                        ) : (
                          <>Submit Application</>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BecomePartnerModal;
