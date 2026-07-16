import { getRazorpayInstance } from "../config/razorpay.js";
import crypto from "crypto";

/**
 * Creates a Razorpay Order.
 * 
 * @param {number} amount - The order total amount in standard currency unit (INR)
 * @param {string} currency - The currency code (default: "INR")
 * @param {string} receipt - Unique identifier referencing database order ID
 * @returns {Promise<Object>} The Razorpay order document
 */
export const createOrder = async (amount, currency = "INR", receipt) => {
  const rzp = getRazorpayInstance();
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency,
    receipt: receipt.toString()
  };
  return await rzp.orders.create(options);
};

/**
 * Verifies Razorpay signature for client payment validation.
 * 
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay response signature
 * @returns {boolean} True if valid, false otherwise
 */
export const verifyPayment = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay secret key is missing in environment variables.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
};

/**
 * Initiates a refund for a captured Razorpay payment.
 * 
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} [amount] - Optional partial refund amount in standard currency
 * @returns {Promise<Object>} Razorpay refund response
 */
export const refundPayment = async (paymentId, amount) => {
  const rzp = getRazorpayInstance();
  const options = {};
  if (amount) {
    options.amount = Math.round(amount * 100); // convert to paise
  }
  return await rzp.payments.refund(paymentId, options);
};

/**
 * Fetches captured payment details from Razorpay logs.
 * 
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Razorpay payment record details
 */
export const getPayment = async (paymentId) => {
  const rzp = getRazorpayInstance();
  return await rzp.payments.fetch(paymentId);
};

/**
 * Validates Razorpay Webhook signatures using the raw payload body.
 * 
 * @param {string} rawBody - Raw body buffer/string received from express req
 * @param {string} signature - x-razorpay-signature header value
 * @param {string} secret - Webhook secret key
 * @returns {boolean} True if payload matches signature
 */
export const validateWebhookSignature = (rawBody, signature, secret) => {
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return generatedSignature === signature;
};
