import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import validator from "validator";
import crypto from "crypto";
import { 
  sendVerificationEmail, 
  sendForgotPasswordEmail, 
  sendPasswordChangedEmail, 
  sendWelcomeEmail,
  sendContactFormEmails
} from "../services/emailService.js";
import { createNotification } from "../helpers/notificationHelper.js";

// ─── Token helper ────────────────────────────────────────────
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

// ─── Login ───────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({ success: false, message: "Please enter all fields" });
    }

    // Auto-detect if user entered email or phone number
    let query = {};
    if (validator.isEmail(email)) {
      query = { email: email.toLowerCase() };
    } else {
      query = { phone: email };
    }

    const user = await userModel.findOne(query);
    if (!user) return res.json({ success: false, message: "User doesn't exist" })

    // Enforce email verification for new accounts
    if (user.emailVerified === false && user.verificationToken) {
      return res.json({ 
        success: false, 
        message: "Your email is not verified yet. Please check your inbox or resend the verification link.",
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" })

    const token = createToken(user._id)
    res.json({ success: true, token })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// ─── Register ────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
  try {
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.json({ success: false, message: "Please fill in all mandatory fields" });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }

    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" })
    
    // Password validation (min 8 chars, at least 1 letter and 1 number)
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" })
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.json({ success: false, message: "Password must contain both letters and numbers" });
    }

    const exists = await userModel.findOne({ email: email.toLowerCase() })
    if (exists) return res.json({ success: false, message: "User already exists" })

    const phoneExists = await userModel.findOne({ phone });
    if (phoneExists) return res.json({ success: false, message: "Phone number is already registered" });

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = new userModel({ 
      name: `${firstName} ${lastName}`, 
      firstName,
      lastName,
      email: email.toLowerCase(), 
      phone,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry
    })
    const user = await newUser.save()

    // Send email verification
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (err) {
      console.error("Verification email failed to send on registration:", err);
    }

    res.json({ 
      success: true, 
      message: "Registration successful! A verification link has been sent to your email address.",
      requiresVerification: true,
      email: user.email
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// ─── Get Profile ─────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password -cartData')
    if (!user) return res.json({ success: false, message: "User not found" })
    res.json({ success: true, data: user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching profile" })
  }
}

// ─── Update Profile ──────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const updates = {}
    if (name && name.trim()) updates.name = name.trim()
    if (phone !== undefined) updates.phone = phone

    const user = await userModel.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password -cartData')
    res.json({ success: true, data: user, message: "Profile updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating profile" })
  }
}

// ─── Change Password ─────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await userModel.findById(req.userId)
    if (!user) return res.json({ success: false, message: "User not found" })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.json({ success: false, message: "Current password is incorrect" })

    if (newPassword.length < 8) return res.json({ success: false, message: "New password must be at least 8 characters" })
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return res.json({ success: false, message: "New password must contain both letters and numbers" });
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error changing password" })
  }
}

// ─── Verify Email ─────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) return res.json({ success: false, message: "Verification token is required" });

    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired verification link" });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      console.error("Welcome email failed to send:", err);
    }

    res.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error verifying email" });
  }
};

// ─── Resend Verification Link ──────────────────────────────────
const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.json({ success: false, message: "Email address is required" });

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });

    if (user.emailVerified) {
      return res.json({ success: false, message: "This account has already been verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ success: true, message: "A new verification link has been sent to your email!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error resending verification link" });
  }
};

// ─── Forgot Password ───────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.json({ success: false, message: "Email is required" });

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // In production, we don't disclose if email exists for security, but returning success is typical
      return res.json({ success: true, message: "If that email is registered, we have sent a reset password link" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendForgotPasswordEmail(user.email, user.name, resetToken, "customer");

    res.json({ success: true, message: "If that email is registered, we have sent a reset password link" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error sending reset email" });
  }
};

// ─── Reset Password ────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  try {
    if (!token || !password || !confirmPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.json({ success: false, message: "Password must contain both letters and numbers" });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired password reset link" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (err) {
      console.error("Password change confirmation email failed to send:", err);
    }

    res.json({ success: true, message: "Your password has been reset successfully!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error resetting password" });
  }
};

// ─── Get Addresses ───────────────────────────────────────────
const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('addresses');
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, data: user.addresses || [] });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Add Address ─────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, zip, country } = req.body;
    const user = await userModel.findById(req.userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    
    user.addresses.push({ label, street, city, state, zip, country });
    await user.save();
    
    res.json({ success: true, message: "Address added", data: user.addresses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Delete Address ──────────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    
    const addressId = req.params.addressId;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();
    
    res.json({ success: true, message: "Address deleted", data: user.addresses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Contact Form ─────────────────────────────────────────────
const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    if (!name || !email || !subject || !message) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // 1. Create a platform notification for Platform Admins (role: superadmin)
    await createNotification({
      userId: null, // broadcast to all superadmins
      title: `Support: ${subject}`,
      message: `Support message from ${name} (${email}): ${message.slice(0, 60)}${message.length > 60 ? '...' : ''}`,
      type: "platform",
      link: "/settings", 
      role: "superadmin"
    });

    // 2. Dispatch transactional emails (Customer auto-reply & Admin alert)
    await sendContactFormEmails(name, email, subject, message);

    res.json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.json({ success: false, message: "Error submitting contact form" });
  }
};

export { 
  loginUser, 
  registerUser, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getAddresses, 
  addAddress, 
  deleteAddress,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  submitContactForm
}
