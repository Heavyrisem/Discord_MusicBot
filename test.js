const Discord = require('discord.js');

var client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    console.log(msg.content, !isNaN(msg.content), Number.isInteger(msg.content));
});

function test() {
    client.removeAllListeners("message");
}

client.login('NjE5NTI3MzY0MDkwNjU4ODE3.XXJh-A.uGTknJRXOKBxjzYB7jaQk_UfLUw');