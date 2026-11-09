const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let checkoutScript;

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (checkoutScript) return checkoutScript;

  checkoutScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay did not initialise.'));
    script.onerror = () => reject(new Error('Could not load Razorpay checkout. Check your connection and try again.'));
    document.head.appendChild(script);
  }).catch((error) => {
    checkoutScript = undefined;
    throw error;
  });

  return checkoutScript;
}

/**
 * Opens Razorpay using only the publishable key. Do not put a Razorpay secret
 * in Vite environment variables: create an order and verify its signature on
 * your server before recording a production booking.
 */
export async function payWithRazorpay({ amount, description, name = 'Kairos', orderId, prefill }) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const amountInPaise = Math.round(Number(amount) * 100);
  if (!key) throw new Error('Payments are not configured. Add VITE_RAZORPAY_KEY_ID to your environment.');
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) throw new Error('A valid payment amount is required.');

  const Razorpay = await loadRazorpayCheckout();
  return new Promise((resolve, reject) => {
    let completed = false;
    const checkout = new Razorpay({
      key,
      amount: amountInPaise,
      currency: 'INR',
      name,
      description,
      ...(orderId ? { order_id: orderId } : {}),
      prefill,
      handler: (response) => {
        completed = true;
        resolve(response);
      },
      modal: { ondismiss: () => { if (!completed) reject(new Error('Payment cancelled.')); } },
    });
    checkout.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed.')));
    checkout.open();
  });
}
