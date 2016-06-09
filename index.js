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
//var listings = [];

//http://stackoverflow.com/questions/11826384/calling-a-json-api-with-node-js


function searchListings(beds,minPrice, maxPrice,sender,listings){
    console.log("SEARCHING!!!");
    var newJSON;
    var listing;
    var listingJson;
    var newMessage = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements": []}
        }
    };
    for (listing in JSON.stringify(listings)){
        //listingJson = JSON.stringify(listing);
        if (listing.bedrooms === beds && listing.price <= maxPrice && listing.price >= minPrice){
            newJSON = {"title": listing.title,
                       "image_url": "https://joinery.nyc/" + listing.image_url,
                       "subtitle": listing.street_address,
                       "buttons": [
                           {"type": "web_url",
                           "url": "https://joinery.nyc/listing/" + listing.slug,
                           "title": "View Apartment"},
                           {"type": "web_url",
                           "url": "https://joinery.nyc",
                           "title": "Go to Joinery"}
                       ]
                      };
            newMessage.attachment.payload.elements.push(newJSON);
        };
    };
    
    var testMessage = {"text" :"got them!"};
    sendMessage(sender, testMessage);
    sendMessage(sender, newMessage);
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
    if (values.length === 3 && values[1] === "to" && Number(values[0]) >= 0 && Number(values[2]) < Number.MAX_VALUE){
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
    if ((lowerMess.match(greet) !== null) || (lowerMess.match(greet2) !== null) || (lowerMess.match(greet3) !== null)) {
        var greetingInstruction = {"text": "Hi there! Please type \'joinery\' to get started!"};
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
                    "title":"I want to search for an apartment.",
                    "payload":"search"
                  },
                  {
                    "type":"postback",
                    "title":"I want to list my apartment.",
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
    var count = 0;
    for (i = 0; i < events.length; i++) {
        console.log(count);
        var event = events[i];
        var sender = event.sender.id;
        if (event.message && event.message.text){
            //if user sends a text message
           if (!joineryMessage(event.sender.id, event.message.text) && !greetingMessage(event.sender.id, event.message.text) &&
              !joineryGreeting(event.sender.id, event.message.text)){
               //console.log("location?");
               //console.log(locationFound);
            //sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
            //findLocation takes in the message and finds 
               if (!locationFound) {
                   var location = findLocation(event.message.text);
                   if (location[0] === "none") {
                       sendMessage(event.sender.id, {"text": "Please input vaid location."});
                   } else {
                       console.log("HERE!");
                       console.log ("location = " + location[1]);
                       place = location[1];
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
                   var listings;
                   var getListings = https.get(fetchListingUrl, function(res){
                       var body = '';
                       res.on('data', function(chunk){
                           //console.log(chunk);
                           body += chunk;
                       });
                       res.on('end', function(){
                           listings = JSON.parse(body);
                           //console.log(listings);
                           //console.log(typeof listings);
                           console.log("Got listings");
                       });
                   }).on('error', function(e){
                       console.log("Got an error: ", e);
                   });
                   //sendMessage(event.sender.id, {"text": "Thanks! Here are 5 apartments I think you will be interested in:"});
                   searchListings(beds, minPrice, maxPrice, event.sender.id, listings);
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
                            "image_url": imageUrl ,
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
        
        
/* message with buttons with boroughs
   message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type":"button",
                            "text":"Where would you want to live?",
                            "buttons":[
                                {
                                    "type":"postback",
                                    "title":"Manhattan",
                                    "payload":"loc-manhattan"
                                },
                                {
                                    "type":"postback",
                                    "title":"Brooklyn",
                                    "payload":"loc-bklyn"
                                },
                                {
                                    "type":"postback",
                                    "title":"Queens",
                                    "payload":"loc-queens"
                                }
                            ]
                        }
                    }
                };

streeteasy url for west village price 1500 to 2000 with beds greater than 2 and 
%7C is a pipe character

http://streeteasy.com/for-rent/west-village/price:1500-2000%7Cbeds%3E=2%7Cbaths%3E=1%7Cno_fee:1


streeteasy url for manhattan price 0 to 2000 with 1 bed and 
http://streeteasy.com/for-rent/manhattan/price:0-2000%7Cbeds:1%7Cbaths%3E=1%7Cno_fee:1

!!!!!!!!!mutliple elements for a message!!!!!!!!!!!!!!!!!!!!
curl -X POST -H "Content-Type: application/json" -d '{
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Classic White T-Shirt",
            "image_url":"http://petersapparel.parseapp.com/img/item100-thumb.png",
            "subtitle":"Soft white cotton t-shirt is back in style",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com/view_item?item_id=100",
                "title":"View Item"
              },
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com/buy_item?item_id=100",
                "title":"Buy Item"
              },
              {
                "type":"postback",
                "title":"Bookmark Item",
                "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM100"
              }              
            ]
          },
          {
            "title":"Classic Grey T-Shirt",
            "image_url":"http://petersapparel.parseapp.com/img/item101-thumb.png",
            "subtitle":"Soft gray cotton t-shirt is back in style",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com/view_item?item_id=101",
                "title":"View Item"
              },
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com/buy_item?item_id=101",
                "title":"Buy Item"
              },
              {
                "type":"postback",
                "title":"Bookmark Item",
                "payload":"USER_DEFINED_PAYLOAD_FOR_ITEM101"
              }              
            ]
          }
        ]
      }
    }
  }
}' "https://graph.facebook.com/v2.6/me/messages?access_token=<PAGE_ACCESS_TOKEN>"
Structured Message - Receipt Template


*/





