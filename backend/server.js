import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";
import favoriteRouter from "./routes/favoriteRoute.js";
import couponRouter from "./routes/couponRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import settingsRouter from "./routes/settingsRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import cuisineRouter from "./routes/cuisineRoute.js";
import bannerRouter from "./routes/bannerRoute.js";
import fs from "fs";

// Validate required environment variables before anything else
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "STRIPE_SECRET_KEY", "ADMIN_SECRET_KEY"];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Maintenance mode middleware stub — will be fully wired to settingsModel in task 8
const maintenanceModeMiddleware = async (req, res, next) => {
  next();
};

connectDB();

app.use("/api/food",     foodRouter);
app.use("/images",       express.static("uploads"));
app.use("/api/user",     userRouter);
app.use("/api/cart",     cartRouter);
app.use("/api/order",    orderRouter);
app.use("/api/admin",    adminRouter);
app.use("/api/favorites",favoriteRouter);
app.use("/api/coupons",  couponRouter);
app.use("/api/reviews",  reviewRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cuisines", cuisineRouter);
app.use("/api/banners", bannerRouter);

app.get("/", (req, res) => res.send("API Working"));
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
