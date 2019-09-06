// https://gabrieltanner.org/blog/dicord-music-bot

const Discord = require('discord.js');
const config = require('./config.js');
const ytdl = require('ytdl-core');
const search = require('yt-search');

const client = new Discord.Client();

const queue = new Map();

var prefix = config.prefix;
var voiceRoomName = 'None';
var activity = '명령어 beta 🖤 ||  ' + prefix + '도움';
var userInputId = ' ';
var userInput;
var playState = false;

client.on('ready', () => {
  console.log(client.user.tag + ' 봇 실행');
  client.user.setActivity(activity);
});
 




client.on('message', message => {
  if(message.channel.type == 'dm') return;
  if(message.content == '삐이이') {
    message.channel.send('요오오오오오오오오오오오오오옹');
    return;
  }
  if(!message.content.startsWith(prefix)) return;
 
  if(message.content.startsWith(prefix + '핑')) {
    message.channel.send('현재 지박령 핑 상태에요 : `' + client.ping + 'ms`');
    return;
  }

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(prefix + '노래')) {
    if (message.content.substring(3, message.content.length) == '') return message.reply('사용법 : `' + prefix + '노래 제목`');
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(prefix + 'skip') || message.content.startsWith(prefix + '스킵')) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(prefix + 'stop') || message.content.startsWith(prefix + '정지') || message.content.startsWith(prefix + '큐 비우기')) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(prefix + '큐 목록') || message.content.startsWith(prefix + '큐목록') || message.content.startsWith(prefix + '큐')) {
    songlist(message, serverQueue);
    return;
  }



  if(message.content.startsWith(prefix + '도움')) {
    var helpMsg = '>>> 안녕하세요 **' + client.user.username + '** 이에요\n명령어 사용방법은 다음과 같아요\n명령어는 `' + prefix + '명령어` 로 쓸수 있어요\n\n\n\n\n**노래**\n`노래` `참가` `나가` `스킵` `정지` `큐 비우기` `큐`\n\n**유틸**\n`핑` `상태` `도움`\n\n';
    message.channel.send(helpMsg);
    return;
  }




  if(message.content.startsWith(prefix + 'join') || message.content.startsWith(prefix + '참가')) {
     if(message.member.voiceChannel) { // 이미 참가했는지 확인
      //roomName = message.member.voiceChannel;
      message.channel.send('➡️`' + message.member.voiceChannel.name + '` 에 연결해요');
      message.member.voiceChannel.join();
        return;
    } else {  // 사용자 없음
      message.reply('⚠️어디에 들어가야 할지 모르겠어요');
      return;
    }
  }

  if((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && message.member.voiceChannel) {
    message.member.voiceChannel.leave();
    message.channel.send('⬅️방에서 나갔어요');
    voiceRoom = ''; //나갈때 방 정보 초기화
    client.user.setActivity(activity);
    return;
  } else if ((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가'))){
    message.reply('❌들어가 있는 방이 없어요');
    return;
  }

  if(message.content.startsWith(prefix + '상태') || message.content.startsWith(prefix + 'status')) {
    message.reply('🏳️‍🌈지박령은 지금 `' + voiceRoomName + '` 에 연결되어 있고 핑 : `'+ client.ping + 'ms`, `' + activity + '` 플레이 중 입니다.');
    return;
  }

  if (!isNaN(message.content.substring(1, message.content.length)) && !(message.content.substring(1, message.content.length) == '')) {
    //message.reply('뮤직 확인 : ' + message.content.substring(1, message.content.length));
    //musicPlayer.userPick(message, message.content.substring(1, message.content.length));
    userInputId = message.member.id;
    userInput = message.content.substring(1, 2);
    return;
  } else {
    message.reply('❌거부됨 ' + message.content.substring(1, message.content.length));
    return;
  }
});




// 노래 함수 시작

function getVideoId(search_name, message) {
  var musicID;
  return new Promise (function(resolve, reject) { search(search_name, function (err, r) {
    const videos = r.videos;
    const list = new Array();
    var tmp = 0;
    var chooselist = '';

    for (var i = 0; i < 5; i++) {
      if (videos[i].seconds == 0) {
        tmp++;
        list[i] = videos[i + tmp];
        console.log('광고를 건너뛰었어요');
      } else {
        list[i] = videos[i + tmp];
      }
    }
    console.log('----------');
    for (var i = 0; i < 5; i++) {
      chooselist = chooselist + (i + 1) + ': ' + list[i].title + ' <' + list[i].duration.timestamp + '>' + '\n';
    }
    message.reply('\n`' + chooselist + '`');
    console.log(chooselist);


    userInput = '';
    userInputId = '';
    var interval = setInterval(function() {
      if (!isNaN(userInput) && message.member.id == userInputId) {
        message.reply('✅`' + userInput + '` 번이 선택되었어요');
        userInput--;
        clearInterval(interval);
        clearTimeout(timeout);
        musicID = list[userInput].videoId;
        userInput = '';
        userInputId = '';
        resolve(musicID);
      }
    }, 500);

    var timeout = setTimeout(function() {
      clearTimeout(interval);
      console.log('시간 만료');
      message.reply('🛑노래는 8초 안에 선택해야 해요 `!번호` 로 선택할수 있어요');
    }, 8500);


  })});
}




async function execute(message, serverQueue) {
  //const args = message.content.split(' ');

  const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('❌먼저 음성 채널에 들어가 주세요');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('🆘참여하고 말할수 있는 권한이 없어요');
  }
  
  const videoId = await getVideoId(message.content.substring(3, message.content.length), message);
  console.log('videoId : ' + videoId);

	const songInfo = await ytdl.getInfo(videoId);
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
			volume: 1,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0], message);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send('✅`' + song.title + '`' + ' 을(를) 재생목록에 추가했어요 🎵');
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('⚠️노래를 스킵하려면 음성 채널에 있어야 해요');
	if (!serverQueue) return message.channel.send('⚠️스킵할 노래가 없어요');
	serverQueue.connection.dispatcher.end();
  message.channel.send('⏩노래를 스킵했어요');
}

function stop(message, serverQueue) {
  if (!message.member.voiceChannel) return message.channel.send('⚠️노래를 멈추려면 음성 채널에 있어야 해요');
  if (!playState) return message.channel.send('⚠️노래 재생중이 아니에요');
	serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  message.channel.send('⏹노래 재생을 끝냈어요');
}

function songlist(message, serverQueue) {
  if (!serverQueue) return message.channel.send('⚠️큐가 비었어요');
  //console.log(serverQueue);
  /*var queue = '';
  for(var i = 0; i < serverQueue.songs.length; i++)
    queue = queue +  '\n`' + serverQueue.songs.title + '`';*/
  var queue = serverQueue.songs.song;
  return message.reply('큐 : ' + queue);
}



function play(guild, song, message) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    playState = false;
		return;
  }
  


  const dispatcher = serverQueue.connection.playStream(ytdl(song.url));
  message.channel.send('▶️`' + song.title + '`' + ' 을(를) 재생해요 🎵');
  playState = true;

	dispatcher.on('end', () => {
		console.log('Music ended!');
    serverQueue.songs.shift();
    playState = false;
		play(guild, serverQueue.songs[0], message);
	});
	dispatcher.on('error', error => {
		console.error(error);
  });
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(config.token);