import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const ProductInfoAddForm = () => {
  const [composition, setComposition] = useState('');
  const [pharmacological_action, setPharmacologicalAction] = useState('');
  const [indications, setIndications] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [side_effects, setSideEffects] = useState('');
  const [interactions, setInteractions] = useState('');
  const [dosage, setDosage] = useState('');
  const [overdose, setOverdose] = useState('');
  const [full_description, setFullDescription] = useState('');
  const [storage_conditions, setStorageConditions] = useState('');
  const [shelf_life, setShelfLife] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}emp/products`);
        setProducts(response.data.products);
      } catch (err) {
        setError('Ошибка при загрузке списка продуктов');
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}emp/product_info`, {
        product_id: productId,
        composition,
        pharmacological_action,
        indications,
        contraindications,
        side_effects,
        interactions,
        dosage,
        overdose,
        full_description,
        storage_conditions,
        shelf_life
      });
      console.log('Product Info added:', response.data);
      setComposition('');
      setPharmacologicalAction('');
      setIndications('');
      setContraindications('');
      setSideEffects('');
      setInteractions('');
      setDosage('');
      setOverdose('');
      setFullDescription('');
      setStorageConditions('');
      setShelfLife('');
      setProductId('');
    } catch (err) {
      setError('Ошибка при добавлении информации о продукте');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className='input-container'>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Выберите продукт</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={composition}
          onChange={(e) => setComposition(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Состав</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={pharmacological_action}
          onChange={(e) => setPharmacologicalAction(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Фармакологическое действие</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={indications}
          onChange={(e) => setIndications(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Показания</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={contraindications}
          onChange={(e) => setContraindications(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Противопоказания</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={side_effects}
          onChange={(e) => setSideEffects(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Побочные эффекты</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={interactions}
          onChange={(e) => setInteractions(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Взаимодействия</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Дозировка</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={overdose}
          onChange={(e) => setOverdose(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Передозировка</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={full_description}
          onChange={(e) => setFullDescription(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Полное описание</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={storage_conditions}
          onChange={(e) => setStorageConditions(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Условия хранения</label>
      </div>
      <div className='input-container'>
        <input
          type="text"
          value={shelf_life}
          onChange={(e) => setShelfLife(e.target.value)}
          placeholder=""
        />
        <label className="input-label">Срок годности</label>
      </div>
      <button type="submit">Добавить информацию о продукте</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default ProductInfoAddForm;