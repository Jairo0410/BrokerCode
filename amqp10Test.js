const Client = require('amqp10').Client;
const Policy = require('amqp10').Policy;

const config = require('dotenv').config();

let brokerId = process.env.MQ_BROKER_ID;
let user = process.env.MQ_USERNAME;
let password = process.env.MQ_PASSWORD;
let region = process.env.MQ_REGION;
let port = 5671;

let client = new Client(Policy.merge({
    senderLinkPolicy: {
        callbackPolicy: Policy.Utils.SenderCallbackPolicies.OnSent
    }
}, Policy.DefaultPolicy));

let url = `amqps://${user}:${password}@${brokerId}.mq.${region}.amazonaws.com:${port}`;

client.connect(url).then(() => {
    console.log('Connected to MQ');
}).catch((err) => {
    console.error(err);
});