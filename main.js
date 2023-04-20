import WebSocket from 'ws';
import readline from 'readline';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const ws = new WebSocket("ws://127.0.0.1:8010/user/user1"); // Listening Websocket server
const { Client, LocalAuth } = pkg;

ws.on('error', console.error);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendRequest() {
  rl.question('', (value) => {
    const request = {
      msg: value
    };

    ws.send(JSON.stringify(request));
  });
}

// Save whatsapp session to .wwebjs_auth directory
const client = new Client({
  authStrategy: new LocalAuth()
});


// QR code generation
client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});


// Prompt successful to console when connected
client.on('ready', () => {
    console.log('Client Ready');
    const messageMap = new Map();

  // Send JSON message to websocket server 
    client.on('message', message => {
    ws.send(JSON.stringify({msg: message.body, from: message.from}));
    messageMap.set(message.from, message);
  });

    // Listening message from WebSocket 
    ws.on('message', function message(data) {
      let response = JSON.parse(data);
      console.log('', response.msg);
    
    const lastMessage = messageMap.get(response.from);
      
    // Send a reply to the sender of the last received WhatsApp message
    if (lastMessage && lastMessage.from) {
        client.sendMessage(lastMessage.from, response.msg);
    }
    
    //Initialzation 
      sendRequest();
    });
    
});

client.initialize();
