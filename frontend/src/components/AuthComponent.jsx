import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import '../style/forms.css';
import { API_URL } from '../js/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNotification } from '../Context/NotificationContext';
import PasswordResetForm from './PasswordResetForm';

const AuthComponent = ({ onLogin, setErrorNotification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, logout, login } = useAuth();
  const { addNotification } = useNotification();

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}login`, {
        email,
        password
      });

      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        /* toast.success("Вы успешно вошли в аккаунт"); */
        
        addNotification('succes','Вы успешно вошли в аккаунт');
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.access_token, response.data.user);
        window.location.href = '/';
      } else {
        console.error('Неверный пароль или адрес электронной почты');
        addNotification('error','Неверный пароль или адрес электронной почты');
      }
    } catch (error) {
      console.error('Ошибка входа:', error.response?.data?.detail || error.message || error.toString());
      if (error.response && error.response.status === 400) {
        /* toast.error("Неверный email или пароль"); */
        addNotification('error','Неверный пароль или адрес электронной почты');
      } else {
        /* toast.error('Произошла ошибка при входе. Попробуйте снова.'); */
        addNotification('error','Произошла ошибка при входе. Попробуйте снова.');
      }
    }
  };

  const validateGeneralInput = useCallback((value) => {
    return /^[a-zA-Z0-9_-]*$/.test(value);
  }, []);

  const validateEmail = useCallback((value) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  }, []);

  const handleInputChange = useCallback((event, isEmail = false) => {
    const { value } = event.target;
    let validator = validateGeneralInput;
    
    if (isEmail) {
      validator = validateEmail;
    }

    if (validator(value)) {
      event.target.value = value;
    } else {
      event.target.value = value.replace(isEmail ? /[^a-zA-Z0-9._%+-@]/g : /[^a-zA-Z0-9_-]/g, '');
    }
  }, [validateGeneralInput, validateEmail]);

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  };

  const handlePasswordResetCancel = () => {
    setShowPasswordReset(false);
  };


  return (
    <div className="modal-content">
      
      {showPasswordReset ? (
        <PasswordResetForm 
          onReset={() => setShowPasswordReset(false)}
          onCancel={handlePasswordResetCancel}
          isAuthorized={false}
        />
      ) : (
        <>
          {!isAuthenticated && (
        <>
<h2>Авторизация</h2>
      <form className="sign_us_form" onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}>
        <div className="input-container">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onInput={(e) => handleInputChange(e, true)}
            placeholder=""
            required
          />  
          <label className="input-label">Email</label>
        </div>
        <div className="input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onInput={handleInputChange}
            placeholder=""
            required
          />  
          <label className="input-label">Пароль</label>
        </div>
        <button type="submit">Войти</button>
      </form>
      <div className="registr">
        <p>У вас нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p> 
      </div>
        </>
      )}
      <div className='registr'>
       <p>Забыли пароль? <Link onClick={handlePasswordReset}>Восстановить</Link></p> 
      </div>
      
        </>
      )}
    </div>
  );
};

export default AuthComponent;