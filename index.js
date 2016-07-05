var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var http = require('http');
var https = require('https');
var redis = require('redis');

//connecting to the server
var client = redis.createClient(process.env.REDIS_URL);

client.on('error', function(err){
    console.log('Error ' + err);
});

client.on('connect', function() {
    console.log("redis connected!");
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send("This is TestBot Server");
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'joinery_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

//regex rules
var ascii = /^[ -~\t\n\r]+$/;
var letters = /^[ a-zA-Z]+$/;

//global vars:
var modify = false;
var modifyloc = false;
var modifyprice = false;
var isBeginning = true;
var isJoinery = false;
var isGreeting = false;
var messageCount = 0; //the very beginning of the message
var locationFound = false;
var place = "";
var beds = Number.MAX_VALUE;
var minPrice = Number.MIN_VALUE;
var maxPrice = Number.MAX_VALUE;
var apartmentType = "";
var criteriaFound = false;
var fromButton = true;
var result = ["none", ""];

function resetGlobals(){
    isJoinery = false;
    isGreeting = false;
    locationFound = false;
    place = "";
    beds = Number.MAX_VALUE;
    minPrice = Number.MIN_VALUE;
    maxPrice = Number.MAX_VALUE;
    apartmentType = "";
    criteriaFound = false;
    searchOn = false;
}

// generic function sending messages to user
function sendMessage(recipientId, message) {
    //console.log(process.env);
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

function topFive(listings){
    var priceDiffs = {};
    var views = {};
    var messages = {};
    var images = {};
    var scoring = {};
    var message = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements": []}
        }
    };
    for (var i in listings){
            if (listings[i]['price'] >= minPrice){
                L_ID = listings[i]['id'];
                L_priceDiffs = listings[i]['price'] - minPrice;
                L_views = listings[i]['views'];
                L_messages = listings[i]['messages'];
                L_images = listings[i]['images'];
                priceDiffs[L_ID] = L_priceDiffs;
                views[L_ID] = L_views;
                messages[L_ID] = L_messages;
                images[L_ID] = L_images;
            }
        };
        //Sorts all the lists. Only gives back ids
        sortpriceDiff = Object.keys(priceDiffs).sort(function(a, b) {return (priceDiffs[a] - priceDiffs[b])});
        sortviews = (Object.keys(views).sort(function(a, b) {return (views[a] - views[b])})).reverse();
        sortimages = (Object.keys(images).sort(function(a, b) {return (images[a] - images[b])})).reverse();
        sortmessages = (Object.keys(messages).sort(function(a, b) {return (messages[a] - messages[b])})).reverse();
        //Makes ID
        for (var i in listings){
            if (listings[i]['price'] >= minPrice){
                L_ID = listings[i]['id'];
                scoring[L_ID] = score(L_ID);
            }
        }
        actualRanking = Object.keys(scoring).sort(function(a, b) {return (scoring[a] - scoring[b])});
        for (var j = 0; j < 5; i ++){
            listing = actualRanking[i];
            message.attachment.payload.elements.push(
                {"title": listing.listing_type_text + " " + listing.title + " " + listing.price_string,
                 "image_url": "https://joinery.nyc/" + listing.image_url.replace("fit/250/120", "fill/955/500"),
                 "subtitle": listing.full_address,
                 "buttons": [
                     {"type": "web_url",
                      "url": "https://joinery.nyc/listing/" + listing.slug,
                      "title": "View Apartment"},
                     {"type": "postback",
                      "title": "Keep Searching",
                      "payload": "search" //need to fix this to go back to joinery welcome message
                     }
                 ]
                });
            
        }
        return message;
}


//listings in json form
var fetchListingUrl = 'https://joinery.nyc/api/v1/listings/available';
//http://stackoverflow.com/questions/11826384/calling-a-json-api-with-node-js
function searchListings(neighborhood,beds,minPrice, maxPrice,sender,listings,type){
    //console.log("SEARCHING!!!");
    neighborhood = neighborhood.toLowerCase();
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
    var matchedListings;
    for (var i = 0; i < listings.length; i++){
        //if (count === 10) {break;}
        listing = listings[i];
        console.log("SEARCHING LOOP!");
        //listingJson = JSON.stringify(listing);
        if ((listing.bedrooms === beds || type === "Share") && 
            listing.price <= maxPrice && 
            listing.price >= minPrice && 
            (neighborhood === listing.neighborhood.toLowerCase() || 
             (listing.parent_neighborhood != null && neighborhood === listing.parent_neighborhood.name.toLowerCase())) &&
            listing.listing_type_text === type){
            count++;
            matchedListings.push(listing);
            newMessage.attachment.payload.elements.push(
                {"title": listing.listing_type_text + " " + listing.title + " " + listing.price_string,
                 "image_url": "https://joinery.nyc/" + listing.image_url.replace("fit/250/120", "fill/955/500"),
                 "subtitle": listing.full_address,
                 "buttons": [
                     {"type": "web_url",
                      "url": "https://joinery.nyc/listing/" + listing.slug,
                      "title": "View Apartment"},
                     {"type": "postback",
                      "title": "Keep Searching",
                      "payload": "keepsearch" //need to fix this to go back to joinery welcome message
                     }
                 ]
                });
        };
    };
    if (count === 0) {
        //console.log(place + " " + minPrice + " " + maxPrice + " " + beds);
        testMessage = {
            "attachment":{
                "type": "template",
                "payload":{
                    "template_type":"button",
                    "text": "Sorry! I came up empty! Would you like to keep searching? Or would you like to set an alert for new listings matching your description?",
                    "buttons": [
                        {
                            "type":"postback",
                            "title":"Alert Me",
                            "payload":"alert"
                        },
                        {
                            "type":"postback",
                            "title":"Keep Searching",
                            "payload":"keepsearch"
                        },
                        {
                            "type":"postback",
                            "title":"Give up",
                            "payload":"done"
                        }
                    ]
                }
            }
        }
        sendMessage(sender, testMessage);
    }
    else {
        if (count > 5){
            newMessage = topFive(matchedListings);
        }
        var verb = " are ";
        if (apartmentType === "Entire Apartment"){
            var results = " apartments ";
        }else{
            results = " rooms ";
        }
        if (count === 1) {
            verb = " is ";
            if (apartmentType === "Entire Apartment"){
                var results = " apartment ";
            }else{
                results = " room ";
            }
        }
        var confirmationMessage =
            {"text" :"Here" + verb + count.toString() + results + "I think you'll be interested in!"};
        sendMessage(sender, confirmationMessage);
        sendMessage(sender, newMessage);
    }
    count = 0;
}

//function for guessing user input because they might be wrong
//likely location
/*function guessCorrectLocation(input, valid){
    var inlen = input.length;
    var Ns = [];
    var shift = [-1,0,1];
    var accuracy = [];
    var sh;
    for (var i = 0; i < shift.length; i++){
        sh = shift[i];
        if (sh < 0){
            sn 
        }
    }
}*/

function locationExists(text,locations,validLoc, sender) {
    console.log("in LocationExists");
    //to do: check for valid address input
    text = text || "";
    //console.log(text);
    result = ["none", ""];
    for (var i = 0; i < locations.length; i++){
        var location = locations[i];
        if (location.name.toLowerCase() === text.toLowerCase()){
            console.log("found neighborhood: " + text);
            result[0] = "some";
            result[1] = text;
            place = text;
            validLoc = true;
            //return;
        }
    }3
    console.log("search thru apartments: " + validLoc);
    if (!validLoc) {
        sendMessage(sender, {"text": "That's not a place I recognize. Please give me a NYC neighborhood."});
    } else {
        //console.log("HERE!");
        //console.log ("location = " + location[1]);
        //place = location[1];
        locationFound = true;
        modifyloc = false;
        console.log("place: " + place);
        if (modifyloc) {
            modifySearchLoc(sender);
        }else {
            if (apartmentType === "Entire Apartment"){
            sendMessage(sender, {"text": "Great! How many bedrooms are you looking for in " + place + "? Please enter a number."});
            }else {
                console.log("sending message to sender!");
                sendMessage(sender,{"text": "Nice! What is your price range? For example, '1500 to 3000'"});
            }
        }
        
    }
}

//gets user's location input
var locationUrl = "https://joinery.nyc/api/v1/neighborhoods";
function findLocation(text, locationExists, sender, validLoc){
    https.get(locationUrl, function(res){
                       var body = '';
                       res.on('data', function(chunk){
                           //console.log("the chunk is");
                           //console.log(typeof chunk);
                           body += chunk;
                       });
                       res.on('end', function(){
                           var locations = "nothing here";
                           //console.log("body is" + body);
                           locations = JSON.parse(body);
                           //console.log(listings);
                           locationExists(text,locations,validLoc, sender);
                           //console.log(validLoc);
                               });
                   }).on('error', function(e){
                       console.log("Got an error: ", e);
                   });
    
}

function findBeds(text) {
    text = text || "";
    var result = Number.MAX_VALUE;
    if (!isNaN(Number(text)) && ascii.test(text)) {
        console.log("it's not a nan");
        result = Number(text);
    } else {
        return result;
    }
    return result;
}

function findPrices(text) {
    var commaPattern = /\d,\d+/g;
    var numberPattern = /\d+/g;
    if (text.match(commaPattern) === null) {
    	numbers = text.match(numberPattern);
    } else {
    	numbers = text.match(commaPattern);
    }
    /*console.log(numbers[0]);
    console.log(numbers[1]);*/
    var results = [Number.MIN_VALUE, Number.MAX_VALUE];
    if (numbers != null && numbers.length === 2){
        results[0] = Number(numbers[0].replace(',',''));
        results[1] = Number(numbers[1].replace(',',''));
    }
    return results;
}

function greetingMessage(recipientId, message){
    //looking for hi or hello in the received message
    var lowerMess = message.toLowerCase();
    //using regex
    var greet = /\bhi\b/;
    var greet2 = /\bhello\b/;
    var greet3 = /\bhey\b/;
    if ((lowerMess.match(greet) !== null) || 
        (lowerMess.match(greet2) !== null) || 
        (lowerMess.match(greet3) !== null)) {
        isGreeting = true;
        isBeginning = false;
        var greetingInstruction = 
            {"text": "Hi there! Please type \'joinery\' to get started!"};
        sendMessage(recipientId, greetingInstruction);
        return true;
    }
    return false;
}

/*modifying search instead of starting over
change one search critera at a time
toBeChanged can be 0,1,2,3 so it sends the appropriate continuous change 
so users can keep changing */
function modifySearch(senderId){
    modify = true;
    if (apartmentType === "Entire Apartment"){ 
        var modMess = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text":"What would you like to change?",
                    "buttons":[
                         {"type":"postback",
                          "title":"Change Location",
                          "payload":"newloc"
                         },
                         {"type":"postback",
                          "title":"Change Price",
                          "payload":"newprice"
                         },
                         {"type":"postback",
                          "title":"Change Beds",
                          "payload":"newbeds"
                         }
                    ]
                }
            }
        };
    } else {
       var modMess = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text":"Do you want to modify your search? What would you like to change?",
                    "buttons":[
                        {"type":"postback",
                         "title":"Change Location",
                         "payload":"newloc"
                        },
                        {"type":"postback",
                         "title":"Change Price",
                         "payload":"newprice"
                        }
                    ]
                }
            }
       };
    }
    //sendMessage(senderId, "What would you like to change?");
    sendMessage(senderId, modMess);   
}

