exports.getallDB = function() {
    return new Promise (function(resolve, reject) {
        const conn = connectDB();
        conn.query('SELECT * FROM serverConfig;', function(err, rows, fields) {
            if (!err) {
                if (rows == '')
                    console.log('데이터베이스가 비었습니다.');
                conn.end();
                resolve (rows);
            } else {
                console.log('초기 데이터베이스 가져오는 중 오류.', err);
                conn.end();
            }
        });
    });
}

exports.searchServerID = async function(message) {
    return new Promise(function(resolve, reject) {
        var conn = connectDB();
        conn.query('SELECT * FROM serverConfig WHERE serverID="' + message.guild.id + '";', function(err, rows, fields) {
            if (!err) {
                console.log('결과: ', rows[0]);
                resolve(rows[0]);
            } else {
                console.log('쿼리 실행중 오류.', err);
            }
            conn.end();
        });
        return;
    });
}

exports.createNewSetting = function(message, defaultsetting) {
    var conn = connectDB();
    var sql = "INSERT INTO serverConfig(serverID, prefix, devMode, serverName) VALUES('" + message.guild.id + "', '" + defaultsetting.prefix + "' ,'" + defaultsetting.devMode + "' ,'" + message.guild.name+ "');";
    conn.query(sql);
    console.log(sql);
    conn.end();
    return;
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