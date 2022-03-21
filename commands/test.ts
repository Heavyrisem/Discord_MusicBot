import ytdl from 'ytdl-core';

(async () => {
  ytdl.getBasicInfo('xarC5jAiO7w').then((d) => {
    console.log(d.videoDetails.title, d.videoDetails.videoId);
  });
})();
