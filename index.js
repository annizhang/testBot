var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

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
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function findLocation(text) {
    text = text || "";
    var result = ["none", ""];
    var values = text.split(' ');
    if (values.length < 3) {
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

var messageCount = 0; //the very beginning of the message
var locationFound = false;
var place = "";
var beds = Number.MAX_VALUE;
var minPrice = Number.MIN_VALUE;
var maxPrice = Number.MAX_VALUE;
var type = "";

// handler receiving messages
app.post('/webhook', function (req, res) {
    //need to create conversation thread
    //create a list of 
    var events = req.body.entry[0].messaging;
    var count = 0;
    for (i = 0; i < events.length; i++) {
        count++;
        console.log(count);
        var event = events[i];
        var sender = event.sender.id;
        if (event.message && event.message.text){
            //if user sends a text message
           if (!joineryMessage(event.sender.id, event.message.text)){
               console.log("location?");
               console.log(locationFound);
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
                   sendMessage(event.sender.id, {"text": "Thanks! Here are 5 apartments I think you will be interested in:"});
               } else {
                   sendMessage(event.sender.id, {"text": "what now?"});
               }
           }
        } if (event.postback) {
            //if user clicked search
            var choice = JSON.stringify(event.postback.payload);
            console.log(choice);
            if (choice === "\"search\""){
                console.log("it is search!");
                message = {"text":"Where would you like to live?"};
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
    
};
        
        
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
*/
