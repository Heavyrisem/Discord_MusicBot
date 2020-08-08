const COVID_selfcheck = require('./Covid_selfcheck');
const prettyms = require('pretty-ms');
const Discord = require('discord.js');

class Utility {
    COVID_check(message) {
        try {
            message.delete();
        } catch(err) {
            this.errorhandler(err, 'COIVD_Check', message);
        }
        let msg = message.content.split(' ');
        
        if (msg.length != 4)
            return message.channel.send('``!자가진단 학교이름 학생이름 생년월일(YYMMDD)``');

        COVID_selfcheck(msg[1], msg[2], msg[3]).then(result => {
            let rs_msg = '';
            switch (result) {
                case "SUCCESS":
                    rs_msg = `\`\`${msg[2]} 학생의 자가진단을 완료했습니다.\`\``; break;
                case "WRONG_USER_INFO":
                    rs_msg = `\`\`잘못된 본인확인 정보입니다. 참여주소 또는 본인확인 정보를 확인바랍니다.\`\``; break;
                case "ADIT_CRTFC_NO":
                    rs_msg = `\`\`동일한 이름을 가진 학생이 있어, 웹 페이지에서 진행해 주시길 바랍니다.\`\``; break;
                case "QSTN_USR_ERROR":
                    rs_msg = `\`\`잘못된 본인확인 정보(학교,성명,생년월일)를 입력하였습니다.\`\``; break;
                case "SCHOR_RFLT_YMD_ERROR":
                    rs_msg = `\`\`학생 건강상태 자가진단 참여가능기간을 확인바랍니다.\`\``; break;
                case "SCHUL_NOT_FOUND":
                    rs_msg = `\`\`검색된 학교가 없거나, 같은 이름인 학교가 있습니다. 학교 이름을 정확히 입력해 주세요\`\``; break;
                default:
                    rs_msg = `\`\`오류가 발생했습니다. 다시 시도해 주세요\`\``; break;
            }

            message.channel.send(rs_msg);
        });
    }

    Uptime(message, time) {
        message.channel.send(`\`\`업타임 ${prettyms(time)}\`\``);
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
        .addField('유틸리티', '``핑`` ``업타임`` ``자가진단`` ``정보``')
        .addField('마지막 업데이트 7/30', 'Youtube 검색 API 개선, 오류 수정')
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