const mongoose = require('mongoose');

const zeqPatternCategorySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    color: {
      type: String,
      default: '#ab68ff',
      maxlength: 20,
    },
    icon: {
      type: String,
      maxlength: 10,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  },
);

// Index for sorting
zeqPatternCategorySchema.index({ sortOrder: 1, label: 1 });

const ZeqPatternCategory = mongoose.model('ZeqPatternCategory', zeqPatternCategorySchema);

// Default categories to seed
const DEFAULT_CATEGORIES = [
  { value: 'fundamentals', label: 'Fundamentals', description: 'Core concepts and basics', icon: '📚', sortOrder: 1 },
  { value: 'operators', label: 'Operators', description: 'Mathematical operators', icon: '🔢', sortOrder: 2 },
  { value: 'applications', label: 'Applications', description: 'Real-world applications', icon: '🚀', sortOrder: 3 },
  { value: 'consciousness', label: 'Consciousness', description: 'Consciousness and awareness', icon: '🧠', sortOrder: 4 },
  { value: 'quantum', label: 'Quantum', description: 'Quantum mechanics', icon: '⚛️', sortOrder: 5 },
  { value: 'relativity', label: 'Relativity', description: 'Relativistic physics', icon: '🌌', sortOrder: 6 },
  { value: 'computation', label: 'Computation', description: 'Computational aspects', icon: '💻', sortOrder: 7 },
  { value: 'hulyas', label: 'HULYAS', description: 'HULYAS Mathematical Intelligence', icon: '🤖', sortOrder: 8 },
];

/**
 * Seed default categories if none exist
 * Also migrates hulya -> hulyas if needed
 */
async function seedDefaultCategories() {
  try {
    // Migration: Update hulya -> hulyas
    const hulyaCategory = await ZeqPatternCategory.findOne({ value: 'hulya' });
    if (hulyaCategory) {
      await ZeqPatternCategory.updateOne(
        { value: 'hulya' },
        { $set: { value: 'hulyas', label: 'HULYAS', description: 'HULYAS Mathematical Intelligence' } }
      );
      console.log('[seedDefaultCategories] Migrated hulya -> hulyas');
    }

    const count = await ZeqPatternCategory.countDocuments();
    if (count === 0) {
      await ZeqPatternCategory.insertMany(DEFAULT_CATEGORIES);
      console.log('[seedDefaultCategories] Seeded', DEFAULT_CATEGORIES.length, 'default categories');
    }
  } catch (error) {
    console.error('[seedDefaultCategories] Error:', error.message);
  }
}

/**
 * Get all active categories sorted by sortOrder
 */
async function getAllCategories() {
  return ZeqPatternCategory.find({ isActive: true }).sort({ sortOrder: 1, label: 1 });
}

/**
 * Get all categories (including inactive) for admin
 */
async function getAllCategoriesAdmin() {
  return ZeqPatternCategory.find().sort({ sortOrder: 1, label: 1 });
}

/**
 * Get category by ID
 */
async function getCategoryById(id) {
  return ZeqPatternCategory.findById(id);
}

/**
 * Get category by value
 */
async function getCategoryByValue(value) {
  return ZeqPatternCategory.findOne({ value: value.toLowerCase() });
}

/**
 * Create a new category
 */
async function createCategory(data) {
  const category = new ZeqPatternCategory({
    ...data,
    value: data.value.toLowerCase().replace(/\s+/g, '-'),
  });
  return category.save();
}

/**
 * Update a category
 */
async function updateCategory(id, data) {
  const updateData = { ...data };
  if (updateData.value) {
    updateData.value = updateData.value.toLowerCase().replace(/\s+/g, '-');
  }
  return ZeqPatternCategory.findByIdAndUpdate(id, updateData, { new: true });
}

/**
 * Delete a category
 */
async function deleteCategory(id) {
  return ZeqPatternCategory.findByIdAndDelete(id);
}

module.exports = {
  ZeqPatternCategory,
  seedDefaultCategories,
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  getCategoryByValue,
  createCategory,
  updateCategory,
  deleteCategory,
  DEFAULT_CATEGORIES,
};
