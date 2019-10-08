const DB = require('./DB.js');
exports.fun = function(message) {
  if(message.content == '삐이이') {
    message.channel.send('요오오오오오오오오오오오오오옹');
    return;
  } else if(message.content == '오리') {
    message.channel.send('꽤애액🦆🦆🦆🦆🦆🦆');
    return;
  } else if (message.content.startsWith('이이')) {
    message.channel.send('음식이 장난이야?');
    message.channel.send({
      files: [{
        attachment: 'EE.jpg',
        name: 'EE.jpg'
      }]
    });
    return;
  }
}

exports.getDB_all = async function() {
    return await DB.DB_update('all');
}


async function setServerSetting(message) {
    const serverSetting = await get_DB(message);
    console.log(serverSetting);
    const defaultSetting = {
      prefix: serverSetting[0].prefix,            // DB 저장
      musicLoop: false,
      voiceChannel: null,
      serverQueue: null,
      exitTimer: null,
      devMode: serverSetting[0].devMode,          // DB 저장
    };
    console.log(defaultSetting);
  
    serverStatus.set(message.guild.id, defaultSetting);
    return '생성 완료';
  }


  async function get_DB(message) {
    var test = await DB.DB_update(message);
    console.log(test);
    return test;
  }