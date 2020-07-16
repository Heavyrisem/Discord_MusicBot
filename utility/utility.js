const steamSearch = require('./steamcroll/steamSearch');
const COVID_selfTest = require('./self_test');

class Utility {
    steamSearch(search) {
        return steamSearch.getSteamGame(search);
    }
    self_test(message) {
        message.delete();
        let msg = message.content.split(' ');
        if (msg.length != 4)
            return message.channel.send('``!자가진단 학교이름 학생이름 생년월일(YYMMDD)``', msg.length);
            
        let Usr = {
            school: { name: msg[1], code: undefined },
            name: msg[2],
            birth: msg[3]
        };
        return COVID_selfTest.Self_test(Usr, message);
    }
}


module.exports = Utility;