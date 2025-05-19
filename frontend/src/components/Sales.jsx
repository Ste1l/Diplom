import '../style/Sales.css';
import Card from 'react-bootstrap/Card';


function Sales() {
    return (
        <div className='sales'>
            <h1>Акции</h1>
            <div className='sales-container'>
            <Card className='sales-item'>
                <Card.Img variant="top" src="/img/Sales_image/sales1.png" />
                <Card.Body>
                    <Card.Title>До -20% на средства для красоты и молодости вашей кожи</Card.Title>
                    <Card.Text>
                        01 сентября 2024 - 30 сентября 2024
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className='sales-item'>
                <Card.Img variant="top" src="/img/Sales_image/sales2.png" />
                <Card.Body>
                    <Card.Title>Скидка 10% на витамины и БАД от Maxler</Card.Title>
                    <Card.Text>
                    01 сентября 2024 - 30 сентября 2024
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className='sales-item'>
                <Card.Img variant="top" src="/img/Sales_image/sales3.png" />
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