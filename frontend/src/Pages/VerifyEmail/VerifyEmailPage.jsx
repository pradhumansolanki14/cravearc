import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight, FiInfo } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Card, Button, Container } from '../../components/ui';
import useToast from '../../hooks/useToast';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const toast = useToast();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');
  const [resending, setResending] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await axios.post(`${url}/api/user/verify-email`, { token });
      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        toast.success('Your email is now verified!');
      } else {
        setStatus('error');
        setMessage(res.data.message || 'Verification failed.');
        toast.error(res.data.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired.');
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailForResend) {
      toast.error('Please enter your email address.');
      return;
    }
    setResending(true);
    try {
      const res = await axios.post(`${url}/api/user/resend-verification`, { email: emailForResend });
      if (res.data.success) {
        toast.success('Verification link sent! Check your inbox.');
        setEmailForResend('');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12">
      <Container className="max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white text-center">
            {status === 'verifying' && (
              <div className="py-8 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"
                >
                  <FiLoader size={32} />
                </motion.div>
                <h1 className="font-poppins font-extrabold text-xl text-slate-800 tracking-tight">Verifying Email</h1>
                <p className="text-slate-500 text-sm font-semibold">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <FiCheckCircle size={36} />
                </div>
                <div>
                  <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Email Verified!</h1>
                  <p className="text-slate-450 text-xs font-semibold mt-1">Thank you. Your CraveArc account is active.</p>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed px-2">
                  You can now log in to your account from the Home page and start ordering your favourite foods.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  variant="primary"
                  size="lg"
                  rightIcon={<FiArrowRight />}
                  className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                >
                  Go to Home
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                  <FiXCircle size={36} />
                </div>
                <div>
                  <h1 className="font-poppins font-extrabold text-xl text-slate-900 tracking-tight">Verification Failed</h1>
                  <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mt-1">{message}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                  <h3 className="font-poppins font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiInfo size={14} className="text-emerald-500" />
                    <span>Resend verification email</span>
                  </h3>
                  <p className="text-slate-450 text-[11px] font-semibold mb-3">
                    Enter the email address you registered with, and we will send you a new secure link.
                  </p>
                  <form onSubmit={handleResend} className="space-y-2.5">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={emailForResend}
                      onChange={(e) => setEmailForResend(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                    />
                    <Button
                      type="submit"
                      disabled={resending}
                      variant="secondary"
                      size="sm"
                      className="w-full font-bold rounded-xl border border-emerald-250 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50"
                    >
                      {resending ? 'Sending link...' : 'Resend Verification Link'}
                    </Button>
                  </form>
                </div>

                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="md"
                  className="w-full font-bold rounded-xl"
                >
                  Return to Home
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default VerifyEmailPage;
