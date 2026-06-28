const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ← আপডেটেড

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
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// AI Summary Route (Gemini)
app.post('/api/ai/summary', async (req, res) => {
  const { repoName, description, language } = req.body;

  if (!repoName) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  try {
    console.log('Generating summary for:', repoName);
    
    const prompt = `Write a 2-sentence professional project summary for a developer portfolio.
Project Name: ${repoName}
Description: ${description || 'No description provided'}
Tech Stack: ${language || 'Not specified'}

The summary should be concise, professional, and highlight the project's purpose and key technologies.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    console.log('Summary generated successfully');
    res.json({ summary });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary', 
      details: error.message 
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});