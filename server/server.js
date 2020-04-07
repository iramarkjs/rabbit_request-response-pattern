#!/usr/bin/env node
const EventEmitter = require('events');
var amqp = require('amqplib/callback_api');

const emmiter = new EventEmitter();

let url = {
    protocol: 'amqp',
    username: 'rabbitmq',
    password: 'rabbitmq',
    // hostname: 'rabbit',
    hostname: 'localhost',
    port: 5672,
    vhost: '/'
};

const object = {
    id: 5,
    price: 15
}

function getObject(id) { 

    if (id == object.id) 
        return object
    else 
        return "Object not found"
}

setInterval(updateObj, 10000)

amqp.connect(url, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'rpc_queue';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests');
        channel.consume(queue, function reply(msg) {
            var id = parseInt(msg.content.toString());

            console.log(" [.] id = %d", id);

            var r = getObject(id);

            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify(r),'utf-8'), {
                    correlationId: msg.properties.correlationId
                });
            
            emmiter.on('change object', obj => {
            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify(r),'utf-8'), {
                    correlationId: msg.properties.correlationId
                });
            });

            channel.ack(msg);
        });
    });
});

function trigger (object) {
    emmiter.emit('change object', object)
}

function updateObj() {
    object.price = Math.floor(Math.random() * Math.floor(10))
    trigger(object)
}