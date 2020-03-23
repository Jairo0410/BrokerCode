const amqp = require('rhea');

const config = require('dotenv').config();

let brokerId = process.env.MQ_BROKER_ID;
let user = process.env.MQ_USERNAME;
let password = process.env.MQ_PASSWORD;
let region = process.env.MQ_REGION;
let port = 5671;


let host = `${brokerId}.mq.${region}.amazonaws.com`;

let connOpts = {
    connection_details: () => ({
        host: host,
        port: port,
        transport: "tls",
    }),
    reconnect: true,
    username: user,
    password: password
};

// console.log(amqp.ConnectionEvents);

let conn = amqp.connect(connOpts);

conn.addListener('connection_open', () => {
    console.log('Connection was openned');

    let receiverOpts = {
        source: 'rides',
        autoaccept: false
    };

    let sub1 = conn.open_receiver(receiverOpts);
    let sub2 = conn.open_receiver(receiverOpts);

    sub1.on('message', (data) => {
        console.log('Message received:');
        
        let message = data.message;
        let delivery = data.delivery;

        console.log(`Message arrived ${JSON.stringify(message)}`);

        //let msg = JSON.parse(message.body);
        delivery.release();
        console.log('Released by sub1');
    });

    sub2.on('message', (data) => {
        console.log('Message received:');
        
        let message = data.message;
        let delivery = data.delivery;

        console.log(`Message arrived ${JSON.stringify(message)}`);

        //let msg = JSON.parse(message.body);
        delivery.accept();
        console.log('Accepted by sub2');
    });
});

conn.addListener('connection_close', () => {
    console.log('Connection closed');
});

conn.addListener('protocol_error', (err) => {
    console.error(`Protocol error ${err}`);
});

conn.addListener('error', (err) => {
    console.error(`An error ocurred: ${err}`);
});

conn.addListener('disconnected', (err) => {
    //console.log(err);
    console.log('Connection disconnected');
});

conn.addListener('connection_error', (err) => {
    //console.error(`Error when connecting:`);
    console.log(err);
});

conn.addListener('settled', () => {
    console.log('Something was settled');
})