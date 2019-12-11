const Discord = require('discord.js');

var joy = 0;


function GetClientPing(client, message) {
    message.channel.send('현재 지박령 핑 상태에요 : `' + client.ping + 'ms`');
    return;
}

function Pray(client, message) {
    joy++;
    const prayJoy = new Discord.RichEmbed()
    .setColor('#ff148e')
    .setDescription('**' + message.author.username + ' 님이 조의를 표했습니다.**')
    .addField('오늘 ' + joy + ' 명이 조의를 표했습니다.', '** **', true);

    message.channel.send(prayJoy);
    return;
}

function Help(client, message, prefix) {
    const helpEmbed = new Discord.RichEmbed()
    .setColor('#ff148e')
    .setTitle(client.user.username)
    .setURL('http://discordbot-ghost.forharu.com/')
    .setAuthor('도움말', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription('유튜브에 있는 음악들을 재생해주는 봇이에요.')
    .setThumbnail('http://discordbot-ghost.forharu.com/bot.png')
    .addField("사용법", "`" + prefix + "명령어` 로 사용할수 있어요.")
    .addBlankField()
    .addField(`노래`, "`노래` `참가` `나가` `스킵` `정지` `큐` `큐 비우기` `취소`")
    .addField(`유틸`, "`핑` `상태` `도움` `설정` `접두어 변경`")
    .addBlankField()
    .addField("주의!", "아직 개발 중이여서 불안정한 부분이 있어요. \n업데이트가 되면 웹 페이지에서 확인할수 있어요.",)
    .addBlankField()
    .setFooter('맨 위의 봇 이름을 클릭하면 웹 페이지로 이동해요. (개발 - 지박령, 도움 - 알파카맨)', 'https://i.imgur.com/wSTFkRM.png');
  
    message.channel.send(helpEmbed);
    return;
}


module.exports.Help = Help;
module.exports.GetClientPing = GetClientPing;
module.exports.Pray = Pray;