const Discord = require('discord.js');
const search = require('yt-search');
const ytdl = require('ytdl-core-discord');

//const client = new Discord.Client();



function music_search (search_target, message, client) {
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

    if (err) throw err;

      const videos = r.videos;
    const playlists = r.playlists;
     const accounts = r.accounts;

    const firstResult = videos[0];
    var URL = "https://www.youtube.com/" + firstResult.url;
     console.log(URL);

     message.channel.send(message.member.nickname + ' :  ${info.title}  ' + firstResult.duration.timestamp);
        
    //console.log(videos);
    return firstResult;
}