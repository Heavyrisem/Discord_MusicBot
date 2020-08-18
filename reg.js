const list_regex = /^.*(youtu.be\/|)([^#\&\?]*).*/;
const url_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
let url = 'https://www.youtube.com/playlist?list=PLlDzPF8ZgkfFgYSRalnp1PXwglYg9OhU-';
let url2 = 'https://www.youtube.com/watch?v=_1scmwn_1VI'
let cm1 = "!노래 odesza late night";

// console.log(url.match(url_regex));
// console.log(url2.match(url_regex));
console.log(cm1.match(url_regex))