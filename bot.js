// https://gabrieltanner.org/blog/dicord-music-bot

const Discord = require('discord.js');
const config = require('./config.js');
const ytdl = require('ytdl-core');
const search = require('yt-search');


const client = new Discord.Client();

var queue = new Map();              // 음악 큐
var serverStatus = new Map();       // 서버 설정

var defaultprefix = config.prefix;
var activity = '명령어 beta 🖤 ||  ' + defaultprefix + '도움';
var userInputId = ' ';     // 입력 사용자 아이디 저장
var userInput;            // 사용자 입력 저장
var admin = config.admin;   // 관리자 아이디

client.on('ready', () => {
  console.log(client.user.tag + ' 봇 실행');
  client.user.setActivity(activity);
});
 




client.on('message', message => {
  if(message.channel.type == 'dm') return;
  if (serverStatus.get(message.guild.id) == undefined && !(message.member.id == client.user.id)) {
    if (!(setServerSetting(message) == '생성 완료')) {
      message.channel.send('❌ 서버에 지정된 설정이 없어요! 기본 설정을 불러오지 못했어요!');
      return;
    }
  }

  if(message.content == '삐이이') {
    message.channel.send('요오오오오오오오오오오오오오옹');
    return;
  } else if(message.content == '오리') {
    message.channel.send('꽤애액🦆🦆🦆🦆🦆🦆');
    return;
  } else if (message.content.startsWith('이이')) {
    message.channel.send('음식이 장난이야?');
    message.channel.send({
      files: [{
        attachment: 'EE.jpg',
        name: 'EE.jpg'
      }]
    });
    return;
  }

  const botStatus = serverStatus.get(message.guild.id);
  var prefix = botStatus.prefix;     // 서버 개별 설정 불러오기


  if(!message.content.startsWith(prefix)) return;
 

  if (message.content.startsWith(prefix + '노래')) {
    if (message.content.substring(4, message.content.length) == '') return message.reply('사용법 : `' + prefix + '노래 제목`');
    execute(message, botStatus);
    return;
  } else if (message.content.startsWith(prefix + 'skip') || message.content.startsWith(prefix + '스킵')) {
    skip(message, botStatus);
    return;
  } else if (message.content.startsWith(prefix + 'stop') || message.content.startsWith(prefix + '정지') || message.content.startsWith(prefix + '큐 비우기')) {
    stop(message, botStatus);
    return;
  } else if (message.content.startsWith(prefix + '큐 목록') || message.content.startsWith(prefix + '큐목록') || message.content.startsWith(prefix + '큐')) {
    songlist(message, botStatus);
    return;
  } else if (message.content.startsWith(prefix + '반복') || message.content.startsWith(prefix + 'loop')) {
    botStatus.musicLoop = !botStatus.musicLoop;
    if (botStatus.musicLoop) {
      message.reply('🔁 노래 반복을 켰어요');
    } else {
      message.reply('🔁 노래 반복을 껐어요');
    }
    return;
  }

  if((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가')) && botStatus.voiceChannel) {
    botStatus.voiceChannel.leave();
    message.channel.send('⬅️ 방에서 나갔어요');
    botStatus.voiceChannel = null;
    clearTimeout(botStatus.exitTimer);
    return;
  } else if ((message.content.startsWith(prefix + 'leave') || message.content.startsWith(prefix + '나가'))){
    message.reply('❌ 들어가 있는 방이 없어요');
    return;
  }

  if(message.content.startsWith(prefix + 'join') || message.content.startsWith(prefix + '참가')) {
    if(message.member.voiceChannel) { // 이미 참가했는지 확인
      message.channel.send('➡️ `' + message.member.voiceChannel.name + '` 에 연결해요');
      botStatus.voiceChannel = message.member.voiceChannel;
      message.member.voiceChannel.join();
      clearTimeout(botStatus.exitTimer);
      setexitTimer(message, botStatus);

      return;
    } else {  // 사용자 없음
      message.reply('⚠️ 어디에 들어가야 할지 모르겠어요');
      return;
    }
 }



 


  if(message.content.startsWith(prefix + '도움')) {
    
    const helpEmbed = new Discord.RichEmbed()
    .setColor('#ff148e')
    .setTitle('지봇령')
    .setURL('http://discordbot-ghost.forharu.com/')
    .setAuthor('도움말', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription('유튜브에 있는 음악들을 재생해주는 봇이에요.')
    .setThumbnail('http://discordbot-ghost.forharu.com/bot.png')
    .addField("사용법", "`" + prefix + "명령어` 로 사용할수 있어요.")
    .addBlankField()
    .addField(`노래`, "`노래` `참가` `나가` `스킵` `정지` `큐` `큐 비우기` `취소`")
    .addField(`유틸`, "`핑` `상태` `도움` `설정` `접두어 변경`")
    .addBlankField()
    .addField("주의!", "아직 개발 중이여서 불안정한 부분이 있어요. \n업데이트가 되면 웹 페이지에서 확인할수 있어요.",)
    .addBlankField()
    .setFooter('맨 위의 봇 이름을 클릭하면 웹 페이지로 이동해요. (개발 - 지박령, 도움 - 알파카맨)', 'https://i.imgur.com/wSTFkRM.png');

    message.channel.send(helpEmbed);
    return;
  }
  
  if (message.content.startsWith(prefix + '접두어 변경')) {
    if (message.content.substring(8, message.content.length) == '' || (message.content.substring(8, message.content.length) == ' ')) {
      message.reply('접두어는 공백으로 정할수 없어요');
      return;
    }
     if (message.content.substring(8, message.content.length).length > 1) {
       message.reply('접두어는 한글자만 가능해요');
       return;
     }
     console.log(message.content.substring(8, message.content.length).length);
     serverStatus.get(message.guild.id).prefix = message.content.substring(8, message.content.length);
     message.reply('서버의 접두어가 ' + prefix + ' 에서 ' + serverStatus.get(message.guild.id).prefix + ' 로 변경되었어요');
    return;
  }



  if(message.content.startsWith(prefix + '핑')) {
    message.channel.send('현재 지박령 핑 상태에요 : `' + client.ping + 'ms`');
    return;
  }

  if (message.content.startsWith(prefix + '테스트')) {
    if (!serverStatus.devMode && !(message.member.id == admin)) {
      message.reply('죄송해요 이 명령어는 개발때만 사용할수 있어요');
      return;
    }
    return;
  }

  if (message.content.startsWith(prefix + '설정')) {
    var setting = serverStatus.get(message.guild.id);
    message.channel.send(message.guild.name + ' 서버의 설정이에요```접두어 : ' + setting.prefix + '\n개발 모드 : ' + setting.devMode + '```');
    return;
  }


  if(message.content.startsWith(prefix + '상태') || message.content.startsWith(prefix + 'status')) {
    message.reply('🏳️‍🌈' +  client.user.username + '은 지금 핑 : `'+ client.ping + 'ms`, `' + activity + '` 플레이 중 입니다.');
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
    message.reply('❌ 거부됨 ' + message.content.substring(1, message.content.length));
    return;
  }
});





















// 노래 함수 시작

async function execute(message, botStatus) {

  const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('❌ 먼저 음성 채널에 들어가 주세요');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('🆘 참여하고 말할수 있는 권한이 없어요');
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



	if (!botStatus.serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			connection: null,
			songs: [],
			volume: 1,
      playing: false,
      playingSong: 0,
      exitTimer: null,
		};

    
    botStatus.voiceChannel = voiceChannel;
    botStatus.serverQueue = queueContruct;
    

		queueContruct.songs.push(song);

		try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;

			play(message.guild, queueContruct.songs[0], message, botStatus);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
    botStatus.serverQueue.songs.push(song);
		return message.channel.send('✅`' + song.title + '`' + ' 을(를) 재생목록에 추가했어요 🎵');
	}

}

function skip(message, botStatus) {
	if (!message.member.voiceChannel) return message.channel.send('⚠️노래를 스킵하려면 음성 채널에 있어야 해요');
  if (!botStatus.serverQueue) return message.channel.send('⚠️스킵할 노래가 없어요');
  if (botStatus.musicLoop) {
    botStatus.serverQueue.songs.shift();
    botStatus.serverQueue.playingSong--;
  }
	botStatus.serverQueue.connection.dispatcher.end();
  message.channel.send('⏩노래를 스킵했어요');
}

function stop(message, botStatus) {
  if (!message.member.voiceChannel) return message.channel.send('⚠️노래를 멈추려면 음성 채널에 있어야 해요');
  if (!botStatus.serverQueue.playing) return message.channel.send('⚠️노래 재생중이 아니에요');
  if (botStatus.serverQueue.connection.dispatcher == null) {
    console.log(botStatus.serverQueue);
    return message.reply('❌ 오류가 발생했어요');
  }
	botStatus.serverQueue.songs = [];
  botStatus.serverQueue.connection.dispatcher.end();
  message.channel.send('⏹노래 재생을 끝냈어요');
}

function songlist(message, botStatus) {
  if (!botStatus.serverQueue) return message.channel.send('⚠️큐가 비었어요');
  var list;
  if (botStatus.musicLoop)
    list = '🔁 큐 전체를 반복해요';
  else if (!botStatus.musicLoop)
    list = '▶️ 큐 전체를 재생해요';
  if (botStatus.musicLoop)
    list = list + '';
  for(var i = 0; i < botStatus.serverQueue.songs.length; i++)
    list = list +  '\n`<' + botStatus.serverQueue.songs[i].author + '> - ' + botStatus.serverQueue.songs[i].title + ' (' + botStatus.serverQueue.songs[i].duration + ')' + '`';
  return message.reply(list);
}



function play(guild, song, message, botStatus) {
  

	if (!song) {
    setexitTimer(message, botStatus);
    botStatus.serverQueue.playing = false;
    botStatus.serverQueue = null;
    return;
  }
  console.log('재생 중인 번호 : ' + botStatus.serverQueue.playingSong);

  clearTimeout(botStatus.exitTimer);
  const dispatcher = botStatus.serverQueue.connection.playStream(ytdl(song.url));
  var loop = '';
  if (serverStatus.get(message.guild.id).musicLoop)
    loop = '🔁';
  message.channel.send(loop + '▶️`' + song.title + '`' + ' 을(를) 재생해요 🎵');
  botStatus.serverQueue.playing = true;



	dispatcher.on('end', () => {
    console.log('Music ended!');
    message.channel.send('⏹노래가 끝났어요');
    botStatus.serverQueue.playing = false;
    
    var nextNum = 0;
    if (botStatus.musicLoop && botStatus.serverQueue) {    // 루프가 켜진지 확인, 서버 큐 확인
      botStatus.serverQueue.playingSong++; 
      nextNum = botStatus.serverQueue.playingSong;

      if (botStatus.serverQueue.songs[nextNum] == null) {   // 다음곡이 존재하는지 체크
        botStatus.serverQueue.playingSong = 0;
        nextNum = botStatus.serverQueue.playingSong;
      }
      console.log('다음 재생 번호 : ' + nextNum);

    } else if (!botStatus.musicLoop)  // 루프가 꺼져있을 때
      botStatus.serverQueue.songs.shift();


		play(guild, botStatus.serverQueue.songs[nextNum], message, botStatus);
	});
	dispatcher.on('error', error => {
		console.error(error);
  });
	dispatcher.setVolumeLogarithmic(botStatus.serverQueue.volume / 5);
}



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
        message.reply('✅ `' + userInput + '` 번이 선택되었어요');
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
      message.reply('🛑 노래는 8초 안에 선택해야 해요 `!번호` 로 선택할수 있어요');
    }, 8500);


  })});
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

function setexitTimer(message, botStatus) {
  clearTimeout(botStatus.exitTimer);
  botStatus.exitTimer = setTimeout(function() {
    message.channel.send('⬅️ 아무런 활동이 없어 방을 나갔어요');
    botStatus.voicechannel
    botStatus.voiceChannel.leave();
  }, 5000);
}

function setServerSetting(message) {
  const defaultSetting = {
    prefix: '!',
    musicLoop: false,
    voiceChannel: null,
    serverQueue: null,
    exitTimer: null,
    devMode: true,
  };

  serverStatus.set(message.guild.id, defaultSetting);
  return '생성 완료';
}

client.login(config.token);