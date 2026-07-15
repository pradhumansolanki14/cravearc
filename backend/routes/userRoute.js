import express from 'express'
import { 
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
} from "../controllers/userController.js"
import authMiddleware from "../middlewares/auth.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/profile", authMiddleware, getProfile)
userRouter.put("/profile", authMiddleware, updateProfile)
userRouter.post("/change-password", authMiddleware, changePassword)
userRouter.get("/addresses", authMiddleware, getAddresses)
userRouter.post("/addresses", authMiddleware, addAddress)
userRouter.delete("/addresses/:addressId", authMiddleware, deleteAddress)

// Production Authentication (P3-R2)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/resend-verification", resendVerification)
userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password", resetPassword)

// Production Notification & Contact (P3-R3)
userRouter.post("/contact", submitContactForm)

export default userRouter
