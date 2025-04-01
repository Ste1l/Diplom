import React, { } from 'react';

import '../style/Footer.css';
import { IoIosMail } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { BsFillTelephoneFill } from "react-icons/bs";

const Footer = () => {

    return (
        <footer className="footer">
            <div className="contain">
                <div className="col">
                    <h1>Информация</h1>
                    <ul>
                        <li>О нас</li>
                        <li>Юридическая информация</li>
                        <li>Лицензии</li>
                        <li>Блог</li>
                    </ul>
                </div>
                <div className="col">
                    <h1>Помощь</h1>
                    <ul>
                        <li>Как сделать заказ</li>
                        <li>Обмен и возврат</li>
                        <li>Часто задаваемые вопросы</li>
                        <li>Обратная связь</li>
                        <li>Где получить заказ</li>
                        <li>Оплата</li>
                    </ul>
                </div>
                <div className="col">
                    <h1>Контакты</h1>
                    <ul>
                        <li><BsFillTelephoneFill /> 7(999)999-99-99</li>
                        <li><FaLocationDot /> г.Ижевск, ул.Ленина 68</li>
                        <li><IoIosMail /> apteka@mail.ru</li>
                    </ul>
                </div>
                <div className="clearfix"></div>
            </div>
        </footer>
    );
};



export default Footer;