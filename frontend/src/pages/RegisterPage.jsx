import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-champagne p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-honeyGarlic">
        <h2 className="text-3xl font-bold text-burntCoffee mb-6 text-center">Join Souq</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'}
                onChange={(e) => setFormData({...formData, role: e.target.value})} />
              <span>Buyer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="role" value="seller" checked={formData.role === 'seller'}
                onChange={(e) => setFormData({...formData, role: e.target.value})} />
              <span>Seller</span>
            </label>
          </div>

          <button type="submit" className="w-full bg-honeyGarlic text-white p-3 rounded-lg font-bold">Register</button>
        </form>
      </div>
    </motion.div>
  );
};

export default RegisterPage;