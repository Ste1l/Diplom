import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '../style/forms.css';
import { initPhoneMask, mask } from '../js/phoneMask';
import { API_URL } from '../js/config';

const RegisterComponent = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
  });
  const [passwordTouched, setPasswordTouched] = useState(false);

  const phoneInputRef = useRef(null);

  useEffect(() => {
    if (phoneInputRef.current) {
      initPhoneMask(phoneInputRef.current);
    }
  }, []);

  const checkPasswordStrength = useCallback(() => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);

    setPasswordStrength({ length, uppercase, lowercase });
  }, [password]);

  useEffect(() => {
    checkPasswordStrength();
  }, [checkPasswordStrength]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (password !== confirmPassword){
        setPasswordMismatch(true);
        return;
      }

      if (!(passwordStrength.length && passwordStrength.uppercase && passwordStrength.lowercase)) {
        alert('Пароль должен быть не менее 8 символов длиной и содержать хотя бы одну заглавную и одну строчную букву.');
        return;
      }

      const response = await axios.post(`${API_URL}register`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        phone_number: phoneNumber || '',
        address: address || ''
      });

      console.log('Регистрация успешна:', response.data);
      alert('Вы успешно зарегистрировались!');
      window.location.href = '/login';
    } catch (error) {
      console.error('Ошибка регистрации:', error.response.data);
      alert('Произошла ошибка при регистрации. Попробуйте еще раз.');
      setPasswordMismatch(false);
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

  


  return (
    <div className='modal-content'>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} className="register_form">
        <div className="input-container">
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} onInput={handleInputChange} placeholder='' required />
          <label className="input-label">Имя</label>
        </div>
        <div className="input-container">
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} onInput={handleInputChange} placeholder='' required />
            <label className="input-label">Фамилия</label>
        </div>
        <div className="input-container">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onInput={(e) => handleInputChange(e, true)} placeholder='' required />
            <label className="input-label">Email</label>
        </div>
        <div className={`input-container ${passwordTouched && (!passwordStrength.length || !passwordStrength.uppercase || !passwordStrength.lowercase) ? 'error' : ''}`}>
            <input type="password" value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              checkPasswordStrength();
            }}
            onInput={handleInputChange} placeholder='' required />
            <label className="input-label">Пароль</label>
            {passwordTouched && (
            <>
              {!passwordStrength.length && <span className="error-message">Пароль должен быть не менее 8 символов</span>}
              {!passwordStrength.uppercase && <span className="error-message">Пароль должен содержать хотя бы одну заглавную букву</span>}
              {!passwordStrength.lowercase && <span className="error-message">Пароль должен содержать хотя бы одну строчную букву</span>}
            </>
          )}
        </div>
        <div className={`input-container ${passwordMismatch ? 'error' : ''}`}>
            <input type="password" value={confirmPassword} placeholder='' 
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordMismatch(password !== e.target.value);
            }}
            onFocus={() => setPasswordTouched(true)}
            onInput={handleInputChange} required />
            <label className="input-label">Подтвердите пароль</label>
            {passwordMismatch && <span className="error-message">Пароли не совпадают</span>}
        </div>
        <div className="input-container">
            <input 
            ref={phoneInputRef}
            type="tel" 
            value={phoneNumber} 
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              mask.call(e.target, e);
            }}
            onBlur={(e) => setPhoneNumber(e.target.dataset.cleanValue || '')}
            placeholder="+7(___)___-__-__"
            maxLength="18"
            pattern="\+7\s?[\(]{0,1}9[0-9]{2}[\)]{0,1}\s?\d{3}[-]{0,1}\d{2}[-]{0,1}\d{2}"
            />
            <label className="input-label">Номер телефона</label>
        </div>
        <div className="input-container">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} onInput={handleInputChange} placeholder='' />
            <label className="input-label">Адрес</label>
        </div>
        {/* <div className="d-flex gap-3 mb-2">
            <input type="checkbox" placeholder='' required/>
            <span className="">Даю согласие на обработку персональных данных в соответствии с <a href="#">политикой конфиденциальности</a></span>
        </div> */}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterComponent;