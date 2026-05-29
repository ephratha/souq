import { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersPage = () => {
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.map(order => (
        <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-honeyGarlic mb-4">
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-500">ID: {order._id.substring(0,8)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="space-y-2">
            {order.products.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{p.productId?.title || 'Product'} (x{p.quantity})</span>
                <span className="font-bold">${p.priceAtPurchase}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
            <span>Total Paid on Delivery:</span>
            <span>${order.totalAmount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;