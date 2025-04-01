// ProductAddForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';
import ImageFile from './ImageFile';

const ProductAddForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date_product, setDateProduct] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await axios.get(`${API_URL}api/manufacturers`);
        setManufacturers(response.data.manufacturers);
      } catch (err) {
        setError('Ошибка при загрузке списка производителей');
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}api/categories`);
        setCategories(response.data.categories);
      } catch (err) {
        setError('Ошибка при загрузке списка категорий');
      }
    };
    fetchManufacturers();
    fetchCategories();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedFile) {
        setError('Пожалуйста, выберите изображение');
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('quantity', quantity);
      formData.append('date_product', date_product);
      formData.append('manufacturer_id', manufacturerId);
      formData.append('category_id', categoryId);

      const response = await axios.post(`${API_URL}api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product added:', response.data);
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setDateProduct('');
      setManufacturerId('');
      setCategoryId('');
      setSelectedFile(null);
    } catch (err) {
      setError('Ошибка при добавлении продукта');
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className='input-container'>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Название продукта</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Описание</label>
      </div>
      <div className='input-container'>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Цена</label>
      </div>
      <div className='input-container'>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Количество</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={date_product}
        onChange={(e) => setDateProduct(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Дата продукта</label>
      </div>
      <div className='input-container'>
      <select value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
        <option value="">Выберите производителя</option>
        {manufacturers.map(manufacturer => (
          <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.manufacturer_name}</option>
        ))}
      </select>
      </div>
      <div className='input-container'>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Выберите категорию</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.category_name}</option>
        ))}
      </select>
      </div>
      <div className='input-container'>
        <ImageFile onFileSelected={(file) => setSelectedFile(file)} />
      </div>
      
      
      
      <button type="submit">Добавить продукт</button>
      {error && <div style={{ color: 'red' }}>{String(error)}</div>}
    </form>
  );
};

export default ProductAddForm;