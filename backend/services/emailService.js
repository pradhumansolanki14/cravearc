import resend from '../config/resend.js';
import { verifyEmailTemplate } from '../templates/verifyEmail.js';
import { forgotPasswordTemplate } from '../templates/forgotPassword.js';
import { passwordChangedTemplate } from '../templates/passwordChanged.js';
import { welcomeTemplate } from '../templates/welcome.js';

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
