const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const youtubeinfo = require('youtube-info');    // 영상 정보 가져오기
const yt_search = require('yt-search');

const fs = require('fs');   // 유튜브 파일 다운로드용


class music {
    constructor() {
    }

    Skip(n, message) {   // 음악 스킵
        try {
            if (this.voiceChannel.playSong.queue == '') // 큐가 비었는지 확인
                message.channel.send('``큐가 이미 비어있습니다.``');
            else if (message.member.voiceChannel == null || message.member.voiceChannel.id != message.guild.me.voiceChannel.id) // 멤버의 음성채널 접속 확인, 같은 음성채팅방에 접속했는지 확인
                this.message.channel.send('``먼저 음성 채팅방에 입장해 주세요.``');
            else if (n == undefined || n <= 1) {    // 스킵 번호가 없거나 1보다 작거나 같은경우
                    this.voiceChannel.playSong.dispatcher.end();    // 현재 음악 스킵
                    message.channel.send('``음악을 스킵했어요.``');
            } else {    // n 번째 음악 스킵
                if (this.voiceChannel.playSong.queue[n-1] == undefined) return message.channel.send('``큐의 ' + n + ' 번째는 비어 있어요.``'); // 큐의 n 번째가 존재하는지 확인
                var deletedsong = this.voiceChannel.playSong.queue.splice(n-1, 1);  // 음악을 큐에서 잘라내서 저장
                message.channel.send('``' + deletedsong[0].title + ' 를 큐에서 제거했어요.``');    // 잘라낸 음악 정보 보여주기
            }
        } catch(error) {
            this.playerrorhandling('Skip', error);
        }
    }

    Stop(message) {    // 음악 정지
        try {
            if (this.voiceChannel.playSong.playing == false)    // 음악 재생중인지 확인
                message.channel.send('``재생 중이 아닙니다.``');
            else if (message.member.voiceChannel == null || message.member.voiceChannel.id != message.guild.me.voiceChannel.id)  // 멤버가 응성채널 접속중인지, 같은채널인지
                message.channel.send('``먼저 음성 채팅방에 입장해 주세요.``');
            else {
                this.voiceChannel.playSong.queue = '';  // 큐 전체 비우기
                this.voiceChannel.playSong.dispatcher.end();    // 재생중인 음악 종료
                message.channel.send('``음악 재생을 정지했어요.``');
            }
        } catch(error) {
            this.playerrorhandling('Stop', error);
        }
    }

    queue_show(message) {  // 큐 보야주기
        var e = this;
        if (e.voiceChannel.playSong.queue == '') {  // 큐가 비었을때
            message.channel.send('``큐가 비어있습니다.``');
        } else {
            var queue = e.voiceChannel.playSong.queue;  // 큐 가져오기
            var queuelist = '```Swift\n';   // 디스코드 메세지 마크업 적용

            for (var i = 0; i < queue.length; i++) {    // 큐 길이만큼 반복
                if (i == 0) queuelist = queuelist + parseInt(1+i) + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>'; // 첫줄
                else queuelist = queuelist + '\n' + parseInt(1+i)   + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>'; // 첫줄 이외
            }
            queuelist = queuelist + '```';  // 마크업 마무리
            
            message.channel.send(queuelist);
        }
        
    }

    Addmusic(target, message) {  // 큐에 음악 추가
        if (target == '') return message.channel.send('``비디오 ID 가 비었습니다.``'); // 영상의 ID 유효성 검사
        if (target.startsWith('https://www.youtube.com') || target.startsWith('http://www.youtube.com'))    // URL 인지 검사
            target = message.content.substring(36, message.content.length);   // 비디오 ID 부분 자르기
        var e = this;
        var video_info;

        youtubeinfo(target).then(info => {  // 영상 정보 가져오기 
            video_info = {
                'title': info.title,    // 제목
                'time': e.scTomin(info.duration),   // 재생시간
                'author': message.member.user.username,   // 추가한 사람
                'id': info.videoId  // 영상 ID
            }

            
            e.voiceChannel.playSong.queue.push(video_info); // 큐에 넣기, 끝에 붙이기
            if (e.voiceChannel.playSong.playing == false)   // 재생중이 아니면
                this.playmusic(message);   // 음악(큐) 재생
            else   
                message.channel.send('``' + video_info.title + ' 을(를) 재생목록에 추가했어요.``');
        })
        .catch(function (error) {e.playerrorhandling('ytdl.getInfo', error)});
    }

