import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

/**
 * Initializes and caches the Razorpay instance.
 * Reads keys dynamically from .env to support test and live modes.
 * 
 * @returns {Razorpay}
 */
export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.warn("WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.");
    }

    razorpayInstance = new Razorpay({
      key_id: key_id || "",
      key_secret: key_secret || ""
    });
  }
  return razorpayInstance;
};
