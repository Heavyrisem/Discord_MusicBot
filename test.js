const main = require('./bot.js');

exports.tsfun = function (message) {
    message.reply('테스트 : ' + main.msg);
    console.log('tsfun');

    return;
}