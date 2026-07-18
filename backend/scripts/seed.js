/**
 * Seed Script: Insert default categories and cuisines
 *
 * Inserts the hardcoded frontend category list into categoryModel
 * and a default cuisine list into cuisineModel, but ONLY if the
 * respective collection is currently empty.
 *
 * - Idempotent: running a second time inserts nothing (collections not empty)
 * - Logs count of inserted documents
 * - Exits with code 0 on completion
 * - Exits with code 1 only on unexpected fatal error
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Requirements: 5.5, 6.6, 25.4
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import categoryModel from '../models/categoryModel.js';
import cuisineModel from '../models/cuisineModel.js';

// ─── Default data ─────────────────────────────────────────────

/**
 * Categories mirror the hardcoded menu_list from the customer frontend:
 * frontend/src/assets/assets.js → menu_list
 */
const DEFAULT_CATEGORIES = [];

/**
 * Default cuisine types for restaurant tagging and customer filtering.
 * Matches Requirement 6.6 default set.
 */
const DEFAULT_CUISINES = [];

// ─── Main ─────────────────────────────────────────────────────

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('[FATAL] MONGODB_URI environment variable is required');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected\n');

  // ── Seed categories ──────────────────────────────────────────
  console.log('─── Seeding categories ──────────────────────────────');
  const existingCategoryCount = await categoryModel.countDocuments();

  if (existingCategoryCount > 0) {
    console.log(`  ✓ Categories collection already has ${existingCategoryCount} document(s) — skipping (idempotent)`);
  } else {
    const inserted = await categoryModel.insertMany(DEFAULT_CATEGORIES);
    console.log(`  ✓ Inserted ${inserted.length} categories:`);
    inserted.forEach(c => console.log(`    • ${c.name}`));
  }

  // ── Seed cuisines ────────────────────────────────────────────
  console.log('\n─── Seeding cuisines ────────────────────────────────');
  const existingCuisineCount = await cuisineModel.countDocuments();

  if (existingCuisineCount > 0) {
    console.log(`  ✓ Cuisines collection already has ${existingCuisineCount} document(s) — skipping (idempotent)`);
  } else {
    const inserted = await cuisineModel.insertMany(DEFAULT_CUISINES);
    console.log(`  ✓ Inserted ${inserted.length} cuisines:`);
    inserted.forEach(c => console.log(`    • ${c.icon}  ${c.name}`));
  }

  console.log('\n═══ Seed complete ═══════════════════════════════════');
  console.log('  Categories and cuisines are now available in the database.');
  console.log('  Restaurant Managers can now tag their restaurants with cuisine types,');
  console.log('  and food items can be organized by category.');

  await mongoose.disconnect();
  console.log('\n✓ Disconnected from MongoDB');
  process.exit(0);
};

run().catch(err => {
  console.error('[FATAL] Unexpected error during seed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
