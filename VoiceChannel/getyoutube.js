const Discord = require('discord.js');
const ytdl = require('ytdl-core');

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
            var queuelist = '```';

            for (var i = 0; i < queue.length; i++) {
                if (i == 0) queuelist = queuelist + parseInt(1+i) + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>';
                else queuelist = queuelist + '\n' + parseInt(1+i)   + ': ' + queue[i].title + '(' + queue[i].time + ') - <' + queue[i].author + '>';
            }
            queuelist = queuelist + '```';
            
            e.message.channel.send(queuelist);
        }
        
    }

    playmusic_url(target) {
        if (target == '') return this.message.channel.send('``링크가 비었습니다.``');
        var e = this;

        this.message.member.voiceChannel.join().then(connection => {
            try {
                var video = ytdl(target, {filter: 'audioonly'});
                ytdl.getInfo(target).then(info => {
                    var video_info = {
                        'title': info.player_response.videoDetails.title,
                        'time': e.scTomin(info.player_response.videoDetails.lengthSeconds),
                        'author': e.message.author
                    }
                    e.voiceChannel.playSong.queue.push(video_info);
                    e.message.channel.send('``' + video_info.title + ' 을(를) 재생해요 🎵``')
                });
                e.voiceChannel.playSong.connection = connection;
                e.voiceChannel.playSong.dispatcher = connection.playStream(video);
                //e.message.channel.send('``' + this.msTomin() +'🎵')
            } catch(error) {
                const errormsg = new Discord.RichEmbed()
                .setColor('#ff148e')
                .setTitle('⚠️ [playStream] 에서 오류가 발생했어요.')
                .setDescription(error)
                .setTimestamp();
            
                e.message.channel.send(errormsg);
            }
        })

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
}

module.exports = getyoutube;