    playmusic(message) {   // 큐에서 음악 재생
        var e = this;
        var i = 0;
        var l = 0;

        this.voiceChannel.join(message).then(async function(connection) {   // 음성 채널 접속
            e.voiceChannel.autoleave_clear();    //  자동 떠나기 해제
            var video_info = e.voiceChannel.playSong.queue[0];  // 큐 첫번째의 정보 가져오기
            const streamOption = {  // 재생 옵션
                volume: e.voiceChannel.playSong.streamOption.volume * 1 / 800,  // 서버 정보에서 볼륨 가져오기 /800으로 큰 소리 방지
                seek: 0
            };
            
            //https://www.youtube.com/watch?v=_1scmwn_1VI
            try {
                e.voiceChannel.playSong.connection = connection;    // 음성채널 연결정보 저장
                //var message = e.message;
                const loading_msg = await message.channel.send('``⌛음악을 로딩중입니다....``');
                const music_file = ytdl(video_info.id, {filter: 'audioonly', quality: 'lowestaudio'});  // 유튜브에서 음악 불러오기
                music_file.pipe(fs.createWriteStream('VoiceChannel/temp/'+message.guild.id+'.mp3', { highWaterMark: 128 })); // 유튜브에서 음악 mp3로 다운로드, 한번에 128바이트
                
                // 이 사이에 메세지를 보내 다운로드 중이라는걸 알리는 기능 추가

                music_file.on('end', () => {    // 디버그용, 파일 다운로드 완료시
                    console.log('write end ', i);
                    i = 0;
                });

                music_file.on('data', () => {   // 데이터 한 조각이 이동할때, 이벤트
                    i++;    // 카운터 증가
                    if (i != 3) return; // 세번째 조각이 저장될때만 실행
                    var read = fs.createReadStream('VoiceChannel/temp/'+message.guild.id+'.mp3', { highWaterMark: 256 }); // mp3 파일 로드 시작
                    

                    e.voiceChannel.playSong.dispatcher = connection.playStream(read , streamOption);    // 읽어온 파일을 재생 옵션을 적용해 재생
                    e.voiceChannel.playSong.playing = true; // 음악 재생 true
                    loading_msg.delete();
                    console.log('``' + video_info.title + ' 을(를) 재생해요 🎵``', message.channel.name);
                    message.channel.send('``' + video_info.title + ' 을(를) 재생해요 🎵``');

                    e.voiceChannel.playSong.dispatcher.on('end', reason => {    // 음악 재생 끝날때
                        e.voiceChannel.playSong.playing = false;    // 음악 재생 false
                        console.log('dispatcher end : ', reason);   // 디버그용, 디스패쳐가 끝난 이유
                        
                        if (e.voiceChannel.playSong.queue != '')    // 큐가 비어있지 않다면
                            e.voiceChannel.playSong.queue.shift();  // 재생한 음악 넘기기

                        e.voiceChannel.autoleave_active();  // 자동 떠나기 활성화
                        if (e.voiceChannel.playSong.queue[0] != undefined)  // 다음 음악이 버이었지 않다면
                            e.playmusic(message);  // 음악 재생
                    });
        
                    e.voiceChannel.playSong.dispatcher.on('error', error => {
                        e.playerrorhandling('dispatcher', error);
                    });
    
                    read.on('data', () => {l++;});  // 데이터 한 조각 읽어들일때, 카운터 증가
                    read.on('end', () => {console.log('read end ', l)});    // 읽기 완료했을때
                });
                



                

            } catch(error) {
                e.playerrorhandling('playStream' ,error);
            }


        });

    }

