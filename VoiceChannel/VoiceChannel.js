const Discord = require('discord.js');

class VoiceChannel{
    constructor() {
        this.connection = undefined;
        this.autoleave = undefined;
    }

    async Join(message) {
        if (message.member.voice.channel == undefined) {
            message.channel.send(`\`\`먼저 음성 채널에 들어가주세요\`\``);
        } else {
            if (message.guild.me.voice.channel == undefined) {
                this.AutoLeave(message);
                message.channel.send(`\`\`➡️${message.member.voice.channel.name} 에 연결해요\`\``);
            }
            return message.member.voice.channel.join();
        }
    }

    Leave(message) {
        if (message.member.voice.channel == undefined || message.guild.me.voice.channel == undefined)
        message.channel.send(`\`\`음성 채널을 확인해주세요.\`\``);
        else 
            try {
                this.Autoleave_clear();
                message.guild.me.voice.channel.leave();
                message.channel.send(`\`\`${message.member.voice.channel.name} 음성 채널을 떠났어요\`\``);
            } catch(err) {
                this.errorhandler(err, message);
            }
    }

    AutoLeave(message) {
        // console.log('autoleave Activate');
        this.autoleave = setTimeout(() => {
            if (message.guild.me.voice.channel) {
                this.Leave(message);
                message.channel.send('``⬅️ 활동이 없어서 방을 나갔어요.``');
            }
        }, 10000)
    }

    Autoleave_clear() {
        clearTimeout(this.autoleave);
    }

    errorhandler(msg, message) {
        const errormsg = new Discord.MessageEmbed()
        .setColor('#9147ff')
        .setTitle('⚠️ [VoiceChannel] 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();
  
        message.channel.send(errormsg);
    }
}

module.exports = VoiceChannel;