import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Card, Button, Container } from '../../components/ui';
import useToast from '../../hooks/useToast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role') || 'customer'; // customer or vendor/admin role
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid password reset token.');
      navigate('/');
    }
  }, [token, navigate, toast]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      toast.error('Password must contain both letters and numbers.');
      return;
    }

    setLoading(true);
    const endpoint = role === 'customer' 
      ? '/api/user/reset-password' 
      : '/api/admin/reset-password';

    try {
      const res = await axios.post(`${url}${endpoint}`, {
        token,
        password,
        confirmPassword
      });

      if (res.data.success) {
        setSubmitted(true);
        toast.success('Password updated successfully!');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
                  <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Password Reset</h1>
                  <p className="text-slate-450 text-xs font-semibold mt-1">Updated successfully</p>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                  Your CraveArc account password has been updated. You can now use your new password to sign in.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/')}
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Create New Password</h1>
                  <p className="text-zinc-400 text-xs font-semibold mt-1">
                    Enter and confirm your new password below.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">New Password</label>
                    <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl px-3.5 py-3 transition-all focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-950/6">
                      <span className="text-zinc-400 mr-2.5 flex-shrink-0"><FiLock size={14} /></span>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="text-zinc-400 hover:text-zinc-700 transition-colors ml-2"
                      >
                        {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Confirm Password</label>
                    <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl px-3.5 py-3 transition-all focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-950/6">
                      <span className="text-zinc-400 mr-2.5 flex-shrink-0"><FiLock size={14} /></span>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-semibold text-zinc-800 placeholder-zinc-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="text-zinc-400 hover:text-zinc-700 transition-colors ml-2"
                      >
                        {showConfirmPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
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
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
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

export default ResetPasswordPage;
