import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MdFavorite } from "react-icons/md";
import Card from 'react-bootstrap/Card';
import useAddToCart from '../hooks/useAddToCart';
import useAddToFavorites from '../hooks/useAddToFavorites';
import "../style/SearchResult.css";
import { API_URL } from '../js/config';
import { Typography, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple } from '@mui/material/colors';

function SearchResultsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { query } = useParams();
    const { addToCart, removeFromCart, cartItems } = useAddToCart();
    const { toggleFavorite, favorites } = useAddToFavorites();
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [manufacturers, setManufacturers] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const filterProducts = (products) => {
        return products.filter(product => {
            const priceInRange = product.price >= priceRange[0] && product.price <= priceRange[1];
            const manufacturerMatches = !selectedManufacturer || product.manufacturer_id === selectedManufacturer;
            return priceInRange && manufacturerMatches;
        });
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`${API_URL}main/products/search/${encodeURIComponent(query)}`);
                setProducts(response.data.products);
            } catch (error) {
                setError('Произошла ошибка при загрузке результатов поиска');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const response = await axios.get(`${API_URL}api/manufacturers`);
                setManufacturers(response.data.manufacturers);
            } catch (error) {
                console.error('Ошибка при загрузке производителей:', error);
            }
        };

        fetchManufacturers();
    }, []);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;

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

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleManufacturerChange = (event) => {
        setSelectedManufacturer(event.target.value);
    };


    const theme = createTheme({
        palette: {
            primary: {
                main: '#8168f0',
            },
            secondary: deepPurple,
        },
    });

    return (
        <div className="search-results-page">
            <h1>Результаты поиска: "{query}"</h1>
            <div className="filters">
                <ThemeProvider theme={theme}>
                    <div className="price-filter">
                        <Typography id="range-slider" gutterBottom>
                            Диапазон цен
                        </Typography>
                        <Slider
                            value={priceRange}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={2500}
                        />
                    </div>
                    <div className="manufacturer-filter">
                        <FormControl fullWidth>
                            <InputLabel id="manufacturer-label">Производитель</InputLabel>
                            <Select
                                labelId="manufacturer-label"
                                id="manufacturer-select"
                                value={selectedManufacturer}
                                label="Производитель"
                                onChange={handleManufacturerChange}
                            >
                                <MenuItem value={null}>Все производители</MenuItem>
                                {manufacturers.map((manufacturer) => (
                                    <MenuItem key={manufacturer.id} value={manufacturer.id}>
                                        {manufacturer.manufacturer_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </ThemeProvider>

            </div>
            <div className="search-results-list">
                {filterProducts(products).length > 0 ? (
                    filterProducts(products).map((product) => (
                        <React.Fragment key={product.id}>
                            <Link className='text-decoration' to={`/products/${product.id}`}>
                                <Card key={product.id} className="search-result-item card-search">
                                    <MdFavorite onClick={(e) => {
                                        e.preventDefault();
                                        handleToggleFavorite(product.id);
                                    }} className={`favorite-but ${favorites[product.id] ? 'in-favorites' : ''}`} />
                                    <div className='image-wrapper-search'>
                                        {product.image_name && (
                                            // <Card.Img variant="top" src={`${API_URL}static/products_image/${product.image_name}`} alt={product.name} />
                                            <Card.Img variant="top" src={`/img/products_image/${product.image_name}`} alt={product.name} />
                                        )}
                                    </div>
                                    <Card.Body>
                                        <Card.Title>{product.name}</Card.Title>
                                        <Card.Text>
                                            Цена: {product.price} ₽.
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
                        </React.Fragment>
                    ))
                ) : (
                    <p>Ничего не найдено</p>
                )}
            </div>
        </div>
    );
}

export default SearchResultsPage;