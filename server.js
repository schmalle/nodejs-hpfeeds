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

//var Buffer = require('buffer');
var fs = require("fs");
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
var img = [];
var bytes;

//
// Start a TCP Server
//
net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort


    //
    // create initial packet from server with none
    //

    var publishLen = 4 + 1 + 1 + S(identifier).length + 4;

    var pubBuf = put()
            .word32be(publishLen)                                               //
            .word8(1)                                                           // INFO PACKET
            .word8(S(identifier).length)                                        // LENGTH IDENTIFIER
            .put(new Buffer(identifier, 'ascii'))                               // IDENTIFIER
            // .put(Buffer.from(identifier))
            .word32be(0x42424242)                                               // NONCE
            .buffer()
        ;

    socket.write(pubBuf)

    // Handle incoming messages from clients.
    socket.on('data', function (data) {

        img.push(data)

        console.log("Recieved " + data.size + " bytes....")

    });

    //
    // Remove the client from the list when it leaves
    //
    socket.on('end', function () {

        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " closed the connection.\n");

        bytes = Buffer.concat(img);

        var lenCompletePacket = bytes.byteLength
        var byteRunner = 0


        binary.parse(bytes)


            .tap(function (vars2) {


                while (byteRunner <= lenCompletePacket -1) {

                    console.log("Starting scan loop at offset " + byteRunner + " from total length  " + lenCompletePacket)

                    this.word32bu('len')
                    this.word8bu('type')
                    this.word8bu('lenIdent')

                    this.tap(function (vars) {


                        this.buffer('identifier', vars.lenIdent)

                        identifier = vars.identifier
                        lenIdent = vars.lenIdent;
                        type = vars.type;


                        //
                        // check for AUTH packet
                        //
                        if (vars.type == 2) {

                            this.buffer('authHash', 20)
                            authHash = vars.authHash
                            byteRunner += 6 + 20 + vars.lenIdent
                            this.flush()
                        }

                        //
                        // check for PUBLISH packet
                        //
                        if (vars.type == 3) {


                            this.word8bu('lenChannel')

                            var lenChannelPlain = vars.lenChannel.toString();
                            var lenChannel = vars.lenChannel.toString().charCodeAt(0);

                            this.buffer('channel', vars.lenChannel);

                            var lenPayload = vars.len - 4 - 1 - 1 - vars.lenIdent - 1 -vars.lenChannel;

                            this.buffer('payload', lenPayload);

                            channel = vars.channel;
                            payload = vars.payload;
                            len = vars.len;

                            byteRunner += 6 + vars.lenIdent + 1 + lenChannel + lenPayload

                        }

                        if (type == 2) {
                            console.log("Auth packet with identifier: " + identifier.toString() + " and hash")
                            console.log(hexdump(authHash))
                        }

                        if (type == 3) {
                            console.log ("   Publish packet with channel: " + channel.toString() + " and identifier " + identifier.toString() + " and len " + len.toString() + " and payload " + payload.toString())
                            console.log(hexdump(payload))
                        }

                    })

                }

            })


    });

    //
    // Send a message to all clients
    //
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

}).listen(10000);

// Put a friendly message on the terminal of the server.
console.log("HpFeeds server running at port 10000\n");


