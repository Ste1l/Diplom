import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../style/CardProducts.css';
import { FaArrowLeft } from "react-icons/fa6";
import useAddToCart from '../hooks/useAddToCart';
import useAddToFavorites from '../hooks/useAddToFavorites';
import { MdFavorite } from "react-icons/md";
import { API_URL } from '../js/config';


const ProductPage = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(1);
    const { addToCart, removeFromCart, cartItems, loading } = useAddToCart();
    const { toggleFavorite, favorites, loading: favoritesLoading, error: favoritesError } = useAddToFavorites();
    /* const [addedToCart, setAddedToCart] = useState(false); */


    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await axios.get(`${API_URL}products/${id}`);
                console.log('Данные товара:', response.data);
                setProduct(response.data);
                setCount(1);
            } catch (error) {
                console.error('Ошибка при получении товара:', error);
                setError('Произошла ошибка при загрузке товара');
            }
        }
        fetchProduct();
    }, [id]);

    const handleIncrement = () => {
        if (count < product.quantity) {
            setCount(prevCount => prevCount + 1);
        }
    };

    const handleDecrement = () => {
        if (count > 1) {
            setCount(prevCount => prevCount - 1);
        }
    };

    const handleToggleCart = async (productId) => {
        console.log('handleToggleCart called with productId:', productId);
        console.log('Current cartItems:', cartItems);
        console.log('Selected count:', count);

        if (cartItems[productId]) {
            console.log('Removing item from cart');
            await removeFromCart(productId);
        } else {
            console.log('Adding item to cart');
            await addToCart(productId, count);
        }
    };

    const handleToggleFavorite = async (productId) => {
        await toggleFavorite(productId);
    };

    if (error) return <div>{error}</div>;
    if (!product) return <div>Загрузка...</div>;

    return (
        <div className="info_page_product_main">
            <div className='back_button_div'>
                <Link className='text-decoration' to='/'>
                    {/* <button className="back_button">Назад</button> */}
                    <FaArrowLeft className="back_button" />
                </Link>
            </div>
            

            <div className="name_page_product">
                <p>
                    {product.name}
                </p>
                <MdFavorite onClick={(e) => {
                    e.preventDefault();
                    handleToggleFavorite(product.id);
                }}
                    className={`favorite-but-card ${favorites[product.id] ? 'favorite-but-card-in-favorites' : ''}`} />
            </div>

            <div className="info_page_product">
                <div className='image-container'>
                    {/* <img src={`${API_URL}static/products_image/${product.image_name}`} alt={product.name} /> */}
                    <img src={`/img/products_image/${product.image_name}`} alt={product.name} />
                </div>
                

                <div className="info_page_product_1">

                    <p>Прозводитель: {product.manufacturer_name}</p>
                    <p>Состав: {product.description}</p>
                    <p>Срок годности: {product.date_product}</p>

                </div>
                <div className="info_page_product_2">
                    <p className="info_page_price">Цена <span> {product.price} ₽</span></p>
                    <button
                        variant="primary"
                        className={`basket ${cartItems[product.id] ? 'in-cart' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggleCart(product.id);
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Обработка...' : cartItems[product.id] ? 'Удалить из корзины' : 'В корзину'}
                    </button>
                    
                    <div className="counter-container">
                        <button className="counter-button_1" onClick={handleDecrement} disabled={count === 1}>-</button>
                        <span id="counter">{count}</span>
                        <button className="counter-button_2" onClick={handleIncrement} disabled={count === product.quantity}>+</button>
                    </div>
                    <p className="info_page_quantity">
                        {product.quantity > 100 ? " В наличии" :
                            product.quantity >= 1 && product.quantity < 100 ? ` Осталось ${product.quantity} штук` :
                                product.quantity === 0 ? " Закончилось" : ""}
                    </p>
                </div>
                <div className="info_page_product_3">
                    <p className="info_page_price">Цена<br></br><span> {product.price} ₽</span></p>
                    <p className="info_page_quantity">
                        {product.quantity > 100 ? " В наличии" :
                            product.quantity >= 1 && product.quantity < 100 ? ` Осталось ${product.quantity} штук` :
                                product.quantity === 0 ? " Закончилось" : ""}
                    </p>
                </div>
                <div className="info_page_product_4">

                    <p>Прозводитель: {product.manufacturer_name}</p>
                    <p>Состав: {product.description}</p>
                    <p>Срок годности: {product.date_product}</p>

                </div>

            </div>
            <button
                variant="primary"
                className={`basket-mobile ${cartItems[product.id] ? 'in-cart' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    handleToggleCart(product.id);
                }}
                disabled={loading}
            >
                {loading ? 'Обработка...' : cartItems[product.id] ? 'Удалить из корзины' : 'В корзину'}
            </button>
            <div className='total_info'>
                <p className="headlines_total_info">Производитель</p>
                <p className='info_headlines'>{product.manufacturer_name || 'f'}</p>
                <p className="headlines_total_info">Состав</p>
                <p className='info_headlines'>{product.composition || 'f'}</p>
                <p className="headlines_total_info">Фармакологическое действие</p>
                <p className='info_headlines'>{product.pharmacological_action || 'f'}</p>
                <p className="headlines_total_info">Показания</p>
                <p className='info_headlines'>{product.indications || 'f'}</p>
                <p className="headlines_total_info">Противопоказания</p>
                <p className='info_headlines'>{product.contraindications || 'f'}</p>
                <p className="headlines_total_info">Побочные действия</p>
                <p className='info_headlines'>{product.side_effects || 'f'}</p>
                <p className="headlines_total_info">Взаимодействие</p>
                <p className='info_headlines'>{product.interactions || 'f'}</p>
                <p className="headlines_total_info">Как принимать, курс приема и дозировка</p>
                <p className='info_headlines'>{product.dosage || 'f'}</p>
                <p className="headlines_total_info">Передозировка</p>
                <p className='info_headlines'>{product.overdose || 'f'}</p>
                <p className="headlines_total_info">Описание</p>
                <p className='info_headlines'>{product.full_description || 'f'}</p>
                <p className="headlines_total_info">Условия хранения</p>
                <p className='info_headlines'>{product.storage_conditions || 'f'}</p>
                <p className="headlines_total_info">Срок годности</p>
                <p className='info_headlines'>{product.shelf_life || 'f'}</p>
            </div>
            
        </div>
    );
}

export default ProductPage;