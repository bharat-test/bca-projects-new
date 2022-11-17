const { Client,List, Buttons } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }else if (msg.body === '!buttons') {
        let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }
    else if(msg.body=="order"){
        const section = {
            title: 'test',
            rows: [
              {
                title: 'Test 1',
              },
              {
                title: 'Test 2',
                id: 'test-2'
              },
              {
                title: 'Test 3',
                description: 'This is a smaller text field, a description'
              },
              {
                title: 'Test 4',
                description: 'This is a smaller text field, a description',
                id: 'test-4',
              }
            ],
          };

       const list = new List('test', 'click me', [section], 'title', 'footer')
       client.sendMessage(msg.from,list);
    }
    else if(msg.body=="button-reply"){
      const buttons_reply = new Buttons('test', [{body: 'Test', id: 'test-1'},{body: "Test 2", url: "https://wwebjs.dev"},{body: "Test 2 Call", url: "+1 (234) 567-8901"},{body:'bt3'},{body:'bt5',id:'btn5-id'}], 'title', 'footer') // Reply button
      client.sendMessage(msg.from, buttons_reply);
    }
    
})

client.initialize();