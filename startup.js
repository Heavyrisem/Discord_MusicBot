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