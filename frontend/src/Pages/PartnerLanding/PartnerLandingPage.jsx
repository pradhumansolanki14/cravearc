import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowRight, FiUsers, FiTrendingUp, FiShield, FiBarChart2,
  FiCheckCircle, FiStar, FiPackage, FiList, FiClock,
  FiHelpCircle, FiChevronDown, FiChevronUp, FiZap,
  FiDollarSign, FiSettings, FiHeadphones, FiAward
} from 'react-icons/fi'
import { BRAND } from '../../constants/brand'

/* ─── Animation helpers ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}

/* ─── Feature cards data ────────────────────────────────────── */
const FEATURES = [
  {
    icon: <FiUsers size={22} />,
    title: 'Reach More Customers',
    body: 'List your restaurant on a platform where hungry customers actively discover and order from local restaurants daily.',
  },
  {
    icon: <FiTrendingUp size={22} />,
    title: 'Increase Online Orders',
    body: 'A seamless customer ordering experience drives higher order volumes and repeat visits to your restaurant profile.',
  },
  {
    icon: <FiSettings size={22} />,
    title: 'Simple Management',
    body: 'Manage your full menu, pricing, availability, and orders from a dedicated vendor dashboard built for speed.',
  },
  {
    icon: <FiShield size={22} />,
    title: 'Secure Payments',
    body: 'Every transaction is processed through a reliable payment system. Payouts are tracked and reconciled automatically.',
  },
  {
    icon: <FiBarChart2 size={22} />,
    title: 'Powerful Analytics',
    body: "Review your restaurant's order history, revenue trends, top-selling dishes, and customer insights in one place.",
  },
  {
    icon: <FiHeadphones size={22} />,
    title: 'Dedicated Support',
    body: 'Our partner support team is available to help you get onboarded, resolve issues, and grow your operation.',
  },
]

/* ─── How it works steps ────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <FiList size={20} />,
    title: 'Apply',
    body: 'Submit your restaurant details through our partner application form. It takes less than 5 minutes.',
  },
  {
    step: '02',
    icon: <FiClock size={20} />,
    title: 'Review',
    body: 'Our team reviews your application and verifies your restaurant information within a few business days.',
  },
  {
    step: '03',
    icon: <FiCheckCircle size={20} />,
    title: 'Approval',
    body: 'Once approved, you receive access credentials to your vendor dashboard and can begin setting up your menu.',
  },
  {
    step: '04',
    icon: <FiZap size={20} />,
    title: 'Start Selling',
    body: 'Go live and start receiving orders from customers in your area. Manage everything from your dashboard.',
  },
]

/* ─── Benefits list ─────────────────────────────────────────── */
const BENEFITS = [
  { icon: <FiZap size={16} />,        label: 'Low setup time',          detail: 'Get your restaurant listed quickly without complex technical setup.' },
  { icon: <FiSettings size={16} />,   label: 'Easy dashboard',          detail: 'An intuitive vendor dashboard to manage your daily operations.' },
  { icon: <FiPackage size={16} />,    label: 'Order management',        detail: 'Track incoming orders, update statuses, and manage your queue in real time.' },
  { icon: <FiList size={16} />,       label: 'Menu management',         detail: 'Add, edit, and organize your menu items with images and pricing.' },
  { icon: <FiStar size={16} />,       label: 'Customer reviews',        detail: 'Build credibility through authentic customer feedback on your dishes.' },
  { icon: <FiAward size={16} />,      label: 'Business growth',         detail: 'Expand your reach and grow your revenue through online ordering.' },
]

