import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { API_URL } from '../js/config';
import { useNavigate } from 'react-router-dom';

const useAddToFavorites = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, user, logout } = useAuth();
    const [favorites, setFavorites] = useState({});
    const navigate = useNavigate();

    const fetchFavorites = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}favorites/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const favoritesObject = {};
            response.data.favorites.forEach(item => {
                favoritesObject[item] = true;
            });
            console.log('Favorites object:', favoritesObject);
            setFavorites(favoritesObject);
        } catch (error) {
            console.error('Ошибка при получении избранных товаров:', error);
            logout();
            navigate('/login');
        }
    }, [token, user]);

    const toggleFavorite = useCallback(async (productId) => {
        setLoading(true);
        setError(null);

        try {
            if (favorites[productId]) {
                await axios.delete(`${API_URL}favorites/remove`, {
                    params: { product_id: productId },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                await axios.post(`${API_URL}favorites/add`, {
                    product_id: productId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            fetchFavorites();
        } catch (error) {
            console.error('Ошибка при изменении избранного:', error);
            setError('Произошла ошибка при изменении избранного');
        } finally {
            setLoading(false);
        }
    }, [token, fetchFavorites, favorites]);

    useEffect(() => {
        if (user && token) {
            fetchFavorites();
        }
    }, [user, token, fetchFavorites]);

    return { toggleFavorite, error, loading, favorites };
};

export default useAddToFavorites;