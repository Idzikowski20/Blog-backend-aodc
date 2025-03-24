const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    contentEng: { type: String, required: false }, // 📌 UPEWNIJ SIĘ, ŻE ISTNIEJE
    image: { type: String },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
