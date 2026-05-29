import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BuyerDashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <div className="bg-honeyGarlic p-6 rounded-2xl text-white mb-8">
        <h1 className="text-3xl font-bold">Hello, {user.name}!</h1>
        <p>Track your orders and manage your account.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Account Stats</h2>
          <p className="text-2xl font-bold text-burntCoffee">{orders.length} Total Orders</p>
          <Link to="/orders" className="text-honeyGarlic underline mt-2 block">View History</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="p-2 bg-champagne rounded text-center font-bold">Browse Products</Link>
            <Link to="/channels" className="p-2 bg-champagne rounded text-center font-bold">Visit Channels</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;