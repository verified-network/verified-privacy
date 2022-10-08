import React from 'react';
import {Row, Col} from 'react-bootstrap';
import './carousel.css';
import Alerts from 'components/layouts/Common/Alerts';

class Carousel extends React.Component {
  render() {
    const items = this.props.items ?? [];

    return (
      <Row className='mt-3'>
        <Col xs={12} sm={5} md={4} lg={4} xl={2}>
          <Alerts/>
        </Col>

        <Col className='container currencies-group' xs={12} sm={7} md={8} lg={8} xl={10}>
          <Row className='text-center p-2'>
            {items.map((item, index) => {
              return (
                <Col key={index} xs={4} md={3} lg={2} className= 'card carousel-card m-1'>
                  <p>{item.name}</p>
                  <p>{item.value}</p>
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Carousel;
