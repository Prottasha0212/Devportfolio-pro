import { useState } from 'react';
import { auth, signOut } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Vercel Backend URL
const BACKEND_URL = 'https://devportfolio-pro.vercel.app/api';

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('dark');
  const [selectedRepos, setSelectedRepos] = useState([]);

  const username = user?.displayName || user?.email?.split('@')[0] || 'developer';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const fetchRepos = async () => {
    if (!token) {
      alert('Please enter your GitHub Personal Access Token');
      return;
    }
    setLoading(true);
    try {
      // ✅ Vercel Backend URL ব্যবহার করো
      const response = await axios.get(`${BACKEND_URL}/github/repos?accessToken=${token}`);
      setRepos(response.data);
      setSelectedRepos(response.data.map(repo => repo.id));
    } catch (error) {
      console.error('Error fetching repos:', error);
      alert('Failed to fetch repositories. Check your token.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (repoId) => {
    setSelectedRepos(prev =>
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    );
  };

  const generateAISummary = async (repo) => {
    try {
      // ✅ Vercel Backend URL ব্যবহার করো
      const response = await axios.post(`${BACKEND_URL}/ai/summary`, {
        repoName: repo.name,
        description: repo.description,
        language: repo.language
      });
      setRepos(prev => prev.map(r =>
        r.id === repo.id ? { ...r, aiSummary: response.data.summary } : r
      ));
      alert('✅ AI Summary generated!');
    } catch (error) {
      console.error('AI Error:', error);
      alert('❌ Failed to generate summary.');
    }
  };

  const publishPortfolio = async () => {
    const selectedData = repos
      .filter(repo => selectedRepos.includes(repo.id))
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        html_url: repo.html_url,
        aiSummary: repo.aiSummary || 'Project summary coming soon...'
      }));

    try {
      // ✅ Vercel Backend URL ব্যবহার করো
      await axios.post(`${BACKEND_URL}/portfolio/save`, {
        username: username,
        uid: user.uid,
        bio,
        theme,
        selectedRepos: selectedData,
        socialLinks: { github: `https://github.com/${username}` }
      });
      alert(`🎉 Portfolio published!`);
      navigate(`/${username}`);
    } catch (error) {
      console.error('Publish error:', error);
      alert('❌ Failed to publish portfolio');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>
        <p className="text-gray-400">Welcome, <span className="text-white font-semibold">{username}</span>!</p>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <div className="flex flex-col gap-4">
            <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write a short bio..." className="bg-gray-700 text-white px-4 py-2 rounded-lg" />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="neon">Neon</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter your GitHub Personal Access Token" className="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1" />
            <button onClick={fetchRepos} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50">
              {loading ? 'Loading...' : 'Fetch Repos'}
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">Generate token at: GitHub → Settings → Developer settings → Personal access tokens</p>
        </div>

        {loading && <p className="text-gray-400">Loading repositories...</p>}

        {repos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {repos.map((repo) => (
                <div key={repo.id} className={`bg-gray-800 p-4 rounded-lg ${selectedRepos.includes(repo.id) ? 'border-2 border-green-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">{repo.name}</h3>
                    <input type="checkbox" checked={selectedRepos.includes(repo.id)} onChange={() => toggleRepo(repo.id)} className="w-5 h-5 mt-1" />
                  </div>
                  <p className="text-gray-400 text-sm">{repo.description || 'No description'}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🔀 {repo.forks_count}</span>
                    <span className="text-blue-400">{repo.language || 'N/A'}</span>
                  </div>
                  <button onClick={() => generateAISummary(repo)} className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm transition w-full">✨ Generate AI Summary</button>
                  {repo.aiSummary && <div className="mt-3 p-3 bg-gray-700 rounded-lg"><p className="text-sm text-green-400">🤖 {repo.aiSummary}</p></div>}
                </div>
              ))}
            </div>
            <button onClick={publishPortfolio} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full">🚀 Publish Portfolio</button>
          </>
        )}
      </div>
    </div>
  );
}