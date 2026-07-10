import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true },
  image:         { type: String, required: true },
  category:      { type: String, required: true },
  restaurantId:  { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", required: true },
  isAvailable:      { type: Boolean, default: true },
  preparationTime:  { type: Number, default: 20 },   // minutes
  isVeg:            { type: Boolean, default: false },
  tags:             { type: [String], default: [] },
  calories:         { type: Number, default: null },
  discount:         { type: Number, default: 0 }, // Percentage discount e.g. 10 for 10%
}, { timestamps: true });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;
