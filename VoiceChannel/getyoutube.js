const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const yt_search = require('yt-search');


class getyoutube {
    constructor() {
    }

    Skip() {
        if (this.voiceChannel.playSong.queue == '') 
            this.message.channel.send('``큐가 이미 비어있습니다.``');
        else if (this.message.member.voiceChannel == null || this.message.member.voiceChannel.id != this.message.guild.me.voiceChannel.id) 
            this.message.channel.send('``먼저 음성 채팅방에 입장해 주세요.``');
        else {
            try {
                this.voiceChannel.playSong.queue.shift();
                this.voiceChannel.playSong.dispatcher.end();
                this.message.channel.send('``음악을 스킵했어요.``');
            } catch(error) {
                this.playerrorhandling('Skip', error);
            }
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

    addmusic(target) {
        if (target == '') return this.message.channel.send('``링크가 비었습니다.``');
        var e = this;
        var video_info;

        ytdl.getInfo(target).then(info => {
            video_info = {
                'title': info.player_response.videoDetails.title,
                'time': e.scTomin(info.player_response.videoDetails.lengthSeconds),
                'author': e.message.member.user.username,
                'id': info.player_response.videoDetails.videoId
            }

            
            e.voiceChannel.playSong.queue.push(video_info);
            if (e.voiceChannel.playSong.playing == false)
                this.playmusic_url();
            else   
                e.message.channel.send('``' + video_info.title + ' 을(를) 재생목록에 추가했어요.``');
        })
        .catch(function (error) {e.playerrorhandling('ytdl.getInfo', error)});
    }

    playmusic_url() {
        var e = this;

        this.voiceChannel.join().then(connection => {
            this.voiceChannel.autoleave_clear();
            var video_info = e.voiceChannel.playSong.queue[0];
            console.log(video_info.id);
            const streamOption = {
                volume: e.voiceChannel.playSong.streamOption.volume * 1 / 2000,
                seek: 0
            };
            
            //https://www.youtube.com/watch?v=_1scmwn_1VI
            try {
                e.voiceChannel.playSong.connection = connection;
                var url = "https://www.youtube.com/watch?v=" + video_info.id + "?hl=kr";
                e.voiceChannel.playSong.dispatcher = connection.playStream(ytdl(url, {filter: 'audioonly', quality: 'lowestaudio'}), streamOption);
                e.voiceChannel.playSong.playing = true;

                e.message.channel.send('``' + video_info.title + ' 을(를) 재생해요 🎵``');
            } catch(error) {
                e.playerrorhandling('playStream' ,error);
            }

            e.voiceChannel.playSong.dispatcher.on('end', () => {
                e.voiceChannel.playSong.playing = false;
                
                e.voiceChannel.playSong.queue.shift();
                e.voiceChannel.autoleave_active();
                if (e.voiceChannel.playSong.queue[0] != undefined)
                    e.playmusic_url();
            });

            e.voiceChannel.playSong.dispatcher.on('error', () => {
                e.playerrorhandling('dispatcher' ,error);
            });
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
                        
                        e.addmusic(music_list[a-1].videoId);
                    });
                } catch(error) {
                    e.playerrorhandling('yt_search', error);
                }
            });
    }

    select_music(range_max, request_author) {
        var e = this;
        return new Promise(function(resolve, reject) {

            var select_timeout = setTimeout(function() {
                e.message.channel.send('``선택 시간이 초과되었어요.``');
                clearInterval(getmessage);
            }, 10000);

            var getmessage = setInterval(function() {
                try {
                    var num = e.message.content.substring(1, e.message.content.length);
                    if (isNaN(num)) return;
                    if (request_author != e.message.member.id) return;

                    console.log('log : ', num);

                    if (num <= 0 || num > range_max) {
                        e.message.channel('``범위 내에서 선택해 주세요.``');
                        return;
                    }
                    
                    clearTimeout(select_timeout);
                    clearInterval(getmessage);
                    resolve(num);
                } catch(error) {
                    reject();
                    e.playerrorhandling('getmessage', error);
                }
            }, 500);
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

module.exports = getyoutube;
