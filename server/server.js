const voicechannel = require('../VoiceChannel/VoiceChannel');

class server extends voicechannel {
    constructor(client, message) {
        try {
            super();
            var e = this;

            this.client = client;
            this.servername = message.guild.name;
            this.message = message;
            this.getmessage = true;
            this.ping = undefined;

            this.serversetting = {
                'prefix': '!',
                'autoleave': 60000,
            }

            this.voiceChannel = {
                join() {return e.Join()},
                now() {e.Now()},
                leave() {e.Leave()},
                addmusic(message, keyword) {e.search_music(message, keyword)},
                addmusic_url(target) {e.Addmusic(target)},
                skip(n) {e.Skip(n)},
                stop() {e.Stop()},
                setvolume(v) {e.Volume(v)},
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
        } catch(error) {
            this.errorhandler(error);
        }
    }

    Ping() {
        var e = this;
        if (e.ping != undefined) return;

        this.message.channel.send('``현재 핑은 ' + this.client.ping + 'ms 입니다.``');
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