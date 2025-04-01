import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FIELD_TYPES } from '../constants/field_types';
import '../style/AdminTable.css';
import '../style/forms.css';
import { TiDelete } from "react-icons/ti";
import { MdEdit } from "react-icons/md";
import { API_URL } from '../js/config';
import { IoMdRefresh } from "react-icons/io";

const AdminTable = ({ tableName, endpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchColumn, setSearchColumn] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}admin/${endpoint}`);
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      setLoading(false);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}admin/${endpoint}/delete/${id}`);
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
    } catch (err) {
      setError('Ошибка при удалении записи');
    }
  };

  const handleAdd = async (newData) => {
    try {

      const formattedData = {};

      Object.entries(newData).forEach(([key, value]) => {
        switch (FIELD_TYPES[endpoint][key]) {
          case 'number':
            formattedData[key] = parseFloat(value);
            break;
          case 'date':
            formattedData[key] = value;
            break;
          default:
            formattedData[key] = value.trim();
        }
      });

      console.log("Отправляемые данные:", formattedData);

      /* const filteredData = Object.fromEntries(
        Object.entries(formattedData).filter(([key]) => !['id', 'order_date', 'supply_date', 'added_at', 'registered_at'].includes(key))
      ); */

      const response = await axios.post(`${API_URL}admin/${endpoint}/add`, {
        endpoint: endpoint,
        data: formattedData
      });
      console.log(response.data.item)
      setData([...data, response.data.item]);
    } catch (err) {
      setError('Ошибка при добавлении записи');
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'string') {
      return value.length > 50 ? `${value.slice(0, 47)}...` : value;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }
    if (typeof value === 'number') {
      return value.toFixed(0);
    }
    return value;
  };

  const filteredData = () => {
    if (!searchColumn || !searchValue) return data;
    return data.filter(item => 
      String(item[searchColumn]).toLowerCase().includes(searchValue.toLowerCase())
    );
  };
  

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleUpdate = async (updatedData) => {
    try {
      console.log('Исходные данные:',updatedData);
      const formattedData = {};

      Object.entries(updatedData).forEach(([key, value]) => {
        // console.log(`Обработка поля ${key}:`, {
        //   value,
        //   type: typeof value,
        //   isNull: value === null,
        //   isUndefined: value === undefined,
        //   isString: typeof value === 'string'
        // });

        switch (FIELD_TYPES[endpoint][key]) {
          case 'number':
            formattedData[key] = parseFloat(value);
            break;
          case 'date':
            formattedData[key] = value;
            break;
          case 'boolean':
            formattedData[key] = value === 'true' || value === true;
            break;
          default:
            formattedData[key] = value;
        }
      });

      console.log("Sending update data:", formattedData);

      const response = await axios.put(`${API_URL}admin/${endpoint}/update/${selectedItem.id}`, {
        endpoint: endpoint,
        data: formattedData
      });
      const newData = data.map(item => 
        item.id === selectedItem.id ? response.data : item
      );
      setData(newData);
      setShowEditForm(false);
    } catch (err) {
      setError('Ошибка при обновлении записи');
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredData().length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className={`page-btn ${currentPage === 1 ? 'active-pagination' : ''}`}
        >
          Первая
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`page-btn ${currentPage === number ? 'active-pagination' : ''}`}
          >
            {number}
          </button>
        ))}
        <button 
          onClick={() => setCurrentPage(pageNumbers.length)}
          disabled={currentPage === pageNumbers.length}
          className={`page-btn ${currentPage === pageNumbers.length ? 'active-pagination' : ''}`}
        >
          Последняя
        </button>
      </div>
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!data.length) return <div>Значений нет</div>;

  return (
    <div className='admin-table-container'>
      <h2>Управление {tableName}</h2>
      <div className="search-container">
        <select 
          value={searchColumn} 
          onChange={(e) => setSearchColumn(e.target.value)}
        >
          <option value="">Выберите колонку для поиска</option>
          {Object.keys(data[0]).map((key, index) => (
            <option key={index} value={key}>{key}</option>
          ))}
        </select>
        <input 
          type="text" 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Введите значение для поиска"
        />
        <button 
          className="add-button"
          onClick={toggleAddForm}
        >
          {showAddForm ? 'Скрыть' : 'Добавить'}
        </button>
        <button className="add-button" onClick={handleRefresh}><IoMdRefresh /></button>
      </div>
      {showAddForm && (
        <AddForm 
          data={data} 
          onAdd={handleAdd} 
          endpoint={endpoint} 
          fieldTypes={FIELD_TYPES} 
        />
      )}
      {showEditForm && (
        <EditForm 
          item={selectedItem} 
          onUpdate={handleUpdate} 
          endpoint={endpoint} 
          fieldTypes={FIELD_TYPES} 
        />
      )}
      <table className='table-admin'>
        <thead>
          <tr>
            {Object.keys(data[0]).map((key, index) => (
              <th key={index}>{key} </th>
            ))}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
        
        {data.length ? (
      filteredData().slice(indexOfFirstItem, indexOfLastItem).map((row, index) => (
        <tr key={index}>
          {Object.values(row).map((value, index) => (
            <td key={index}>{formatValue(value)}</td>
          ))}
          <td>
            <button className='reset-button button-admin-table' onClick={() => handleDelete(row.id)}><TiDelete /></button>
            <button className='reset-button button-admin-table' onClick={() => handleEdit(row)}><MdEdit /></button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="100%" style={{ textAlign: 'center' }}>Значений нет</td>
      </tr>
    )}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
};

const AddForm = ({ data, onAdd, endpoint, fieldTypes }) => {
  const [newData, setNewData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredData = Object.fromEntries(
      Object.entries(newData).filter(([key]) => !['id', 'order_date', 'supply_date', 'added_at', 'registered_at'].includes(key))
    );
    onAdd(filteredData);
    setNewData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData({ ...newData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      {Object.keys(data[0]).map((key, index) => {
        if (['id', 'order_date', 'supply_date', 'added_at', 'registered_at'].includes(key)) {
          return null;
        }
        return (
          <div key={index} className='input-container'>
            <input
              type={fieldTypes[endpoint][key]}
              id={key}
              name={key}
              value={newData[key] || ''}
              onChange={handleChange}
            />
            <label className="input-label" htmlFor={key}>{key}</label>
          </div>
        );
      })}
      <button type="submit">Добавить</button>
    </form>
  );
};

const EditForm = ({ item, onUpdate, endpoint, fieldTypes }) => {
  const [updatedData, setUpdatedData] = useState(item);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(updatedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData(prevData => ({ ...prevData, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className='form_add'>
      {Object.keys(item).map((key, index) => (
        <div key={index} className='input-container'>
          <input
            type={fieldTypes[endpoint][key]}
            id={key}
            name={key}
            value={updatedData[key]}
            onChange={handleChange}
            placeholder=''
          />
          <label className="input-label" htmlFor={key}>{key}</label>
          
        </div>
      ))}
      <button type="submit">Обновить</button>
    </form>
  );
};





export default AdminTable;