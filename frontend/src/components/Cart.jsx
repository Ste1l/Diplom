import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import '../style/Cart.css';
import { MdDelete } from "react-icons/md";
import useAddToCart from '../hooks/useAddToCart';
import { Link } from 'react-router-dom';
import { API_URL } from '../js/config';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, user, logout, isLoading } = useAuth();
  const { addToCart, removeFromCart, loading, cartItems: cartItemsFromHook } = useAddToCart();
  const navigate = useNavigate();

  useEffect(() => {
    /* console.log('Cart component mounted');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('token:', token);
    console.log('user:', user); */

    if (isLoading) return;

    if (isAuthenticated && token && user && user.id) {
      fetchCartData();
    } else {
      console.log('Not authenticated or missing credentials');
      logout();
      navigate('/login');
    }
  }, [isAuthenticated, token, user]);

  /* console.log('Cart items:', cartItems); */

  const fetchCartData = async () => {
    try {
      /* console.log('Fetching cart data...'); */
      const response = await axios.get(`${API_URL}cart-user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      /* console.log('Cart data received:', response.data); */
      setCartItems(response.data.cart);
      setError(null);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setError('Произошла ошибка при загрузке данных корзины. Попробуйте обновить страницу.');
      logout();
      navigate('/login');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      fetchCartData();
    } catch (error) {
      console.error('Ошибка при удалении товара из корзины:', error);
      setError('Не удалось удалить товар из корзины');
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      if (quantity === 0) {
        await handleRemoveFromCart(productId);
      } else {
        await addToCart(productId, quantity);
      }
      fetchCartData();
    } catch (error) {
      console.error('Ошибка при обновлении количества товара в корзине:', error);
      setError('Не удалось обновить количество товара в корзине');
    }
  };



  return (
    <div className='container'>
      <h2>Корзина</h2>
      <div className='cart-container'>
        {error ? (
          <p>{error}</p>
        ) : cartItems.length > 0 ? (
          <>
            <div className='cart-items-container'>
              {cartItems.map(item => (
                <div key={item.product_id} className='cart-item'>
                  <div className='flex'>
                  <div className='product-image'>
                    {/* <img src={`http://127.0.0.1:8000/static/products_image/${item.image}`} alt="" /> */}
                    <img src={`/img/products_image/${item.image}`} alt={item.name} />
                  </div>
                  <div className='product-price'>
                    <p className='product-name'>{item.name}</p>
                    <MdDelete className='remove-basket-main' onClick={() => handleRemoveFromCart(item.product_id)} />
                  </div>
                  {/* <p className='price-cart-tov'>{item.price} ₽</p> */}
                  <div className='product-quantity'>
                    <div className="counter-container">
                      <button
                        className="counter-button_1"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>
                      <span id="counter">{item.quantity}</span>
                      <button
                        className="counter-button_2"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    {/* <p>Количество: {item.quantity}</p> */}
                    
                  </div>
                  <div className='product-cart-mobile'>
                    <p className='product-name'>{item.name}</p>
                    
                    <p className='price-main-tov'>{item.price} ₽</p>
                  </div>
                  
                    </div>
                  
                    <div className='buttons-cart-mobile'>
                  <MdDelete className='remove-basket-main-mobile' onClick={() => handleRemoveFromCart(item.product_id)} />
                  <div className="counter-container">
                      <button
                        className="counter-button_1"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>
                      <span id="counter">{item.quantity}</span>
                      <button
                        className="counter-button_2"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>  
                  </div>
                </div>
              ))}
            </div>
            <div className='cart-total-container'>
              <p>Общая сумма: {totalPrice.toFixed(2)} ₽</p>
              <Link to="/payment" state={{cartItems}}>
              <button>К оформлению</button>
              </Link>
              
            </div>
            <Link to="/payment" state={{cartItems}}>
            <button className='button-cart-total z-3'>К оформлению {totalPrice.toFixed(2)} ₽</button>
            </Link>
          </>
        ) : (
          <p>Корзина пуста</p>
        )}
      </div>
    </div>
  );
};



export default Cart;