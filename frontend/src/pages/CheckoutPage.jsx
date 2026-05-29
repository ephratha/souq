import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderData = {
      products: cart.map(item => ({ productId: item._id, quantity: item.qty, priceAtPurchase: item.price })),
      totalAmount: total,
      shippingAddress: address,
      phoneNumber: phone
    };

    try {
      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('cart');
      alert('Order placed successfully! Pay on delivery.');
      navigate('/orders');
    } catch {
      alert('Order failed');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-burntCoffee">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block mb-1 font-bold">Phone Number</label>
          <input type="tel" required className="w-full p-3 border rounded-lg" 
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-bold">Delivery Address</label>
          <textarea required className="w-full p-3 border rounded-lg" rows="4"
            value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="bg-champagne p-4 rounded-lg">
          <p className="font-bold text-burntCoffee">Payment Method: Cash on Delivery</p>
        </div>
        <button type="submit" className="w-full bg-honeyGarlic text-white p-4 rounded-xl font-bold">
          Confirm Order
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;