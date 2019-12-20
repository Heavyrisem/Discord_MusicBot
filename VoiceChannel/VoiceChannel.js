const Discord = require('discord.js');

const getyoutube = require('./getyoutube');

class voicechannel extends getyoutube {
    constructor() {
        super();
    }

    Join() {
        var message = this.message;
        try {
            if (message.member.voiceChannel != undefined) {
                this.Autoleave_clear();
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

    Leave() {
        var message = this.message;
        try {
            if (message.guild.me.voiceChannel == undefined) {
                message.channel.send('``아무 채널에도 연결되어 있지 않아요.``');
            } else {
                message.guild.me.voiceChannel.leave();
                message.channel.send('``' + message.guild.me.voiceChannel.name + ' 음성 채널을 떠났어요.``');
                this.Autoleave_clear();
            }
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Now() {
        var message = this.message;
        try {
            if (message.guild.me.voiceChannel == undefined)
                message.channel.send('``아무 채널에도 참가하고 있지 않아요.``');
            else
                message.channel.send('``' + this.client.user.username + ' 는 지금 ' + message.guild.me.voiceChannel.name + ' 에 접속중이에요.``');
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Volume(v) {
        try {
            if (v > 100 || v < 10) return this.message.channel.send('``볼륨은 10 ~ 100 사이에서 정해 주세요.``');
            
            this.voiceChannel.playSong.streamOption.volume = v;
            console.log(this.voiceChannel.playSong.streamOption.volume);
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