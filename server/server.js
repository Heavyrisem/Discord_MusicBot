const voicechannel = require('../VoiceChannel/VoiceChannel');


class server extends voicechannel {
    constructor(client, message) {
        super();
        this.client = client;
        this.servername = message.guild.name;
        console.log('created!');
    }
    join(message) {
        try {
            this.joinchannel(message);
        } catch(error) {
            this.errorhandler(error, message);
        }
    }


    holdPing() {
        var e = this;
        setInterval(function() {
            e.client.user.setActivity('ping : ' + e.client.ping);
        }, 1000);
    }

    errorhandler(msg, message) {
        message.channel.send('``'+msg+'``');
    }
}

module.exports = server;