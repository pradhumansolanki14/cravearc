import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
import validator from "validator"

// ─── Token helper ────────────────────────────────────────────
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

// ─── Login ───────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User doesn't exist" })

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
  const { name, password, email } = req.body;
  try {
    const exists = await userModel.findOne({ email })
    if (exists) return res.json({ success: false, message: "User already exists" })

    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email" })
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({ name, email, password: hashedPassword })
    const user = await newUser.save()
    const token = createToken(user._id)
    res.json({ success: true, token })
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

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error changing password" })
  }
}

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

export { loginUser, registerUser, getProfile, updateProfile, changePassword, getAddresses, addAddress, deleteAddress }
