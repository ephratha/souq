import { useState, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CartPage = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    return savedCart;
  });
  const navigate = useNavigate();

  const updateQty = (id, delta) => {
    const newCart = cart.map(item => 
      item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item._id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-burntCoffee">Your cart is empty</h2>
      <Link to="/products" className="mt-4 text-honeyGarlic underline">Go Shopping</Link>
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-burntCoffee mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {cart.map(item => (
          <motion.div layout key={item._id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-champagne">
            <div className="flex items-center gap-4">
              <img src={`http://localhost:5000/${item.images[0]}`} className="w-16 h-16 object-cover rounded-md" alt="" />
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-honeyGarlic font-bold">${item.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQty(item._id, -1)} className="px-2 bg-champagne rounded">-</button>
              <span>{item.qty}</span>
              <button onClick={() => updateQty(item._id, 1)} className="px-2 bg-champagne rounded">+</button>
              <button onClick={() => removeItem(item._id)} className="ml-4 text-red-500 font-bold">X</button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-honeyGarlic">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-burntCoffee text-white p-4 rounded-xl font-bold text-lg hover:bg-black transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;