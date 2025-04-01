import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';
import '../style/Reports.css';

function OrderReport() {
  const [startDateSales, setStartDateSales] = useState('');
  const [endDateSales, setEndDateSales] = useState('');
  const [startDateSupplies, setStartDateSupplies] = useState('');
  const [endDateSupplies, setEndDateSupplies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}api/report_sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDateSales,
          end_date: endDateSales
        })
      });
      
      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Данные ошибки:', errorData);
        throw new Error(errorData.detail || 'Ошибка при загрузке отчёта');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Ошибка при загрузке отчёта:', error);
      alert(`Произошла ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}api/report_supplies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDateSupplies,
          end_date: endDateSupplies
        })
      });
      
      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Данные ошибки:', errorData);
        throw new Error(errorData.detail || 'Ошибка при загрузке отчёта');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Ошибка при загрузке отчёта:', error);
      alert(`Произошла ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  if (error) return <div>{error}</div>;
  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="report-container">
      <div className='report-sales'>
        <div className="report-header">
          <h2>Отчет о продажах</h2>
        </div>
        
        <div className="report-filters">
          <div className="date-input">
            <label>Дата с:</label>
            <input
              type="date"
              value={startDateSales}
              onChange={(e) => setStartDateSales(e.target.value)}
            />
          </div>
          
          <div className="date-input">
            <label>Дата по:</label>
            <input
              type="date"
              value={endDateSales}
              onChange={(e) => setEndDateSales(e.target.value)}
            />
          </div>
        </div>
          <button
              onClick={loadOrders}
              disabled={loading}
              className="report-button"
            >
              {loading ? 'Загрузка...' : 'Сформировать отчет'}
            </button> 
        
      </div>

      <div className='report-supplies'>
        <div className="report-header">
          <h2>Отчет о поставках</h2>
        </div>
        
        <div className="report-filters">
          <div className="date-input">
            <label>Дата с:</label>
            <input
              type="date"
              value={startDateSupplies}
              onChange={(e) => setStartDateSupplies(e.target.value)}
            />
          </div>
          
          <div className="date-input">
            <label>Дата по:</label>
            <input
              type="date"
              value={endDateSupplies}
              onChange={(e) => setEndDateSupplies(e.target.value)}
            />
          </div>
        </div>
        <button
            onClick={loadSupplies}
            disabled={loading}
            className="report-button"
          >
            {loading ? 'Загрузка...' : 'Сформировать отчет'}
          </button>
      </div>
    </div>
  );
}

export default OrderReport;