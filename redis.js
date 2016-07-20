var redis = require('redis');
                    
//connecting to the server
var client = redis.createClient(process.env.REDIS_URL);

client.on('error', function(err){
    console.log('Error ' + err);
});

client.on('connect', function() {
    console.log("redis connected!");
});

module.exports = client;