const Discord = require('discord.js');
const config = require('./config.js');
const search = require('yt-search');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

var prefix = config.prefix;
var voiceRoomName = 'None';
var voiceRoom;  // 연결된 방 정보를 저장
var activity = '명령어 alpha';

client.on('ready', () => {
  console.log(client.user.tag + ' 봇 실행');
  client.user.setActivity(activity);
})
 


function music_search (search_target, message) {
    if (search_target == '') {
      message.reply('!노래 <검색할 이름> 으로 사용할수 있어요');
      return;
    }
    if (voiceRoomName == 'None') {
      message.member.voiceChannel.join()
        .then(connection => {
          voiceRoom = connection; //연결과 동시에 방 정보 저장
          voiceRoomName = voiceRoom.channel.name;
          message.channel.send(voiceRoomName + ' 에 연결했어요');
          client.user.setActivity(voiceRoomName);
        });
    }
    message.reply(search_target + ' 을(를) 검색해요');

    search(search_target, function (err, r) {
        if (err) throw err;

        const videos = r.videos;
        const playlists = r.playlists;
        const accounts = r.accounts;

        const firstResult = videos[0];
        async (client, message, args, ops) => {
          var URL = "https://www.youtube.com/" + firstResult.url;
          console.log(URL);
          let info = await ytdl.getInfo(URL);
          let dispatcher = await connection.play(ytdl(URL, { filter: 'audioonly'}));

          message.channel.send(message.member.nickname + ' :  ${info.title}  ' + firstResult.duration.timestamp);
        }
        //console.log(videos);
        return firstResult;
    })
}



client.on('message', message => {
  if(message.channel.type == 'dm') return;

  if(message.content == '삐이이') {
    message.channel.send('요오오오오오오오오오오오오오옹');
  }

  if(!message.content.startsWith(prefix)) return;
 
  if(message.content.startsWith(prefix + '핑')) {
    message.channel.send('현재 지박령 핑 상태에요 : ' + client.ping);
  }

  if(message.content.startsWith(prefix + '노래')) {
    //music_search(message.content.substring(3, message.content.length), message);\
    message.reply('아직 음악 기능이 활성화 되지 않았어요, 개발자한테 돈주면 더빨리해요');
  }


  // 오류 발생
  if(message.content.startsWith(prefix + '테스트')) {
    var test = message.channel.type;
    //message.reply(servers[message.guild.id]);
    //if (message.content == 'tt') message.reply('undefined 확인');
   // console.log(voiceRoom.channel.name);
  }




  if(message.content.startsWith(prefix + 'join') || message.content.startsWith(prefix + '참가') || message.content.startsWith(prefix + 'ㅓㅐㅑㅜ')) {
     if(message.member.voiceChannel && voiceRoomName == 'None' || !(message.member.voiceChannel == voiceRoom.channel)) { // 이미 참가했는지 확인
      //roomName = message.member.voiceChannel;
      message.member.voiceChannel.join()
        .then(connection => {
          voiceRoom = connection; //연결과 동시에 방 정보 저장
          voiceRoomName = voiceRoom.channel.name;
          message.channel.send(voiceRoomName + ' 에 연결했어요');
          client.user.setActivity(voiceRoomName);
        });
        return;
    } else if(!(voiceRoomName == 'None')) { // 이미 참가함
      message.channel.send('이미 ' + voiceRoomName + ' 에 연결되어 있어요');
      return;
    } else {  // 사용자 없음
      message.reply('어디에 들어가야 할지 모르겠어요');
      return;
    }
  }

  if((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && !(voiceRoomName == 'None')) {
    voiceRoom.disconnect();
    message.channel.send('방에서 나갔어요');
    voiceRoom = ''; //나갈때 방 정보 초기화
    voiceRoomName = 'None';
    client.user.setActivity(activity);
    return;
  } else if ((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && voiceRoomName == 'None'){
    message.reply('들어가 있는 방이 없어요');
    return;
  }

  if(message.content.startsWith(prefix + '상태') || message.content.startsWith(prefix + 'status')) {
    message.channel.send('지박령은 지금 ' + voiceRoomName + ' 에 연결되어 있고 핑 : '+ client.ping + 'ms, ' + activity + ' 플레이 중 입니다.');
  }
});
client.login(config.token);