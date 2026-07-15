import resend from '../config/resend.js';
import { verifyEmailTemplate } from '../templates/verifyEmail.js';
import { forgotPasswordTemplate } from '../templates/forgotPassword.js';
import { passwordChangedTemplate } from '../templates/passwordChanged.js';
import { welcomeTemplate } from '../templates/welcome.js';
import { orderConfirmTemplate } from '../templates/orderConfirm.js';
import { orderCancelledTemplate } from '../templates/orderCancelled.js';
import { vendorReceivedTemplate, vendorAdminAlertTemplate } from '../templates/vendorReceived.js';
import { vendorApprovedTemplate } from '../templates/vendorApproved.js';
import { vendorRejectedTemplate } from '../templates/vendorRejected.js';
import { contactAutoReplyTemplate, contactAdminAlertTemplate } from '../templates/contactAutoReply.js';

const FROM_EMAIL = 'onboarding@resend.dev'; // Resend default test domain sender

/**
 * Sends a verification link to a newly registered user
 * @param {string} email 
 * @param {string} name 
 * @param {string} token 
 * @returns {Promise<any>}
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Verify your CraveArc Email',
      html: verifyEmailTemplate(name, verifyUrl),
    });
    return response;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

/**
 * Sends a password reset link to a user
 * @param {string} email 
 * @param {string} name 
 * @param {string} token 
 * @param {string} role - 'customer' or 'admin' / 'vendor'
 * @returns {Promise<any>}
 */
export const sendForgotPasswordEmail = async (email, name, token, role = 'customer') => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&role=${role}`;
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Reset your CraveArc Password',
      html: forgotPasswordTemplate(name, resetUrl),
    });
    return response;
  } catch (error) {
    console.error('Failed to send forgot password email:', error);
    throw error;
  }
};

/**
 * Sends a password reset confirmation to a user
 * @param {string} email 
 * @param {string} name 
 * @returns {Promise<any>}
 */
export const sendPasswordChangedEmail = async (email, name) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Your CraveArc Password has been updated',
      html: passwordChangedTemplate(name),
    });
    return response;
  } catch (error) {
    console.error('Failed to send password confirmation email:', error);
    throw error;
  }
};

/**
 * Sends a welcome email after successful email verification
 * @param {string} email 
 * @param {string} name 
 * @returns {Promise<any>}
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Welcome to CraveArc!',
      html: welcomeTemplate(name),
    });
    return response;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

/**
 * Sends order confirmation receipt to customer
 */
export const sendOrderConfirmationEmail = async (email, name, orderId, amount, items) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Order Confirmed - CraveArc',
      html: orderConfirmTemplate(name, orderId, amount, items),
    });
    return response;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

/**
 * Sends order cancelled alert
 */
export const sendOrderCancelledEmail = async (email, name, orderId) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Order Cancelled - CraveArc',
      html: orderCancelledTemplate(name, orderId),
    });
    return response;
  } catch (error) {
    console.error('Failed to send order cancellation email:', error);
  }
};

/**
 * Sends application received receipt to vendor and admin alert
 */
export const sendVendorReceivedEmail = async (email, name, restaurantName) => {
  try {
    // 1. Receipt to merchant applicant
    await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Partner Application Received - CraveArc',
      html: vendorReceivedTemplate(name, restaurantName),
    });
    
    // 2. Alert to Platform Admins (send to default test sender)
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@fooddelplatform.com';
    await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: 'Alert: New Vendor Registration - CraveArc',
      html: vendorAdminAlertTemplate(name, email, restaurantName),
    });
  } catch (error) {
    console.error('Failed to send vendor receipt/alert emails:', error);
  }
};

/**
 * Sends vendor approval activation notification
 */
export const sendVendorApprovedEmail = async (email, name, restaurantName) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Merchant Application Approved! - CraveArc',
      html: vendorApprovedTemplate(name, restaurantName),
    });
    return response;
  } catch (error) {
    console.error('Failed to send vendor approval email:', error);
  }
};

/**
 * Sends vendor rejection notice
 */
export const sendVendorRejectedEmail = async (email, name, restaurantName) => {
  try {
    const response = await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Merchant Application Status - CraveArc',
      html: vendorRejectedTemplate(name, restaurantName),
    });
    return response;
  } catch (error) {
    console.error('Failed to send vendor rejection email:', error);
  }
};

/**
 * Sends contact auto-reply to customer and inquiry alert to superadmin
 */
export const sendContactFormEmails = async (customerName, customerEmail, subject, message) => {
  try {
    // 1. Receipt to customer
    await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [customerEmail],
      subject: 'Support Ticket Received - CraveArc',
      html: contactAutoReplyTemplate(customerName),
    });

    // 2. Alert to platform admin
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@fooddelplatform.com';
    await resend.emails.send({
      from: `CraveArc <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `Support Inquiry: ${subject} - CraveArc`,
      html: contactAdminAlertTemplate(customerName, customerEmail, subject, message),
    });
  } catch (error) {
    console.error('Failed to send support form emails:', error);
  }
};
