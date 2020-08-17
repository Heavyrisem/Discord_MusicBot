const prettyms = require('pretty-ms');
const Discord = require('discord.js');

class Utility {
    Uptime(message, time) {
        message.channel.send(`\`\`업타임 ${prettyms(time)}\`\``);
    }

    CurrentVersion(message, ver) {
        message.channel.send(`\`\`현재 클라이언트 버전은 ${ver} 입니다.\`\``);
    }

    ShowBotinfo(message, Client) {
        const info_message = new Discord.MessageEmbed()
        .setColor('#9147ff')
        .setAuthor(Client.user.username)
        .setTitle('도움말')
        .setThumbnail('https://images-ext-2.discordapp.net/external/Lbzfl2XV7cgwopCR4_z5ElADp5x-0ebsKWCPnr91GV0/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/619527364090658817/d0236fcaa434b8c75722e85a9cd821a3.png')
        .setDescription('디스코드 음악 봇 ``' + Client.user.username + '``입니다.\n사용할 수 있는 명령어들은 아래와 같아요')
        .addField('\u200B', '\u200B')
        .addField('음악', '``노래(p)`` ``볼륨`` ``스킵`` ``큐`` ``정지`` ``참가`` ``나가`` ``일시정지(pause)`` ``재생(resume)``')
        .addField('유틸리티', '``핑`` ``업타임`` ``정보`` ``버전``')
        .addField('마지막 업데이트 8/17', 'Youtube API 개선, 안정성 향상, 재생목록 감지 기능 추가')
        .setTimestamp()
        .setFooter(Client.guilds.cache.size + '개의 서버와 함께하고 있어요.');
        
        message.channel.send(info_message)
    }


    errorhandler(msg, where, message) {
        const errormsg = new Discord.MessageEmbed()
        .setColor('#9147ff')
        .setTitle('⚠️ [ ' + where + '] 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();
  
        message.channel.send(errormsg);
    }
}

module.exports = Utility;