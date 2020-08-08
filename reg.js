let rg = /^(\!p|\!노래) /;
let url = '!노래 https://www.youtube.com/watch?v=_1scmwn_1VI';
let url2 = '!p https://www.youtube.com/watch?v=_1scmwn_1VI'

console.log(url.match(rg));
console.log(url2.match(rg));