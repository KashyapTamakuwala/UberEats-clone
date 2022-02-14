/* eslint-disable camelcase */
/* eslint-disable no-new-require */
// eslint-disable-next-line new-cap
const connection = new require('./kafka/connection');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// topics files
const createRestaurant = require('./services/restaurants/create');
const loginRestaurant = require('./services/restaurants/login');
const updateRestaurant = require('./services/restaurants/update');
const addRestaurantImage = require('./services/restaurants/addImage');
const createCustomer = require('./services/customers/create');
const loginCustomer = require('./services/customers/login');
const updateCustomer = require('./services/customers/update');
const addAddress = require('./services/customers/addAddress');
const deleteCustomer = require('./services/customers/delete');
const addFavorites = require('./services/customers/addFavorites');
const deleteFavorites = require('./services/customers/deleteFavorites');
const createOrder = require('./services/orders/create');
const placeOrder = require('./services/orders/place');
const updateOrder = require('./services/orders/update');


function handleTopicRequest(topic_name, fname) {
  const consumer = connection.getConsumer(topic_name);
  const producer = connection.getProducer();
  consumer.on('message', (message) => {
    try {
      const data = JSON.parse(message.value);
      fname(data.data, (err, res) => {
        let payloads = [];
        if (err) {
          payloads = [
            {
              topic: 'response_topic',
              messages: JSON.stringify({
                correlationId: data.correlationId,
                data: err,
              }),
              partition: 0,
            },
          ];
        } else {
          payloads = [
            {
              topic: 'response_topic',
              messages: JSON.stringify({
                correlationId: data.correlationId,
                data: res,
              }),
              partition: 0,
            },
          ];
        }
        producer.send(payloads, (error) => {
          if (error) {
            console.log('Error from backend: ', JSON.stringify(error));
            return;
          }
          console.log('Sent data from backend: ', JSON.stringify(res));
        });
      });
    } catch (e) {
      const payloads = [
        {
          topic: 'response_topic',
          messages: JSON.stringify({
            data: e,
          }),
          partition: 0,
        },
      ];
      producer.send(payloads, (error, producerData) => {
        if (error) {
          console.log('Error with kafka: ', JSON.stringify(error));
          return;
        }
        console.log('Kafka backend reponse: ', JSON.stringify(producerData));
      });
    }
  });
}

mongoose.connect(
  'mongodb+srv://admin:Akash1743a@cluster0.pdnmu.mongodb.net/ubereats?retryWrites=true&w=majority',
  {
    useNewUrlParser: 'true',
    autoIndex: true,
  }
);

// Add your TOPICs here
// First argument is topic name
// Second argument is a function that will handle this topic request

handleTopicRequest('restaurant.create', createRestaurant);
handleTopicRequest('restaurant.login', loginRestaurant);
handleTopicRequest('restaurant.update', updateRestaurant);
handleTopicRequest('restaurant.addImage', addRestaurantImage);
handleTopicRequest('customer.create', createCustomer);
handleTopicRequest('customer.login', loginCustomer);
handleTopicRequest('customer.update', updateCustomer);
handleTopicRequest('customer.addAddress', addAddress);
handleTopicRequest('customer.delete', deleteCustomer);
handleTopicRequest('customer.addFavorites', addFavorites);
handleTopicRequest('customer.deleteFavorites', deleteFavorites);
handleTopicRequest('order.create', createOrder);
handleTopicRequest('order.place', placeOrder);
handleTopicRequest('order.update', updateOrder);








