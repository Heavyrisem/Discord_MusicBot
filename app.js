// 35.190.232.202
// Import the discord.js module

const main = 'NjE3MzEwMzY1OTE4ODIyNDIx.XWuI4w.MSdZ8LorBxaKMAIzYA-68L1WCto';
const beta = 'NjE5NTI3MzY0MDkwNjU4ODE3.XnDOeg.Lh02kxHHjLFBHgfffJg9UcdjrD4';
const cpuStat = require('cpu-stat');
const Discord = require('discord.js');
const Token = main;

const serverClass = require('./server/server');
// Create an instance of a Discord client
const client = new Discord.Client();

const current_version = '2.0.2.4';


var serverMap = new Map();


client.on('ready', () => {
  console.log(client.user.username + ' I am ready!');
  client.user.setActivity('명령어 v' + current_version);
});



client.on('message', async function(message) {
  if (message.member.id == client.user.id) return;  // 자기가 보낸 메세지 무시

  if (message.content.startsWith('오리')) {
    message.channel.send('꽤애액🦆🦆🦆🦆🦆🦆');
  }



  if (!serverMap.has(message.guild.id)) { // 서버 맵에 있는지
    try {
      serverMap.set(message.guild.id, new serverClass(client, message));  // 없으면 새 클래스 생성
    } catch(error) {  // 오류 처리
      const errormsg = new Discord.RichEmbed()
      .setColor('#9147ff')
      .setTitle('⚠️ [server Class] 에서 오류가 발생했어요.')
      .setDescription(error)
      .setTimestamp();

      message.channel.send(errormsg);
    }
  }

  var server = serverMap.get(message.guild.id); // 서버맵 가져오기



  try {
    var prefix = server.serversetting.prefix; //prefix 가져오기
  } catch(error) {
    const errormsg = new Discord.RichEmbed()
    .setColor('#9147ff')
    .setTitle('⚠️ [Get Default Setting] 에서 오류가 발생했어요.')
    .setDescription(error)
    .setTimestamp();

    message.channel.send(errormsg);
  }

  if (!message.content.startsWith(prefix)) return; // prefix 확인

  if (server.getmessage) {  // 서버 클래스에 메세지 올리기 (삭제예정)
    server.updateMsg(message);
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
  if (message.content.startsWith(prefix + 'CPU')) {
    return message.channel.send('``오류로 인해 비활성화 되었어요``')  // stack 오류
    setInterval(() => {
      cpuStat.usagePercent((err, percent, seconds) => {
        if (err)
          return console.log (err);

        client.user.setActivity('CPU: ' + percent);
      })
    },5000);
  }

  if (message.content.startsWith(prefix + '핑')) {  // 한글자 단축어 추가 예정
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
    if (message.member.voiceChannel == undefined) return message.channel.send('``먼저 음성 채널에 접속해 주세요.``'); // 접속중인 채널 체크
    var keyword = message.content.substring(4, message.content.length); // 명령어 부분 자르기
    if (keyword.startsWith('https://www.youtube.com') || keyword.startsWith('http://www.youtube.com')) {  // URL 문자열 검사
      try {
        server.voiceChannel.addmusic_url(keyword, message); // URL이면 바로 음악 추가
      } catch(error) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#9147ff')
        .setTitle('⚠️ [URL 재생] 에서 오류가 발생했어요.')
        .setDescription(error)
        .setTimestamp();
    
        message.channel.send(errormsg);
      }
    } else if (keyword != '') { // 공백인지 검사
      server.voiceChannel.addmusic(message, keyword); // 유튜브 에서 음악 검색후 추가
    } else {
      message.channel.send('``사용법 : ' + prefix + '노래 [URL 이나 제목]``');  // 키워드가 비었을때
    }
  }

  if (message.content.startsWith(prefix + '스킵')) {
    if (!isNaN(message.content.substring(4, message.content.length))) // 명령어 부분 잘라서 숫자인지 확인
      server.voiceChannel.skip(message.content.substring(4, message.content.length), message);  // 숫자면 해당 번호 음악 스킵
    else
      server.voiceChannel.skip(message);  // 아니면 현재음악 스킵
  }
  
  if (message.content.startsWith(prefix + '정지')) {
    server.voiceChannel.stop(message);
  }

  if (message.content.startsWith(prefix + '큐')) {
    server.voiceChannel.show_queue(message);
  }

  if (message.content.startsWith(prefix + '볼륨')) {
    if (isNaN(message.content.substring(4, message.content.length))) return message.channel.send('``사용법 : 볼륨 [숫자]``'); // 명령어 잘라서 숫자인지 확인
    server.voiceChannel.setvolume(message.content.substring(4, message.content.length), message); // 볼륨 설정
  }

  if (message.content.startsWith(prefix + '스팀')) {  // 스팀에서 게임 검색
    var search = message.content.substring(3, message.content.length);  // 명령어 부분 자르기
    if (search == undefined) return message.channel.send('``스팀 [검색어]``');  // 검색어가 없으면
    const loading_msg = await message.channel.send('``데이터를 찾는 중입니다.....``');
    server.Utility.steamSearch(search, message).then(result => { // 유틸리티 에서 steamSearh 호출, 검색어 주고 결과값 동기로 받아오기
      loading_msg.delete(); // 로딩중 메세지 삭제
      if (result == undefined) return message.channel.send('``검색 결과가 없습니다.``');  // 결과가 비었을때 (오류 있는거같음)
      var price;  
      if (result.gameprice[0] == 0) price = '무료'; // 0원일때
      else if (result.gameprice[0] == undefined) price = '미정';  // 미출시 게임들
      else price = result.gameprice[0] + '원';  // 화폐단위
      

      const steamgame = new Discord.RichEmbed()
      .setColor('#9147ff')
      .setTitle(result.gametitle[0])
      .setThumbnail(result.gameimgURL[0])
      .addField('출시일자', result.gamerelesed[0])
      .addField('가격', price)
      .setFooter('지원 os ,' + result.gameplatform[0]);

      message.channel.send(steamgame);
    });
  }

  if (message.content.startsWith(prefix + '정보')) {  // 작동 안됨
    const info_message = new Discord.RichEmbed()
    .setColor('#9147ff')
    .setAuthor(client.user.username)
    .setTitle('도움말')
    .setThumbnail('https://images-ext-2.discordapp.net/external/Lbzfl2XV7cgwopCR4_z5ElADp5x-0ebsKWCPnr91GV0/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/619527364090658817/d0236fcaa434b8c75722e85a9cd821a3.png')
    .setDescription('디스코드 음악 봇 ``' + client.user.username + '``입니다.\n사용할 수 있는 명령어들은 아래와 같아요')
    .addBlankField()
    .addField('음악', '``노래`` ``볼륨`` ``스킵`` ``큐`` ``정지`` ``참가`` ``나가``')
    .addField('유틸리티', '``핑`` ``업타임`` ``스팀(베타)`` ``상태``');
    
    message.channel.send(info_message)
  }

  if (message.content.startsWith(prefix + '업타임')) {  // 계산 제대로 필요
    message.channel.send('``' + client.uptime/60/10 + '``');
  }
  
  if (message.content === prefix + '재시작 DHQUDALS') { // forever 필요
    message.delete().then(() => { // 비밀번호 노출 방지, 메세지 삭제
      console.log('수동 재시작 : ', message.member.user.username);
      message.channel.send('``⚠️ 수동 재시작을 시작합니다. \n디스코드 봇 클라이언트가 정지되고, 재시작까지 최대 30초가 소요됩니다.``').then(() => { // 메세지 보내기
      client.destroy().then(() => {process.exit()});  // 동기식으로 클라이언트 종료, 코드 종료
      });
    });
  }

});


client.login(Token);  // 클라이언트 로그인
