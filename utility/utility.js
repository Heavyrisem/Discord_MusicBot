const steamSearch = require('./steamcroll/steamSearch');


class Utility {
    steamSearch(search) {
        return steamSearch.getSteamGame(search);
    }
}


module.exports = Utility;