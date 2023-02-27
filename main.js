import WebSocket from 'ws';
import readline from 'readline';
import { Client  } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const ws = new WebSocket("ws://127.0.0.1:8010/user/user1");

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

const client = new Client();


client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('客户端已就绪！');
    let lastMessage;

    client.on('message', message => {
      ws.send(JSON.stringify({msg: message.body}));
      lastMessage = message;
    });

    // 监听来自 WebSocket 的消息
    ws.on('message', function message(data) {
      let response = JSON.parse(data);
      console.log('', response.msg);
    
    // Send a reply to the sender of the last received WhatsApp message
    if (lastMessage && lastMessage.from) {
        client.sendMessage(lastMessage.from, response.msg);
    }
    
      sendRequest();
    });
    
});

client.initialize();