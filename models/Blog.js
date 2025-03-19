const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Zmieniamy content na Map z kluczami jako języki
    content: {
      type: Map,
      of: String, // Przechowujemy teksty jako ciągi znaków
      required: true
    },
    image: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
