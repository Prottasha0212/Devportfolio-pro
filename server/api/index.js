const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// Service Account JSON (Environment Variable থেকে)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// GitHub API Route
app.get('/api/github/repos', async (req, res) => {
  const { accessToken } = req.query;
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token required' });
  }
  try {
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    const repos = await response.json();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// AI Summary Route
app.post('/api/ai/summary', async (req, res) => {
  const { repoName, description, language } = req.body;
  try {
    const prompt = `Write a 2-sentence professional summary for: ${repoName}`;
    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Portfolio Save Route
app.post('/api/portfolio/save', async (req, res) => {
  const { username, bio, theme, selectedRepos, socialLinks, uid } = req.body;
  try {
    await db.collection('portfolios').doc(username).set({
      uid, username, bio, theme, socialLinks, selectedRepos,
      published: true, updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

// Portfolio Get Route
app.get('/api/portfolio/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const doc = await db.collection('portfolios').doc(username).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Vercel Serverless Function Export
module.exports = app;