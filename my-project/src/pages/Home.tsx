import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-100 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-emerald-600 mb-4">Welcome to Health Assistant</h1>
        <p className="text-gray-700 text-lg">
          Inspired by a personal ER visit and real biometric health insights, this app was built to help users make smarter, more informed decisions before rushing to a doctor — saving time, money, and healthcare resources.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="mt-6 px-5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
