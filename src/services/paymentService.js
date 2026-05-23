// src/services/paymentService.js
import api from "./api";

/**
 * Load Razorpay checkout script dynamically
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Initiate a Razorpay checkout for the given plan.
 * Handles UPI, Cards, Netbanking, Wallets automatically.
 *
 * @param {Object} opts
 * @param {"monthly"|"yearly"} opts.plan
 * @param {{ name: string, email: string, contact?: string }} opts.user
 * @param {Function} opts.onSuccess  - called with server verify response
 * @param {Function} opts.onFailure  - called with error message
 */
export async function initiatePayment({ plan, user, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure("Could not load payment SDK. Check your internet connection.");
    return;
  }

  let orderData;
  try {
    const res = await api.post("/payment/create-order", { plan });
    orderData = res.data;
  } catch (err) {
    onFailure(err?.response?.data?.error || "Failed to create order.");
    return;
  }

  const options = {
    key: orderData.key_id,
    amount: orderData.amount,
    currency: "INR",
    name: "Nirvexa Pro",
    description: plan === "yearly" ? "Pro Yearly Plan" : "Pro Monthly Plan",
    order_id: orderData.order_id,

    // ── UPI + all methods ──────────────────────────────────────
    method: {
      upi: true,        // GPay, PhonePe, Paytm, BHIM, etc.
      card: true,
      netbanking: true,
      wallet: true,
      emi: false,
    },

    // Pre-fill user info so UPI intent flow works smoothly
    prefill: {
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      method: "upi",          // open UPI tab first
    },

    config: {
      display: {
        blocks: {
          utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
          other: { name: "Other Methods", instruments: [{ method: "card" }, { method: "netbanking" }] },
        },
        sequence: ["block.utib", "block.other"],
        preferences: { show_default_blocks: false },
      },
    },

    theme: { color: "#6366f1" },   // match your brand

    handler: async function (response) {
      try {
        const verifyRes = await api.post("/payment/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        onSuccess(verifyRes.data);
      } catch (err) {
        onFailure(err?.response?.data?.error || "Payment verification failed.");
      }
    },

    modal: {
      ondismiss: () => onFailure("Payment cancelled."),
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", (response) => {
    onFailure(response.error?.description || "Payment failed.");
  });

  rzp.open();
}

/** Fetch current user's premium status */
export async function fetchPremiumStatus() {
  const res = await api.get("/payment/status");
  return res.data;
}

/** Fetch daily usage quota for all features */
export async function fetchUsageSummary() {
  const res = await api.get("/user/usage");
  return res.data;
}
