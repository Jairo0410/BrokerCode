const Stomp = require('stomp-client');
const StompClient = require('stomp-client').StompClient;

const config = require('dotenv').config();

const brokerId= process.env.MQ_BROKER_ID;
const region= process.env.MQ_REGION;

clientOptions = {
    username: process.env.MQ_USERNAME,
    password: process.env.MQ_PASSWORD
};

function getStompHost(brokerId, region) {
    return `${brokerId}.mq.${region}.amazonaws.com`;
}

const host = getStompHost(brokerId, region);
const connectionPort = 61614;
const protocolVersion = '1.1';
const vhost = true;
const reconnectOptions = {};
const tls = true;

const topic = 'rides';


let stompClient = new Stomp(
    host,
    connectionPort,
    clientOptions.username,
    clientOptions.password,
    protocolVersion,
    vhost,
    reconnectOptions,
    tls
);

stompClient.connect((sessionId) => {
    let counter = 1;
    setInterval(() => {
        let headers = {
            persistent: true
        };

        let message = {
            greeting: `Hello World ${counter} from publisher`
        };
        stompClient.publish(`/queue/${topic}`, JSON.stringify(message), headers);
        console.log(`Published message ${message}`);
        counter = counter + 1;
    }, 100);

    setTimeout(() => {
        stompClient.disconnect();
        process.exit();
    }, 10000);
}, (err) => {
    console.error(`Error while connecting to publisher: ${err}`);
});