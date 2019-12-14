const ytdl = require('ytdl-core');

const fs = require('fs');

class getyoutube {
    constructor() {
    }

    playmusic_url(url) {
        this.message.member.voiceChannel.join().then(connection => {
            connection.playStream(ytdl('https://www.youtube.com/watch?v=8xlUBdQS5Ho').pipe(fs.createWriteStream('babayetu.mp3')));
        })
    }
}

module.exports = getyoutube;