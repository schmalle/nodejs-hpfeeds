var myTest = require ("../nodehp");
fs = require('fs')


function startTest(callback) {

    var xml;

    fs.readFile("/opt/request.xml", 'utf8', function (err,data) {
        if (err) {
            //console.log(err);
            callback(null);
        }
        //console.log(data);
        xml = data
        callback(10000, "127.0.0.1", "ChannelName", data, "SECRET", "MeineID")

    });

}

startTest(myTest.publish)


