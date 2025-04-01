import React, { useState, useEffect } from 'react';
import logo from '../img/logo-purple.png';
import '../style/Header.css';
import { FaRegUser } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { TbMenu2 } from "react-icons/tb";
import { BsBasket3 } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
import { IoMdExit } from "react-icons/io";
import { useAuth } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { RxHamburgerMenu } from "react-icons/rx";

const Header = () => {

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { isAuthenticated, token, user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [showMenuUser, setShowMenuUser] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [quantityCart, setQuantityCart] = useState(0);

    /* console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user); */

    useEffect(() => {
        if (isAuthenticated && token && user && user.id) {
            // fetchCartQuantity();
        } else {
            console.log('Not authenticated or missing credentials');
        }
    }, [isAuthenticated, token, user])

    // const fetchCartQuantity = async () => {
    //             try {
    //             const response = await axios.get(`${API_URL}cart-user/${user.id}`, {
    //                 headers: {
    //                 Authorization: `Bearer ${token}`
    //                 }
    //             });
    //             if('total_quantity' in response.data){
    //                 setQuantityCart(response.data.total_quantity);
    //             }
    //             setError(null);
    //             } catch (error) {
    //             console.error('Error fetching cart data:', error);
    //             setError('Произошла ошибка при загрузке данных корзины. Попробуйте обновить страницу.');
    //             }
    //         };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleCloseSearch = (e) => {
        if (e.target.classList.contains('search_mobile_div')) {
            setIsSearchOpen(false);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSubmitSearch = async (e) => {
        e.preventDefault();
        const searchTerm = e.target.elements.search.value.trim();
        if (searchTerm) {
            navigate(`/search/${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleShowMenuUser = () => {
        setShowMenuUser(!showMenuUser);
    }
    return (
        <header>
            <div className='header'>
                <div className="header-content">
                    <Link to="/">
                        <img className='logo' src={logo} alt="" />
                    </Link>
                    <form className='search' onSubmit={handleSubmitSearch}>
                        <input type="text" placeholder="Поиск" autoComplete="off" autoFocus={true} name='search' value={searchQuery}
                            onChange={handleInputChange} />
                        <button type='submit'><IoIosSearch color='white' size={25} /></button>
                    </form>
                    <ul className='user'>
                        {!isAuthenticated && (
                            <li className='user-info user-item'>
                                <Link to="/login" className="custom-link">
                                    <button>
                                        <span className='icon'><FaRegUser /></span>
                                        <span className='text'>Войти</span>
                                    </button>
                                </Link>

                            </li>
                        )}
                        {isAuthenticated && (
                            <li className='user-item' key={user.id} onMouseOver={() => setShowMenuUser(true)} onMouseOut={() => setShowMenuUser(false)}>
                                <Link to="/profile" className="custom-link user-profile">
                                    <button>
                                        <span className='icon'><FaRegUser /></span>
                                        <span className='text'>{user?.first_name || 'Выход'}</span>
                                    </button>
                                    {showMenuUser && (
                                        <div className="user-dropdown">
                                            <ul>
                                                <li>
                                                    <Link to="/orders" className='custom-link'>
                                                        Заказы
                                                    </Link>
                                                </li>
                                                <li onClick={logout}>Выйти</li>
                                            </ul>
                                        </div>
                                    )}

                                </Link>

                            </li>
                        )}

                        <li className='user-item' id='favorite_page'>
                            <Link to="/favorites" className="custom-link">
                                <button>
                                    <span className='icon'><MdFavoriteBorder /></span>
                                    <span className='text'>Избранное</span>
                                </button>
                            </Link>

                        </li>
                        <li className='user-item'>
                            <Link to="/cart" className="custom-link">
                                <button>
                                    <span className='icon'><BsBasket3 /></span>
                                    <span className='text'>Корзина</span>
                                </button>
                            </Link>
                        </li>
                    </ul>

                    <div className="menu-container">
                        <IoIosSearch className='search-mobile' size={25} onClick={toggleSearch} />
                        <div className="menu-toggle">
                            {/* {isMenuOpen ? (
                                <IoClose className='menu-close-button' onClick={toggleMenu} />
                            ) : (
                                <TbMenu2 className='menu-open-button' onClick={toggleMenu} />
                            )} */}
                            <div class="dropdown-menu-end">
                                <button class="btn border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <RxHamburgerMenu className='fs-1 color-toggle'/>
                                </button>
                                <ul class="dropdown-menu p-3">
                                    {!isAuthenticated && (
                                        <li className='my-1'>
                                            <Link to="/login" className="custom-link  d-flex align-items-center">
                                                <span className='icon-mobile'><FaRegUser /></span>
                                                <span className='text-mobile'>Войти</span>
                                            </Link>
                                        </li>
                                    )}
                                    {isAuthenticated && (
                                        <li className='my-1'>
                                            <Link to="/profile" className="custom-link d-flex align-items-center">
                                                <span className='icon-mobile'><FaRegUser /> </span>
                                                <span className='text-mobile'>{user?.first_name || 'Выход'}</span>
                                            </Link>
                                        </li>

                                    )}
                                    <li className='my-1'>
                                        <Link to="/favorites" className="custom-link d-flex align-items-center">
                                            <span className='icon-mobile'><MdFavoriteBorder /></span>
                                            <span className='text-mobile'>Избранное</span>
                                        </Link>
                                    </li>
                                    <li className='my-1'>
                                        <Link to="/cart" className='custom-link d-flex align-items-center'>
                                            <span className='icon-mobile'><BsBasket3 /></span>
                                            <span className='text-mobile'>Корзина</span>
                                        </Link>
                                    </li>
                                    <li className='my-1'>
                                        {isAuthenticated && (
                                            <Link to="" className='text-decoration-none text-black d-flex align-items-center' onClick={logout}>
                                                    <span className='icon-mobile'><IoMdExit /></span>
                                                    <span className='text-mobile'>Выйти</span>
                                            </Link>      
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* {isMenuOpen && (
                <div className={`menu-mobile ${isMenuOpen ? 'active' : ''}`}>
                    <ul className='user-mobile'>
                        {!isAuthenticated && (
                            <li className='user-info user-item-mobile'>
                                <Link to="/login" className="custom-link">
                                    <button>
                                        <span className='icon-mobile'><FaRegUser /></span>
                                        <span className='text-mobile'>Войти</span>
                                    </button>
                                </Link>
                            </li>
                        )}
                        {isAuthenticated && (
                            <li className='user-item-mobile'>
                                <Link to="/profile" className="custom-link">
                                    <button>
                                        <span className='icon-mobile'><FaRegUser /> </span>
                                        <span className='text-mobile'>{user?.first_name || 'Выход'}</span>
                                    </button>
                                </Link>
                            </li>
                        )}
                        <Link to="/favorites" className="custom-link">
                            <li className='user-item-mobile' id='favorite_page'>
                                <button>
                                    <span className='icon-mobile'><MdFavoriteBorder /></span>
                                    <span className='text-mobile'>Избранное</span>
                                </button>
                            </li>
                        </Link>
                        <Link to="/cart" className='custom-link'>
                            <li className='user-item-mobile'>
                                <button>
                                    <span className='icon-mobile'><BsBasket3 /></span>
                                    <span className='text-mobile'>Корзина</span>
                                </button>
                            </li>
                        </Link>
                        {isAuthenticated && (
                            <li className='user-item-mobile'>
                                <button onClick={logout}>
                                    <span className='icon-mobile'><IoMdExit /></span>
                                    <span className='text-mobile'>Выйти</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )} */}
            <div className={`search_mobile_div ${isSearchOpen ? 'active' : ''}`} onClick={handleCloseSearch}>
                <form className='search_mobile_form' onSubmit={handleSubmitSearch}>
                    <input type="text" placeholder="Поиск" autoсomplete="off" autoFocus={true} name='search' value={searchQuery} onChange={handleInputChange} />
                    <button type='submit'><IoIosSearch color='white' size={25} /></button>
                </form>
            </div>
        </header>

    );
};

export default Header;