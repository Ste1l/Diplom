import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const SupplyAddForm = () => {
  const [totalCost, setTotalCost] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [error, setError] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await axios.get(`${API_URL}emp/manufacturers`);
        setManufacturers(response.data.manufacturers);
      } catch (err) {
        setError('Ошибка при загрузке списка производителей');
      }
    };
    fetchManufacturers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${API_URL}emp/supplies/add`, {
            total_cost: totalCost,
            manufacturer_id: manufacturerId,
        });

        if (response.status === 200 && !response.data.detail) {
            console.log('Поставка успешно добавлена:', response.data);
            setTotalCost('');
            setManufacturerId('');
            setError(null);
        } else {
            throw new Error(response.data.message || 'Ошибка при оформлении поставки');
        }
    } catch (err) {
        setError(err.message);
    }
};

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className='input-container'>
      <input
        type="text"
        value={totalCost}
        onChange={(e) => setTotalCost(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Общая сумма</label>
      </div>
      <div className='input-container'>
      <select value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
        <option value="">Выберите поставщика</option>
        {manufacturers.map(manufacturer => (
          <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.manufacturer_name}</option>
        ))}
      </select>
      </div>
      <button type="submit">Оформить поставку</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default SupplyAddForm;