import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const SupplyItemAddForm = () => {
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [items, setItems] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await axios.get(`${API_URL}api/supplies`);
        setSupplies(response.data.supplies);
      } catch (err) {
        setError('Ошибка при загрузке списка поставок');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}api/products`);
        setProducts(response.data.products);
      } catch (err) {
        setError('Ошибка при загрузке списка товаров');
      }
    };

    fetchSupplies();
    fetchProducts();
  }, []);

  const handleSupplySelect = (e) => {
    setSelectedSupply(e.target.value);
  };

  const handleProductSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    setSelectedProducts(new Set(selectedOptions.map(opt => opt.value)));

    const newItems = {};
    selectedOptions.forEach(option => {
      newItems[option.value] = items[option.value] || { quantity: '', cost: '' };
    });
    setItems(newItems);
  };

  const handleItemChange = (productId, field, value) => {
    setItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupply) {
      setError('Пожалуйста, выберите поставку');
      return;
    }

    try {
      const supplyItems = Object.entries(items).map(([productId, item]) => {
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Количество товара ${productId} должно быть больше нуля`);
        }
        return {
          supply_id: parseInt(selectedSupply),
          product_id: parseInt(productId),
          quantity: parseInt(item.quantity)
        };
      });

      try {
        const response = await axios.post(
          `${API_URL}api/supplies/${selectedSupply}/items`,
          supplyItems,
          {
            validateStatus: (status) => {
              return status >= 200 && status < 300;
            }
          }
        );

        if (response.status === 200) {
          setError(null);
          setSelectedSupply('');
          setSelectedProducts(new Set());
          setItems({});
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            setError(`Ошибка валидации: ${error.response.data.detail || 'Неверные данные'}`);
          } else if (error.response.status === 404) {
            setError('Поставка или товар не найдены');
          } else {
            setError(`Ошибка сервера: ${error.response.data.detail || 'Произошла ошибка'}`);
          }
        } else if (error.request) {
          setError('Ошибка соединения с сервером');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className="input-container">
        <select 
          value={selectedSupply} 
          onChange={handleSupplySelect}
          className="select-supply"
        >
          <option value="">Выберите поставку</option>
          {supplies.map(supply => (
            <option key={supply.id} value={supply.id}>
              Поставка #{supply.id} от {new Date(supply.supply_date).toLocaleDateString()}
            </option>
          ))}
        </select>
        <label>Поставка</label>
      </div>

      {selectedSupply && (
        <>
          <div className="input-container">
            <select 
              multiple 
              value={Array.from(selectedProducts)} 
              onChange={handleProductSelect}
              className="multi-select"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.price} ₽, {product.quantity} шт.)
                </option>
              ))}
            </select>
            <label>Выберите товар</label>
          </div>

          {Array.from(selectedProducts).map(productId => {
            const product = products.find(p => p.id === parseInt(productId));
            return (
              <div key={productId} className="item-form">
                <h3>{product.name}</h3>

                <div className="input-container">
                  <input
                    type="number"
                    min="1"
                    value={items[productId]?.quantity || ''}
                    onChange={(e) => handleItemChange(productId, 'quantity', e.target.value)}
                    placeholder="Количество"
                  />
                  <label>Количество</label>
                </div>

                {/* <div className="input-container">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={items[productId]?.cost || ''}
                    onChange={(e) => handleItemChange(productId, 'cost', e.target.value)}
                    placeholder="Стоимость за единицу"
                  />
                  <label>Стоимость за единицу</label>
                </div> */}

                {items[productId]?.quantity && items[productId]?.cost && (
                  <div className="total-cost">
                    Итого по позиции: {(items[productId].quantity * items[productId].cost).toFixed(2)} ₽
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {selectedSupply && (
        <button type="submit">Добавить товар в поставку</button>
      )}
    </form>
  );
};

export default SupplyItemAddForm;