/* ─── FAQ data ──────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Who can apply to become a partner?',
    a: 'Any registered restaurant or food business can apply to list on ' + BRAND.NAME + '. We review all applications to ensure quality and a consistent experience for customers.',
  },
  {
    q: 'How long does the approval process take?',
    a: 'After submitting your application, our team typically reviews and responds within a few business days. You will be notified by email once a decision is made.',
  },
  {
    q: 'What information do I need to apply?',
    a: 'You will need your restaurant name, contact details, address, and a brief description of your cuisine. You can also add your menu items after approval.',
  },
  {
    q: 'Can I manage my menu after going live?',
    a: 'Yes. Your vendor dashboard gives you full control over your menu, including adding new dishes, updating prices, and marking items as available or unavailable.',
  },
  {
    q: 'How do I receive payments for orders?',
    a: 'All orders placed through the platform are tracked in your dashboard. Payment reconciliation details are available through your vendor account settings.',
  },
  {
    q: 'Is there support if I run into issues?',
    a: 'Yes. Our partner support team is available to assist you with onboarding, technical questions, and ongoing operational support.',
  },
]

/* ─── FAQ Accordion Item ────────────────────────────────────── */
const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      className="border border-slate-200 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-800 pr-4">{q}</span>
        <span className="flex-shrink-0 text-emerald-500">
          {open ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════
   PARTNER LANDING PAGE
════════════════════════════════════════════════════════════ */
const PartnerLandingPage = () => {
  const navigate = useNavigate()

  const goToApply = () => navigate('/vendor-register')

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[80px] translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-36 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <FiStar size={11} />
                Partner Program
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-poppins text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Grow your restaurant
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                with {BRAND.NAME}
              </span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              variants={fadeUp}
              className="max-w-xl mx-auto text-slate-400 text-lg leading-relaxed"
            >
              List your restaurant on {BRAND.NAME} and start reaching new customers in your area. Simple to join, easy to manage, built for growth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <button
                onClick={goToApply}
                className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-sm shadow-[0_8px_32px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_40px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Apply as Vendor
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={`${import.meta.env.VITE_VENDOR_APP || "http://localhost:5174"}/partner/login`}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 text-sm font-bold transition-all duration-200"
              >
                Partner Login
                <FiArrowRight size={16} />
              </a>
              <a
                href="#how-it-works"
                onClick={e => {
                  e.preventDefault()
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 hover:border-slate-600 text-sm font-semibold transition-all duration-200"
              >
                Learn More
                <FiChevronDown size={15} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY PARTNER ───────────────────────────────────────── */}
      <section className="py-24 bg-white" id="why-partner">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16 space-y-4"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Why Choose Us
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything your restaurant needs
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
              {BRAND.NAME} gives restaurant partners the tools to manage their online presence and grow their order volume.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group p-7 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-poppins font-bold text-slate-900 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-100" id="how-it-works">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16 space-y-4"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              The Process
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How it works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 max-w-md mx-auto text-base">
              Getting your restaurant onto {BRAND.NAME} is straightforward.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

            {HOW_IT_WORKS.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 relative z-10">
                  {s.icon}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{s.step}</span>
                <h3 className="font-poppins font-bold text-slate-900 text-base mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left: text */}
            <div className="space-y-6">
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Platform Capabilities
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Built for restaurant operators
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed">
                Every feature in the {BRAND.NAME} partner dashboard is designed around the day-to-day needs of restaurant operators.
              </motion.p>
              <motion.div variants={fadeUp}>
                <button
                  onClick={goToApply}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all duration-200"
                >
                  Apply as Vendor
                  <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Right: benefit list */}
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-start gap-3.5 p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-0.5">{b.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{b.detail}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-12 space-y-4"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <FiHelpCircle size={20} />
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently asked questions
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500">
              Common questions from restaurant owners looking to partner with {BRAND.NAME}.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="space-y-3"
          >
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
              Get Started Today
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Ready to grow with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                {BRAND.NAME}?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto mt-4">
              Join restaurant partners already using {BRAND.NAME} to manage their menus, receive orders, and grow their business online.
            </motion.p>

            <motion.div variants={fadeUp} className="pt-6">
              <button
                onClick={goToApply}
                className="group inline-flex items-center gap-2.5 px-10 py-4.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-base shadow-[0_8px_40px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_50px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Apply as Vendor
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default PartnerLandingPage
