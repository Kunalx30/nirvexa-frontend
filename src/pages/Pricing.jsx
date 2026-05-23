// src/pages/Pricing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initiatePayment } from "../services/paymentService";
import { useUsage } from "../hooks/useUsage";

const PLANS = {
  monthly: {
    label: "Pro Monthly",
    price: 199,
    period: "/ month",
    badge: null,
    features: [
      "Unlimited AI career chat",
      "Resume Builder export and PDF downloads",
      "Unlimited ATS resume analysis",
      "Unlimited mock interview sessions",
      "Unlimited Skill Match and Career Roadmaps",
      "Unlimited Company Research and Salary Insights",
      "Premium job alerts",
      "Priority Support",
    ],
  },
  yearly: {
    label: "Pro Yearly",
    price: 1999,
    period: "/ year",
    badge: "Save 16%",
    features: [
      "Everything in Monthly",
      "₹166 / month effective",
      "Early access to new features",
      "Dedicated onboarding call",
    ],
  },
};

const FREE_LIMITS = [
  { feature: "AI Chat", limit: "7 messages / day" },
  { feature: "Resume ATS Analyzer", limit: "1 / day" },
  { feature: "Resume Builder PDF", limit: "Locked" },
  { feature: "Interview Sessions", limit: "3 / day" },
  { feature: "Career Roadmaps", limit: "3 / day" },
  { feature: "PDF Downloads", limit: "❌ Not available" },
  { feature: "Roadmap Search", limit: "3 / day" },
  { feature: "Skill Match", limit: "3 / day" },
  { feature: "Company Research", limit: "2 / day" },
  { feature: "Salary Insights", limit: "2 / day" },
  { feature: "Job Alerts", limit: "Locked" },
];

export default function Pricing() {
  const { user } = useAuth();
  const { isPremium, data } = useUsage();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    setLoading(true);

    initiatePayment({
      plan: selectedPlan,
      user: { name: user.name, email: user.email, contact: user.phone || "" },
      onSuccess: (res) => {
        setLoading(false);
        showToast("success", `🎉 You're now on Nirvexa Pro! Valid till ${new Date(res.expiry).toLocaleDateString("en-IN")}`);
        setTimeout(() => navigate("/"), 2500);
      },
      onFailure: (msg) => {
        setLoading(false);
        if (msg !== "Payment cancelled.") showToast("error", msg);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a]">
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-indigo-500/15 text-indigo-400 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            Simple Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Unlock your full potential
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            One plan. Every feature. No hidden costs.
            Pay securely via <span className="text-white font-medium">UPI, GPay, PhonePe, Cards</span> or Netbanking.
          </p>

          {isPremium && (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Pro Plan — expires {new Date(data?.premium_expiry).toLocaleDateString("en-IN")}
            </div>
          )}
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 flex gap-1">
            {["monthly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlan(p)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedPlan === p
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
                {p === "yearly" && (
                  <span className="ml-2 text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                    BEST
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Free</p>
              <div className="text-4xl font-bold">₹0</div>
              <p className="text-gray-500 text-sm mt-1">Forever, with daily limits</p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_LIMITS.map((item) => (
                <li key={item.feature} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.feature}</span>
                  <span className={item.limit.startsWith("❌") ? "text-red-400" : "text-gray-300 font-medium"}>
                    {item.limit}
                  </span>
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-3 rounded-xl bg-gray-800 text-gray-500 text-sm font-medium cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Card */}
          <div className="relative bg-gradient-to-b from-indigo-600/20 to-gray-900 border border-indigo-500/40 rounded-2xl p-7 shadow-xl shadow-indigo-900/20">
            {PLANS[selectedPlan].badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                {PLANS[selectedPlan].badge}
              </span>
            )}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-indigo-400 mb-1">Pro</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">₹{PLANS[selectedPlan].price.toLocaleString("en-IN")}</span>
                <span className="text-gray-400 text-sm pb-1">{PLANS[selectedPlan].period}</span>
              </div>
              {selectedPlan === "yearly" && (
                <p className="text-gray-400 text-sm mt-1">₹166 / month, billed annually</p>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {PLANS[selectedPlan].features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="text-indigo-400 text-base">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 flex-wrap mb-5">
              {["UPI", "GPay", "PhonePe", "Paytm", "Cards", "Netbanking"].map((m) => (
                <span key={m} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-md">
                  {m}
                </span>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || isPremium}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening checkout…
                </>
              ) : isPremium ? (
                "Already Pro ✓"
              ) : (
                `Get Pro ${selectedPlan === "yearly" ? "Yearly" : "Monthly"} →`
              )}
            </button>

            <p className="text-center text-xs text-gray-600 mt-3">
              Secured by Razorpay · 256-bit SSL
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-gray-800 pt-12 grid md:grid-cols-3 gap-8 text-sm text-gray-400">
          {[
            { q: "Is UPI payment safe?", a: "Yes — payments are processed by Razorpay, a PCI-DSS certified gateway. Your credentials never touch our servers." },
            { q: "Can I cancel anytime?", a: "Plans are one-time payments for the period chosen. No auto-renewal unless you re-subscribe." },
            { q: "What if my payment fails?", a: "No money is deducted on a failed payment. You can retry or use a different method." },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-white font-medium mb-1">{q}</p>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
