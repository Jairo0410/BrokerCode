const stomp = require('node-stomp');
const config = require('dotenv').config();

function getStompHost(brokerId, region) {
    return `${brokerId}.mq.${region}.amazonaws.com`;
}
 
// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
let stomp_args = {
    port: 61614,
    host: getStompHost(process.env.MQ_BROKER_ID, process.env.MQ_REGION),
    debug: true,
    login: process.env.MQ_USERNAME,
    passcode: process.env.MQ_PASSWORD,
};

let client = new stomp.Stomp(stomp_args);
 
// start connection with active-mq
client.connect();
 
client.on('connected', function () {
    console.log('[AMQ] Connected');

    // 'activemq.prefetchSize' is optional.
    // Specified number will 'fetch' that many messages
    // and dump it to the client.
    let headers = {
        destination: '/queue/rides',
        ack: 'client-individual',
        // 'activemq.prefetchSize': '10'
    };

    client.subscribe(headers);
});
 
client.on('disconnected', function () {
    console.log('[AMQ] Disconnected');
});
 
client.on('message', function (message) {
    console.log("received message : " + message.body[0]);
    client.ack(message.headers['message-id']);
});
 
client.on('error', function (error_frame) {
    console.log('[AMQ] message : ' + error_frame);
    client.disconnect();
});