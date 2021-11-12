const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const youtube_api = require('ytsearch_api');

const VoiceChannel = require('./VoiceChannel');

class music extends VoiceChannel{
    constructor(Client, message, YOUTUBEAPIKEYS) {
        super();
        this.YoutubeAPI = YOUTUBEAPIKEYS;
    

        this.Client = Client;
        this.connection = message.guild.me.voice.channel == undefined ? undefined : message.guild.me.voice.channel;

        
        this.playing = false;
        this.dispatcher = undefined;
        this.queue = [];
        this.playOption = {
            volume: 0.3,
            bitrate: 'auto'
        };

        this.tempMessage = undefined;
    }

    SetVolume(message, v) {
        if (v == null) return message.channel.send(`\`\`현재 볼륨은 ${this.playOption.volume * 100} 입니다.\`\``);
        if (isNaN(v)) return message.channel.send('``볼륨 [숫자]``');
        this.playOption = {
            volume: v / 100,
            bitrate: 'auto'
        };

        if (this.playing) this.dispatcher.setVolume(this.playOption.volume);
        message.channel.send(`\`\`볼륨을 ${v}로 설정했어요.\`\``);
    }

    Stop(message) {
        if (!this.playing) return message.channel.send(`\`\`재생 중이 아닙니다.\`\``);
        if (message.member.voice.channel == null || message.guild.me.voice.channel != message.member.voice.channel)
        return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);

