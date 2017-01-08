/**
 * Created by flake on 08/01/2017.
 */

// npm install libxmljs

var libxmljs = require("libxmljs");
var redis = require("./redis");
var fs = require('fs');
var helper = require("./helper");


module.exports = {

    parseEWS: function (data, useredis, verbose) {

        parseXML(data, useredis, verbose)

    }
};


function readFileXML(callback) {

    fs.readFile("/opt/request.xml", 'utf8', function (err,data) {
        if (err) {
            //console.log(err);
            callback(null);
        }
        //console.log(data);

        callback(data)

    });

}

/*
    Parses a dedicacted alert node
 */
function parseAlert(alertNode, useredis, verbose) {

    var children = alertNode.childNodes();

    var childRunner = 0;

    while (childRunner <= children.length - 1) {

        //console.log("Found child from Alert..." + children[childRunner].name())

        if ("Target" == children[childRunner].name()) {

            var targetPort = children[childRunner].attr('port').value()
            if (verbose) console.log("Attack on port " + targetPort)

            if (useredis) {
                redis.increaseKey(helper.getDateTime() + ":" + targetPort)
            }

        }

        childRunner++;

    }

}

function parseXML(data, useredis, verbose) {

    //console.log(data)

    var xmlDoc = libxmljs.parseXml(data);
    var children = xmlDoc.root().childNodes();
    var childRunner = 0;

    while (childRunner <= children.length - 1) {

        //console.log("Found child from root..." + children[childRunner].name())

        if ("Alert" == children[childRunner].name()) {

            parseAlert(children[childRunner], useredis, verbose)

        }

        childRunner++;
    }

}

//var xml = readFileXML(parseXML);


