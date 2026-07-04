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
 * Required environment variables (no defaults — must be set explicitly):
 *   MONGODB_URI              MongoDB connection string
 *   PLATFORM_ADMIN_EMAIL     Email address for the Platform Admin account
 *   PLATFORM_ADMIN_PASSWORD  Password (minimum 8 characters)
 *
 * Optional:
 *   PLATFORM_ADMIN_NAME      Display name  (default: "Platform Administrator")
 *
 * Usage:
 *   node scripts/initPlatformAdmin.js
 *
 * Set variables in your .env file or export them before running:
 *   PLATFORM_ADMIN_EMAIL=admin@yourdomain.com \
 *   PLATFORM_ADMIN_PASSWORD=YourSecurePass123 \
 *   node scripts/initPlatformAdmin.js
 */

async function initPlatformAdmin() {
  try {
    // ── Validate required environment variables ──────────────
    const missing = [];
    if (!process.env.MONGODB_URI)           missing.push("MONGODB_URI");
    if (!process.env.PLATFORM_ADMIN_EMAIL)  missing.push("PLATFORM_ADMIN_EMAIL");
    if (!process.env.PLATFORM_ADMIN_PASSWORD) missing.push("PLATFORM_ADMIN_PASSWORD");

    if (missing.length > 0) {
      console.error("[FATAL] Missing required environment variables:");
      missing.forEach(v => console.error(`  - ${v}`));
      console.error("\nSet these variables in your .env file before running this script.");
      console.error("See .env.example for reference.");
      process.exit(1);
    }

    const email    = process.env.PLATFORM_ADMIN_EMAIL.trim();
    const password = process.env.PLATFORM_ADMIN_PASSWORD;
    const name     = (process.env.PLATFORM_ADMIN_NAME || "Platform Administrator").trim();

    // ── Validate password strength ───────────────────────────
    if (password.length < 8) {
      console.error("[ERROR] PLATFORM_ADMIN_PASSWORD must be at least 8 characters long");
      process.exit(1);
    }

    // ── Connect to MongoDB ───────────────────────────────────
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // ── Idempotency check ────────────────────────────────────
    const existingSuperAdmin = await adminModel.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("✓ Platform Admin already exists:");
      console.log(`  Email: ${existingSuperAdmin.email}`);
      console.log(`  Name:  ${existingSuperAdmin.name}`);
      console.log(`  Created: ${existingSuperAdmin.createdAt}`);
      console.log("\nNo action taken. Script is idempotent.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // ── Hash password ────────────────────────────────────────
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── Create Platform Admin ────────────────────────────────
    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      role:         "superadmin",
      isApproved:   true,
      restaurantId: null,
      phone:        "",
    });

    console.log("\n✓ Platform Admin created successfully!");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Role:  ${admin.role}`);
    console.log(`  ID:    ${admin._id}`);
    console.log("\n  You can now log in to the Admin dashboard with the credentials you provided.");

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
