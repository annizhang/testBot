var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var http = require('http');
var https = require('https');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send("This is TestBot Server");
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

/*$.getJSON('https://joinery.nyc/api/v1/listings/available', function(data) {
    console.log(data);
});*/

//listings in json form
var fetchListingUrl = 'https://joinery.nyc/api/v1/listings/available';
//http://stackoverflow.com/questions/11826384/calling-a-json-api-with-node-js
function searchListings(neighborhood,beds,minPrice, maxPrice,sender,listings){
    //console.log("SEARCHING!!!");
    var newJSON;
    var listing;
    var listingJson;
    var count = 0;
    var newMessage = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements": []}
        }
    };
    for (var i = 0; i < listings.length; i++){
        listing = listings[i];
        console.log("SEARCHING LOOP!");
        //listingJson = JSON.stringify(listing);
        if (listing.bedrooms === beds && 
            listing.price <= maxPrice && 
            listing.price >= minPrice && 
            neighborhood === listing.neighborhood.toLowerCase()){
            count++;
            newMessage.attachment.payload.elements.push(
                {"title": listing.listing_type_text + " " + listing.title + " " + listing.price_string,
                 "image_url": "https://joinery.nyc/" + listing.image_url.replace("fit/250/120", "fill/400/400"),
                 "subtitle": listing.full_address,
                 "buttons": [
                     {"type": "web_url",
                      "url": "https://joinery.nyc/listing/" + listing.slug,
                      "title": "View Apartment"},
                     {"type": "web_url",
                      "url": "https://joinery.nyc",
                      "title": "Go to Joinery"},
                     {"type": "postback",
                      "title": "Keep looking",
                      "payload": "search"
                     }
                 ]
                });
        };
    };
    if (count === 0) {
        testMessage = {"text" : "Sorry I came up empty!! Type joinery to search again!"};
        sendMessage(sender, testMessage);
    }
    else {
        var verb = " are ";
        var results = " apartments ";
        if (count === 1) {
            verb = " is ";
            results = " apartment ";
        }
        var confirmationMessage =
            {"text" :"Here" + verb + count.toString() + results + "I think you'll be interested in!"};
        sendMessage(sender, confirmationMessage);
        sendMessage(sender, newMessage);
    }
}

//gets user's location input
function findLocation(text) {
    //to do: check for valid address input
    text = text || "";
    var result = ["none", ""];
    var values = text.split(' ');
    if (values.length < 4) {
        result[0] = "some";
        result[1] = text;
    }
    return result;
}

function findBeds(text) {
    text = text || "";
    var result = Number.MIN_VALUE;
    if (Number(text) !== NaN) {
        result = Number(text);
    }
    return result;
}

function findPrices(text) {
    text = text || "";
    var results = [Number.MIN_VALUE, Number.MAX_VALUE];
    var values = text.split(' ');
    if (values.length === 3 && 
        values[1] === "to" && 
        Number(values[0]) >= 0 && 
        Number(values[2]) < Number.MAX_VALUE){
        results[0] = Number(values[0]);
        results[1] = Number(values[2]);
    }
    return results;
}

//global vars:
var messageCount = 0; //the very beginning of the message
var locationFound = false;
var place = "";
var beds = Number.MAX_VALUE;
var minPrice = Number.MIN_VALUE;
var maxPrice = Number.MAX_VALUE;
var type = "";


function greetingMessage(recipientId, message) {
    //looking for hi or hello in the received message
    var lowerMess = message.toLowerCase();
    //using regex
    var greet = /\bhi\b/;
    var greet2 = /\bhello\b/;
    var greet3 = /\bhey\b/;
    if ((lowerMess.match(greet) !== null) || 
        (lowerMess.match(greet2) !== null) || 
        (lowerMess.match(greet3) !== null)) {
        var greetingInstruction = 
            {"text": "Hi there! Please type \'joinery\' to get started!"};
        sendMessage(recipientId, greetingInstruction);
        return true;
    }
    return false;
}

function joineryGreeting(recipientId, message) {
    var lowerMess = message.toLowerCase();
    var joinery = /\bjoinery\b/;
    if (joinery.test(lowerMess)) {
        var joineryMess = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title":"Welcome to Joinery",
                "item_url":"https://joinery.nyc",
                "image_url":"https://scontent.fash1-1.fna.fbcdn.net/t31.0-8/10344292_421916781342262_7831247042188894229_o.jpg",
                "subtitle":"Find a home from a fellow renter.",
                "buttons":[
                  {
                    "type":"postback",
                    "title":"Search apartments",
                    "payload":"search"
                  },
                  {
                    "type":"postback",
                    "title":"List my apartment",
                    "payload":"list"
                  },
                  {
                    "type":"web_url",
                    "title":"Go to Joinery",
                    "url":"https://joinery.nyc"
                  }
                ]
              }
            ]
          }
        }
      }
        sendMessage(recipientId, joineryMess);
        return true;
    }
    return false;   
}

