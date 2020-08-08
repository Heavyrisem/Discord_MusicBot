const Discord = require('discord.js');
const prettyms = require('pretty-ms');


const DEFAULT_INFO = require('./Default_info.json');
const TOKEN = DEFAULT_INFO.TOKEN_BETA;
const PREFIX = DEFAULT_INFO.PREFIX;


const Client = new Discord.Client();
const current_version = 'v3.2 beta';

const server_class = require('./server_class');
const music = require('./VoiceChannel/music');


let ServerList = new Map();


let counter = 5;

let Flipflop = 0;
Client.on('ready', () => {
    console.log(Client.user.username + ', 준비 완료');

    setInterval(() => {
        switch (Flipflop) {
            case 0:
                Client.user.setActivity(`${current_version}`); Flipflop++; break;
            case 1:
                Client.user.setActivity(`${PREFIX}정보`); Flipflop++; break;
            case 2:
                Client.user.setActivity(`${prettyms(Client.uptime)} 가동`);  Flipflop=0; break;
        }
    }, 5000);
});


Client.on('message', async message => {
    if (message.member.id == Client.user.id) return;


    if (message.content.startsWith(PREFIX))
        message.content = message.content.substring(1, message.content.length);
    else return;
    

    if (!ServerList.has(message.guild.id))
        ServerList.set(message.guild.id, {
            server: new server_class(Client, message),
            music: new music(Client, message)
        });
    let Server = ServerList.get(message.guild.id);

    // =========================== Utility ===============================

    if (message.content == "핑" || message.content == "ping")
        Server.server.Ping(message);
    
    if (message.content.startsWith("자가진단"))
        Server.server.COVID_check(message);
    
    if (message.content == "정보")
        Server.server.ShowBotinfo(message, Client);

    if (message.content == "업타임")
        Server.server.Uptime(message, Client.uptime);
    
    // ============================ VoiceChannel ============================

    if (message.content == "참가")
        Server.music.Join(message);
        
    
    if (message.content == "나가")
        Server.music.Leave(message);
        
    
    // ============================= MUSIC ===========================
    
    if (message.content.startsWith("노래") || message.content.startsWith("p")) {
        if (message.content.split(' ').length < 2)
            return message.channel.send(`\`\`노래 [검색어|유튜브URL]\`\``);
        
        let keyword = '';
        message.content.split(' ').forEach((value, index) => {
            if (index == 0) return;
            keyword += value + ' ';
        });

        const youtube_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        let URL = keyword.match(youtube_regex);
        
        if (URL != null) {            
            if (URL[0].includes('list')) return message.channel.send('``재생목록은 재생할수 없습니다. URL을 확인해주세요``');   // 리스트는 재생 거부
            Server.music.AddMusic(message, URL[7].trim());
        } else {
            console.log(keyword);
            Server.music.SearchMusic(message, keyword);
        }
    }

    if (message.content.startsWith("스킵")) {
        if (message.content.split(' ').length == 2)
            Server.music.Skip(message, message.content.split(' ')[1])
        else
            Server.music.Skip(message);
    }

    if (message.content == "정지" || message.content == "stop")
        Server.music.Stop(message);

    if (message.content.startsWith("볼륨") || message.content.startsWith("v")) {
        if (message.content.split(' ')[1] == undefined) return Server.music.SetVolume(message);
        Server.music.SetVolume(message, message.content.split(' ')[1]);
    }

    if (message.content == "큐") {
        Server.music.Queue(message);
    }

    if (message.content == "일시정지" || message.content == "pause") {
        Server.music.Pause(message);
    }

    if (message.content == "재생" || message.content == "resume") {
        Server.music.Resume(message);
    }



    // =========================== TEST ==============================
    if (message.content == "테스트") {
        message.delete();

        let msg = "==========".split('');
        msg.splice(counter,0,"#");
        msg = msg.toString().replace(/,/gi, "")
        console.log(msg)

        const embedmsg = new Discord.MessageEmbed()            
        .setColor('#9147ff')
        .setTitle('현재 재생 중')
        .setThumbnail('https://i.ytimg.com/vi_webp/HXA9ZL8K5Js/maxresdefault.webp')
        .addField('Inline field title', 'Some value here', true)
        .addField('Inline field title', 'Some value here', true)
        .addField('Inline field title', 'Some value here', true)
        .addField('Inline field title', 'Some value here', true)
        // .setDescription(err)
        .setTimestamp();
        
        message.channel.send(embedmsg);

        message.channel.send(`\`\`${msg}\`\``).then(message => {
            message.react("⬅").then(() => {
                message.react("➡");
            });

            Client.on("messageReactionAdd", async (reaction, user) => {
                if (user == Client.user) return;

                if (reaction.emoji.name == "⬅" && counter > 0) counter--;
                if (reaction.emoji.name == "➡" && counter < 10) counter++;

                let msg = "==========".split('');
                msg.splice(counter,0,"#");
                msg = msg.toString().replace(/,/gi, "")

                message.edit(`\`\`${msg}\`\``);
                reaction.users.remove(user.id);
            })
        });
        // message.channel.send(`\`\`${counter} \`\``);
    }
});




Client.login(TOKEN);