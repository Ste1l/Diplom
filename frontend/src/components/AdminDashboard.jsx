import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminTable from './AdminTable';
import { API_URL } from '../js/config';
import '../style/AdminDashboard.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const { endpoint } = useParams();

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}admin/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        /* setIsAdmin(data.isAdmin); */
        setIsAdmin(data.is_admin || data.role_id === 2);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/');
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const storedTable = localStorage.getItem('currentTable');
    if (storedTable) {
      setCurrentTable(JSON.parse(storedTable));
    }
  }, []);

  const handleTableClick = (tableName, endpoint) => {
    setCurrentTable({ tableName, endpoint });
    localStorage.setItem('currentTable', JSON.stringify({ tableName, endpoint }));
  };

  const tabs = [
    { label: 'Роли', endpoint: 'roles' },
    { label: 'Пользователи', endpoint: 'users' },
    { label: 'Продукты', endpoint: 'products' },
    { label: 'Информация о продуктах', endpoint: 'product_info' },
    { label: 'Категории', endpoint: 'category' },
    { label: 'Избранные', endpoint: 'favorites' },
    { label: 'Поставщики', endpoint: 'manufacturers' },
    { label: 'Заказы', endpoint: 'orders' },
    { label: 'Подробности о заказах', endpoint: 'order_details' },
    { label: 'Поставки', endpoint: 'supplies' },
    { label: 'Подробности о поставках', endpoint: 'supply_items' },
    { label: 'Корзины', endpoint: 'cart_items' },
  ];

  if (!isAdmin) {
    return null; //не показываю ничего, если пользователь не админ
  }





  return (
    <div className="admin-dashboard">
      {isAdmin && (
        <>
          <h1>Административная панель</h1>
          <Tabs
            defaultActiveKey={endpoint || 'roles'}
            id="admin-tabs"
            className="mb-3"
            onSelect={(k) => handleTableClick(tabs.find(tab => tab.endpoint === k).label, k)}
          >
            {tabs.map(({ label, endpoint }) => (
              <Tab
                eventKey={endpoint}
                title={label}
                className='tab-dashboard'
              />
            ))}
          </Tabs>
          {currentTable && <AdminTable tableName={currentTable.tableName} endpoint={currentTable.endpoint} />}
        </>
      )}


    </div>
  );
};

export default AdminDashboard;