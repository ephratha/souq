import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'seller') navigate('/seller-dashboard');
      else navigate('/buyer-dashboard');
      window.location.reload(); // Refresh to update context
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-champagne p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-honeyGarlic">
        <h2 className="text-3xl font-bold text-burntCoffee mb-6 text-center">Welcome Back to Souq</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-honeyGarlic outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-honeyGarlic outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full bg-honeyGarlic text-white p-3 rounded-lg font-bold hover:bg-whiskeySour transition">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-burntCoffee">
          Don't have an account? <Link to="/register" className="text-honeyGarlic font-bold underline">Register</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;