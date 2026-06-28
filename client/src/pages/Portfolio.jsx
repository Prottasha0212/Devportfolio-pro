import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Portfolio() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/portfolio/${username}`);
        setData(response.data);
      } catch (error) {
        console.error('Portfolio not found:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!data) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Portfolio not found</div>;

  const { bio, selectedRepos, socialLinks, theme } = data;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{username}</h1>
          <p className="text-gray-400">{bio || 'Developer'}</p>
          <div className="flex justify-center gap-4 mt-4">
            {socialLinks?.github && <a href={socialLinks.github} target="_blank" className="text-blue-400 hover:underline">GitHub</a>}
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedRepos?.map((repo) => (
            <div key={repo.id} className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="text-xl font-bold">{repo.name}</h3>
              <p className="text-sm mt-2">{repo.aiSummary || repo.description || 'No description'}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span>⭐ {repo.stars}</span>
                <span>🔀 {repo.forks}</span>
                <span className="text-blue-400">{repo.language}</span>
              </div>
              <a href={repo.html_url} target="_blank" className="text-blue-400 hover:underline text-sm mt-2 inline-block">View on GitHub →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}