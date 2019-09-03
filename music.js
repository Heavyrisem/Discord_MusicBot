const Discord = require('discord.js');
const search = require('yt-search');
const ytdl = require('ytdl-core');
const steramOpitons = { seek: 0, volume: 0.05};

//const queue = new Map();

//const client = new Discord.Client();

var memberId;
var addPick;



exports.music_play = function music_play(search_target, message, connection) {
    message.reply(search_target + ' 을(를) 검색해요');

    //const serverQueue = queue.get(message.guild.id);

    search(search_target, function ( err, r) {
        const videos = r.videos;
        const playlists = r.playlists;
        var musiclistMsg = ' ';
        var musiclist = new Array();

        for (var i=0; i<5; i++)
            console.log(videos[i].title);

        var music;
        var start = 0;
        var tmp = 1;

       // for (var i=0; i<5; i++){
            /*if (videos[i].seconds == 0) {
                message.reply('광고를 건너뛰었어요');
                start++;
                tmp--;
                //videos[i] = ' ';
                //musiclist[i] = ' ';
                continue;
            } else {
                music = videos[i];
                break;
            }*/
        //}


       // var loop = 5;
        /*for (var i=0; i<=5; i++) {
            if (!(videos[i] == ' ')) {
                if (musiclistMsg == ' ') {
                    musiclistMsg = (i + tmp) + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>';
                    musiclist[i] = videos[i];
                }

                
                if (!(i == 0)) { 
                    musiclistMsg = musiclistMsg +  (i + tmp) + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>';
                    musiclistMsg = musiclistMsg + '\n'; 
                    musiclist[i] = videos[i];
                }
            }
        }*/

        for (var i=0; i<5; i++) {
            if(i == 0) {
                musiclistMsg = (i+1) + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>\n';
            }

            if(!(i==0)) {
                musiclistMsg = musiclistMsg +  (i+1) + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>';
                musiclistMsg = musiclistMsg + '\n'; 
            }

        }


        console.log(musiclistMsg);
        message.channel.send('```' + musiclistMsg + '```');
        memberId = message.member.id;


        var Interval = setInterval(function() {
            if (!isNaN(addPick)) {
                message.reply('선택 확인 : ' + addPick);
                addPick--;
                clearInterval(Interval);
                clearTimeout(Timeout);
                start =  parseInt(start);
                tmp = parseInt(tmp);
                addPick = parseInt(addPick);
                var tmp2 = (tmp + addPick);
                var URL = 'https://www.youtube.com/' + videos[addPick].url;
                var title = videos[addPick].title;
                var time = videos[addPick].duration.timestamp;
                play(connection, URL, message, title, time);
                addPick = '';
                console.log('선택곡 제목 : ' + URL + ', tmp2 : ' + tmp2);

            } else if (isNaN(addPick)) {
                console.log("선택안됨");
            }
        }, 500);

        var Timeout = setTimeout(function() {
            clearTimeout(Interval);
            console.log("시간 만료");
            message.reply('노래는 5초안에 선택해야 해요 <!번호> 로 선택할수 있어요');
        },7000);


        

        //const dispatcher = connection.playSteram(stream, steramOpitons);

    

    });

        
}

async function play(connection, URL, message, title, time) {
    const music = ytdl(URL, { filter: 'audioonly' });
    const dispatcher = connection.playStream(music, steramOpitons);

    message.channel.send('```' + message.member.nickname + ' - ' + title + ' ' + time + '```');

    dispatcher.on('error', () => message.channel.send('에러가 발생했어요'));
    dispatcher.on('end', () => {
        message.channel.send('음악이 끝났어요');
        dispatcher.end();
});
}

exports.userPick = function userPick(message, pick) {
    if (message.member.id == memberId) {
        addPick = pick;
        console.log('userPick : ' + addPick);
    }
}