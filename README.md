nodejs-hpfeeds
==============

Simple nodejs code to publish data to the hpfeeds system
(http://hpfeeds.honeycloud.net/)

Simple HpFeeds reciever (for the moment without real auth etc.)

Function for client code

publish(PORT, HOST, CHANNEL, PAYLOAD, secret, identifier)

Port: Port for the hp feeds broker (10000)
Host: Hpfeeds broker 
Channel: Channel to be published to
Payload: Data to be published
secret: you name it
identifier: identifier (authkey)


 
$ sudo npm install -g node-gyp
$ cd node_modules/libxmljs
$ node-gyp rebuild



forever start start.js -l mylog.txt --workingDir /opt/nodejs-hpfeeds/ --sourceDir /opt/nodejs-hpfeeds/ -o ./mylogo.txt -e ./error.log


Ensure, that Redis only listens on local interface
