var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var http = require('http');
var https = require('https');
var client = require('./redis');
var schedule = require('node-schedule');

var fetchListingUrl = 'https://joinery.nyc/api/v1/listings/available';

var alertSystem = function (){  
   var self = this;
    self.findNewMatches = function (saved, listings){
        //go through available listings via joinery api and compares 
        //saved searches/alerts with all available listings after the 
        //timestamp that match the search criteria
        console.log("In findNewMatches");
        var foundcount = 0; //used to check if any matching listings are found
        //skeleton of new message to be sent to user when an alert is found
        //NEED TO FIGURE OUT: when to send the notifcation at the user's specified time
        var newMessage = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"generic",
                    "elements": []}
            }
        }; 
        var loopcount = 0; //used to check when loop is over (dealing with async)
        for (i in saved){
            loopcount++;
            console.log("searching alerts");
            //each saved listing
            var savedListing = saved[i];
            //console.log("savedListing: " + savedListing);
            for (var j in listings) {
                var listing = listings[j];
                //go through each listing
                //check if listing time is afte saved time and then compare search criteria
                if ((Date.parse(listing.created_at) > savedListing.time) &&
                    (listing.listing_type_text === savedListing.type) &&
                    (listing.neighborhood === savedListing.location  || listing.neighborhood.parent_neighborhood.name === savedListing.location) &&
                    (listing.bedrooms === savedListing.beds) && 
                    (listing.price >= savedListing.minPrice) &&
                    (listing.price <= savedListing.maxPrice)) {
                    foundcount++;
                    //add to new message:
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
                }
            }
        }
        //for async check if loops is finished before doing stuff
        /*console.log("DONE WITH LOOP count is " + loopcount);
        console.log("saved length is " + saved.length);*/
        if (loopcount === saved.length){
            if (foundcount > 0){
                console.log("here it's saved length");
                console.log(newMessage);
            } else {
                console.log("none matches alert");
            }
        }
    };
    self.getMembers = function(keys, listings){
        keys.forEach(function(key) {
            client.smembers(key, function(err, reply, listings) {
                //console.log(reply);
                if (err) {
                    return console.log(err);
                } else {
                    console.log("got members: " + key);
                    console.log("reply:" + reply);
                    self.findNewMatches(reply, listings);
                }
            });
        });
    };
    self.getKeys = function(listings){
        //console.log("getKeys listings: " + listings);
        console.log("in getKeys");
        client.keys('*', function (err, keys, listings) {
            if (err) {
             return console.log(err);
         } else {
             self.getMembers(keys, listings);
         }
         console.log("alert found?");
     });
    };
    self.fetchAlerts = function(callback){
        //first get all the listings then get keys and then get 
        https.get(fetchListingUrl, function(res){
            var body = '';
            res.on('data', function(chunk){
                body += chunk;
            });
            res.on('end', function(){
                var listings = JSON.parse(body);
                //sendMessage(event.sender.id, {"text":"I'm searching!"});
                //var asyncTasks = [];
                callback(listings);
            }).on('error', function(e){
                console.log("Got an error: ", e);
            });
        });
    };
    self.setAlert = function (){
        //scheduling for alerts
        //using node-schedule
        var j = schedule.scheduleJob( '*/10 * * * * *', function(){
            self.fetchAlerts(self.getKeys);
            console.log("Time to search for alerts that expire NOWW");
        });
    };
    
};

module.exports = alertSystem;

