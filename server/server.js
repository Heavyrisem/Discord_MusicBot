const voicechannel = require('../VoiceChannel/VoiceChannel');   // 음성채널 관리 로드
const Utility = require('../utility/utility');  //유틸리티 로드

class server extends voicechannel {
    constructor(client, message) {
        try {
            super();
            var e = this;

            this.client = client;
            this.servername = message.guild.name;
            this.message = message;
            this.last_message;
            this.getmessage = true;
            this.ping = undefined;

            this.serversetting = {
                'prefix': '!',
                'autoleave': 60000,
            }

            this.voiceChannel = {   // 왜했지, 삭제해라
                join() {return e.Join()},
                now(m) {e.Now(m)},
                leave(m) {e.Leave(m)},
                addmusic(message, keyword) {e.search_music(message, keyword)},
                addmusic_url(target) {e.Addmusic(target)},
                skip(n) {e.Skip(n)},
                stop() {e.Stop()},
                setvolume(v, m) {e.Volume(v, m)},
                autoleave_active() {e.Autoleave()},
                autoleave_clear() {e.Autoleave_clear()},
                autoleave: undefined,
                playSong: {
                    playing: false,
                    streamOption: {
                        seek: 0,
                        volume: 50,
                        bitrate: 19200
                    },
                    connection: undefined,
                    dispatcher: undefined,
                    queue: [],
                },
                fun : {
                    funAction(input) {e.FunAction(input)},
                },
                show_queue() {e.queue_show()}
            };

            this.Utility = new Utility();   // 유틸리티 부분
        } catch(error) {
            this.errorhandler(error);
        }
    }

    Ping() {    // 핑
        var e = this;
        if (e.ping != undefined) return; // ??

        this.message.channel.send('``현재 핑은 ' + this.client.ping + 'ms 입니다.``'); // discord.js v12에서 Client.ws.ping으로 변경됨, 새로운 핑 시스템 추가 예정
    }

    updateMsg(message) {    // 서버 클래스에 메세지 넣는 기능, 마지막 메세지 저장용으로 변경해라
        if (message == undefined) return;   // 들어온 값 비었으면 리턴
        this.message = message;
    }

    test() {
        console.log(this.voiceChannel.playSong.queue);
    }

    errorhandler(msg) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#ff148e')
        .setTitle('⚠️ [server Class] constructor() 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();
  
        message.channel.send(errormsg);
    }
}

module.exports = server;