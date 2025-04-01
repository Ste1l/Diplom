import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { API_URL } from '../js/config';
import '../style/PaymentForm.css';

const PaymentForm = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const cartItems = location.state?.cartItems;

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const cardLength = 16;
    
    if (value.length > cardLength) {
      return;
    }

    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if ((i % 4 === 0) && (i !== 0)) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    setCardNumber(formattedValue);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length > 3) {
      return;
    }
    setCvv(value);
  };

  const handleExpirationDateChange = (e) => {
    let value = e.target.value.replace(/[^0-9\/]/gi, '');
    if (value.length === 2 && !value.includes('/')) {
      value += '/';
    }
    if (value.length > 5) {
      return;
    }
    setExpirationDate(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cardNumber || !cvv || !expirationDate) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (!cartItems) {
        setError('Корзина пуста');
        return;
      }

    console.log('Отправляемые данные:', {
        user_id: user.id,
        cart_items: cartItems
      });

    try {
      const response = await axios.post(`${API_URL}process-payment`, {
        user_id: user.id,
        cart_items: cartItems
      });

      if (response.status === 200) {
        navigate('/payment-success');
      } else {
        throw new Error('Ошибка при обработке платежа');
      }
    } catch (error) {
      setError(error.message || 'Произошла ошибка при обработке платежа');
    }
  };

  return (
    <form className='payment-form' onSubmit={handleSubmit}>
      <label>
        Номер карты:
        <input 
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          placeholder="XXXX XXXX XXXX XXXX"
        />
      </label>

      <label>
        CVV:
        <input 
          type="text"
          value={cvv}
          onChange={handleCvvChange}
          maxLength={3}
          placeholder="XXX"
        />
      </label>

      <label>
        Дата истечения:
        <input 
          type="text"
          value={expirationDate}
          onChange={handleExpirationDateChange}
          maxLength={5}
          placeholder="MM/YY"
        />
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" className='submit-button'>Оплатить</button>
    </form>
  );
};

export default PaymentForm;