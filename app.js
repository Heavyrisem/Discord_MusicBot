/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');

const server = require('./server/server');
// Create an instance of a Discord client
const client = new Discord.Client();

var serverMap = new Map();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});


// Create an event listener for messages
client.on('message', message => {
  // If the message is "ping"
  if (message.content === '테스트') {
    if (!serverMap.has(message.guild.id)) {
      try {
        serverMap.set(message.guild.id, new server(client, message));
      } catch(error) {
        errorhandler(error, message)
      }
    }
    var d = serverMap.get(message.guild.id);
    d.join(message);
    d.holdPing();
  }
  return;
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjE5NTI3MzY0MDkwNjU4ODE3.XXJh-A.uGTknJRXOKBxjzYB7jaQk_UfLUw'); 