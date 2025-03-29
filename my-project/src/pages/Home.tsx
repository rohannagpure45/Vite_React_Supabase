import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to My App</h1>
      <p className="mt-4 text-gray-600">This is a test page to verify rendering.</p>
      <button 
        onClick={() => navigate('/login')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign In
      </button>
    </div>
  );
}