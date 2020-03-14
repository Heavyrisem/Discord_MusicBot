// 35.190.232.202
// Import the discord.js module

//main NjE3MzEwMzY1OTE4ODIyNDIx.XWuI4w.MSdZ8LorBxaKMAIzYA-68L1WCto
//beta NjE5NTI3MzY0MDkwNjU4ODE3.XXJh-A.uGTknJRXOKBxjzYB7jaQk_UfLUw
const Discord = require('discord.js');
const Token = 'NjE3MzEwMzY1OTE4ODIyNDIx.XWuI4w.MSdZ8LorBxaKMAIzYA-68L1WCto';

const serverClass = require('./server/server');
// Create an instance of a Discord client
const client = new Discord.Client();



var serverMap = new Map();


client.on('ready', () => {
  console.log(client.user.username + ' I am ready!');
});



client.on('message', message => {
  if (message.member.id == client.user.id) return;


  if (message.content.startsWith == '오리') {
    message.channel.send('꽤애액🦆🦆🦆🦆🦆🦆');
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

  var server = serverMap.get(message.guild.id);

  if (server.getmessage) {
    server.updateMsg(message);
  }

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

  if (message.content.startsWith(prefix + '틱')) {
    server.voiceChannel.fun.funAction('Tick', message);
  }
  if (message.content.startsWith(prefix + '이이')) {
    server.voiceChannel.fun.funAction('EE', message);
  }
  if (message.content.startsWith(prefix + '업보킹')) {
    server.voiceChannel.fun.funAction('eoajfl', message);
  }
  if (message.content.startsWith(prefix + '테스트')) {
    server.voiceChannel.test();
  }

  if (message.content.startsWith(prefix + '핑')) {
    server.Ping(message);
  }

  if (message.content.startsWith(prefix + '참가')) {
    server.voiceChannel.join(message);
  }

  if (message.content.startsWith(prefix + '나가')) {
    server.voiceChannel.leave(message);
  }

  if (message.content.startsWith(prefix + '상태')) {
    server.voiceChannel.now(message);
  }

  if (message.content.startsWith(prefix + '노래')) {
    if (message.member.voiceChannel == undefined) return message.channel.send('``먼저 음성 채널에 접속해 주세요.``');
    var keyword = message.content.substring(4, message.content.length);
    if (keyword.startsWith('https://www.youtube.com') || keyword.startsWith('http://www.youtube.com')) {
      try {
        server.voiceChannel.addmusic_url(keyword, message);
      } catch(error) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#ff148e')
        .setTitle('⚠️ [URL 재생] 에서 오류가 발생했어요.')
        .setDescription(error)
        .setTimestamp();
    
        message.channel.send(errormsg);
      }
    } else if (keyword != '') {
      server.voiceChannel.addmusic(message, keyword);
    } else {
      message.channel.send('``사용법 : ' + prefix + '노래 [URL 이나 제목]``');
    }
  }

  if (message.content.startsWith(prefix + '스킵')) {
    if (!isNaN(message.content.substring(4, message.content.length))) 
      server.voiceChannel.skip(message.content.substring(4, message.content.length), message);
    else
      server.voiceChannel.skip(message);
  }
  
  if (message.content.startsWith(prefix + '정지')) {
    server.voiceChannel.stop(message);
  }

  if (message.content.startsWith(prefix + '큐')) {
    server.voiceChannel.show_queue(message);
  }

  if (message.content.startsWith(prefix + '볼륨')) {
    if (isNaN(message.content.substring(4, message.content.length))) return message.channel.send('``사용법 : 볼륨 [숫자]``');
    server.voiceChannel.setvolume(message.content.substring(4, message.content.length), message);
  }

  if (message.content.startsWith(prefix + '스팀')) {
    var search = message.content.substring(3, message.content.length);
    if (search == undefined) return message.channel.send('``스팀 [검색어]``');
    server.Utility.steamSearch(search).then(result => {
      if (result == undefined) return message.channel.send('``검색 결과가 없습니다.``');
      var price;
      if (result.gameprice[0] == 0) price = '무료';
      else if (result.gameprice[0] == undefined) price = '미정';
      else price = result.gameprice[0] + '원';
      

      const steamgame = new Discord.RichEmbed()
      .setColor('#ff148e')
      .setTitle(result.gametitle[0])
      .setThumbnail(result.gameimgURL[0])
      .addField('출시일자', result.gamerelesed[0])
      .addField('가격', price)
      .setFooter('지원 os ,' + result.gameplatform[0]);

      message.channel.send(steamgame);
    });
  }

  if (message.content.startsWith(prefix + '리셋')) {
    server = '';
  }

  if (message.content.startsWith(prefix + '업타임')) {
    message.channel.send('``' + client.uptime/60/10 + '``');
  }
  
  if (message.content === prefix + '재시작 DHQUDALS') {
    message.delete().then(() => {
      console.log('수동 재시작 : ', message.member.user.username);
      message.channel.send('``⚠️ 수동 재시작을 시작합니다. \n디스코드 봇 클라이언트가 정지되고, 재시작까지 최대 30초가 소요됩니다.``').then(() => {
      client.destroy().then(() => {process.exit()});
      });
    });
  }

});


client.login(Token); 
