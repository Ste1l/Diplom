// src/components/PasswordResetForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const PasswordResetForm = ({
  onReset,
  onCancel,
  initialEmail = '',
  isAuthorized = false
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        email: email.trim(),
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmNewPassword: confirmPassword.trim(),
        isAuthorized: isAuthorized
      };

      const response = await axios.post(`${API_URL}main/reset-password`, data);

      if (response.status === 200) {
        onReset();
      } else {
        setError('Ошибка при изменении пароля');
      }
    } catch (err) {
      console.error('Ошибка при изменении пароля:', err);
      setError('Произошла ошибка при изменении пароля');
    }
  };

  return (
    <form className='form-reset' onSubmit={handleSubmit}>
      <h2>Восстановление пароля</h2>
      {!isAuthorized && (
        <div className='input-container'>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
          />
          <label className='input-label'>Email</label>
        </div>

      )}
      <div className='input-container'>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder=""
        />
        <label className='input-label'>Старый пароль</label>
      </div>
      <div className='input-container'>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder=""
        />
        <label className='input-label'>Новый пароль</label>
      </div>
      <div className='input-container'>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder=""
        />
        <label className='input-label'>Подтвердите пароль</label>
      </div>



      <button type="submit" className='buttons'>Сохранить</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="button" className='buttons' onClick={onCancel}>Отмена</button>
    </form>
  );
};

export default PasswordResetForm;