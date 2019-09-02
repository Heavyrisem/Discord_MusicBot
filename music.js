const Discord = require('discord.js');
const search = require('yt-search');
const ytdl = require('ytdl-core');
const steramOpitons = { seek: 0, volume: 0.04, quality: "highest"};

//const client = new Discord.Client();



exports.music_play = function music_play(search_target, message, connection) {
    message.reply(search_target + ' 을(를) 검색해요');

    search(search_target, function ( err, r) {
        const videos = r.videos;
        const playlists = r.playlists;
        const accounts = r.accounts;
        var musiclist;
        var music;

        for (var i=0; i<5; i++){
            if (videos[i].seconds == 0) {
                message.reply('광고를 건너뛰었어요');
                videos[i] = ' ';
                continue;
            } else {
                music = videos[i];
                break;
            }
        }

        for (var i=0; i<=5; i++) {
            if (!(videos[i] == ' ')) {
                if (i == 0) musiclist = i + 1 + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>';

                
                if (!(i == 0)) { 
                    musiclist = musiclist +  i + ': ' + videos[i].title + ' <' + videos[i].duration.timestamp + '>';
                    musiclist = musiclist + '\n';
                }
            }
        }
        message.channel.send('```' + musiclist + '```');

        for (var i=0; i<5; i++)
            console.log(videos[i]);
        
        var URL = "https://www.youtube.com/" + music.url;
        console.log(URL);
        
        play(connection, URL, message);
        //const dispatcher = connection.playSteram(stream, steramOpitons);

    
        message.channel.send('```' + message.member.nickname + ' - ' + music.title + ' ' + music.duration.timestamp + '```');
    });

        
}

async function play(connection, URL, message) {
    const music = ytdl(URL, { filter: 'audioonly' });
    const dispatcher = connection.playStream(music, steramOpitons);
    dispatcher.on('error', () => message.channel.send('에러가 발생했어요'));
    dispatcher.on('end', () => message.channel.send('음악이 끝났어요'));
}