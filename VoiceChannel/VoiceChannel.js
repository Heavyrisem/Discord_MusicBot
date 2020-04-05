const Discord = require('discord.js');
const fs = require('fs');   // 이스터에그 파일 로드용

const music = require('./music');   // 음악 관리 파일 로드

class voicechannel extends music {
    constructor() {
        super();
    }

    FunAction(input, message) { // 이스터에그
        if (this.voiceChannel.playSong.playing) return; // 음악 재생중이면 리턴
        else if (this.message.member.voiceChannel == undefined) return; // 음성채널에 없으면 리턴
        else {
            var e = this;
            var mp3;
            this.voiceChannel.join(message).then(connection => {   // 음성채널 참가
                e.Autoleave_clear();    // 자동 나가기 해제  
                e.voiceChannel.playSong.connection = connection;    // 연결 정보 저장

                if (input == 'Tick') {
                    mp3 = fs.createReadStream('./VoiceChannel/fun/xlr.mp3');
                    const errormsg = new Discord.RichEmbed()
                    .setColor('#ff148e')
                    .setTitle('⚠️ 틱장애 발생.')
                    .setDescription('티기틱ㅌㄱ티기ㅣㅌ기ㅣ티긱')
                    .setTimestamp();
                
                    message.channel.send(errormsg);
                }
                else if (input == 'EE') {
                    message.channel.send('음식이 장난이야?');
                    message.channel.send({
                      files: [{
                        attachment: './VoiceChannel/fun/EE.jpg',
                        name: 'EE.jpg'
                      }]
                    });
                    mp3 = fs.createReadStream('./VoiceChannel/fun/EE.mp3');
                } 
                else if (input == 'eoajfl')
                    mp3 = fs.createReadStream('./VoiceChannel/fun/eoajfl.mp3');
                else throw new Error('틱틱틱틱틱틱틱'); // 진짜 오류 발생

                e.voiceChannel.playSong.dispatcher = connection.playStream(mp3);    // 이스터에그 재생


                e.voiceChannel.playSong.playing = true; // 재생 상태 True, 재생중 음악 추가시 다음 큐에 저장되도록

                e.voiceChannel.playSong.dispatcher.on('end', () => {    // 재생 끝나면
                    e.voiceChannel.playSong.playing = false;    // 재상 상태 False
                    e.voiceChannel.autoleave_active();  // 자동 떠나기 켜기

                    if (e.voiceChannel.playSong.queue[0] != undefined) e.playmusic(message);   // 다음 큐 있으면 재생
                });
            }).catch(error => {
                const errormsg = new Discord.RichEmbed()
                .setColor('#ff148e')
                .setTitle('⚠️ 틱장애 발생.')
                .setDescription(error)
                .setTimestamp();
            
                message.channel.send(errormsg);
                this.voiceChannel.leave(message);
            });
        }
    }

    Join(message) {    // 음성채널 참가
        //var message = this.message; // 메세지 받는식, 마지막 메세지 처리 식으로 아니면 참가 메세지 저장
            if (message.member.voiceChannel != undefined) { // 음성채널 접속확인
                this.Autoleave_clear(); // 자동 떠나기 해제
                if (message.guild.me.voiceChannel == undefined) // 현재 봇이 참가한 채널이 없으면
                    message.channel.send('``➡️ ' + message.member.voiceChannel.name + ' 에 연결해요``');    // 참가한다는 메세지 출력
                this.Autoleave(); // 자동 떠나기 켜기
                return message.member.voiceChannel.join()  // .then()을 위해 참가 메소드 리턴
                .catch((err) => { this.voiceerrorhandler(err) })
                
            } else {
                message.channel.send('``먼저 음성 채널에 접속해 주세요.``');    // 음성채널이 없을때
            }
    }

    Leave(message) {    // 음성채널 떠나기   
        try {
            if (message == undefined)
                message = this.message;
            if (message.guild.me.voiceChannel == undefined || message.guild.me.voiceChannel != message.member.voiceChannel) {   // 봇의 채널이 없는지, 명령한 사람이 봇과 같이 있는지
                message.channel.send('``연결된 채널을 확인해주세요.``');
            } else {
                message.guild.me.voiceChannel.leave();  // leave()
                message.channel.send('``' + message.guild.me.voiceChannel.name + ' 음성 채널을 떠났어요.``');   // 채널을 떠났다는 메세지 출력
                this.Autoleave_clear(); // 자동 떠나기 해제
            }
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Now(message) {  // 현재 접속중인 음성채널, 추후에 핑 관련 추가
        // var message = this.message;
        try {
            if (message.guild.me.voiceChannel == undefined) // 봇의 음성 채널이 없을때
                message.channel.send('``아무 채널에도 참가하고 있지 않아요.``');
            else
                message.channel.send('``' + this.client.user.username + ' 는 지금 ' + message.guild.me.voiceChannel.name + ' 에 접속중이에요.``');  // 봇의 음성채널 이름 출력
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Volume(v, message) {    // 볼륨 조절
        try {
            if (v > 200 || v < 10) return message.channel.send('``볼륨은 10 ~ 200 사이에서 정해 주세요.``');    // 10 ~ 120 제한
            
            this.voiceChannel.playSong.streamOption.volume = v; // 서버 설정에 볼륨 저장
            
            if (this.voiceChannel.playSong.playing) // 음악 재생중이면
                this.voiceChannel.playSong.dispatcher.setVolume(this.voiceChannel.playSong.streamOption.volume * 1 / 800);  // 볼륨 바로 적용

            message.channel.send('``볼륨을 ' + this.voiceChannel.playSong.streamOption.volume + ' 으로 설정했어요.``');
        } catch(error) {
            this.voiceerrorhandler(error);
        }
    }

    Autoleave() {   // 자동 떠나기
        var e = this;
        if (this.voiceChannel.playSong.playing) {   // 음악 재생중 실행 방지
            console.log('오류, Autoleave() 가 재생중에 실행됨');
            return;
        }
        
        this.voiceChannel.autoleave = setTimeout(function() {   // 자동 떠나기 활성화
            var last_message = e.message;
            try {
                if (last_message.guild.me.voiceChannel) {    // 봇이 접속중인 채널이 있다면
                    e.Leave()   // Leave()
                    last_message.channel.send('``⬅️ 활동이 없어서 방을 나갔어요.``'); // 자동으로 떠났다는 메세지
                }
            } catch(error) {
                e.voiceerrorhandler(error);
            }
        }, e.serversetting.autoleave)   // 자동으로 나가는 시간
    }

    Autoleave_clear() { // 자동 떠나기 해제
        clearTimeout(this.voiceChannel.autoleave);
    }

    voiceerrorhandler(msg) {
        const errormsg = new Discord.RichEmbed()
        .setColor('#ff148e')
        .setTitle('⚠️ [VoiceChannel Class] 에서 오류가 발생했어요.')
        .setDescription(msg)
        .setTimestamp();

        this.message.channel.send(errormsg);
        this.voiceChannel.leave();
    }
}

module.exports = voicechannel;