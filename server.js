const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// MongoDB холболт
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB-тэй амжилттай холбогдлоо'))
  .catch(err => console.error('MongoDB холболтод алдаа гарлаа:', err));

// Нэмэлт Mongoose холболтын logging
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Алдаа гарвал процессыг зогсоох
    process.exit(1);
  }
};

// Issue Model
const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Issue = mongoose.model('Issue', issueSchema);

// API маршрутууд
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Серверийг эхлүүлэх
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Database холболтыг дуудах
connectDB();