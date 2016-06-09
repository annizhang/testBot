var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var http = require('http');
var https = require('https');
var stringOfListings = [{"id":335,"slug":"550-west-45th-street-916","title":"Hell's Kitchen, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"Hell's Kitchen","price":3100,"image_url":"/attachments/store/fit/250/120/99609809117b79b4d7e97177ead57b49c2d9364c7d339ddf7b0f03c4fd6c/image","price_string":"$3,100","available_date":"2016-06-06","full_address":"550 West 45th Street, 10036","listing_type_text":"Entire Apartment"},{"id":375,"slug":"brooklyn-williamsburg-17-devoe-st-ph","title":"Williamsburg, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Williamsburg","price":2000,"image_url":"/attachments/store/fit/250/120/279717dd9815db1b3509e2f72a917265c65d316f475d0cb32bddf9b06c08/image","price_string":"$2,000","available_date":"2016-06-21","full_address":" 17 Devoe St. , 11211","listing_type_text":"Share"},{"id":379,"slug":"299-graham-avenue-2","title":"Williamsburg, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Williamsburg","price":1200,"image_url":"/attachments/store/fit/250/120/d679df1b5cf978ebd6e5ef204fbcdd1ce90da7e0c752697c3b8af333fce1/image","price_string":"$1,200","available_date":"2016-08-01","full_address":"299 Graham Avenue, 11211","listing_type_text":"Share"},{"id":381,"slug":"212-montrose-ave-apt-1-1","title":"Williamsburg, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Williamsburg","price":1500,"image_url":"/attachments/store/fit/250/120/9496f7ba2155a4acea9f318f957e45643b00afbdf181080e45581c98cbc1/image","price_string":"$1,500","available_date":"2016-07-01","full_address":"212 MONTROSE AVE APT 1, 11206","listing_type_text":"Share"},{"id":386,"slug":"179-mott-st-2","title":"Nolita, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Nolita","price":1700,"image_url":"/attachments/store/fit/250/120/9da3b4516ffbdbec02235e88368c6ddb89eb85173387708eaa14490143fa/image","price_string":"$1,700","available_date":"2016-07-01","full_address":"179 Mott St., 10012","listing_type_text":"Share"},{"id":405,"slug":"brooklyn-bedford-stuyvesant-265-nostrand-avenue-a3","title":"Bedford-Stuyvesant, 2 bedrooms","bedrooms":2,"bathrooms":2,"neighborhood":"Bedford-Stuyvesant","price":2850,"image_url":"/attachments/store/fit/250/120/4c40f8283951c2f88d18512103f16d21b54dbb445aa25f07823b92c0722b/image","price_string":"$2,850","available_date":"2016-08-15","full_address":"265 Nostrand Avenue, 11216","listing_type_text":"Entire Apartment"},{"id":472,"slug":"360-w-43rd-st","title":"Hell's Kitchen, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Hell's Kitchen","price":1775,"image_url":"/attachments/store/fit/250/120/d6e1609fa07f67f6d3b71dc4220efe6b8e04225b38958afee9f82255aa86/image","price_string":"$1,775","available_date":"2016-06-01","full_address":"360 W 43rd St., 10036","listing_type_text":"Share"},{"id":473,"slug":"160-w-73rd-st-7k","title":"Upper West Side, studio","bedrooms":0,"bathrooms":1,"neighborhood":"Upper West Side","price":2700,"image_url":"/attachments/store/fit/250/120/610f4cf9ac60c24c64fb263641113e641ca87ddbde1a695ee0bdf55e7075/image","price_string":"$2,700","available_date":"2016-06-01","full_address":"160 W. 73rd St, 10023","listing_type_text":"Entire Apartment"},{"id":480,"slug":"65-maspeth-avenue-7c","title":"Williamsburg, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Williamsburg","price":3000,"image_url":"/attachments/store/fit/250/120/44d490f9cdd645a28c588650ed7caceb606da9b61d8fdaeaafe790effcf9/image","price_string":"$3,000","available_date":"2016-06-01","full_address":"65 Maspeth Avenue, 11211","listing_type_text":"Entire Apartment"},{"id":484,"slug":"405-e-14th-street","title":"Stuyvesant Town, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Stuyvesant Town","price":1800,"image_url":"/attachments/store/fit/250/120/e35131f673f7b63b56d5348bd8df006b8138f0e37bc4cbac863d3b9e437f/image","price_string":"$1,800","available_date":"2016-06-01","full_address":"405 E. 14th Street, 10009","listing_type_text":"Share"},{"id":489,"slug":"manhattan-central-park-106-central-park-south-17c","title":"Midtown, studio","bedrooms":0,"bathrooms":1,"neighborhood":"Midtown","price":2700,"image_url":"/attachments/store/fit/250/120/6f4a25b7632ceafebb4467d3c892ce62334b70a49928d4e31f6ca629d0a0/image","price_string":"$2,700","available_date":"2016-06-01","full_address":"106 Central Park South, 10019","listing_type_text":"Entire Apartment"},{"id":491,"slug":"232-20th-street","title":"Sunset Park, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Sunset Park","price":1250,"image_url":"/attachments/store/fit/250/120/0bce24d2658ca2180548cd3c6ed91d90099135b18217837137cd84be5d17/image","price_string":"$1,250","available_date":"2016-07-01","full_address":"232 20th Street, 11232","listing_type_text":"Share"},{"id":495,"slug":"455-west-37th-street-1016","title":"Hell's Kitchen, 3 bedrooms","bedrooms":3,"bathrooms":2,"neighborhood":"Hell's Kitchen","price":1710,"image_url":"/attachments/store/fit/250/120/93d7a1fe6d26095eda03d93789284dc92b5f960ef0a2bec77b4d6d6a0ccc/image","price_string":"$1,710","available_date":"2016-06-01","full_address":"455 west 37th street, 10018","listing_type_text":"Share"},{"id":496,"slug":"553-manhattan-ave-1","title":"Harlem, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Harlem","price":1250,"image_url":"/attachments/store/fit/250/120/e5dd21dd021961e9aa8ede204a452a4a0f4bcbf82182993ed356bea15331/image","price_string":"$1,250","available_date":"2016-05-31","full_address":"553 Manhattan Ave, 10027","listing_type_text":"Share"},{"id":497,"slug":"124-w-60th-st-24h","title":"Upper West Side, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"Upper West Side","price":3900,"image_url":"/attachments/store/fit/250/120/2eb56c1983b0d539a26c91f6daef4ebc5891b1f7fa1d755eb104dc462a4e/image","price_string":"$3,900","available_date":"2016-07-01","full_address":"124 W 60TH ST , 10023","listing_type_text":"Entire Apartment"},{"id":498,"slug":"200-withers-street-1b","title":"Williamsburg, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"Williamsburg","price":2725,"image_url":"/attachments/store/fit/250/120/e9946963eb398a9c8ce89cec34da1c624b7f3cc6f1b08960edce86d1661d/image","price_string":"$2,725","available_date":"2016-07-01","full_address":"200 Withers Street, 11211","listing_type_text":"Entire Apartment"},{"id":499,"slug":"501-east-87th-street-new-york-ny-16c","title":"Upper East Side, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"Upper East Side","price":3350,"image_url":"/attachments/store/fit/250/120/aa8875a931bf45ba75b541043ee229149bc2ba6913a9c6c4a4155e6a014b/image","price_string":"$3,350","available_date":"2016-05-15","full_address":"501 East 87th Street, New York, NY, 10128","listing_type_text":"Entire Apartment"},{"id":500,"slug":"190-22nd-st-1f","title":"Sunset Park, 2 bedrooms","bedrooms":2,"bathrooms":2,"neighborhood":"Sunset Park","price":2650,"image_url":"/attachments/store/fit/250/120/56697ffb7b93c6dcbee8e0f1d73d7240c251d5a9b16c912c4ad34daeda85/image","price_string":"$2,650","available_date":"2016-05-25","full_address":"190 22ND ST, 11232","listing_type_text":"Entire Apartment"},{"id":503,"slug":"747-10th-ave","title":"Hell's Kitchen, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Hell's Kitchen","price":1700,"image_url":"/attachments/store/fit/250/120/ab93b75bb65f088a6595b5bfef225b9b4af831790f3417e4ae3eb94a01d6/image","price_string":"$1,700","available_date":"2016-08-01","full_address":"747 10th Ave, 10019","listing_type_text":"Share"},{"id":506,"slug":"3333-broadway-fdb7063d-7c69-4b8c-a35e-ba4251440e91","title":"Harlem, 3 bedrooms","bedrooms":3,"bathrooms":2,"neighborhood":"Harlem","price":3450,"image_url":"/attachments/store/fit/250/120/33e8879772a1a177fdd903daf43abbb16efc697f2aca4829924e744b988e/image","price_string":"$3,450","available_date":"2016-07-01","full_address":"3333 Broadway, 10031","listing_type_text":"Entire Apartment"},{"id":507,"slug":"386-manhattan-avenue","title":"Harlem, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Harlem","price":2550,"image_url":"/attachments/store/fit/250/120/653bdd08605e9ff4fd28f9195fb2a8ae995f517428da06916678a3dafa87/image","price_string":"$2,550","available_date":"2016-08-01","full_address":"386 Manhattan Avenue, 10026","listing_type_text":"Entire Apartment"},{"id":509,"slug":"20-park-ave-15f","title":"Murray Hill, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Murray Hill","price":2045,"image_url":"/attachments/store/fit/250/120/f8c3b89bb625c1ab97ca850de8993ab178135ecf7c5897f86cbc476905ed/image","price_string":"$2,045","available_date":"2016-06-25","full_address":"20 Park Ave, 10016","listing_type_text":"Share"},{"id":512,"slug":"154-e-29th-street","title":"Kips Bay, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Kips Bay","price":1800,"image_url":"/attachments/store/fit/250/120/9287072c77c9f8c64da27729ba10bfae09f6dd61f14aff5afde7ed18f8ed/image","price_string":"$1,800","available_date":"2016-05-25","full_address":"154 E 29th Street, 10016","listing_type_text":"Share"},{"id":515,"slug":"244-e-78th","title":"Upper East Side, 4 bedrooms","bedrooms":4,"bathrooms":2,"neighborhood":"Upper East Side","price":1440,"image_url":"/attachments/store/fit/250/120/1594373aa7f83f2688c20608498d8e2da70e062cda64b42b05789e01197b/image","price_string":"$1,440","available_date":"2016-07-01","full_address":"244 E 78th, 10075","listing_type_text":"Share"},{"id":517,"slug":"624-11th-st-unit-1","title":"South Slope, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"South Slope","price":3600,"image_url":"/attachments/store/fit/250/120/546eb8cd859508b7e2f872fe3580df3c733fbae47d03d2d501b13a7616a7/image","price_string":"$3,600","available_date":"2016-06-01","full_address":"624 11th st, 11215","listing_type_text":"Entire Apartment"},{"id":519,"slug":"2614-jackson-ave-12-c","title":"Long Island City, studio","bedrooms":0,"bathrooms":1,"neighborhood":"Long Island City","price":3100,"image_url":"/attachments/store/fit/250/120/47294664f8f22616f7b02446dd92f83ae90fae8dd18447fcfd3b372cbabe/image",
"price_string":"$3,100","available_date":"2016-06-15","full_address":"2614 Jackson Ave, 11101","listing_type_text":"Entire Apartment"},{"id":520,"slug":"1952-1st-ave-2o","title":"East Harlem, 4 bedrooms","bedrooms":4,"bathrooms":2,"neighborhood":"East Harlem","price":1035,"image_url":"/attachments/store/fit/250/120/fbd57e76226030f8d46c6c39255a78baa0dcc4316fa6d0137b7909f9cd5f/image","price_string":"$1,035","available_date":"2016-06-01","full_address":"1952 1st ave, 10029","listing_type_text":"Share"},{"id":521,"slug":"320-east-58th-street","title":"Midtown, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Midtown","price":1450,"image_url":"/attachments/store/fit/250/120/613aad57c5a98a093b79a910626d75e7d6ba465cdf8fcbbd33aed557b008/image","price_string":"$1,450","available_date":"2016-07-01","full_address":"320 East 58th Street, 10022","listing_type_text":"Share"},{"id":522,"slug":"330-west-45th-street","title":"Hell's Kitchen, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Hell's Kitchen","price":1600,"image_url":"/attachments/store/fit/250/120/97685ddd3ab33389a416d70c58c8d39063c1ee30a91fdf4a12c4a9c3872c/image","price_string":"$1,600","available_date":"2016-06-26","full_address":"330 West 45th Street, 10036","listing_type_text":"Share"},{"id":525,"slug":"336-e-86th-st-6a","title":"Upper East Side, studio","bedrooms":0,"bathrooms":1,"neighborhood":"Upper East Side","price":2500,"image_url":"/attachments/store/fit/250/120/be4093fc8530b50f53770bff8d82225c4f163618de84e1e9a088c5931f93/image","price_string":"$2,500","available_date":"2016-07-01","full_address":"336 E 86th St, 10028","listing_type_text":"Entire Apartment"},{"id":528,"slug":"4310-44th-street-1e","title":"Sunnyside, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"Sunnyside","price":1650,"image_url":"/attachments/store/fit/250/120/27a26a8e8b416531efb658a45025b24fe249b70c34f537ae750045a6465d/image","price_string":"$1,650","available_date":"2016-07-01","full_address":"4310 44th Street, 11104","listing_type_text":"Entire Apartment"},{"id":530,"slug":"3333-broadway-c174b67d-5f7e-41e2-a71d-87c300a691b0","title":"Harlem, 3 bedrooms","bedrooms":3,"bathrooms":2,"neighborhood":"Harlem","price":1300,"image_url":"/attachments/store/fit/250/120/794e8c882055f88c9a2c5a77bc423c533987f3b120453cc76da9288c5e56/image","price_string":"$1,300","available_date":"2016-07-01","full_address":"3333 Broadway, 10031","listing_type_text":"Share"},{"id":531,"slug":"319-menahan-st-2l","title":"Bushwick, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Bushwick","price":1250,"image_url":"/attachments/store/fit/250/120/e609bd7497147a11f0d3ab47031dd44d62bbc370409d46ca0369d30f755d/image","price_string":"$1,250","available_date":"2016-06-15","full_address":"319 Menahan St. , 11237","listing_type_text":"Share"},{"id":532,"slug":"117-w-13th-st","title":"West Village, 1 bedroom","bedrooms":1,"bathrooms":1,"neighborhood":"West Village","price":3500,"image_url":"/attachments/store/fit/250/120/f5784bccefeebbb84b8bb41d78bbfb9f0fd020812e0832b23affe54c8f76/image","price_string":"$3,500","available_date":"2016-06-29","full_address":"117 W. 13th St., 10011","listing_type_text":"Entire Apartment"},{"id":533,"slug":"3333-broadway-d4dec778-36df-475b-aa84-8f6d1eb7b29f","title":"Harlem, 3 bedrooms","bedrooms":3,"bathrooms":2,"neighborhood":"Harlem","price":1150,"image_url":"/attachments/store/fit/250/120/d534b23e3bcc94923e39cc5def576c14211f4ba9d5bf8f7472f69fb3a163/image","price_string":"$1,150","available_date":"2016-07-01","full_address":"3333 Broadway, 10031","listing_type_text":"Share"},{"id":534,"slug":"34-12-31st-ave-2-b6e57911-1d52-4e02-b66b-5099a8f64eb9","title":"Astoria, 3 bedrooms","bedrooms":3,"bathrooms":1,"neighborhood":"Astoria","price":900,"image_url":"/attachments/store/fit/250/120/a504c31381c1e9a3bc2c0f0b070688b2d371722f0345857f757d189402fb/image","price_string":"$900","available_date":"2016-07-01","full_address":"34-12 31st Ave, 11106","listing_type_text":"Share"},{"id":535,"slug":"116-vanderbilt-avenue","title":"Fort Greene, 2 bedrooms","bedrooms":2,"bathrooms":1,"neighborhood":"Fort Greene","price":1100,"image_url":"/attachments/store/fit/250/120/66171380588bda709be1a8ed9b5c83f9f1d071270f561c9990f5b29de68a/image","price_string":"$1,100","available_date":"2016-07-01","full_address":"116 Vanderbilt Avenue , 11205","listing_type_text":"Share"},{"id":537,"slug":"182-north-10th-street-4r-096eccac-7df3-480e-9999-b47977d84a4b","title":"Williamsburg, 3 bedrooms","bedrooms":3,"bathrooms":2,"neighborhood":"Williamsburg","price":1275,"image_url":"/attachments/store/fit/250/120/1f73775ebb2037ca91bea1978f2309ab20f0409a8eb96cf734b071fb42e0/image","price_string":"$1,275","available_date":"2016-08-01","full_address":"182 north 10th street, 11211","listing_type_text":"Share"},{"id":538,"slug":"823-madison-st-2","title":"Bedford-Stuyvesant, 4 bedrooms","bedrooms":4,"bathrooms":2,"neighborhood":"Bedford-Stuyvesant","price":800,"image_url":"/attachments/store/fit/250/120/6ebee56b6d78f5aaad8f062b00c44567fe74b571d1229683a6dfd754926b/image","price_string":"$800","available_date":"2016-06-24","full_address":"823 Madison St, 11221","listing_type_text":"Share"}];

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
    //console.log("SEARCHING!!!");
    var newJSON;
    var listing;
    var listingJson;
    var found = false;
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
        if (listing.bedrooms === beds && listing.price <= maxPrice && listing.price >= minPrice){
            found = true;
            newMessage.attachment.payload.elements.push({"title": listing.listing_type_text + " " + listing.title + " " + listing.price_string,
                       "image_url": "https://joinery.nyc/" + listing.image_url,
                       "subtitle": listing.full_address,
                       "buttons": [
                           {"type": "web_url",
                           "url": "https://joinery.nyc/listing/" + listing.slug,
                           "title": "View Apartment"},
                           {"type": "web_url",
                           "url": "https://joinery.nyc",
                           "title": "Go to Joinery"}
                       ]
                      });
        };
    };
    if (!found) {
        testMessage = {"text" : "Sorry I came up empty!!"};
        sendMessage(sender, testMessage);
    }
    else {
        var confirmationMessage = {"text" :"Here are " + listings.length.toString() + " apartments I think you'll be interested in!"};
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
                           searchListings(beds, minPrice, maxPrice, event.sender.id, listings);
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





