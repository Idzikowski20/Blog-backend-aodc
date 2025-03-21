const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // Polska wersja
    contentEng: { type: String }, // Angielska wersja
    image: { type: String },
    tags: [String],
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Blog', blogSchema);
