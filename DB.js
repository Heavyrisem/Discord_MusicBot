exports.DB_update = function(message) {
    return new Promise (function(resolve, reject) {
        const conn = connectDB();
        if (message = 'all') {
            return conn.query('SELECT * FROM serverConfig;', function(err, rows, fields) {
                if (!err) {
                    if (rows == '')
                        console.log('데이터베이스가 비었습니다.');
                    resolve (rows);
                } else {
                    console.log('초기 데이터베이스 가져오는 중 오류.', err);
                }
            });
        }

        conn.query('SELECT * FROM serverConfig WHERE serverID="' + message.guild.id + '";', function(err, rows, fields) {
            if (!err) {
                console.log('결과: ', rows);
                if (true) {
                    const defaultSetting = loadDefaultSettings(conn, message);
                    resolve(defaultSetting);
                    console.log('close');
                    conn.end();
                } else {
                    resolve(rows);
                    console.log('close');
                    conn.end();
                }
            } else {
                console.log('쿼리 실행중 오류.', err);
            }
        });
    });
}

exports.getallDB = function(message) {
    return new Promise (function(resolve, reject) {
        const conn = connectDB();
        conn.query('SELECT * FROM serverConfig;', function(err, rows, fields) {
            if (!err) {
                if (rows == '')
                    console.log('데이터베이스가 비었습니다.');
                resolve (rows);
            } else {
                console.log('초기 데이터베이스 가져오는 중 오류.', err);
            }
        });
    });
}

exports.inputNewServer = async function(message) {
    const conn = connectDB();
    console.log(await loadDefaultSettings(conn, message));
}




function connectDB() {
        var mysql = require('mysql');
        const config = require('./config.js');
        var conn = mysql.createConnection({
            host : config.host,
            user : config.user,
            password : config.password,
            port : config.port,
            database : config.database
        });

        conn.on('error', function(err) {
            console.log(err.code);
        });
        return conn;
}


async function loadDefaultSettings(conn, message) {
    console.log('test');
    return new Promise(async function(resolve, reject) {
        conn.query('SELECT prefix, devMode FROM serverConfig WHERE serverID="Default"', function(err, rows, fields) {
            if (!err) {
                var sql = "INSERT INTO serverConfig(serverID, prefix, devMode, serverName) VALUES('" + message.guild.id + "', '" + rows[0].prefix + "' ,'" + rows[0].devMode + "' ,'" + message.guild.name+ "');";
                conn.query(sql);
                console.log(sql);
                resolve(rows);
            } else {
                console.log('2 실행중 오류.', err);
            }
        });
    });
}