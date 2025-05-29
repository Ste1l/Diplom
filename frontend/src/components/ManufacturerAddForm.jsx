import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const ManufacturerAddForm = () => {
  const [manufacturerName, setManufacturerName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}emp/manufacturers`, {
        manufacturer_name: manufacturerName,
        address,
        phone_number: phoneNumber,
        inn,
        kpp,
        account_number: accountNumber
      });
      console.log('Manufacturer added:', response.data);
      setManufacturerName('');
      setAddress('');
      setPhoneNumber('');
      setInn('');
      setKpp('');
      setAccountNumber('');
    } catch (err) {
      setError('Ошибка при добавлении производителя');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      <div className='input-container'>
      <input
        type="text"
        value={manufacturerName}
        onChange={(e) => setManufacturerName(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Название производителя</label>
      </div>
      
      <div className='input-container'>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Адрес</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Номер телефона</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={inn}
        onChange={(e) => setInn(e.target.value)}
        placeholder=""
      />
      <label className="input-label">ИНН</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={kpp}
        onChange={(e) => setKpp(e.target.value)}
        placeholder=""
      />
      <label className="input-label">КПП</label>
      </div>
      <div className='input-container'>
      <input
        type="text"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder=""
      />
      <label className="input-label">Номер счета</label>
      </div>
      <button type="submit">Добавить производителя</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default ManufacturerAddForm;