import React, { useState } from 'react';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './style/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ProductCarousel from './components/ProductCarousel';
import Sales from './components/Sales';
import AuthComponent from './components/AuthComponent';
import { AuthProvider } from './Context/AuthContext';
import RegisterComponent from './components/RegisterComponent';
import CardProduct from './components/CardProduct';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Favorites from './components/Favorites';
import SearchResults from './components/SearchResults';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import Orders from './components/Orders';
import NotificationBar from './components/NotificationBar';
import { NotificationProvider } from './Context/NotificationContext';
import Footer from './components/Footer';

function App() {

  const [errorNotification, setErrorNotification] = useState(null);

  return (
    <Router>
        <AuthProvider>
          <NotificationProvider>
          <div className="App min-vh-100 d-flex flex-column">
            <div className='container'>
            <Header /> 
            </div>
              
            <main className='container mt-5 pt-5 flex-grow-1 mb-5'>
              <Routes>
                <Route path="/" element={
                  <div>
                    <ProductCarousel />
                    <Sales />
                  </div>
                } />
                <Route path='/login' element={<AuthComponent setErrorNotification={setErrorNotification}/>} />
                <Route path='/register' element={<RegisterComponent />} />
                <Route path="/products/:id" element={<CardProduct />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/search/:query" element={<SearchResults />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/payment" element={<PaymentForm />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/orders" element={<Orders />} />
              </Routes>
            </main>
            <footer className='container-fluid p-0 mt-auto'>
            <Footer />
            </footer>
            
            <NotificationBar/>
          </div>
          </NotificationProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;