class voicechannel {
    constructor() {
    }
    joinchannel(message) {
        if (message.member.voiceChannel != undefined) {
            message.member.voiceChannel.join();
            message.channel.send('``➡️ ' + message.member.voiceChannel.name + ' 에 연결해요``');
        }
    }
    Now() {
        
    }
}

module.exports = voicechannel;