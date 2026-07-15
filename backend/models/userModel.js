import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required: true},
    firstName: {type:String, default: ""},
    lastName: {type:String, default: ""},
    email: {type:String, required: true, unique: true},
    password: {type:String, required:true},
    phone: {type:String, default: ""},
    cartData:{type:Object, default:{}},
    addresses: [{
        label:   { type: String, default: "" },
        street:  { type: String, default: "" },
        city:    { type: String, default: "" },
        state:   { type: String, default: "" },
        zip:     { type: String, default: "" },
        country: { type: String, default: "" },
    }],
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
},{minimize: false})

const userModel = mongoose.models.user || mongoose.model("users",userSchema);

export default userModel;