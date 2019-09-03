// https://gabrieltanner.org/blog/dicord-music-bot

const Discord = require('discord.js');
const config = require('./config.js');
const musicPlayer = require('./music.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const queue = new Map();

var prefix = config.prefix;
var voiceRoomName = 'None';
var voiceRoom;  // 연결된 방 정보를 저장
var activity = '명령어 beta';

client.on('ready', () => {
  console.log(client.user.tag + ' 봇 실행');
  client.user.setActivity(activity);
})
 




client.on('message', message => {
  if(message.channel.type == 'dm') return;
  if(message.content == '삐이이') {
    message.channel.send('요오오오오오오오오오오오오오옹');
    return;
  }
  if(!message.content.startsWith(prefix)) return;
 
  if(message.content.startsWith(prefix + '핑')) {
    message.channel.send('현재 지박령 핑 상태에요 : ' + client.ping);
    return;
  }

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(prefix + '노래')) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(prefix + 'skip') || message.content.startsWith(prefix + '스킵')) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(prefix + 'stop') || message.content.startsWith(prefix + '정지')) {
    stop(message, serverQueue);
    return;
  }











  /*if(message.content.startsWith(prefix + '노래')) { // 노래 플레이
    var search_target = message.content.substring(3, message.content.length);
    if (search_target == '') {
      message.reply('```!노래 <검색할 이름> 으로 사용할수 있어요```');
      return;
    }
      message.member.voiceChannel.join()
       .then(connection => {
        voiceRoom = connection; //연결과 동시에 방 정보 저장
        voiceRoomName = voiceRoom.channel.name;
        message.channel.send('```' + voiceRoomName + ' 에 연결했어요```');
        client.user.setActivity(voiceRoomName);
        musicPlayer.music_play(search_target, message, connection);
        return;
      });
    return;
  }*/








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
      message.channel.send('```' + message.member.voiceChannel.name + ' 에 연결해요```');
      message.member.voiceChannel.join()
        .then(connection => {
          voiceRoom = connection; //연결과 동시에 방 정보 저장
          voiceRoomName = voiceRoom.channel.name;
          client.user.setActivity(voiceRoomName);
        });
        return;
    } else if(!(voiceRoomName == 'None')) { // 이미 참가함
      message.channel.send('```이미 ' + voiceRoomName + ' 에 연결되어 있어요```');
      return;
    } else {  // 사용자 없음
      message.reply('어디에 들어가야 할지 모르겠어요');
      return;
    }
  }

  if((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && !(voiceRoomName == 'None')) {
    voiceRoom.disconnect();
    message.channel.send('```방에서 나갔어요```');
    voiceRoom = ''; //나갈때 방 정보 초기화
    voiceRoomName = 'None';
    client.user.setActivity(activity);
    return;
  } else if ((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && voiceRoomName == 'None'){
    message.reply('```들어가 있는 방이 없어요```');
    return;
  }

  if(message.content.startsWith(prefix + '상태') || message.content.startsWith(prefix + 'status')) {
    message.reply('지박령은 지금 ' + voiceRoomName + ' 에 연결되어 있고 핑 : '+ client.ping + 'ms, ' + activity + ' 플레이 중 입니다.');
    return;
  }

  if (!isNaN(message.content.substring(1, message.content.length))) {
    //message.reply('뮤직 확인 : ' + message.content.substring(1, message.content.length));
    musicPlayer.userPick(message, message.content.substring(1, message.content.length));
  } else {
    message.reply('거부됨 ' + message.content.substring(1, message.content.length));
  }
});




// 노래 함수 시작

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(config.token);