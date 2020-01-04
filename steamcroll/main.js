const readline = require('readline');
const axios = require('axios');
const cheerio = require('cheerio');

const r = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});


r.question("Steam 에서 검색 : ", function(answer) {
    var search = answer;
    console.log("steam 에서 " + search + "를 검색합니다");
    printres(search);
    r.close();
});



async function getres(search) {
    try {
        return await axios.get('https://store.steampowered.com/search/', {
            params: {
                term: search,
                gnore_preferences: 1
            }
        });
    } catch (error) {
        console.log(error);
    }
}

async function printres(search) {
    const res = await getres(search);
    //console.log(res.data);
    var data = cheerio.load(res.data);
    var gametitle = [];
    var gameprice = [];
    var gamerelesed = [];
    var gameplatform = [];
    var gameimgURL = [];
    data('div#search_resultsRows').children('a').each(function(key, val) {
        gametitle[key] = data('span.title', val).text();
        gameprice[key] = data('div.search_price_discount_combined', val).attr('data-price-final') / 100;
        gamerelesed[key] = data('div.search_released', val).text();
        gameimgURL[key] = data('div.search_capsule', val).children('img').attr('src');
        data('div.search_name', val).children('p').each(function(k, va) {
            gameplatform[key] = "";
            if (data(va).html().match("win") != null) {
                gameplatform[key] = gameplatform[key] + "win ";
            }
            if (data(va).html().match("mac") != null) {
                gameplatform[key] = gameplatform[key] + "mac ";
            }
            if (data(va).html().match("linux") != null) {
                gameplatform[key] = gameplatform[key] + "linux ";
            }
            if (data(va).html().match("VR") != null) {
                gameplatform[key] = gameplatform[key] + "VR ";
            }
        });
        console.log("");
        console.log(gametitle[key] + " - " + gameprice[key] + "원, 출시일 : " + gamerelesed[key] + ", Platform : " + gameplatform[key] +  ", URL : " + gameimgURL[key]);
        console.log("");

    });
}







