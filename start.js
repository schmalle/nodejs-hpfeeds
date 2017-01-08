//
// start a dedicated HpFeeds sever
//

var myHpFeedsServer = require ("./server");
myHpFeedsServer.startServer(10000, true, false) // port 10000 useEWS = true verbose = false
