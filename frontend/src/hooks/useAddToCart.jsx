import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { API_URL } from '../js/config';
import { useNavigate } from 'react-router-dom';

const useAddToCart = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, user, logout } = useAuth();
    const [cartItems, setCartItems] = useState({});
    const navigate = useNavigate();
    
    const fetchCartItems = useCallback(async () => {

        try {
            const response = await axios.get(`${API_URL}main/cart/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            /* console.log('Response data:', response.data);
            console.log('Cart items:', response.data.cart); */
    
            const cartItemsObject = {};
            response.data.cart.forEach(item => {
                cartItemsObject[item] = true;
            });
            /* console.log('Parsed cart items:', cartItemsObject); */
    
            setCartItems(cartItemsObject);
        } catch (error) {
            console.error('Ошибка при получении товаров в корзине:', error);
            logout();
            navigate('/login');
        }
    }, [token, user]);

    const addToCart = useCallback(async (productId, quantity) => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.post(`${API_URL}main/cart/add-item`, {
                product_id: productId,
                quantity: quantity
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            fetchCartItems();
            return response.data;
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            setError('Произошла ошибка при добавлении товара в корзину');
        } finally {
            setLoading(false);
        }
    }, [token, fetchCartItems]);
    
    const removeFromCart = useCallback(async (productId) => {
        try {
            await axios.delete(`${API_URL}main/cart/remove-item`, {
                params: { product_id: productId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchCartItems();
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
        }
    }, [token, fetchCartItems]);

    useEffect(() => {
        if (user && token) {
            fetchCartItems();
        }
    }, [user, token, fetchCartItems]);

    return { addToCart, removeFromCart, error, loading, cartItems };

};



export default useAddToCart;