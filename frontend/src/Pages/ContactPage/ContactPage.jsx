import React, { useState } from 'react'
import { BRAND } from '../../constants/brand'

const faqs = [
  { q: "How long does delivery take?", a: "Most orders arrive within 25–45 minutes depending on your location and restaurant prep time. You can track your order live in the app." },
  { q: "Can I change my order after placing it?", a: "Orders can be modified within 2 minutes of placement. After that, contact our support team immediately and we'll do our best to help." },
  { q: "What if my food arrives cold or incorrect?", a: "We have a 100% satisfaction guarantee. Contact us through the app or email within 2 hours and we'll make it right — refund or replacement." },
  { q: "How do I apply a promo code?", a: "Add items to your cart, then enter your promo code in the cart page before proceeding to checkout." },
  { q: "Do you deliver to my area?", a: "We currently serve most urban areas. Enter your address in the app to see if delivery is available in your location." },
]

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"

  return (
    <div className="bg-white min-h-screen pt-4" id="contact">
      {/* Hero */}
      <div className="bg-slate-950 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Contact Us</span>
          </div>
          <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">We&apos;re here to help</h1>
          <p className="text-slate-450 text-sm font-semibold max-w-md mx-auto leading-relaxed">Got a question, complaint, or just want to say hi? We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Contact Info */}
          <div>
            <h2 className="font-poppins text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Get in touch</h2>
            <div className="space-y-5 mb-10">
              {[
                { icon: "📞", title: "Phone", value: "+1-212-456-7898", sub: "Mon–Fri, 9am–6pm EST" },
                { icon: "📧", title: "Email", value: BRAND.SUPPORT_EMAIL, sub: "We reply within 24 hours" },
                { icon: "📍", title: "Head Office", value: "123 Food Street, New York, NY 10001", sub: "United States" },
                { icon: "💬", title: "Live Chat", value: "Available in the app", sub: "24/7 support" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-200">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">{c.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{c.title}</p>
                    <p className="font-bold text-slate-800 text-sm">{c.value}</p>
                    <p className="text-xs text-slate-450 mt-0.5 font-semibold">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <h3 className="font-poppins font-bold text-slate-900 mb-4">Follow us</h3>
            <div className="flex gap-3">
              {[
                { name: "Twitter", icon: "𝕏", color: "hover:bg-slate-950 hover:text-white" },
                { name: "Instagram", icon: "📷", color: "hover:bg-pink-500 hover:text-white hover:border-pink-500" },
                { name: "Facebook", icon: "f", color: "hover:bg-blue-600 hover:text-white hover:border-blue-600" },
              ].map((s, i) => (
                <a key={i} href="#" className={`w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-600 transition-all duration-200 ${s.color}`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-poppins text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Send a message</h2>

            {sent && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fadeUp">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-emerald-700">Message sent! We&apos;ll get back to you shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="your@email.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject *</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required className={inputCls}>
                  <option value="">Select a subject</option>
                  <option>Order Issue</option>
                  <option>Payment Problem</option>
                  <option>Delivery Complaint</option>
                  <option>Account Help</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} placeholder="Describe your issue or question..." className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-emerald-sm hover:shadow-emerald transition-all duration-200 text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">FAQ</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-slate-50 animate-fadeUp">
                    <p className="text-sm text-slate-450 leading-relaxed font-semibold pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
