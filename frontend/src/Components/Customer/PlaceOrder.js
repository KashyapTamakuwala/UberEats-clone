import { FormControl } from 'baseui/form-control';
import { Select } from 'baseui/select';
import React, { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import axiosConfig from '../../axiosConfig';
import { useHistory } from 'react-router';
import { H2, H3 } from 'baseui/typography';
import { Button, KIND } from 'baseui/button';
import logo from '../../assets/images/ubereats.png';
import { ANCHOR, Drawer } from 'baseui/drawer';
import {
  ALIGN,
  HeaderNavigation,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from 'baseui/header-navigation';

import { Menu } from 'baseui/icon';
import { Modal } from 'baseui/modal';
import { Input } from 'baseui/input';
import toast from 'react-hot-toast';

function PlaceOrder({ match }) {
  const [addresses, setAddresses] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const history = useHistory();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState([]);
  const [address, setAddress] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);
  const [addressModalIsOpen, setAddressModalIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [delTypeOptions, setDelTypeOptions] = useState([]);
  const [newAddressLine, setnewAddressLine] = useState('');
  const [newZipcode, setnewZipcode] = useState(null);

  const getAddresses = () => {
    const token = localStorage.getItem('token');
    axiosConfig
      .get('/customers/address', {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setAddresses(res.data);
        const addrOpt = [];

        const temp =
          res.data.length > 0
            ? res.data.forEach((ele) => {
                addrOpt.push({
                  address: ele.address_line + ', ' + ele.zipcode,
                });
              })
            : null;
        setAddressOptions(addrOpt);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          toast.error('Session Expired! Please Login Again!');
          history.push('/customer/login');
        }
      });
  };

  const createNewAddress = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axiosConfig
      .post(
        '/customers/address',
        {
          address: newAddressLine,
          zipcode: newZipcode,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        setnewZipcode(null);
        setnewAddressLine('');
        toast.success('New Address Created');
        getAddresses();
      })
      .catch((err) => {
        if (err.response.status === 401) {
          toast.error('Session Expired! Please Login Again!');
          history.push('/customer/login');
        }
        toast.error(err.response.data.error);
      });
    setAddressModalIsOpen(false);
  };

  const getOrderDetails = () => {
    const token = localStorage.getItem('token');
    axiosConfig
      .get(`/orders/details/${match.params.oid}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        const delOpt = [];
        if (res.data.status !== 'Initialized') {
          history.push('/customer/orders');
        }
        if (res.data.delType === 'Both') {
          delOpt.push({ deliveryType: 'Pickup' });
          delOpt.push({ deliveryType: 'Delivery' });
          setDelTypeOptions(delOpt);
        } else {
          delOpt.push({ deliveryType: res?.data?.delType });
          setDelTypeOptions({ deliveryType: delOpt });
        }
        setOrderDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error('Order Not Found');
        // history.push("/customer/dashboard");
      });
  };

  const placeOrder = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (address.length > 0 && deliveryType.length > 0) {
      axiosConfig
        .put(
          '/orders/finalorder',
          {
            id: match.params.oid,
            address: address[0].address,
            type: deliveryType[0].deliveryType,
            notes,
          },
          {
            headers: { Authorization: token },
          }
        )
        .then((res) => {
          history.push('/customer/orders');
          toast.success('Order Placed!!');
        })
        .catch((err) => {
          toast.error('Error Placing Order');
        });
    } else {
      toast.error('Please select Delivery Address and Delivery Type');
    }
  };

  useEffect(() => {
    setAddressOptions([]);
    getAddresses();
    getOrderDetails();
  }, [addressModalIsOpen]);

  return (
    <div>
      <Modal isOpen={addressModalIsOpen} onClose={() => setAddressModalIsOpen(false)}>
        <div
          style={{
            paddingLeft: '50px',
            paddingRight: '50px',
            marginTop: '20px',
            textAlign: 'left',
          }}
        >
          <H3>Add New Address </H3>
          <FormControl label="Address Line">
            <Input
              id="newAddressLine"
              autoComplete="off"
              placeholder="Enter Address Line"
              value={newAddressLine}
              onChange={(e) => setnewAddressLine(e.target.value)}
            />
          </FormControl>
          <FormControl label="Zipcode">
            <Input
              id="zipcode"
              autoComplete="off"
              placeholder="Enter Zipcode"
              value={newZipcode}
              onChange={(e) => setnewZipcode(e.target.value)}
              type="number"
            />
          </FormControl>
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Button onClick={createNewAddress}> Add </Button>
          </div>
        </div>
      </Modal>
      <HeaderNavigation style={{ height: '70px' }}>
        <NavigationList $align={ALIGN.left}>
          <Button kind={KIND.minimal} onClick={() => setIsDrawerOpen(true)}>
            <Menu />
          </Button>
          <Drawer
            isOpen={isDrawerOpen}
            autoFocus
            anchor={ANCHOR.left}
            onClose={() => setIsDrawerOpen(false)}
          >
            <div style={{ marginTop: '10%' }}>
              <div style={{ marginTop: '5%' }}>
                <Button
                  style={{ width: '100%' }}
                  // onClick={() => history.push("/customer/update")}
                >
                  Update Profile
                </Button>
              </div>
              <div style={{ marginTop: '5%' }}>
                <Button style={{ width: '100%' }}> Past Orders </Button>
              </div>
              <div style={{ marginTop: '5%' }}>
                <Button style={{ width: '100%' }}> Favorites </Button>
              </div>
            </div>
          </Drawer>
          <NavigationItem>
            <a href="/customer/dashboard">
              <img src={logo} style={{ width: '100px', height: '70px' }} />
            </a>
          </NavigationItem>
        </NavigationList>
      </HeaderNavigation>
      <Row>
        <Col style={{ textAlign: 'left', paddingLeft: '50px' }}>
          <H2>{orderDetails?.restName}</H2>
          <img
            src={orderDetails?.restImage ? orderDetails.restImage : ''}
            style={{ height: '25%', width: '100%', marginRight: '10px' }}
          />
          <div style={{ width: '50%' }}>
            <div style={{ marginTop: '10px' }}>
              <FormControl>
                <Select
                  options={addressOptions}
                  value={address}
                  onChange={(e) => setAddress(e.value)}
                  valueKey="address"
                  labelKey="address"
                  placeholder="Select address"
                />
              </FormControl>
            </div>
            <Button onClick={() => setAddressModalIsOpen(true)}>Add New Address</Button>
            <div style={{ marginTop: '10px' }}>
              <FormControl>
                <Select
                  options={delTypeOptions}
                  value={deliveryType}
                  valueKey="deliveryType"
                  labelKey="deliveryType"
                  placeholder="Select delivery Type"
                  onChange={(e) => setDeliveryType(e.value)}
                />
              </FormControl>
            </div>
            <Input
              placeholder="Add Notes"
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
              clearable
            />
          </div>
        </Col>
        <Col
          xs={5}
          style={{
            backgroundColor: 'rgb(240, 239, 239)',
            paddingLeft: '35px',
            paddingRight: '35px',
          }}
        >
          <form onSubmit={placeOrder}>
            <Button
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'rgb(32, 112, 32)',
                marginTop: '70px',
              }}
            >
              Place Order
            </Button>
          </form>
          <p
            style={{
              fontSize: '12px',
              textAlign: 'left',
              marginTop: '2%',
              color: 'grey',
            }}
          >
            If you're not around when the delivery person arrives, they'll leave your order at the
            door. By placing your order, you agree to take full responsibility for it once it's
            delivered.
          </p>
          <hr />
          <Row>
            <Col style={{ textAlign: 'left' }}>
              <h6> Subtotal </h6>
              <h6> Taxes & Fees </h6>
              <h6> Delivery Fee </h6>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <h6> ${orderDetails ? orderDetails.totalOrderPrice : null} </h6>
              <h6> ${orderDetails ? orderDetails.tax : null} </h6>
              <h6> $0</h6>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col style={{ textAlign: 'left' }}>
              <h6> Total </h6>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <h6> ${orderDetails.finalOrderPrice ? orderDetails.finalOrderPrice : null} </h6>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default PlaceOrder;
