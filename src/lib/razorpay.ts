/** Razorpay Checkout. Uses a test key when one is configured, otherwise a local test checkout. */

export interface RazorpayResult {
  paymentId: string;
}

interface CheckoutOptions {
  amount: number;
  description: string;
  name: string;
  email: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
}

interface RazorpayCheckout {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));
    document.body.appendChild(script);
  });
}

/** Opens Razorpay test checkout when VITE_RAZORPAY_KEY_ID is set. Returns null if the buyer closes it. */
export async function openRazorpayCheckout(options: CheckoutOptions): Promise<RazorpayResult | null> {
  const key = (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) || "rzp_test_SsI9IqT5Be0Iqp";
  if (!key) return null;
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout did not start.");
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key,
      amount: Math.round(options.amount * 100),
      currency: "INR",
      name: "AI Smartgate Estate OS",
      description: options.description,
      prefill: { name: options.name, email: options.email },
      theme: { color: "#0072f5" },
      handler: (response: RazorpayHandlerResponse) => resolve({ paymentId: response.razorpay_payment_id }),
      modal: { ondismiss: () => resolve(null) },
    });
    try {
      checkout.open();
    } catch (error) {
      reject(error);
    }
  });
}

/** True only when checkout should stay inside the app. A test key still opens Razorpay. */
export function razorpayTestMode(): boolean {
  return false;
}
