const Discord = require('discord.js');
const fs = require('fs');

const music = require('./music');

class voicechannel extends music {
    constructor() {
        super();
    }

    FunAction(input) {
        if (this.voiceChannel.playSong.playing) return;
        else if (this.message.member.voiceChannel == undefined) return;
        else {
            var e = this;
            var mp3;
            this.voiceChannel.join().then(connection => {
                e.Autoleave_clear();
                e.voiceChannel.playSong.connection = connection;

                if (input == 'Tick') {
                    mp3 = fs.createReadStream('./VoiceChannel/fun/xlr.mp3');
                    const errormsg = new Discord.RichEmbed()
                    .setColor('#ff148e')
                    .setTitle('⚠️ 틱장애 발생.')
                    .setDescription('티기틱ㅌㄱ티기ㅣㅌ기ㅣ티긱')
                    .setTimestamp();
                
                    e.message.channel.send(errormsg);
                }
                else if (input == 'EE') {
                    e.message.channel.send('음식이 장난이야?');
                    e.message.channel.send({
                      files: [{
                        attachment: './VoiceChannel/fun/EE.jpg',
                        name: 'EE.jpg'
                      }]
                    });
                    mp3 = fs.createReadStream('./VoiceChannel/fun/EE.mp3');
                } 
                else if (input == 'eoajfl')
                    mp3 = fs.createReadStream('./VoiceChannel/fun/eoajfl.mp3');
                else throw new Error('틱틱틱틱틱틱틱');

                e.voiceChannel.playSong.dispatcher = connection.playStream(mp3);


                e.voiceChannel.playSong.playing = true;

                e.voiceChannel.playSong.dispatcher.on('end', () => {
                    e.voiceChannel.playSong.playing = false;
                    e.voiceChannel.autoleave_active();

                    if (e.voiceChannel.playSong.queue[0] != undefined) e.playmusic();
                });
            }).catch(error => {
                const errormsg = new Discord.RichEmbed()
                .setColor('#ff148e')
                .setTitle('⚠️ 틱장애 발생.')
                .setDescription(error)
                .setTimestamp();
            
                this.message.channel.send(errormsg);
                this.voiceChannel.leave();
            });
        }
    }

    Join() {
        var message = this.message;
        try {
            if (message.member.voiceChannel != undefined) {
                this.Autoleave_clear();
                if (message.guild.me.voiceChannel == undefined)
                    message.channel.send('``➡️ ' + message.member.voiceChannel.name + ' 에 연결해요``');
                this.Autoleave();
                return message.member.voiceChannel.join();
            } else {
                message.channel.send('``먼저 음성 채널에 접속해 주세요.``');
            }
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Leave(message) {
        var message = this.message;
        try {
            this.last_message = message;
            if (message.guild.me.voiceChannel == undefined || message.guild.me.voiceChannel != message.member.voiceChannel) {
                message.channel.send('``연결된 채널을 확인해주세요.``');
            } else {
                message.guild.me.voiceChannel.leave();
                message.channel.send('``' + message.guild.me.voiceChannel.name + ' 음성 채널을 떠났어요.``');
                this.Autoleave_clear();
            }
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Now(message) {
        // var message = this.message;
        try {
            if (message.guild.me.voiceChannel == undefined)
                message.channel.send('``아무 채널에도 참가하고 있지 않아요.``');
            else
                message.channel.send('``' + this.client.user.username + ' 는 지금 ' + message.guild.me.voiceChannel.name + ' 에 접속중이에요.``');
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Volume(v, message) {
        try {
            if (v > 120 || v < 10) return message.channel.send('``볼륨은 10 ~ 120 사이에서 정해 주세요.``');
            
            this.voiceChannel.playSong.streamOption.volume = v;
            
            if (this.voiceChannel.playSong.playing)
                this.voiceChannel.playSong.dispatcher.setVolume(this.voiceChannel.playSong.streamOption.volume * 1 / 800);

            message.channel.send('``볼륨을 ' + this.voiceChannel.playSong.streamOption.volume + ' 으로 설정했어요.``');
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Autoleave() {
        var e = this;
        if (this.voiceChannel.playSong.playing) {
            console.log('오류, Autoleave() 가 재생중에 실행됨');
            return;
        }
        
        this.voiceChannel.autoleave = setTimeout(function() {
            var message = e.message;
            try {
                if (message.guild.me.voiceChannel) {
                    e.Leave()
                    message.channel.send('``⬅️ 활동이 없어서 방을 나갔어요.``');
                }
            } catch(error) {
                e.voiceerrorhandler(error);
            }
        }, e.serversetting.autoleave)
    }

    Autoleave_clear() {
        clearTimeout(this.voiceChannel.autoleave);
    }

    voiceerrorhandler(msg) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#ff148e')
        .setTitle('⚠️ [VoiceChannel Class] 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();

        this.message.channel.send(errormsg);
        this.voiceChannel.leave();
    }
}

module.exports = voicechannel;