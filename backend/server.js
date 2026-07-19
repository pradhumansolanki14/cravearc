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
import restaurantRouter from "./routes/restaurantRoute.js";
import searchRouter from "./routes/searchRoute.js";
import settingsModel from "./models/settingsModel.js";
import notificationRouter from "./routes/notificationRoute.js";
import announcementRouter from "./routes/announcementRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import financeRouter from "./routes/financeRoute.js";
import settlementRouter from "./routes/settlementRoute.js";
import refundRouter from "./routes/refundRoute.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { noSqlSanitize } from "./middlewares/sanitize.js";
import { autoValidateObjectIds } from "./middlewares/validateObjectId.js";

// Validate required environment variables before anything else
const REQUIRED_ENV = [
  "MONGODB_URI", "JWT_SECRET", "ADMIN_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"
];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 4000;

// Global security headers
app.use(helmet());

// CORS preflight policy configuration
app.use(cors());

// Global rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api", apiLimiter);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

// Global query sanitization & object id validation
app.use(noSqlSanitize);
app.use(autoValidateObjectIds);

// Maintenance mode middleware — blocks customer routes when enabled
const maintenanceModeMiddleware = async (req, res, next) => {
  try {
    // Always allow settings endpoint (so frontend can check maintenance status)
    if (req.path === "/api/settings" || req.method === "GET" && req.path.startsWith("/api/settings")) {
      return next();
    }
    
    // Always allow admin routes (admins need to access dashboard to disable maintenance mode)
    if (req.path.startsWith("/api/admin")) {
      return next();
    }
    
    // Check maintenance mode for customer-facing routes
    const settings = await settingsModel.findOne({});
    if (settings?.maintenanceMode === true) {
      return res.status(503).json({ 
        success: false, 
        message: "Platform is under maintenance" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Maintenance mode check error:", error);
    next(); // Fail open (allow request if check fails)
  }
};

// Apply maintenance mode check to all routes
app.use(maintenanceModeMiddleware);

app.use("/api/food",     foodRouter);
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
app.use("/api/admin/restaurant", restaurantRouter);
app.use("/api/search",   searchRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/finance", financeRouter);
app.use("/api/settlements", settlementRouter);
app.use("/api/refunds", refundRouter);

app.get("/", (req, res) => res.send("API Working"));

// Global unhandled exception handler to standardise errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "An internal server error occurred" : err.message
  });
});

try {
  await connectDB();
  
  // Mismatch auto-fix: update any old "Rolls" category foods to "Samosa"
  try {
    const foodModel = (await import("./models/foodModel.js")).default;
    const res = await foodModel.updateMany({ category: { $regex: /^rolls$/i } }, { category: "Samosa" });
    if (res.modifiedCount > 0) {
      console.log(`[DB Migration] Auto-updated ${res.modifiedCount} foods from category Rolls to Samosa`);
    }
  } catch (err) {
    console.error("Failed to run category auto-migration:", err);
  }

  // Currency auto-fix: update USD setting values to INR
  try {
    const settingsModel = (await import("./models/settingsModel.js")).default;
    await settingsModel.updateMany({ currency: "USD" }, { currency: "INR" });
  } catch (err) {
    console.error("Failed to run settings currency auto-migration:", err);
  }

    // Restaurant slugs auto-fix: generate slugs for any legacy restaurants
    try {
      const restaurantModel = (await import("./models/restaurantModel.js")).default;
      const { generateUniqueSlug } = await import("./models/restaurantModel.js");
      const restaurantsWithoutSlug = await restaurantModel.find({
        $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }]
      });
      for (const r of restaurantsWithoutSlug) {
        r.slug = await generateUniqueSlug(r.name, r._id);
        await r.save();
        console.log(`[DB Migration] Generated slug for restaurant "${r.name}": "${r.slug}"`);
      }
    } catch (err) {
      console.error("Failed to run restaurant slugs auto-migration:", err);
    }

    // Restaurant ratings & review counts auto-sync check on boot
    try {
      const restaurantModel = (await import("./models/restaurantModel.js")).default;
      const restaurantReviewModel = (await import("./models/restaurantReviewModel.js")).default;
      const allRestaurants = await restaurantModel.find({});
      for (const r of allRestaurants) {
        const reviews = await restaurantReviewModel.find({ restaurantId: r._id });
        const count = reviews.length;
        const avg = count ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / count) : 0;
        if (r.rating !== avg || r.totalReviews !== count) {
          r.rating = avg;
          r.totalReviews = count;
          await r.save();
          console.log(`[DB Migration] Synchronized ratings for "${r.name}": Rating=${avg.toFixed(1)}, Reviews=${count}`);
        }
      }
    } catch (err) {
      console.error("Failed to run ratings auto-synchronization:", err);
    }

    // Restaurant cuisines auto-sync check on boot
    try {
      const restaurantModel = (await import("./models/restaurantModel.js")).default;
      const cuisineModel = (await import("./models/cuisineModel.js")).default;
      const allRestaurants = await restaurantModel.find({});
      const allCuisines = await cuisineModel.find({ isActive: true });
      
      for (const r of allRestaurants) {
        if (!r.cuisine) continue;
        
        // Parse cuisines from the string (e.g. "Indian, Italian" -> ["indian", "italian"])
        const parts = r.cuisine.split(/[,\s·/&]+/i).map(x => x.trim().toLowerCase()).filter(Boolean);
        const matchedCuisineIds = [];
        
        for (const c of allCuisines) {
          const cNameLower = c.name.toLowerCase();
          if (parts.includes(cNameLower) || r.cuisine.toLowerCase().includes(cNameLower)) {
            matchedCuisineIds.push(c._id);
          }
        }
        
        // Check if we need to update
        const existingIdsStr = (r.cuisineIds || []).map(id => id.toString()).sort().join(",");
        const newIdsStr = matchedCuisineIds.map(id => id.toString()).sort().join(",");
        
        if (existingIdsStr !== newIdsStr) {
          r.cuisineIds = matchedCuisineIds;
          await r.save();
          console.log(`[DB Migration] Synchronized cuisineIds for "${r.name}": [${matchedCuisineIds.length} cuisines matched]`);
        }
      }
    } catch (err) {
      console.error("Failed to run cuisines auto-synchronization:", err);
    }

  app.listen(port, () => console.log(`Server started on port ${port}`));
} catch (error) {
  console.error("[FATAL] MongoDB connection failed:", error.message);
  process.exit(1);
}
