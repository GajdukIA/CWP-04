const net = require('net');
const fs = require('fs');
//const path=require('path');
const port = 8124;
const string = 'QA';
const bad = 'DEC';
const good = 'ACK';
let arr=[];
let counter=1;
const path = require('path');
const client = new net.Socket();
let currentIndex = -1;
client.setEncoding('utf8');

let questions = [];
client.connect({port: port, host: '127.0.0.1'}, () => {
    client.write("REMOTE");
});

client.on('data', (data) => {
    if (data === bad)
        client.destroy();
    if (data === good) {
        //console.log("COPY;"+process.argv[2]+";"+process.argv[3]);
        client.write("COPY;"+process.argv[2]+";"+process.argv[3]);
    }

    
    if (data==="DONE"){
        client.write("ENCODE;"+process.argv[2]+";"+process.argv[3]+";MYTOPKEY");
    }
    if (data==="CODED"){
        client.write("DECODE;"+process.argv[2]+";"+process.argv[3]+";MYTOPKEY");
    }
});


client.on('close', function () {
    console.log('Connection closed');
});

