import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get(`${API_URL}products/`);
            console.log(response);
            setProducts(response.data);
        };
        fetchProducts();
    }, []);

    return (
        <ul>
            {products.map(product => (
                <li key={product.id}>
                    {product.name} - {product.price} руб. - {product.description}
                </li>
            ))}
        </ul>
    );
};

export default ProductList;