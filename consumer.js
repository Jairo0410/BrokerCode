const Stomp = require('stomp-client');
const StompClient = require('stomp-client').StompClient;

const config = require('dotenv').config();

const brokerId= process.env.MQ_BROKER_ID;
const region= process.env.MQ_REGION;

function getStompHost(brokerId, region) {
    return `${brokerId}.mq.${region}.amazonaws.com`;
}

const options = {
    host: getStompHost(brokerId, region),
    port: 61614,
    user: process.env.MQ_USERNAME,
    pass: process.env.MQ_PASSWORD,
    protocolVersion: '1.1',
    tls: true
};

const vhost = true;
const reconnectOptions = {};
const tls = true;

const topic = 'rides';



/**
 * 
 * @param {StompClient} client 
 * @param {string} topic 
 */
function createSubscriber(client, topic, options){
    let subHeaders = {
        id: options.subscription,
        ack: 'client'
    };
    client.subscribe(`/queue/${topic}`, subHeaders,  (message, headers) => {

        let message_id = headers['message-id'];
        let subscription = headers['subscription'];

        if(message_id) {
            if(options.shouldAck) {
                
                setTimeout(() => {
                    client.ack(message_id, subscription);
                    console.log(`Acked message ${message} by ${subscription}`);
                }, 500);

            } else if(options.shouldNack) {
                client.nack(message_id, subscription);
                console.log(`Nacked message ${message_id} by ${subscription}`);
            }
        }
        
    });
}

function connectConsumer(subOptions, timeout) {
    let stompClient = new Stomp(options);

    stompClient.connect((sessionId) => {
        console.log('Connected to MQ');
    
        
        let subscription = Math.random().toString(16).substr(2, 8);
        subOptions.subscription = subscription;
    
        createSubscriber(stompClient, topic, subOptions);
    }, (err) => {
        console.error(`Error while connecting to consumer: ${err}`);
    });
}

let consumerTimeout = 60000;

let nackerOptions = {
    shouldAck: false,
    shouldNack: true
};

let ackerOptions = {
    shouldAck: true,
    shouldNack: false
};

//connectConsumer(ackerOptions, consumerTimeout);
connectConsumer(ackerOptions, consumerTimeout);

// setTimeout(() => process.exit(), consumerTimeout + 2000);

