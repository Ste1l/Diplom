import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';
import { useAuth } from '../Context/AuthContext';
import '../style/Order.css';
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { user, token, logout } = useAuth();
  const [showOrderDetails, setShowOrderDetails] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Токен не найден. Пожалуйста, войдите в систему.');
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${API_URL}orders/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const sortedOrders = response.data.orders.sort((a, b) => {
          return new Date(b.order_date) - new Date(a.order_date);
        });
        setOrders(sortedOrders);
        const initialShowDetails = {};
        sortedOrders.forEach(order => {
          initialShowDetails[order.id] = false;
        });
        setShowOrderDetails(initialShowDetails);
      } catch (err) {
        console.error('Ошибка при получении заказов пользователя:', err);
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    if (user && token) {
      fetchUserOrders();
    }
  }, [user, token, logout]);

  const toggleOrderDetails = (orderId) => {
    setShowOrderDetails(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

  if (!user || !token) {
    return <div>Вы не авторизованы. Пожалуйста, войдите в систему.</div>;
  }

  return (
    <div className="orders-container">
      <h2>Ваши заказы</h2>
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id} className="order-item">
            <p>Номер заказа: #{order.id}</p>
            <p>Дата заказа: {new Date(order.order_date).toLocaleDateString()}</p>
            <p>Общая стоимость: {order.total_cost.toFixed(2)}</p>
            <h3>Продукты  
               <span className='show-order-details'  onClick={() => toggleOrderDetails(order.id)}> 
                {showOrderDetails[order.id] ? <FaAngleUp /> : <FaAngleDown />}
               </span>
                
              </h3>

            {showOrderDetails[order.id] && (
              <ul>
                {order.items.map(item => (
                  <li key={item.product_id}>
                    <img src={`${API_URL}static/products_image/${item.image_name}`} alt={item.name} />
                    {item.name} x{item.quantity} - {item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}

          </div>
        ))
      ) : (
        <p>У вас нет заказов</p>
      )}
    </div>
  );
};

export default Orders;