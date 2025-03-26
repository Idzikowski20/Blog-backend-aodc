require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./models/Blog");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

// 🛡️ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" })); // Wymusza odczyt JSON
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Obsługuje formularze

// 🌩️ Konfiguracja Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🗂️ Konfiguracja Multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 2000, height: 2000, crop: "limit" }  // Zmieniamy rozdzielczość na 2000x2000
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ✅ ROUTE testowy — Render sprawdza ten endpoint!
app.get("/", (req, res) => {
  res.send("✅ Serwer działa! Sprawdź dostępne endpointy.");
});

// 📝 Tworzenie posta
app.post("/api/blogs", upload.none(), async (req, res) => {
  try {
    console.log("📥 OTRZYMANY REQUEST BODY:", req.body); // Logowanie całego body
    const { title, titleEng, content, contentEng, tags } = req.body;

    if (!title || !titleEng || !content || !contentEng) {
      console.error("❌ Brak tytułu lub treści!");
      return res.status(400).json({ message: "❌ Brak tytułu lub treści" });
    }

    const parsedTags = tags ? JSON.parse(tags) : [];
    const imageUrl = req.file ? req.file.path : null;

    const blog = new Blog({
      title,
      titleEng,
      content,
      contentEng,
      image: imageUrl,
      tags: parsedTags,
    });

    const savedBlog = await blog.save();
    console.log("✅ POST ZAPISANY W MONGO:", savedBlog);

    res.status(201).json(savedBlog);
  } catch (err) {
    console.error("❌ BŁĄD BACKENDU:", err);
    res.status(500).json({ message: "❌ Błąd serwera" });
  }
});

// 📄 Pobieranie wszystkich postów
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("❌ Błąd pobierania postów:", err);
    res.status(500).json({ message: "❌ Błąd serwera przy pobieraniu postów" });
  }
});

// Pobieranie posta po tytule
app.get("/api/blogs/title/:title", async (req, res) => {
  try {
    // Zamieniamy myślniki z powrotem na spacje
    const decodedTitle = decodeURIComponent(req.params.title.replace(/-/g, ' '));
    const blog = await Blog.findOne({ title: decodedTitle });

    if (!blog) return res.status(404).json({ message: "❌ Post nie znaleziony" });

    res.json(blog);
  } catch (err) {
    console.error("❌ Błąd pobierania posta:", err);
    res.status(500).json({ message: "❌ Błąd serwera" });
  }
});




// ✏️ Aktualizacja posta
app.put("/api/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, titleEng , content, contentEng, tags } = req.body;
    if (!title || !titleEng || !content || !contentEng) {
      return res.status(400).json({ message: "❌ Brak tytułu, treści PL lub EN" });
    }

    const parsedTags = tags ? JSON.parse(tags) : [];
    const updatedData = { title, titleEng, content, contentEng, tags: parsedTags };
    if (req.file) {
      console.log("Plik obrazu:", req.file);
      updatedData.image = req.file.path;
    }

    const updatedPost = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedPost) return res.status(404).json({ message: "❌ Post nie znaleziony" });
    res.json(updatedPost);
  } catch (err) {
    console.error("❌ Błąd aktualizacji posta:", err);
    res.status(500).json({ message: "❌ Błąd serwera przy aktualizacji posta" });
  }
});

// 🗑️ Usuwanie posta
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "❌ Post nie znaleziony" });
    res.json({ message: "✅ Post usunięty" });
  } catch (err) {
    console.error("❌ Błąd usuwania posta:", err);
    res.status(500).json({ message: "❌ Błąd serwera przy usuwaniu posta" });
  }
});

const uri = 'mongodb+srv://aodc:aodc@aodc.cq1hn.mongodb.net/?retryWrites=true&w=majority&appName=AODC';

// 🚀 Połączenie z MongoDB (usunięcie przestarzałych opcji)
mongoose.connect(uri)
  .then(() => {
    console.log("✅ Połączono z MongoDB");
  })
  .catch((err) => {
    console.error("❌ Błąd połączenia z MongoDB:", err);
  });

module.exports = app;
