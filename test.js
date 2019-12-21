const fs = require('fs');

var file = fs.createReadStream('test.txt', 'UTF-8');

var i =0;

var r = '';
file.on('data', (c) => {console.log(++i); r = r + c;})
file.on('end', () => {console.log (r)});