
//
//
// simple NodeJS hp feeds server code
// written by Markus Schmall
//
// 
// npm install string
// npm install put
// npm install binary
// npm install hexdump-nodejs
//
//

var put = require('put');
var binary = require('binary');
var S = require('string');
var net = require('net');
var hexdump = require('hexdump-nodejs');
var crypto = require('crypto'), shasum = crypto.createHash('sha1');

var len, type, lenIdent, lenChannel = 0, serverName, nonce;

var identifier = "HPFeedsNodeJSServer"
var payload, authHash, channel;

// Keep track of the chat clients
var clients = [];

// Start a TCP Server
net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort


    //
    // create initial packet from server with none
    //

    var publishLen = 4 + 1 + 1 + S(identifier).length + 4;

    var pubBuf = put()
            .word32be(publishLen)
            .word8(1)															// INFO PACKET
            .word8(S(identifier).length)										// LENGTH IDENTIFIER
            .put(new Buffer(identifier, 'ascii'))								// IDENTIFIER
            .word32be(0x42424242)										        // NONCE
             .buffer()
        ;

    socket.write(pubBuf)


    // Handle incoming messages from clients.
    socket.on('data', function (data) {

        binary.parse(data)
            .word32bu('len')
            .word8bu('type')
            .word8bu('lenIdent')

            .tap(function (vars) {

                // check for AUTH packet
                if (vars.type == 2) {

                    this.buffer('identifier', vars.lenIdent)
                    this.buffer('authHash', 20)

                    type = vars.type;
                    lenIdent = vars.lenIdent;
                    identifier= vars.identifier;
                    authHash = vars.authHash

                }

                // check for PUBLISH packet
                if (vars.type == 3) {

                    this.buffer('identifier', vars.lenIdent);
                    this.buffer('lenChannel', 1);

                    var lenChannel = vars.lenChannel.toString().charCodeAt(0);

                    this.buffer('channel', lenChannel);

                    var lenPayload  = vars.len - 4 - vars.lenIdent - 1 - lenChannel - 2;

                    this.buffer('payload', lenPayload);

                    type = vars.type;
                    lenIdent = vars.lenIdent;
                    identifier= vars.identifier;
                    channel = vars.channel;
                    payload = vars.payload;

                }

            })


        console.log ("Recieved data packet of type: " + type);


        if (type == 2) {
            console.log("Auth packet with identifier: " + identifier.toString() + " and hash")
            console.log(hexdump(authHash))
        }

        if (type == 3) {
            console.log ("   Publish packet with channel: " + channel.toString() + " and identifier " + identifier.toString())
            console.log(hexdump(payload))
        }


        if (type == 4) console.log ("   Subscribe packet with nonce: " + nonce)


    });



    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " closed the connection.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("HpFeeds server running at port 5000\n");