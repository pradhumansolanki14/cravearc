import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiTruck, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Button, Card } from '../../components/ui';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <Card 
        variant="default" 
        radius="3xl" 
        padding="none" 
        className="border border-slate-100 shadow-card flex flex-col items-center text-center max-w-md w-full animate-scaleIn overflow-hidden bg-white"
      >
        {/* Top green accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-450 to-emerald-600" />

        <div className="p-8 sm:p-10 flex flex-col items-center w-full">
          {/* Delightful Pulse Checkmark Icon */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
            <div className="relative w-full h-full rounded-full bg-emerald-50 border-4 border-emerald-400 flex items-center justify-center text-emerald-500 shadow-sm">
              <FiCheck size={38} strokeWidth={3} />
            </div>
          </div>

          <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest mb-3.5 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100/50">
            Order Dispatched Successfully
          </span>
          
          <h1 className="font-poppins font-black text-2xl text-slate-900 mb-3 tracking-tight">
            Your food is on the way!
          </h1>
          
          <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-8 max-w-xs">
            We&apos;ve received your payment and the restaurant kitchen is preparing your delicious meal. Estimated delivery is 20–30 minutes.
          </p>

          {/* Highlights overview container */}
          <div className="w-full bg-slate-50 border border-slate-100/60 rounded-3xl p-5 mb-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiCheck size={15} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-750 leading-none">Order Accepted</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Synced securely with kitchen systems</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiTruck size={15} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-755 leading-none">Express Courier Assigned</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Delivery agent is on route to collect items</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2.5 w-full">
            <Button 
              onClick={() => navigate('/myorders')} 
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-emerald-lg h-12 rounded-2xl flex items-center justify-center gap-2"
            >
              <span>Track Order</span>
              <FiArrowRight size={15} strokeWidth={2.5} />
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              size="lg"
              className="w-full font-bold h-12 text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-2xl"
            >
              <span>Explore More Dishes</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderSuccess;
