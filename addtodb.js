//johnson

/*var redis = require('redis');
var client = redis.createClient();
client.on('error', function(err){
    console.log('Error ' + err);
});

client.on('connect', function() {
    console.log("redis connected!");
});
//sample listings
listing = {"id":335,
        "slug":"550-west-45th-street-916",
        "title":"Hell's Kitchen, 1 bedroom",
        "bedrooms":1,
        "bathrooms":1,
        "neighborhood":"Hell's Kitchen",
        "parent_neighborhood":{"id":13,"name":"Manhattan","parent_neighborhood":null},
        "price":3100,
        "image_url":"/attachments/store/fit/250/120/99609809117b79b4d7e97177ead57b49c2d9364c7d339ddf7b0f03c4fd6c/image",
        "price_string":"$3,100",
        "available_date":"2016-07-13",
        "full_address":"550 West 45th Street, 10036",
        "listing_type_text":"Entire Apartment",
        "created_at":"2016-03-11T12:09:51.000-05:00",
        "views":268,
        "messages":4,
        "images":27}
listing2 = {"id":501,
        "slug":"brooklyn-williamsburg-260-moore-street",
        "title":"Williamsburg, 4 bedrooms",
        "bedrooms":4,
        "bathrooms":1,
        "neighborhood":"Williamsburg",
        "parent_neighborhood":{"id":11,"name":"Brooklyn","parent_neighborhood":null},
        "price":1100,
        "image_url":"/attachments/store/fit/250/120/a474b702f21aecc3385065575cac5b1ba78fcb17dab9db0240dddd2efb5f/image",
        "price_string":"$1,100",
        "available_date":"2016-07-15",
        "full_address":"260 Moore Street, 11206",
        "listing_type_text":"Share",
        "created_at":"2016-05-16T15:44:03.000-04:00",
        "views":180,
        "messages":28,
        "images":7}
listing3 = {"id":401,
        "slug":"brooklyn-williamsburg-260-moore-street",
        "title":"Williamsburg, 4 bedrooms",
        "bedrooms":4,
        "bathrooms":1,
        "neighborhood":"Williamsburg",
        "parent_neighborhood":{"id":11,"name":"Brooklyn","parent_neighborhood":null},
        "price":1100,
        "image_url":"/attachments/store/fit/250/120/a474b702f21aecc3385065575cac5b1ba78fcb17dab9db0240dddd2efb5f/image",
        "price_string":"$1,100",
        "available_date":"2016-07-19",
        "full_address":"260 Moore Street, 11206",
        "listing_type_text":"Share",
        "created_at":"2016-05-16T15:44:03.000-04:00",
        "views":180,
        "messages":28,
        "images":7}*/

//save listing to another database
function save(id_sender, apt){
    //switch database
    client.select(1);
    //save a listing
    client.sadd(id_sender, JSON.stringify(apt))
    //switch database again
    client.select(2);
    client.set(id_sender, "true");
    //switch back
    client.select(0);
}

//gets the set of listings associated with the senderid and then runs avail_in_milli
function tellme(id_sender, howsoon, beforetoday){
    client.select(1);
    client.smembers(id_sender, function(err, reply){
        console.log(id_sender);
        avail_in_milli(reply, howsoon, beforetoday);
    }) 
    client.select(0);
}

/*
    Goes through list of listings. Checks if listings are within *milli*. If it is,
    it outputs that listing. by default, it does not send listings are already available.
*/
function avail_in_milli(list, milli, before_today){
    var date = Date.parse(new Date());
    for (var i in list){
        var avail = JSON.parse(list[i])['available_date'];
        var time_diff = Date.parse(avail) - date;
        var do_it = false;
        if (before_today || (time_diff > 0 && time_diff < milli)) {
             do_it = true;
        }
        if (do_it && time_diff < milli){
            console.log(JSON.parse(list[i])['id'], JSON.parse(list[i])['available_date']);
        }
    }
}
//if person says/presses a "do not disturb"
function donotdisturb(id_sender){
    client.select(2);
    client.set(id_sender, "false");
    //switch back
    client.select(0);
}
//checks for if the value of the key in database 2 is true or false.
//returned through callback
function canIsend(id, callback){
    client.select(2);
    client.get(id, function(err, reply){
        callback(id, reply);
    });
    //switch back
    client.select(0);
}
//add sample listings to database
save("senderid", listing);
save("senderid", listing2);
save("senderid2", listing);
save("senderid2", listing2);
save("senderid3", listing3);
donotdisturb("senderid");


//in milliseconds
var day = 86400000;
var ids = ["senderid","senderid2","senderid3"];
//run through all ids. if canisend gives true, it sends message that listing is available
setInterval(function(){
    for (var i in ids){
        canIsend(ids[i], function(id, disturb){
            if (disturb == "true"){
                tellme(id, day * 2);
            }
        })
    }
}, day)
