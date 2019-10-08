exports.DB_update = async function(message) {
    return new Promise (async function(resolve, reject) {
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

        conn.query('SELECT * FROM serverConfig WHERE serverID="'+message.guild.id+'";', async function(err, rows, fields) {
            if (!err) {
                console.log('결과: ', rows);
                if (rows == '') {
                    const defaultSetting = await loadDefaultSettings(conn, message);
                    await resolve(defaultSetting);
                } else {
                    await resolve(rows);
                }
            } else {
                console.log('쿼리 실행중 오류.', err);
            }
        });
        conn.end();
    });
}





async function loadDefaultSettings(conn, message) {
    return new Promise(async function(resolve, reject) {
        conn.query('SELECT prefix, devMode FROM serverConfig WHERE serverID="Default"', async function(err, rows, fields) {
            if (!err) {
                var sql = "INSERT INTO serverConfig(serverID, prefix, devMode, serverName) VALUES('" + message.guild.id + "', '" + rows[0].prefix + "' ,'" + rows[0].devMode + "' ,'" + message.guild.name+ "');";
                //conn.query(sql);
                console.log(rows);
                await resolve(rows);
            } else {
                console.log('2 실행중 오류.', err);
            }
        });
        conn.end();
    });
}