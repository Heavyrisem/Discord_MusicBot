exports.DB_update = function(message) {
    return new Promise (function(resolve, reject) {
        var mysql = require('mysql');
        const config = require('./config.js');
        var conn = mysql.createConnection({
            host : config.host,
            user : config.user,
            password : config.password,
            port : config.port,
            database : config.database
        });

        conn.connect();

        conn.query('SELECT prefix, devMode FROM serverConfig WHERE serverID="'+message.guild.id+'";', function(err, rows, fields) {
            if (!err) {
                console.log('결과: ', rows);
                resolve(rows);
                if (rows == '') {
                    const defaultSetting = loadDefaultSettings();
                    resolve(defaultSetting);
                    return;
                }
            } else {
                console.log('쿼리 실행중 오류.', err);
                return;
            }
        });
    });
}





function loadDefaultSettings() {
    console.log('test');
    conn.query('SELECT prefix, devMode FROM serverConfig WHERE serverID="Default"', function(err, rows, fields) {
        if (!err) {
            var sql = "INSERT INTO serverConfig(serverID, prefix, devMode, serverName) VALUES('" + message.guild.id + "', '" + rows[0].prefix + "' ,'" + rows[0].devMode + "' ,'" + message.guild.name+ "');";
            //conn.query(sql);
            console.log(sql);
            conn.end();
            return rows;
        } else {
            console.log('쿼리 실행중 오류.', err);
        }

    });
}