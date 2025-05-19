import { useEffect, useState } from 'react';
import '../style/ProductCarousel.css';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdFavorite } from "react-icons/md";
import { Link } from 'react-router-dom';
import useAddToCart from '../hooks/useAddToCart';
import useAddToFavorites from '../hooks/useAddToFavorites';
import { useAuth } from '../Context/AuthContext';
import { API_URL } from '../js/config';

function ProductCarousel() {

  const [products, setProducts] = useState([]);
  const { addToCart, removeFromCart, cartItems, loading, error } = useAddToCart();
  const { toggleFavorite, favorites, loading: favoritesLoading, error: favoritesError } = useAddToFavorites();
  const { isAuthenticated } = useAuth();


  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}products/`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Ошибка при получении товаров:', error);
      }
    }

    /* const loadCartItems = () => {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
          setCartItems(JSON.parse(storedCart));
      }
  }; */

    fetchProducts();
    /* loadCartItems(); */
  }, []);

  const [itemsPerSlide, setItemsPerSlide] = useState(6);

  useEffect(() => {
    /* const handleResize = () => {
      setItemsPerSlide(window.innerWidth <= 768 ? 2 : 6);
    }; */
    const handleResize = () => {
      const width = window.innerWidth;
      let itemsPerSlide;
    
      if (width <= 768) {
        itemsPerSlide = 2;
      } else if (width <= 1024) {
        itemsPerSlide = 3; 
      } else {
        itemsPerSlide = 6;
      }
    
      setItemsPerSlide(itemsPerSlide);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const truncateTitle = (title) => {
    if (window.innerWidth <= 768 && title.length > 15) {
      return `${title.substring(0, 12)}...`;
    }
    return title;
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
  };



  const maxProductsToShow = Math.min(products.length, 18);
  const slides = [];

  if (!products || products.length === 0) {
    /* console.warn('No products available'); */
    return <div>No products available</div>;
  }

  for (let i = 0; i < Math.ceil(maxProductsToShow / itemsPerSlide); i++) {
    const slideProducts = products.slice(i * itemsPerSlide, Math.min((i + 1) * itemsPerSlide, maxProductsToShow));

    slides.push(
      <Carousel.Item key={i}>
        <div className="cards-wrapper">
          {slideProducts.map((product, index) => (
            <div key={index} className="card-wrapper">
              <Link className='text-decoration' to={`/products/${product.id}`}>
                <Card>
                  <MdFavorite onClick={(e) => {
                    e.preventDefault();
                    handleToggleFavorite(product.id);
                  }} className={`favorite-but ${favorites[product.id] ? 'in-favorites' : ''}`} />

                  <div className='image-wrapper'>
                    {product.image_name && (
                      <Card.Img variant="top" src={`/img/products_image/${product.image_name}`} alt={product.name} />
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title>{truncateTitle(product.name)}</Card.Title>
                    <Card.Text className='price-carousel'>
                      {product.price} ₽.
                    </Card.Text>
                    <div className='buttons-card'>
                      <button
                        variant="primary"
                        className={`button-card ${cartItems[product.id] ? 'in-cart' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleCart(product.id);
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Обработка...' : cartItems[product.id] ? 'Удалить из корзины' : 'В корзину'}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </Carousel.Item>
    );
  }

  return (
    <div>
      <h1>Продукты</h1>
      <Carousel className='carousel-css no-controls' interval={null} indicators={false}>
        {slides}
      </Carousel>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>



  );
}

export default ProductCarousel;
