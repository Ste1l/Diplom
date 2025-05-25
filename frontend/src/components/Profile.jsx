import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../js/config';
import CategoryAddForm from './CategoryAddForm';
import ManufacturerAddForm from './ManufacturerAddForm';
import ProductInfoAddForm from './ProductInfoAddForm';
import ProductAddForm from './ProductAddForm';
import SupplyItemAddForm from './SupplyItemAddForm';
import SupplyAddForm from './SupplyAddForm';
import { Tab, Tabs } from 'react-bootstrap';
import '../style/Profile.css';
import { useAuth } from '../Context/AuthContext';
import { IoMdExit } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import PasswordResetForm from './PasswordResetForm';
import Reports from './Reports';


const Profile = () => {

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const { logout } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);


  /* console.log(localStorage.getItem('token')); */

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Токен не найден. Пожалуйста, войдите в систему.');
          logout();
          navigate('/login');
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}main/profile/me`);
        setUser(response.data);
        setIsAdmin(response.data.role_id === 2);
        setIsEmployee(response.data.role_id === 3);

        
        
      } catch (err) {
        console.error('Ошибка при получении данных текущего пользователя:', err);
        setError('Произошла ошибка при загрузке профиля');
        logout();
        navigate('/login');
      }
    };

    fetchCurrentUser();
  }, []);

  const handleTabSelect = (eventKey) => {
    if (eventKey === activeTab) {
      setActiveTab(null);
    } else {
      setActiveTab(eventKey);
    }
  };

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  };

  const handlePasswordResetCancel = () => {
    setShowPasswordReset(false);
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Загрузка...</div>;


  return (
    <div className='profile-container'>
      <div className='profile-header'>
        <h1 className='profile-title'>Личный кабинет</h1>
        <IoMdExit className='logout-button' onClick={logout}/>
      </div>

      <div className='profile-info'>
        <div className='info-item'>
          <span className='info-label'>Имя:</span>
          <span className='info-value'>{user.first_name}</span>
        </div>
        <hr />
        <div className='info-item'>
          <span className='info-label'>Фамилия:</span>
          <span className='info-value'>{user.last_name}</span>
        </div>
        <hr />
        <div className='info-item'>
          <span className='info-label'>Email:</span>
          <span className='info-value'>{user.email}</span>
        </div>
        <hr />
        <div className='info-item'>
          <span className='info-label'>Номер телефона:</span>
          <span className='info-value'>{user.phone_number}</span>
        </div>
        <hr />
        <div className='info-item'>
          <span className='info-label'>Адрес:</span>
          <span className='info-value'>{user.address}</span>
        </div>
        <hr />
        <div className='info-item'>
          <span className='info-label'>Пароль:</span>
          {showPasswordReset ? (
            <PasswordResetForm
              onReset={() => setShowPasswordReset(false)}
              onCancel={handlePasswordResetCancel}
              initialEmail={user.email}
              isAuthorized={true}
            />
          ) : (
            <>
              <span className='info-value'>{/* {user.hashed_password} */}
                <button className='reset-button button-admin-table' onClick={handlePasswordReset}><MdEdit /></button>
              </span>
            </>
          )}
        </div>
        <hr />
      </div>
      <div className='buttons_link_profile'>
        <Link to="/cart" className='custom-link'>
          Корзина
        </Link>
        <Link to="/favorites" className='custom-link'>
          Избранное
        </Link>
        <Link to="/orders" className='custom-link'>
          Заказы
        </Link>
        {isAdmin && (
        <Link to="/admin/dashboard" className='custom-link'>
          Административная панель
        </Link>
        )}
      </div>

      
      {isEmployee && (
        <div>
          <h2>Функции для сотрудника</h2>
          <Tabs
            id="admin-tabs"
            className="mb-3"
            activeKey={activeTab}
            onSelect={handleTabSelect}
          >
            <Tab eventKey="category" title="Добавить категорию" className='tab-dashboard'>
              {activeTab === "category" && (
                <>
                  <CategoryAddForm />
                </>
              )}
            </Tab>
            <Tab eventKey="manufacturer" title="Добавить производителя/поставщика" className='tab-dashboard'>
              {activeTab === "manufacturer" && (
                <>
                  <ManufacturerAddForm />
                </>
              )}
            </Tab>
            <Tab eventKey="product-info" title="Добавить информацию о продукте" className='tab-dashboard'>
              {activeTab === "product-info" && (
                <>
                  <ProductInfoAddForm />
                </>
              )}
            </Tab>
            <Tab eventKey="product" title="Добавить продукт" className='tab-dashboard'>
              {activeTab === "product" && (
                <>
                  <ProductAddForm />
                </>
              )}
            </Tab>
            <Tab eventKey="supply" title="Оформление поставки" className='tab-dashboard'>
              {activeTab === "supply" && (
                <SupplyAddForm />
              )}
            </Tab>
            <Tab eventKey="supply-item" title="Добавление товара в поставку" className='tab-dashboard'>
              {activeTab === "supply-item" && (
                <SupplyItemAddForm />
              )}
            </Tab>
          </Tabs>
          <Reports />
        </div>
      )}
    </div>
  );
}

export default Profile;