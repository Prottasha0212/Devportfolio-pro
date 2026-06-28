import { auth, githubProvider, signInWithPopup } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-2xl text-center">
        <h1 className="text-4xl font-bold text-white mb-4">DevPortfolio Pro</h1>
        <p className="text-gray-400 mb-8">Build your AI-powered portfolio</p>
        <button onClick={handleLogin} className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg">
          <FaGithub size={24} /> Login with GitHub
        </button>
      </div>
    </div>
  );
}