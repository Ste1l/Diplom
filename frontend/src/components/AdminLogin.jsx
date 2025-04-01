import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}admin/login`, { email, password });
      localStorage.setItem('adminToken', response.data.access_token);
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error(error);
      alert('Неверный email или пароль');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
      <button type="submit">Войти</button>
    </form>
  );
};

export default AdminLogin;