import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import "../style/Favorites.css"
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdFavorite } from "react-icons/md";
import useAddToCart from '../hooks/useAddToCart';
import useAddToFavorites from '../hooks/useAddToFavorites';
import { API_URL } from '../js/config';
import { useNavigate } from 'react-router-dom';

function Favorites() {
    const [favoritesInfo, setFavorites] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToCart, removeFromCart, cartItems, loading: cartLoading, error: cartError } = useAddToCart();
    const { toggleFavorite, favorites, loading: favoritesLoading, error: favoritesError } = useAddToFavorites();
    const { isAuthenticated, token, user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && token && user && user.id) {
            fetchFavorites();
        } else {
            console.log('Not authenticated or missing credentials');
            logout();
            navigate('/login');
          }
    }, [isAuthenticated, token, user]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}favorites/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Favorite response:', response.data);
            const productIds = response.data.favorites;
            console.log('Favorite product IDs:', productIds);
            
            const productsResponse = await axios.post(`${API_URL}products/batch`, {
                product_ids: productIds
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Fetched products:', productsResponse.data.products);
            setFavorites(productsResponse.data.products);
            setError(null);
        } catch (error) {
            console.error('Ошибка при получении избранных товаров:', error);
            setError('Произошла ошибка при загрузке избранных товаров');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCart = async (productId) => {
        if (cartItems[productId]) {
            await removeFromCart(productId);
        } else {
            await addToCart(productId, 1);
        }
    };

    const handleToggleFavorite = async (productId) => {
        await toggleFavorite(productId);
        fetchFavorites();
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (favoritesInfo.length === 0) {
        return <div>У вас пока нет избранных товаров</div>;
    }

    return (
        <div className="favorites-container">
            <h2>Избранные товары</h2>
            <div className="favorites-list">
                {favoritesInfo.map((favorite) => (
                    <React.Fragment key={favorite.id}>
                        <Link className='text-decoration' to={`/products/${favorite.id}`}>
                            <Card key={favorite.id} className="favorite-item card-favorites">
                                <MdFavorite onClick={(e) => {
                                    e.preventDefault();
                                    handleToggleFavorite(favorite.id);
                                }} className={`favorite-but ${favorites[favorite.id] ? 'in-favorites' : ''}`} />
                                <div className='image-wrapper-favorites'>
                                    {favorite.image_name && (
                                        <Card.Img variant="top" src={`${API_URL}static/products_image/${favorite.image_name}`} alt={favorite.name}/>
                                    )}
                                </div>
                                <Card.Body>
                                    <Card.Title>{favorite.name}</Card.Title>
                                    <Card.Text>
                                        Цена: {favorite.price} ₽.
                                    </Card.Text>
                                    <div className='buttons-card'>
                                        <button
                                            variant="primary"
                                            className={`button-card ${cartItems[favorite.id] ? 'in-cart' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleToggleCart(favorite.id);
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Обработка...' : cartItems[favorite.id] ? 'Удалить из корзины' : 'В корзину'}
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default Favorites;