const { getInfo } = require('ytdl-getinfo');


getInfo('_1scmwn_1VI').then((res) => {
    console.log(res.items[0].title);
})