// handler receiving messages
app.post('/webhook', function (req, res) {
    //need to create conversation thread
    //create a list of 
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var sender = event.sender.id;
        if (event.message && event.message.text){
            //if user sends a text message
           if (!joineryMessage(event.sender.id, event.message.text) && 
               !greetingMessage(event.sender.id, event.message.text) &&
              !joineryGreeting(event.sender.id, event.message.text)){
               //findLocation takes in the message and finds 
               if (!locationFound) {
                   var location = findLocation(event.message.text);
                   if (location[0] === "none") {
                       sendMessage(event.sender.id, {"text": "Please input vaid location."});
                   } else {
                       console.log("HERE!");
                       console.log ("location = " + location[1]);
                       place = location[1].toLowerCase();
                       locationFound = true;
                       console.log(locationFound);
                       sendMessage(event.sender.id, {"text": "Great! How many bedrooms are you looking for in " + location[1] + "? Please enter a number."});
                   }
               } else if (beds === Number.MAX_VALUE) {
                   //finding bedrooms
                   beds = findBeds(event.message.text);
                   message = {"text": "Nice! What is your price range? Please type in the form of \"low to high\""};
                   sendMessage(event.sender.id, message);
               } else if (minPrice === Number.MIN_VALUE) {
                   var minMax = findPrices(event.message.text);
                   minPrice = minMax[0];
                   maxPrice = minMax[1];
                   var getListings = https.get(fetchListingUrl, function(res){
                       var body = '';
                       res.on('data', function(chunk){
                           //console.log("the chunk is");
                           //console.log(typeof chunk);
                           body += chunk;
                       });
                       res.on('end', function(){
                           console.log("body is" + body);
                           var listings = JSON.parse(body);
                           //console.log(listings);
                           searchListings(place, beds, minPrice, maxPrice, event.sender.id, listings);
                           console.log("Got listings" + listings.length);
                       });
                   }).on('error', function(e){
                       console.log("Got an error: ", e);
                   });
                   //sendMessage(event.sender.id, {"text": "Thanks! Here are some apartments I think you will be interested in:"});
                   //console.log(typeof JSON.stringify(listings));
                   
               } else {
                   sendMessage(event.sender.id, {"text": "hahah what? type 'joinery' to get started finding some no fee apartments or to list your apartment :\)"});
               }
           }
        } if (event.postback) {
            //if user clicked search
            var choice = JSON.stringify(event.postback.payload);
            console.log(choice);
            if (choice === "\"search\""){
                console.log("it is search!");
                message = {"text":"I can help you search! Where would you like to live?"};
                locationFound = false;
                place = "";
                beds = Number.MAX_VALUE;
                minPrice = Number.MIN_VALUE;
                maxPrice = Number.MAX_VALUE;
                type = "";
                sendMessage(event.sender.id, message);
                console.log("location choesn");
            } else {
                //var theText = JSON.stringify(event.postback);
                message ={text: "hmm...choose a different button because I'm not fully functional yet :) "};
                sendMessage(event.sender.id, message);
                console.log("Postback received!!!!!!!");
            }
        }
    res.sendStatus(200);
    }
    console.log("end of receive function");
});

// send rich message with joinery search
function joineryMessage(recipientId, text) {
    text = text || "";
    var values = text.split(' ');
    //if length 3 and first word is "search"
    if (values.length === 2 && values[0] === "search") {
        location = values[1];
        imageUrl = "https://scontent-iad3-1.xx.fbcdn.net/t31.0-8/10344292_421916781342262_7831247042188894229_o.jpg"
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Apartments in " + location,
                            "subtitle": "From Joinery",
                            "image_url": imageUrl,
                            "buttons": [{
                                "type": "web_url",
                                "url": "https://joinery.nyc/search?utf8=%E2%9C%93&neighborhoods%5B%5D=13&bedrooms=Bedrooms&listing-type=Apartment+Type&price-low=Min+%24&price-high=Max+%24&date=",
                                "title": "View results"
                                }, {
                                "type": "postback",
                                "title": "I like these",
                                "payload": "i like this",
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);
            
            return true;
        }
    return false;
    
}