module.exports = function(connection, startnummer) {
    var sql = "SELECT * FROM cars WHERE `startnummer`=" + startnummer;
    connection.query(sql,
        function (err, rows, fields) {
            if (err) {
                console.log('error: Database Select');
                throw err;
            } else {
                return  rows[0]
            }
        });
};