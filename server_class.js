const Utility = require('./Utility/Utility');

class server_class extends Utility{

    constructor(Client, message) {
        super();
        this.Client = Client;
        this.serverName = message.guild.name;
    }

    async Ping(message) {
        const pingTest_msg = await message.channel.send("``핑 테스트``");
        message.channel.send(`\`\`현재 핑은 ${this.Client.ws.ping}ms, 레이턴시는 ${pingTest_msg.createdTimestamp - message.createdTimestamp}ms\`\``);
        pingTest_msg.delete();
    }

    setLastMessage(message) {
        this.message = message;
    }

    errorhandler(msg) {
        const errormsg = new Discord.MessageEmbed()
        .setColor('#9147ff')
        .setTitle('⚠️ [server_class] constructor() 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();
  
        message.channel.send(errormsg);
    }
}

module.exports = server_class;