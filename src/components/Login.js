import { useState } from 'react';
import Image from 'next/image';
import logo from "../../public/logo.jpg"

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    const staticEmail = process.env.NEXT_PUBLIC_EMAIL;
    const staticPassword = process.env.NEXT_PUBLIC_PASSWORD;

    setTimeout(() => {
      setLoading(false);
      if (email === staticEmail && password === staticPassword) {
        setMessage('Login successful!');
        onLoginSuccess();
      } else {
        setMessage('Invalid email or password.');
      }
    }, 1000);
  };

  return (
    <div className="flex items-center mx-auto justify-center min-h-screen bg-green-100">
      <div className="w-full mx-auto max-w-md p-6 bg-white shadow-xl rounded-lg border border-gray-200 relative">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="Login Icon" width={50} height={50} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">WELCOME TO ALIEN</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Username:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'LOGIN'}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes('Invalid') ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
