import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const CategoryAddForm = () => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}api/categories`, {
        category_name: categoryName
      });
      console.log('Категория добавлена:', response.data);
      setCategoryName('');
    } catch (err) {
      console.error('Ошибка при добавлении категории:', err);
      if (err.response) {

        console.log('Ответ с ошибкой:', err.response.data);
        console.log('Статус ошибки:', err.response.status);
        console.log('Заголовки ошибки:', err.response.headers);
        setError(`Ошибка при добавлении категории: ${err.response.data.detail || 'Неизвестная ошибка'}`);
      } else if (err.request) {
        console.log('Нет ответа от сервера:', err.request);
        setError('Сервер не ответил. Проверьте подключение к интернету.');
      } else {
        console.log('Ошибка при настройке запроса:', err.message);
        setError('Произошла ошибка при отправке запроса. Попробуйте еще раз.');
      }
      console.error('Полный объект ошибки:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className='input-container'>
      <input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Введите название категории</label>
      </div>
      
      <button type="submit">Добавить категорию</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default CategoryAddForm;