//modify search after location is changed
function modifySearchLoc(senderId){
    if (apartmentType === "Entire Apartment"){ 
        var modMess = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text":"Would you like to change anything in addition to location?",
                    "buttons":[
                         {"type":"postback",
                          "title":"Change Price",
                          "payload":"newprice"
                         },
                         {"type":"postback",
                          "title":"Change Beds",
                          "payload":"newbeds"
                         },
                        {"type":"postback",
                         "title":"Nope",
                         "payload":"nomorechange"
                        }
                    ]
                }
            }
        };
    } else {
       var modMess = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text":"Do you want to modify your search? What would you like to change?",
                    "buttons":[
                        {"type":"postback",
                         "title":"Change Price",
                         "payload":"newprice"
                        }
                    ]
                }
            }
       };
    }
    //sendMessage(senderId, "What would you like to change?");
    sendMessage(senderId, modMess); 
    
}

//message with buttons to search apartments/rooms
//restarts the search process from blank slate
function welcomeMessage(firstName, senderId) {
    //resetGlobals();
    var joineryMess = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[
                    {"title":"Hi " + firstName + "! Welcome to Joinery",
                     "item_url":"https://joinery.nyc",
                     "image_url":"https://scontent.fash1-1.fna.fbcdn.net/t31.0-8/10344292_421916781342262_7831247042188894229_o.jpg",
                     "subtitle":"Find a home in NYC from a fellow renter.",
                     "buttons":[
                         {"type":"postback",
                          "title":"Search Apartments",
                          "payload":"Entire Apartment"
                         },
                         {"type":"postback",
                          "title":"Search Rooms",
                          "payload":"Share"
                         },
                         {"type":"web_url",
                          "title":"Go to Joinery",
                          "url":"https://joinery.nyc"
                         }
                     ]
                    }
                ]
            }
        }
    };
    sendMessage(senderId, joineryMess);
}

