// https://gabrieltanner.org/blog/dicord-music-bot

const Discord = require('discord.js');
const config = require('./config.js');
const ytdl = require('ytdl-core');
const search = require('yt-search');

const msgtest = require('./test.js');

const client = new Discord.Client();

const queue = new Map();

var prefix = config.prefix;
var voiceRoomName = 'None';
var activity = '명령어 beta 🖤 ||  ' + prefix + '도움';
var userInputId = ' ';
var userInput;
var playState = false;
var musicLoop = false;

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
    if (message.content.substring(4, message.content.length) == '') return message.reply('사용법 : `' + prefix + '노래 제목`');
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
  } else if (message.content.startsWith(prefix + '반복') || message.content.startsWith(prefix + 'loop')) {
    musicLoop = !musicLoop;
    if (musicLoop) {
      message.reply('🔁 노래 반복을 켰어요');
    } else {
      message.reply('🔁 노래 반복을 껐어요');
    }
    return;
  }



  if(message.content.startsWith(prefix + '도움')) {
    var helpMsg = '>>> 안녕하세요 **' + client.user.username + '** 이에요\n명령어 사용방법은 다음과 같아요\n명령어는 `' + prefix + '명령어` 로 쓸수 있어요\n\n\n\n**노래**\n`노래` `참가` `나가` `스킵` `정지` `큐 비우기` `큐` `취소`\n\n**유틸**\n`핑` `상태` `도움`\n\n\n\n**도움**\n`알파카맨`';
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



  if (message.content.startsWith(prefix + '테스트')) {
    message.reply('테스트 기능이 없어요');
    return;
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

  if (!isNaN(message.content.substring(1, message.content.length)) && !(message.content.substring(1, message.content.length) == '') || message.content.startsWith(prefix + '취소')) {
    //message.reply('뮤직 확인 : ' + message.content.substring(1, message.content.length));
    //musicPlayer.userPick(message, message.content.substring(1, message.content.length));
    userInputId = message.member.id;

    if (message.content.startsWith(prefix + '취소') || message.content.startsWith(prefix + 'cancel')) {
      userInput = 0;
    } else if (message.content.substring(1, 2) <= 5 || message.content.substring(1, 2) >= 1) {
      userInput = message.content.substring(1, 2);
    }
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

    if (search_name.startsWith('https://www.youtube.com') || search_name.startsWith('http://www.youtube.com')) {
      musicID = search_name.substring(32, search_name.length);
      console.log('URL 감지됨 : ' + musicID);
      resolve(musicID);
      return;
    }
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
    chooselist = chooselist + '취소 : 선택을 하지않고 종료해요\n';
    message.reply('\n`' + chooselist + '`');
    console.log(chooselist);


    userInput = '';
    userInputId = '';
    var interval = setInterval(function() {
      if (!isNaN(userInput) && message.member.id == userInputId) {
        if (userInput == 0) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve('취소됨');
          return;
        }
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
  
  const videoInfo = await getVideoId(message.content.substring(4, message.content.length), message);


  console.log('videoId : ' + videoInfo);

  if (videoInfo == '취소됨') {
    message.reply('선택을 취소했어요');
    return;
  }

  const songInfo = await ytdl.getInfo(videoInfo);
  var timestamp = getTimestamp(songInfo.player_response.videoDetails.lengthSeconds);
	const song = {
		title: songInfo.title,
    url: songInfo.video_url,
    author: message.member.nickname,
    duration: timestamp,
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
		return message.channel.send('✅`' + song.title + '`' + ' 을(를) 재생목록에 추가했어요 🎵');
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('⚠️노래를 스킵하려면 음성 채널에 있어야 해요');
	if (!serverQueue) return message.channel.send('⚠️스킵할 노래가 없어요');
  serverQueue.songs.shift();
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
  var list = serverQueue.songs[0].title;
  var list = '';
  for(var i = 0; i < serverQueue.songs.length; i++)
    list = list +  '\n`<' + serverQueue.songs[i].author + '> - ' + serverQueue.songs[i].title + ' (' + serverQueue.songs[i].duration + ')' + '`';
  return message.reply(list);
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
  var loop = '';
  if (musicLoop)
    loop = '🔁';
  message.channel.send(loop + '▶️`' + song.title + '`' + ' 을(를) 재생해요 🎵');
  playState = true;

	dispatcher.on('end', () => {
    console.log('Music ended!');
    message.channel.send('⏹노래가 끝났어요');
    if (!musicLoop)
      serverQueue.songs.shift();
    playState = false;
		play(guild, serverQueue.songs[0], message);
	});
	dispatcher.on('error', error => {
		console.error(error);
  });
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}



function getTimestamp(second) {
  var sec = second;
  var min;
  var hour;
  var timestamp;

  if (sec >= 60) {
     min = parseInt(sec / 60);
     sec = sec % 60;
     if (sec < 10) sec = "0" + sec;

     if (min >= 60) {
        hour = parseInt(min / 60);
        min = min % 60;
        if (min < 10) { min = "0" + min; }
        timestamp = hour + ':' + min + ':' + sec;
     }
     else if (min >= 1) timestamp = min + ':' + sec;
     else timestamp = '00:' + sec;

  }
  return timestamp;
}
client.login(config.token);