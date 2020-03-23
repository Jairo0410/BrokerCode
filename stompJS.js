const Stomp = require('stompjs');
const config = require('dotenv').config();

function getStompHost(brokerId, region) {
    return `${brokerId}.mq.${region}.amazonaws.com`;
}

let brokerId = process.env.MQ_BROKER_ID;

console.log(`Broker: ${brokerId}`);
console.log(`passcode : ${passcode}`);
console.log(`login : ${login}`);

let region = process.env.MQ_REGION;
let login = process.env.MQ_USERNAME;
let passcode = process.env.MQ_PASSWORD;

let client = Stomp.overTCP(`${brokerId}.mq.${region}.amazonaws.com`, 61614);

console.log(`Is client connected? ${client.connected}`);

console.log('Trying to connect to MQ');

let headers = {
    login: login, 
    passcode: passcode
}

client.connect(headers, function(frame) {
    console.log('Connected to MQ');
    let destination = '/queue/rides';
    // upon connection, subscribe to the destination
    var sub = client.subscribe(destination, function(message) {
        // when a message is received, post it to the current WebWorker
        postMessage("WebWorker: " + message.body);
        //... unsubscribe from the destination
        sub.unsubscribe();
        //... and disconnect from the server
        client.disconnect();
    });
    // send the text to the destination
    client.send(destination, {}, text);
}, (err) => {
    console.error(`Error trying to connect: ${err}`);
});