var getUserInfo = "https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAD6wZAASe5MBANH0PswPqWYFundOw29RPmLZAqYp9UX60FQpb3PA5Bq9Od5qGGBZBqZBWxIDaZBb5WdXgbLUrAiS6XF54fBI2n5dRWuac6dA2BpuldGsTLHTGtU0o1NTfp18ZCpiKkdgHzqT28hfOKhlKM6CfZCxcbDSaCUCLNMAZDZD";

function joineryGreeting(recipientId, message) {
    var userFirstName = '';
    var lowerMess = message.toLowerCase();
    var joinery = /\bjoinery\b/;
    if (joinery.test(lowerMess)) {
        isGreeting = false;
        isJoinery = true;
        isBeginning = false;
        userId = getUserInfo.replace("<USER_ID>", recipientId);
        var getYoName = https.get(userId, function(res){
                       var body = '';
                       res.on('data', function(chunk){
                           //console.log("the chunk is");
                           //console.log(typeof chunk);
                           body += chunk;
                       });
                       res.on('end', function(){
                           console.log("body is" + body);
                           var profile = JSON.parse(body);
                           //console.log(listings);
                           userFirstName = profile.first_name;
                           console.log("your name is " + userFirstName + "!");
                           welcomeMessage(userFirstName, recipientId);
                       });
                   }).on('error', function(e){
                       console.log("Got an error: ", e);
                   });
        fromButton = true;
        return true;
    }
    return false;   
}

