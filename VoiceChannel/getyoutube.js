const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const yt_search = require('yt-search');

const fs = require('fs');

class getyoutube {
    constructor() {
    }

    queue_show() {
        var e = this;
        if (e.voiceChannel.playSong.queue == '') {
            e.message.channel.send('``큐가 비어있습니다.``');
        } else {
            var queue = e.voiceChannel.playSong.queue;
            var queuelist = '```cs\n';

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
        })
        .catch(function (error) {e.playerrorhandling(error)});
    }

    playmusic_url() {
        var e = this;

        this.message.member.voiceChannel.join().then(connection => {
            var video_info = e.voiceChannel.playSong.queue[0];
            console.log(video_info.id);
            const streamOption = {
                volume: e.voiceChannel.playSong.streamOption.volume * 1 / 2000,
                seek: 0
            };
            
        
            try {
                e.voiceChannel.playSong.connection = connection;
                e.voiceChannel.playSong.dispatcher = connection.playStream(ytdl(video_info.id, {filter: 'audioonly'}), streamOption);
                e.voiceChannel.playSong.playing = true;

                e.message.channel.send('``' + video_info.title + ' 을(를) 재생해요 🎵``');
            } catch(error) {
                e.playerrorhandling(error);
            }

            e.voiceChannel.playSong.dispatcher.on('end', () => {
                e.voiceChannel.playSong.playing = false;
                e.message.channel.send('``음악이 끝났어요.``');
                
                e.voiceChannel.playSong.queue.shift();
                if (e.voiceChannel.playSong.queue[0] != undefined)
                    this.playmusic_url();
            })

            e.voiceChannel.playSong.dispatcher.on('error', () => {
                
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

      playerrorhandling(msg) {
        const errormsg = new Discord.RichEmbed()            
        .setColor('#ff148e')
        .setTitle('⚠️ [playStream] 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();
    
        this.message.channel.send(errormsg);
      }
}

module.exports = getyoutube;