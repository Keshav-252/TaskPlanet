const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const User = require("./model/user.js");
const Post = require("./model/post.js");
const authMiddleware = require("./middleware/authmiddleware.js");
const UserSchema = require("./types.js");

const PORT = process.env.PORT;
const UPLOADS_DIR = path.join(__dirname, "uploads");

const app = express();

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

app.post("/signup", async (req, res) => {
  const body = req.body;
  const response = UserSchema.safeParse(body);
  if (!response.success) return res.status(401).json({ msg: "Inputs are invalid" });
  const existingUser = await User.findOne({ email: body.email });
  if (existingUser) return res.status(409).json({ msg: "user already exists" });
  const existingUsername = await User.findOne({ username: body.username });
  if (existingUsername) return res.status(409).json({ msg: "username already exists" });
  //creating user in db
  const hashedPassword = await bcrypt.hash(body.password, 10);
  await User.create({
    email: body.email,
    username: body.username,
    password: hashedPassword
  });
  return res.status(201).json({ msg: "account created succesfully" });
  // user must be shown login button to go to /login page
})


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ msg: "Login successful", token, username: user.username, email: user.email });
  }
  catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Public feed (viewable without auth); interactions still require auth
app.get("/posts", async (req, res) => {  // Homepage
  try {
    // try decode viewer id if provided so we can indicate likedByMe
    let viewerId = null;
    const header = req.headers.authorization;
    if (header) {
      try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        viewerId = decoded.userId;
      } catch (err) {
        viewerId = null;
      }
    }

    const posts = await Post.find()
      .populate("author", "username")
      .populate("likes", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 })
      .lean();

    const shaped = posts.map((p) => ({
      _id: p._id,
      text: p.text,
      image: p.image,
      author: p.author?.username,
      likeCount: p.likes?.length || 0,
      likes: (p.likes || []).map((u) => u.username),
      likedByMe: viewerId ? (p.likes || []).some((u) => String(u._id) === String(viewerId)) : false,
      commentCount: p.comments?.length || 0,
      comments: (p.comments || []).map((c) => ({
        username: c.user?.username,
        text: c.text,
        createdAt: c.createdAt,
        _id: c._id
      })),
      createdAt: p.createdAt
    }));

    res.json(shaped);
  } catch (err) {
    console.error("Error in GET /posts:", err);
    res.status(500).json({ msg: "Failed to fetch posts", error: err.message });
  }
});

app.post("/posts", authMiddleware, upload.single("image"), async (req, res) => {
   try {
    if (!req.body.text  && !req.file ) {
      return res.status(400).json({ msg: "Post must contain text or image" });
    }
    const post = await Post.create({
      text: req.body.text,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      author: req.userId
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error_is: err.message });
  }
});
// Like / Unlike API
app.post("/posts/:id/like", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });
  const index = post.likes.indexOf(req.userId);
  if (index === -1) {
    post.likes.push(req.userId);   // Like
  }
  else {
    post.likes.splice(index, 1);   // Unlike
  }
  await post.save();
  res.json({ likes: post.likes.length });
});

//Add Comment API
app.post("/posts/:id/comment", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ msg: "Post not found" });
  if (!req.body.text) return res.status(400).json({ msg: "Comment text required" });
  post.comments.push({
    user: req.userId,
    text: req.body.text
  });
  await post.save();
  // populate comment user info before returning so client sees username
  await post.populate("comments.user", "username email");
  const shapedComments = (post.comments || []).map((c) => ({
    _id: c._id,
    username: c.user?.username,
    text: c.text,
    createdAt: c.createdAt,
  }));
  res.json(shapedComments);
});


mongoose.connect(MONGO_URI)
  .then(() => { console.log("db connected") })
  .catch((err) => { console.log("error in connecting to db", err) });

 
app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR HANDLER", err && err.stack ? err.stack : err);
  res.status(500).json({ error: err && err.message ? err.message : String(err) });
});

app.listen(PORT, () => { console.log("server started!") });
// fetch(`${import.meta.env.VITE_API_URL}/posts`)