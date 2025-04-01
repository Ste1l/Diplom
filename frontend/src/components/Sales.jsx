import '../style/Sales.css';
import Card from 'react-bootstrap/Card';
import sales1 from '../img/Sales_image/sales1.png';
import sales2 from '../img/Sales_image/sales2.png';
import sales3 from '../img/Sales_image/sales3.png';


function Sales() {
    return (
        <div className='sales'>
            <h1>Акции</h1>
            <div className='sales-container'>
            <Card className='sales-item'>
                <Card.Img variant="top" src={sales1} />
                <Card.Body>
                    <Card.Title>До -20% на средства для красоты и молодости вашей кожи</Card.Title>
                    <Card.Text>
                        01 сентября 2024 - 30 сентября 2024
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className='sales-item'>
                <Card.Img variant="top" src={sales2} />
                <Card.Body>
                    <Card.Title>Скидка 10% на витамины и БАД от Maxler</Card.Title>
                    <Card.Text>
                    01 сентября 2024 - 30 сентября 2024
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className='sales-item'>
                <Card.Img variant="top" src={sales3} />
                <Card.Body>
                    <Card.Title>Скидка 20% на вторую банку Colla Gen </Card.Title>
                    <Card.Text>
                    01 сентября 2024 - 30 сентября 2024
                    </Card.Text>
                </Card.Body>
            </Card>
            </div>
        </div>
    );
}

export default Sales;