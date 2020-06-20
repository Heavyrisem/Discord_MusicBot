const youtube_search = require('youtube-search');

const youtube_search_opt = {
    maxResults: 10,
    key: 'AIzaSyAE3XrR70rvhswQHouLcRHNvBkhHs_Euvo'
}

youtube_search('잡어', youtube_search_opt, (err, result) => {
    if (err) console.log(err);
    console.log(result[0]);
})
