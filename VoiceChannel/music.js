const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const youtubeinfo = require('youtube-info');
const yt_search = require('yt-search');

const fs = require('fs');


class music {
    constructor() {
    }

    Skip(n) {
        try {
            if (this.voiceChannel.playSong.queue == '') 
                this.message.channel.send('``큐가 이미 비어있습니다.``');
            else if (this.message.member.voiceChannel == null || this.message.member.voiceChannel.id != this.message.guild.me.voiceChannel.id) 
                this.message.channel.send('``먼저 음성 채팅방에 입장해 주세요.``');
            else if (n == undefined || n <= 1) {
                    this.voiceChannel.playSong.dispatcher.end();
                    this.message.channel.send('``음악을 스킵했어요.``');
            } else {
                if (this.voiceChannel.playSong.queue[n-1] == undefined) return this.message.channel.send('``큐의 ' + n + ' 번째는 비어 있어요.``');
                var deletedsong = this.voiceChannel.playSong.queue.splice(n-1, 1);
                this.message.channel.send('``' + deletedsong[0].title + ' 를 큐에서 제거했어요.``');
            }
        } catch(error) {
            this.playerrorhandling('Skip', error);
        }
    }

    Stop() {
        try {
            if (this.voiceChannel.playSong.playing == false) 
                this.message.channel.send('``재생 중이 아닙니다.``');
            else if (this.message.member.voiceChannel == null || this.message.member.voiceChannel.id != this.message.guild.me.voiceChannel.id) 
                this.message.channel.send('``먼저 음성 채팅방에 입장해 주세요.``');
            else {
                this.voiceChannel.playSong.queue = '';
                this.voiceChannel.playSong.dispatcher.end();
                this.message.channel.send('``음악 재생을 정지했어요.``');
            }
        } catch(error) {
            this.playerrorhandling('Stop', error);
        }
    }

    queue_show() {
        var e = this;
        if (e.voiceChannel.playSong.queue == '') {
            e.message.channel.send('``큐가 비어있습니다.``');
        } else {
            var queue = e.voiceChannel.playSong.queue;
            var queuelist = '```Swift\n';

            for (var i = 0; i < queue.length; i++) {
                if (i == 0) queuelist = queuelist + parseInt(1+i) + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>';
                else queuelist = queuelist + '\n' + parseInt(1+i)   + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>';
            }
            queuelist = queuelist + '```';
            
            e.message.channel.send(queuelist);
        }
        
    }

    Addmusic(target) {
        if (target == '') return this.message.channel.send('``링크가 비었습니다.``');
        if (target.startsWith('https://www.youtube.com') || target.startsWith('http://www.youtube.com'))
            target = this.message.content.substring(36, this.message.content.length);
        var e = this;
        var video_info;

        youtubeinfo(target).then(info => {
            video_info = {
                'title': info.title,
                'time': e.scTomin(info.duration),
                'author': e.message.member.user.username,
                'id': info.videoId
            }

            
            e.voiceChannel.playSong.queue.push(video_info);
            if (e.voiceChannel.playSong.playing == false)
                this.playmusic();
            else   
                e.message.channel.send('``' + video_info.title + ' 을(를) 재생목록에 추가했어요.``');
        })
        .catch(function (error) {e.playerrorhandling('ytdl.getInfo', error)});
    }

    playmusic() {
        var e = this;
        var i = 0;
        var l = 0;

        this.voiceChannel.join().then(connection => {
            this.voiceChannel.autoleave_clear();
            var video_info = e.voiceChannel.playSong.queue[0];
            const streamOption = {
                volume: e.voiceChannel.playSong.streamOption.volume * 1 / 800,
                seek: 0
            };
            
            //https://www.youtube.com/watch?v=_1scmwn_1VI
            try {
                e.voiceChannel.playSong.connection = connection;
                var message = e.message;
                
                const music_file = ytdl(video_info.id, {filter: 'audioonly', quality: 'lowestaudio'});
                music_file.pipe(fs.createWriteStream('VoiceChannel/temp/'+message.guild.id+'.mp3')); // video download
                
                music_file.on('end', () => {
                    console.log('write end ', i);
                    i = 0;
                });

                music_file.on('data', () => {
                    i++;
                    if (i != 1) return;
                    var read = fs.createReadStream('VoiceChannel/temp/'+message.guild.id+'.mp3', { highWaterMark: 256 }); // video load
                    

                    e.voiceChannel.playSong.dispatcher = connection.playStream(read , streamOption);
                    e.voiceChannel.playSong.playing = true;
                    console.log('``' + video_info.title + ' 을(를) 재생해요 🎵``', message.channel.name);
                    message.channel.send('``' + video_info.title + ' 을(를) 재생해요 🎵``');

                    e.voiceChannel.playSong.dispatcher.on('end', reason => {
                        e.voiceChannel.playSong.playing = false;
                        console.log('dispatcher end : ', reason);
                        
                        if (e.voiceChannel.playSong.queue != '')
                            e.voiceChannel.playSong.queue.shift();

                        e.voiceChannel.autoleave_active();
                        if (e.voiceChannel.playSong.queue[0] != undefined)
                            e.playmusic();
                    });
        
                    e.voiceChannel.playSong.dispatcher.on('error', error => {
                        e.playerrorhandling('dispatcher' ,error);
                    });
    
                    read.on('data', () => {l++;});
                    read.on('end', () => {console.log('read end ', l)});
                });
                



                

            } catch(error) {
                e.playerrorhandling('playStream' ,error);
            }


        });

    }

    search_music(keyword) {
        var e = this;
        var music_list = [];
        var music_selection = '```Swift';
        const request_author = e.message.member.id;
            yt_search(keyword, function(err, r) {
                try {
                    for (var i = 0; i < 5; i++) {
                        if (r.videos[i] == undefined) break;
                        if (r.videos[i].seconds == 0) {
                            console.log('광고를 건너뜁니다.');
                            r.videos.splice(i, 1);
                            i--;
                            continue;
                        } else {
                            music_list[i] = r.videos[i];
                        }
                    }

                    for (var i = 0; i < 5; i++) {
                        if (music_list[i] == undefined) break;
                        music_selection = music_selection + '\n' + parseInt(i+1) + ': ' + music_list[i].title + ' (' + music_list[i].timestamp + ')'
                    }

                    music_selection = music_selection + '```';

                    e.message.channel.send(music_selection);

                    e.select_music(music_list.length, request_author).then(a => {
                        if (a == undefined) throw new Error('선택값을 찾지 못했습니다.');
                        
                        e.Addmusic(music_list[a-1].videoId);
                    });
                } catch(error) {
                    e.playerrorhandling('yt_search', error);
                }
            });
    }

    select_music(range_max, request_author) {
        var e = this;
        return new Promise(function(resolve, reject) {
            var waiting_input = true;

            var select_timeout = setTimeout(function() {
                e.message.channel.send('``선택 시간이 초과되었어요.``');
                waiting_input = false;
            }, 10000);

            e.client.on('message', message => {
                try {
                    if (!waiting_input || message.member.id == e.client.user.id) return;

                    var num;
                    if (!isNaN(message.content)) num = message.content;
                    else num = message.content.substring(1, message.content.length);
                    if (isNaN(num)) return;
                    if (request_author != message.member.id) return;

                    if (num <= 0 || num > range_max) {
                        message.channel.send('``범위 내에서 선택해 주세요.``');
                        return;
                    }
                    message.delete();
                    
                    clearTimeout(select_timeout);
                    waiting_input = false;
                    resolve(num);
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