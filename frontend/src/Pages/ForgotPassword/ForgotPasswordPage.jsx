import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Card, Button, Container } from '../../components/ui';
import useToast from '../../hooks/useToast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('customer'); // customer, vendor/admin
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    const endpoint = userRole === 'customer' 
      ? '/api/user/forgot-password' 
      : '/api/admin/forgot-password';

    try {
      const res = await axios.post(`${url}${endpoint}`, { email });
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Password reset link sent!');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12">
      <Container className="max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
            {submitted ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <FiCheckCircle size={36} />
                </div>
                <div>
                  <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Check your inbox</h1>
                  <p className="text-slate-450 text-xs font-semibold mt-1">Reset link dispatched</p>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                  If that email is registered on CraveArc, we have sent a secure password reset link. Please check your inbox (and spam folder) to set up a new password.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/')}
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold hover:text-zinc-800 transition-colors uppercase tracking-widest outline-none mb-4"
                  >
                    <FiArrowLeft size={13} />
                    <span>Back to Home</span>
                  </button>
                  <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Recover Password</h1>
                  <p className="text-zinc-400 text-xs font-semibold mt-1">
                    Enter your email below to receive a secure reset link.
                  </p>
                </div>

                {/* Account Type Toggle */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 border border-zinc-200/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUserRole('customer')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      userRole === 'customer' 
                        ? 'bg-white border border-zinc-200/60 shadow-sm text-zinc-900' 
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    Customer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('vendor')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      userRole === 'vendor' 
                        ? 'bg-white border border-zinc-200/60 shadow-sm text-zinc-900' 
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    Partner / Admin
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Address</label>
                    <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl px-3.5 py-3 transition-all focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-950/6">
                      <span className="text-zinc-400 mr-2.5 flex-shrink-0"><FiMail size={14} /></span>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-zinc-sm h-12.5 rounded-2xl flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="inline-block"
                        >
                          <FiLoader size={14} />
                        </motion.span>
                        <span>Requesting Link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;
