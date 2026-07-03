import mongoose from "mongoose";
import bcrypt from "bcrypt";
import 'dotenv/config';
import adminModel from "../models/adminModel.js";

/**
 * Platform Admin Initialization Script
 * 
 * Creates the first Platform Admin (superadmin) account if one doesn't exist.
 * Safe to run multiple times (idempotent).
 * 
 * Environment Variables:
 * - MONGODB_URI: Required
 * - PLATFORM_ADMIN_EMAIL: Default "admin@tomato.com"
 * - PLATFORM_ADMIN_PASSWORD: Default "Admin@123456"
 * - PLATFORM_ADMIN_NAME: Default "Platform Administrator"
 * 
 * Usage:
 *   node scripts/initPlatformAdmin.js
 * 
 * To customize credentials, set env vars before running:
 *   PLATFORM_ADMIN_EMAIL=myemail@example.com PLATFORM_ADMIN_PASSWORD=MySecurePass123 node scripts/initPlatformAdmin.js
 */

const DEFAULT_EMAIL = "admin@tomato.com";
const DEFAULT_PASSWORD = "Admin@123456";
const DEFAULT_NAME = "Platform Administrator";

async function initPlatformAdmin() {
  try {
    // Validate required env
    if (!process.env.MONGODB_URI) {
      console.error("[FATAL] MONGODB_URI environment variable is required");
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Check if any superadmin already exists
    const existingSuperAdmin = await adminModel.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("✓ Platform Admin already exists:");
      console.log(`  Email: ${existingSuperAdmin.email}`);
      console.log(`  Name: ${existingSuperAdmin.name}`);
      console.log(`  Created: ${existingSuperAdmin.createdAt}`);
      console.log("\nNo action taken. Script is idempotent.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Read credentials from env or use defaults
    const email = process.env.PLATFORM_ADMIN_EMAIL || DEFAULT_EMAIL;
    const password = process.env.PLATFORM_ADMIN_PASSWORD || DEFAULT_PASSWORD;
    const name = process.env.PLATFORM_ADMIN_NAME || DEFAULT_NAME;

    // Validate password strength
    if (password.length < 8) {
      console.error("[ERROR] Password must be at least 8 characters long");
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password using the same mechanism as registerSuperAdmin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Platform Admin
    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      isApproved: true,
      restaurantId: null,
      phone: "",
    });

    console.log("\n✓ Platform Admin created successfully!");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  ID: ${admin._id}`);
    console.log("\n⚠️  IMPORTANT: Save these credentials securely!");
    console.log(`  Login Email: ${email}`);
    console.log(`  Login Password: ${password}`);
    console.log("\n  You can now log in to the Admin dashboard with these credentials.");

    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n[ERROR] Failed to initialize Platform Admin:");
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

initPlatformAdmin();
