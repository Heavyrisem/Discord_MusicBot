const fs = require('fs');

var test = fs.createReadStream('xlr.mp4');

test.on('data', data => {
    console.log('data');
})