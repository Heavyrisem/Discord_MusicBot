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
                'autoleave': 8000,
            }

            this.voiceChannel = {
                test(a) {e.test(a)},
                join() {return e.Join()},
                now() {e.Now()},
                leave() {e.Leave()},
                addmusic(keyword) {e.search_music(keyword)},
                addmusic_url(target) {e.addmusic(target)},
                skip() {e.Skip()},
                autoleave_active() {e.Autoleave()},
                autoleave_clear() {e.Autoleave_clear()},
                autoleave: undefined,
                playSong: {
                    playing: false,
                    streamOption: {
                        seek: 0,
                        volume: 50,
                        bitrate: 192000
                    },
                    connection: undefined,
                    dispatcher: undefined,
                    queue: [],
                },
                show_queue() {e.queue_show()}
            };
        } catch(error) {
            this.errorhandler(error);
        }
    }

    holdPing() {
        var e = this;
        if (e.ping != undefined) return;

        e.client.user.setActivity('ping ' + e.client.ping);
        e.ping = setInterval(function() {
            e.client.user.setActivity('ping ' + e.client.ping);
        }, 1000);
    }

    updateMsg(message) {
        this.message = message;
    }

    test(message) {
        var e = this;
        setInterval(function() {
            console.log('interval ', e.message.content);
        },500);
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