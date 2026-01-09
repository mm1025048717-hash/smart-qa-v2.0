import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/auth.store';
import api from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const { data } = await api.post(url, payload);

      if (data.token) {
        login(data, data.token);
        window.location.hash = '#/workbench';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-bfl-surface">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-bfl-border"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-bfl-text">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-bfl-text-dim mt-2">
            {isLogin ? 'Login to continue to Innofusion' : 'Get started with your free account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <InputField label="Name" type="text" value={name} onChange={setName} required />
          )}
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-bfl-primary text-white font-semibold rounded-lg shadow-md hover:bg-bfl-primary-600 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </motion.button>
        </form>

        <p className="text-center text-sm text-bfl-text-dim mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-bfl-primary hover:underline ml-1">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

const InputField = ({ label, type, value, onChange, required }) => (
  <div>
    <label className="block text-sm font-medium text-bfl-text">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 block w-full px-3 py-2 bg-white border border-bfl-border rounded-md text-sm shadow-sm placeholder-gray-400
        focus:outline-none focus:ring-bfl-primary focus:border-bfl-primary"
    />
  </div>
);
