import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required: true},
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
},{minimize: false})

const userModel = mongoose.models.user || mongoose.model("users",userSchema);

export default userModel;