    search_music(message, keyword) {    // 유튜브에서 음악 검색
        var e = this;
        var music_list = [];
        var music_selection = '```Swift';   // 마크업 설정
        const request_author = message.member.id;   // 추가하려는 멤버 아이디
            yt_search(keyword, async function(err, r) {   // 유튜브 영상 검색
                try {
                    if (err) throw new Error(err);
                    for (var i = 0; i < 5; i++) {   // 최대 5개까지 검색
                        if (r.videos[i] == undefined) break;    // 검색 결과가 적어서 5개 미만일 경우
                        if (r.videos[i].seconds == 0) { // 재생 시간이 0인것 스킵, 광고임
                            console.log('광고를 건너뜁니다.');
                            r.videos.splice(i, 1);  // 배열에서 잘라버리기
                            i--;    // 반복 횟수에서 빼기
                            continue;   // 카운터 1 증가시키고 다시 반복
                        } else {
                            if (r.videos[i].title == '') {
                                console.log('err', r.videos);
                            }
                            music_list[i] = r.videos[i];    // 검색 결과값으로 이동
                        }
                    }

                    for (var i = 0; i < 5; i++) {   // 유저 선택 메세지로 만들기
                        if (music_list[i] == undefined) break;
                        music_selection = music_selection + '\n' + parseInt(i+1) + ': ' + music_list[i].title + ' (' + music_list[i].timestamp + ')'    // 번호 제복 시간
                    }

                    music_selection = music_selection + '```';
                    if (music_selection == '```Swift```') throw new Error('API 오류, 결과값이 없습니다. 다시 시도해 주세요'); // 검색 결과가 없는 오류

                    const select_message = await message.channel.send(music_selection);    // 보내기

                    e.select_music(music_list.length, request_author, message, select_message).then(a => {   // 음악 선택 입력받기
                        if (a == undefined) throw new Error('선택값을 찾지 못했습니다.');   // 예외처리
                        
                        e.Addmusic(music_list[a-1].videoId, message);    // 받아온 영상의 ID 값으로 음악 추가
                    });
                } catch(error) {
                    e.playerrorhandling('yt_search', error);
                }
            });
    }

    select_music(range_max, request_author, message, select_message) {   // 음악 선택 입력받기
        var input_message = message;
        var e = this;
        if (e.client.listeners('message')[1] != null) {
            e.client.removeListener('message', e.client.listeners('message')[1]);
            message.channel.send('``이전에 입력받던 리스너를 자동 삭제합니다.``');
        }
        return new Promise(function(resolve, reject) {  // 결과값을 돌려줘야해서 동기 처리

            var select_timeout = setTimeout(function() {    // 제한시간
                select_message.delete() // 이전에 검색했던 결과값 메세지 삭제
                .catch((err) => { console.log('del err', err) });

                if (e.client.listeners('message')[1] == null) return;   // 이미 리스너가 제거되었는지 확인
                input_message.channel.send('``선택 시간이 초과되었어요.``');    // 리스너가 없다면 실행할 필요 없음

                if (e.client.listeners('message')[1] == null) return;   // 리스너가 있는지 확인
                e.client.removeListener('message', e.client.listeners('message')[1]);   // 입력받는 리스너 제거


            }, 10000);
            

            e.client.on('message', message => { // 메세지 입력시 이벤트
                try {
                    if (message.member.id == e.client.user.id) return;    // 봇이 보낸 메세지는 무시
                    if (message.channel.id != input_message.channel.id) return; // 다른 채널의 메세지 무시
                    //console.log(message.content); // 디버그용, 입력값

                    var num;
                    
                    if (!isNaN(message.content)) num = message.content; // 숫자인기 검사
                    else num = message.content.substring(1, message.content.length);    // !숫자 인 경우 접두어 자르기
                    if (isNaN(num)) return console.log('nan');  // 접두어 자르고 숫자인기 검사
                    if (request_author != message.member.id) return console.log('author diff', request_author); // 보낸사람이 같은지 확인

                    if (num <= 0 || num > range_max) {  // 선택범위 확인
                        message.channel.send('``범위 내에서 선택해 주세요.``');
                        return;
                    }

                    select_message.delete()
                    .catch((err) => { console.log('msg already deleted') });    // 검색 리스트 삭제
                    message.delete();   // 입력받은 메세지는 삭제
                    
                    
                    clearTimeout(select_timeout);   // 입력시간 제한 해제
                    e.client.removeListener('message', e.client.listeners('message')[1]);   // 입력 받는용도의 리스너 삭제
                    resolve(num);   // 결과 Id 리턴
                } catch(error) {
                    reject();
                    e.playerrorhandling('getmessage', error);
                }
            }); 
        });
    }

    scTomin(second) {
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

      playerrorhandling(msg, err) {
        const errormsg = new Discord.RichEmbed()            
        .setColor('#ff148e')
        .setTitle('⚠️ [' + msg + '] 에서 오류가 발생했어요.')
        .setDescription(err)
        .setTimestamp();
    
        this.message.channel.send(errormsg);
      }
}

module.exports = music;