//alert function
function alertMe(senderId) {
    //only for 
    //console.log(senderId);
    //console.log(place + " " + minPrice + " " + maxPrice + " " + beds);
    //client.del(senderId);
    client.sadd(senderId, JSON.stringify({'type':apartmentType,
        'location' : place,
        'minPrice' : minPrice,
        'maxPrice' : maxPrice,
        'beds' : beds }));
    console.log("set alert, what is alert:");
    client.smembers(senderId, function(err, reply) {
        console.log(reply);
    });
    if (apartmentType === "Share"){
        message = "Cool! I will alert you when a room listing in " + place +" between " + "$" + minPrice.toString() + " and " + "$" + maxPrice.toString() +  " pops up!";
        sendMessage(senderId, {"text": message});
    } else {
        message = "Cool! I will alert you when a " + beds.toString() + " bedroom apartment in " + place + " between " + "$" + minPrice.toString() + " and " + "$" + maxPrice.toString() +  " pops up!";
        sendMessage(senderId, {"text": message});
    }
    //console.log(client.hmget senderId);
    //add the stored search criteria to the hash set
    //bedrooms, location, price range, move out date (tentative)
}

function onButton(senderId, postback){
    //if user clicked a button
    var choice = JSON.stringify(postback.payload);
    /*console.log(choice);
    locationFound = false;
    place = "";
    beds = Number.MAX_VALUE;
    minPrice = Number.MIN_VALUE;
    maxPrice = Number.MAX_VALUE;*/
    if (choice === "\"Entire Apartment\""){
        resetGlobals();
        fromButton = false;
        apartmentType = "Entire Apartment";
        //console.log("it is search!");
        message = {"text":"I can help you search for a full apartment! Where would you like to live?"};
        //console.log("location choesn");
        sendMessage(senderId, message);
    } else if (choice === "\"Share\""){
        resetGlobals();
        fromButton = false;
        apartmentType = "Share";
        //console.log("it is search!");
        message = {"text":"I can help you search for rooms! Where would you like to live?"};
        sendMessage(senderId, message);
    } else if (choice === "\"search\""){
        resetGlobals();
        fromButton = true;
        joineryGreeting(senderId, "joinery");
    } else if (choice === "\"done\""){
        fromButton = false;
        sendMessage(senderId,{"text":"Aw okay. Type 'joinery' when you want to search again!"});
    } else if (choice === "\"alert\""){
        //console.log(place + " " + minPrice + " " + maxPrice + " " + beds);
        alertMe(senderId);
    } else if (choice === "\"keepsearch\""){
        modifySearch(senderId);
    } else if (choice === "\"newloc\""){
        modifyloc = true;
        sendMessage(senderId, {"text":"Where would you like to live?"});
        //modifySearchLoc(senderId);
    } else if (choice === "\"newprice\""){
        modifyprice = true;
        sendMessage(senderId, {"text":"What is your price range? For example, '1500 to 3000'"});
        return;
    }
    else {
        //backup for when button does not work
        searchOn = false;
        //var theText = JSON.stringify(event.postback);
        message ={text: "hmm...choose a different button because I'm not fully functional yet :) "};
        sendMessage(senderId, message);
    }
}