        try {
            this.queue = [];
            this.dispatcher.end();
            message.channel.send(`\`\`음악 재생을 정지했어요.\`\``);
        } catch(err) {
            message.channel.send(`\`\`오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\`\``);
        }
    }

    Resume(message) {
        if (!this.playing) return message.channel.send(`\`\`재생 중이 아닙니다.\`\``);
        if (message.member.voice.channel == null || message.guild.me.voice.channel != message.member.voice.channel)
        return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);

        try {
            this.dispatcher.resume();
            message.channel.send(`\`\`음악을 재생해요\`\``);
        } catch(err) {
            this.errorhandler(err, message);
        }
    }

    Pause(message) {
        if (!this.playing) return message.channel.send(`\`\`재생 중이 아닙니다.\`\``);
        if (message.member.voice.channel == null || message.guild.me.voice.channel != message.member.voice.channel)
        return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);

        try {
            this.dispatcher.pause();
            message.channel.send(`\`\`음악을 일시정지 했어요\`\``);
        } catch(err) {
            this.errorhandler(err, message);
        }
    }

    Skip(message, skip_no) {
        if (this.queue == '') return message.channel.send(`\`\`큐가 비었습니다.\`\``);
        if (message.member.voice.channel == null || message.guild.me.voice.channel != message.member.voice.channel)
            return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);
        if (skip_no != undefined) if(isNaN(skip_no)) return message.channel.send(`\`\스킵 [큐 번호]\`\``);

        if (skip_no < 1 || skip_no > this.queue.length) return message.channel.send(`\`\`큐의 범위를 벗어났습니다.\`\``);

        if (skip_no == 1 || skip_no == undefined) {
            try {
                this.dispatcher.end();
                message.channel.send(`\`\`음악을 스킵했어요\`\``);
            } catch (err) {
                message.channel.send('\`\`오류가 발생했어요, 천천히 입력해 주세요\`\`');
            }
        } else {
            message.channel.send(`\`\`${this.queue.splice(skip_no-1, 1)[0].title} 를 큐에서 제거했어요.\`\``);
        }
            
    }

    Queue(message) {
        if (this.queue == '') return message.channel.send(`\`\`큐가 비었습니다.\`\``);

        let queue_msg = '\n';
        this.queue.forEach((value, index) => {
            queue_msg += `${index+1}: ${value.title} - ${value.time} (${value.author})\n`;
        });
        message.channel.send(`\`\`\`swift${queue_msg}\`\`\``);
    }

    PlayMusic() {
        let video_info = this.queue[0];
        let e = this;
        
        this.Join(video_info.message).then(async function(connection) {
            e.Autoleave_clear();
            let tmp = 1;
            const loading_msg = await video_info.message.channel.send(`\`\`⌛음악을 로딩중입니다....\`\``);
            let music_file;

            try {
                fs.stat(`VoiceChannel/temp/${video_info.message.guild.id}.mp3`);
                fs.unlink(`VoiceChannel/temp/${video_info.message.guild.id}.mp3`, () => {
                    music_file = ytdl(video_info.id, {filter: 'audioonly', quality: 'lowestaudio'});
                    music_file.pipe(fs.createWriteStream(`VoiceChannel/temp/${video_info.message.guild.id}.mp3`, { highWaterMark: 128 }));
                }).catch(err =>{ throw new Error("download" + err) });
            } catch(err) {
                music_file = ytdl(video_info.id, {filter: 'audioonly', quality: 'lowestaudio'});  // 유튜브에서 음악 불러오기
                music_file.pipe(fs.createWriteStream(`VoiceChannel/temp/${video_info.message.guild.id}.mp3`, { highWaterMark: 128 })); // 유튜브에서 음악 mp3로 다운로드, 한번에 128바이트
            }

            music_file.on('data', () => {
                // console.log(tmp);
                tmp++;
                if (tmp != 8) return;
                let read = fs.createReadStream(`VoiceChannel/temp/${video_info.message.guild.id}.mp3`, { highWaterMark: 256 });

                // console.log(connection);
                e.dispatcher = connection.play(read, e.playOption);
                e.playing = true;
                loading_msg.delete();
                video_info.message.channel.send(`\`\`${video_info.title} 을(를) 재생해요 🎵\`\``);

                e.dispatcher.on('finish', reason => {
                    e.playing = false;
                    e.AutoLeave(video_info.message);

                    if (e.queue != '') e.queue.shift();

                    if (e.queue[0] != undefined) e.PlayMusic();
                });

                e.dispatcher.on('error', error => {
                    e.errorhandler(error);
                });

            });
        }).catch(err => { console.log('158 err'); this.playing = false; this.queue.shift(); this.errorhandler(err, video_info.message) });
    }

    AddMusic(message, musicId, depth) {
        try {
            if (message.guild.me.voice.channel != message.member.voice.channel && message.guild.me.voice.channel != null) return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);
            if (message.member.voice.channel == null) return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);
            
            if (depth == undefined) depth = 0;
            // else message.channel.send(`\`\`${depth} 번째 API키가 작동하지 않습니다. 백업 키로 대체합니다.\`\``);
            if (this.YoutubeAPI[depth] == undefined) return this.errorhandler("API 쿼리 제한 수를 초과했습니다. "+depth+" 도달", message);
            
            
            youtube_api.GetInfo(musicId, this.YoutubeAPI[depth]).then(info => {
                
                if (info.error) {
                    depth += 1;
                    if (info.error.reason == "quotaExceeded") return this.AddMusic(message, musicId, depth);
                    return this.errorhandler(info.error.message, message);
                }
                
                
                let index = 0;
                do {               
                    let video_info = {
                        title: info[index].title,
                        time: info[index].duration,
                        author: message.member.user.username,
                        id: info[index].id,
                        message: message
                    };
                    this.queue.push(video_info);
                    index += 1;
                } while (index < info.length)
            
                
                
                if (!this.playing) {
                    if (info.length > 1) message.channel.send(`\`\`${info[0].title} 외 ${info.length-1} 곡을 재생목록에 추가했습니다.\`\``);
                    this.PlayMusic(message);
                } else {
                    if (info.length > 1)
                        message.channel.send(`\`\`${info[0].title} 외 ${info.length-1} 곡을 재생목록에 추가했습니다.\`\``);
                    else
                        message.channel.send(`\`\`${info[0].title} 를 재생목록에 추가했습니다.\`\``);
                }
           });
        } catch(err) {
            this.errorhandler(err, message);
        }
    }

    async SearchMusic(message, keyword, depth) {
        if (message.guild.me.voice.channel != message.member.voice.channel && message.guild.me.voice.channel != null) return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);
        if (message.member.voice.channel == null) return message.channel.send(`\`\`음성 채널에 접속해 주세요\`\``);

        let music_list = [];
        let music_select_msg = '';
        if (depth == undefined) depth = 0;
        else message.channel.send(`\`\`${depth} 번째 API키가 작동하지 않습니다. 백업 키로 대체합니다.\`\``);
        if (this.YoutubeAPI[depth] == undefined) return this.errorhandler("API 쿼리 제한 수를 초과했습니다. "+depth+" 도달", message);

        youtube_api.SearchOnYoutube(keyword, this.YoutubeAPI[depth]).then(async result => {
            try {
                if (result.error) {
                    depth += 1;
                    if (result.error.reason == 'quotaExceeded') return this.SearchMusic(message, keyword, depth);
                    throw new Error(result.error.message);
                }
                
                

                result.forEach((value, index) => {

                    let info = {
                        title: value.title,
                        channel_name: value.channel,
                        videoId: value.id,
                        duration: value.duration
                    }
                    music_list.push(info);
                    music_select_msg += `${index+1}: ${info.title} (${info.duration}) - ${info.channel_name}\n`;

                });


                const select_message = await message.channel.send(`\`\`\`Swift\n${music_select_msg}\`\`\``);

                this.Music_Selector(message, select_message, music_list.length).then(result_num => {
                    this.AddMusic(message, music_list[result_num-1].videoId);
                });

            } catch(err) {
                console.log('err');
                this.errorhandler(err, message);
            }
        })
    }
    async Music_Selector(message, select_message, music_range) {
        if (this.Client.listeners('message')[1] != null) {
            this.Client.removeListener('message', this.Client.listeners('message')[1]);
            message.channel.send(`\`\`이전에 입력받던 리스너를 삭제합니다.\`\``);
        }

        let select_timeout = setTimeout(() => {
            // select_message.delete().catch(err => { this.errorhandler(err, message) });

            select_message.edit(`\`\`선택 시간이 초과되었어요.\`\``);
            this.Client.listeners('message')[1] != null ? this.Client.removeListener('message', this.Client.listeners('message')[1]) : '';
        }, 10000);

        return new Promise(resolve => {
            this.Client.on('message', new_message => {
                if (new_message.member.id == this.Client.user.id) return;
                if (new_message.channel.id != message.channel.id) return;
    
                let input_num = !isNaN(new_message.content) ? new_message.content : message.content.substring(1, new_message.content.length);
    
                if (isNaN(input_num)) return;
                if (message.member.id != new_message.member.id) return;
    
                if (input_num < 1 || input_num > music_range)
                    return new_message.channel.send(`\`\`범위 내에서 선택해 주세요.\`\``);
                
                select_message.delete().catch(err => { console.log('메세지가 이미 삭제됨') });
                new_message.delete();
    
                clearTimeout(select_timeout);
                this.Client.removeListener('message', this.Client.listeners('message')[1]);
                resolve(input_num);
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


    errorhandler(err, message) {
        const errormsg = new Discord.MessageEmbed()            
        .setColor('#9147ff')
        .setTitle('⚠️ [ music ] 에서 오류가 발생했어요.')
        .setDescription(err)
        .setTimestamp();
    
        message.channel.send(errormsg);
      }
}

module.exports = music;