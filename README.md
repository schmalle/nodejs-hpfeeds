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


