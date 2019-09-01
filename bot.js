const Discord = require('discord.js');
const config = require('./config.js');
 
const client = new Discord.Client();

var prefix = config.prefix;
var voiceRoomName = 'None';
var voiceRoomTemp;  // 연결된 방 정보를 저장
var activity = '명령어 beta';

client.on('ready', () => {
  console.log(client.user.tag + ' 봇 실행');
  client.user.setActivity(activity);
})
 



client.on('message', message => {
  if(message.channel.type == 'dm') return;

  if(message.content == '삐이이') {
    message.channel.send('요오오오오옹');
  }

  if(!message.content.startsWith(prefix)) return;


 
  if(message.content.startsWith(prefix + '핑')) {
    message.channel.send('현재 지박령 핑 상태에요 : ' + client.ping);
  }

  if(message.content.startsWith(prefix + 'join') || message.content.startsWith(prefix + '참가') || message.content.startsWith(prefix + 'ㅓㅐㅑㅜ')) {
     if(message.member.voiceChannel && voiceRoomName == 'None' || !(message.member.voiceChannel == voiceRoomTemp)) { // 이미 참가했는지 확인
      //roomName = message.member.voiceChannel;
      message.member.voiceChannel.join()
        .then(connection => {
          voiceRoomTemp = connection.channel; //연결과 동시에 방 정보 저장
          voiceRoomName = connection.channel.name;
          message.channel.send(voiceRoomName + ' 에 연결했어요');
          client.user.setActivity(voiceRoomName);
        });

      client.user.setActivity(voiceRoomName);
    } else if(!(voiceRoomName == 'None')) { // 이미 참가함
      message.channel.send('이미 ' + voiceRoomName + ' 에 연결되어 있어요');
    } else {  // 사용자 없음
      message.channel.send('어디에 들어가야 할지 모르겠어요');
    }
  }

  if(message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) {
    voiceRoomTemp = ''; //나갈때 방 정보 초기화
    voiceRoomName = 'None';
    message.member.voiceChannel.leave();
    message.channel.send('방에서 나갔어요');
    client.user.setActivity(activity);
  }

  if(message.content.startsWith(prefix + '상태') || message.content.startsWith(prefix + 'status')) {
    message.channel.send('지박령은 지금 ' + voiceRoomName + ' 에 연결되어 있고 핑 : '+ client.ping + 'ms, ' + activity + ' 플레이 중 입니다.');
  }
});
console.log("토큰 : " + process.env.DISCORD_TOKEN);
client.login(config.token);