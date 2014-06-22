
//
//
// simple NodeJS hp feeds client code
// written by Markus Schmall
// 
// npm install string
// npm install put
// npm install binary
//
//

var put = require('put');
var binary = require('binary');
var S = require('string');
var net = require('net');
var crypto = require('crypto'), shasum = crypto.createHash('sha1');

var len, type, lenIdent, serverName, nonce = "0000";

// create socket
var client = new net.Socket();

module.exports = {
		publish: function(PORT, HOST, CHANNEL, PAYLOAD, secret, identifier) {


// connect to socket
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
    console.log('Recieved ' + S(data).length + ' bytes');
    
    // now dissect hp feed format
    // 4 byte length of entire packet (S(data).length)
    // 1 Byte Type
    // 1 Byte Length ServerName
    // n Bytes ServerName
    // 4 Bytes Nonce
    
    
		binary.parse(data)
        .word32bu('len')
        .word8bu('type')
        .word8bu('lenIdent')

    .tap(function (vars) {
        
        this.skip(vars.lenIdent)
        this.buffer('nonce', 4)
        console.dir(vars);
        
        type = vars.type;
        lenIdent = vars.lenIdent;
        nonce = vars.nonce;
        
    })
    
 
 
 		//
		// calculate now sha1(nonce + secret)
		// 

		var buffer = new Buffer(nonce, "HEX");
				
		shasum.update(buffer);
		shasum.update(secret);
		var binOut = shasum.digest();

		//
		// create AUTH packet now
		//

		var authLen = 4 + 1 + 1 + S(identifier).length + 20;

		var authBuf = put()
    	.word32be(authLen)
    	.word8(2)															// AUTH PACKET
    	.word8(S(identifier).length)					// LENGTH IDENTIFIER
    	.put(new Buffer(identifier, 'ascii'))	// LENGTH IDENTIFIER
    	.put(binOut)													// LENGTH HASH
    	.buffer()
		;

		console.log(authBuf);
 
 		// send data to server
 
 		client.write(authBuf);
 

		// publish laenge channel name
		// channelname
		// data
		 
 
 		//
		// create PUBLISH packet now
		//

		var publishLen = 4 + 1 + 1 + S(identifier).length + 1 + S(CHANNEL).length+ S(PAYLOAD).length;

		var pubBuf = put()
    	.word32be(publishLen)
    	.word8(3)															// PUBLISH PACKET
    	.word8(S(identifier).length)					// LENGTH IDENTIFIER
    	.put(new Buffer(identifier, 'ascii'))	// IDENTIFIER
    	.word8(S(CHANNEL).length)							// LENGTH CHANNEL
    	.put(new Buffer(CHANNEL, 'ascii'))		// CHANNEL
    	.put(new Buffer(PAYLOAD, 'ascii'))		// PAYLOAD

    	.buffer()
		;

		console.log(pubBuf);
 
 		// send data to server
 
 		client.write(pubBuf); 
    
    // Close the client socket completely
    client.destroy();
    
});

//
// Add a 'close' event handler for the client socket
//
client.on('close', function() {
    console.log('Connection closed');
});

}	 // publish function

}; // module exports