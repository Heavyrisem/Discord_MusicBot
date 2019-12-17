// Import the discord.js module
const Discord = require('discord.js');

const serverClass = require('./server/server');
// Create an instance of a Discord client
const client = new Discord.Client();

var serverMap = new Map();


client.on('ready', () => {
  console.log(client.user.username + ' I am ready!');
});



client.on('message', message => {
  if (message.member.id == client.user.id) return;
  if (serverMap.has(message.guild.id)) {
    var servert = serverMap.get(message.guild.id);
    if (servert.getmessage) {
      servert.updateMsg(message);
    }
      
  }
  if (!message.content.startsWith('!')) return;
  if (!serverMap.has(message.guild.id)) {
    try {
      serverMap.set(message.guild.id, new serverClass(client, message));
    } catch(error) {
      const errormsg = new Discord.RichEmbed()
      .setColor('#ff148e')
      .setTitle('⚠️ [server Class] 에서 오류가 발생했어요.')
      .setDescription(error)
      .setTimestamp();

      message.channel.send(errormsg);
    }
  }

  const server = serverMap.get(message.guild.id);

  try {
    var prefix = server.serversetting.prefix;
  } catch(error) {
    const errormsg = new Discord.RichEmbed()
    .setColor('#ff148e')
    .setTitle('⚠️ [Get Default Setting] 에서 오류가 발생했어요.')
    .setDescription(error)
    .setTimestamp();

    message.channel.send(errormsg);
  }

  if (message.content.startsWith(prefix + '핑')) {
    server.holdPing();
  }

  if (message.content.startsWith(prefix + '참가')) {
    server.voiceChannel.join();
  }

  if (message.content.startsWith(prefix + '나가')) {
    server.voiceChannel.leave();
  }

  if (message.content.startsWith(prefix + '상태')) {
    server.voiceChannel.now();
  }

  if (message.content.startsWith(prefix + '노래')) {
    var keyword = message.content.substring(4, message.content.length);
    if (keyword.startsWith('https://www.youtube.com') || keyword.startsWith('http://www.youtube.com')) {
      try {
        server.voiceChannel.addmusic_url(keyword);
      } catch(error) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#ff148e')
        .setTitle('⚠️ [URL 재생] 에서 오류가 발생했어요.')
        .setDescription(error)
        .setTimestamp();
    
        message.channel.send(errormsg);
      }
    } else if (keyword != '') {
      server.voiceChannel.addmusic(keyword);
    } else {
      message.channel.send('``사용법 : ' + prefix + '노래 [URL 이나 제목]``');
    }
  }

  if (message.content.startsWith(prefix + '스킵')) {
    server.voiceChannel.skip();
  }
  
  if (message.content.startsWith(prefix + '큐')) {
    server.voiceChannel.show_queue();
  }

  if (message.content.startsWith(prefix + '테스트')) {
    
    server.voiceChannel.test(message);
  }
});


client.login('NjE5NTI3MzY0MDkwNjU4ODE3.XXJh-A.uGTknJRXOKBxjzYB7jaQk_UfLUw'); 