// handler receiving messages, sending messages
// conversation flow
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var sender = event.sender.id;
        if (event.message && event.message.text){
            //if user sends a text message
           if (!greetingMessage(sender, event.message.text) &&
              !joineryGreeting(sender, event.message.text) && !fromButton){
               //findLocation takes in the message and finds location 
               /*if (modifyloc){
                   var validLoc = false;
                   findLocation(event.message.text, locationExists, sender, validLoc);
               } else if (modifybeds){
                   beds = Number.MAX_VALUE
                   beds = findBeds(event.message.text);
                   if (beds === Number.MAX_VALUE) {
                       message = {"text":"What was that? Please enter a valid number like 1,2,3."};
                   } else {
                       message = {
                           "attachment":{
                               "type":"template",
                               "payload":{
                                   "template_type":"button",
                                   "text":"Would you like to change your price range?",
                                   "buttons":[
                                       {"type":"postback",
                                        "title":"Yes",
                                        "payload":"newprice"
                                       },
                                       {"type":"postback",
                                        "title":"No",
                                        "payload":"nomorechange"
                                       }
                                   ]
                               }
                           }
                       };
                       sendMessage(senderId, message);
                   }
               } else if (modifyprice){
                   minPrice = Number.MIN_VALUE;
                   maxPrice = Number.MAX_VALUE;
                   var minMax = findPrices(event.message.text);
                   minPrice = minMax[0];
                   maxPrice = minMax[1];
                   console.log("prices: " + minPrice + "-" + maxPrice);
                   if (minPrice === Number.MIN_VALUE || maxPrice === Number.MAX_VALUE){
                       message = {"text":"Hm...I didn't get that, can you please input your price range in the form of 'minimum to maximum'?"};
                       sendMessage(event.sender.id, message);
                   } else {
                       modifySearch
                   }
               }*/
               if (!locationFound) {
                   var validLoc = false;
                   //console.log("looking at location");
                   findLocation(event.message.text, locationExists, sender, validLoc);
               } else if (beds === Number.MAX_VALUE && apartmentType === "Entire Apartment") {
                   //finding bedrooms
                   beds = findBeds(event.message.text);
                   console.log("beds: " + beds);
                   if (beds === Number.MAX_VALUE) {
                       message = {"text":"What was that? Please enter a valid number like 1,2,3."};
                   } else {
                       message = {"text": "Nice! What is your price range? For example, '1500 to 3000'"};
                   }
                   sendMessage(event.sender.id, message);
               } else if (minPrice === Number.MIN_VALUE) {
                   var minMax = findPrices(event.message.text);
                   minPrice = minMax[0];
                   maxPrice = minMax[1];
                   console.log("prices: " + minPrice + "-" + maxPrice);
                   if (minPrice === Number.MIN_VALUE || maxPrice === Number.MAX_VALUE){
                       message = {"text":"Hm...I didn't get that, can you please input your price range in the form of 'minimum to maximum'?"};
                       sendMessage(event.sender.id, message);
                       criteriaFound = false;
                   } else {
                       criteriaFound = true;
                       var getListings = https.get(fetchListingUrl, function(res){
                           var body = '';
                           res.on('data', function(chunk){
                           body += chunk;
                           });
                           res.on('end', function(){
                               var listings = JSON.parse(body);
                               //sendMessage(event.sender.id, {"text":"I'm searching!"});
                               searchListings(place, beds, minPrice, maxPrice, event.sender.id, listings, apartmentType);
                               console.log("Got listings" + listings.length);
                           });
                       }).on('error', function(e){
                           console.log("Got an error: ", e);
                       });
                       //sendMessage(event.sender.id, {"text": "Thanks! Here are some apartments I think you will be interested in:"});
                   }
               } else {
                   sendMessage(event.sender.id, {"text": "Type 'joinery' to get started finding some no fee apartments or rooms in New York City :)"});
               }
           } else {
               if ((fromButton && !isGreeting && !isJoinery) || (fromButton && isBeginning)){
                   sendMessage(sender, {"text":"Hey there! To find a NYC apartment on Joinery please use the buttons or type 'joinery' to start over! :)"});
               }
           }
        }if (event.postback) {
            isBeginning = false;
            //if user clicked a button
            onButton(event.sender.id, event.postback);
    }
    res.sendStatus(200);
    }
    console.log("end of receive function");
});