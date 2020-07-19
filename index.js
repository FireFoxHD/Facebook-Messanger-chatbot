// Imports dependencies and set up http server
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const app = express().use(bodyParser.json()); // creates express http server
app.listen(process.env.PORT || 5000, () => console.log("webhook is listening"));

const accessToken = process.env.PAGE_ACCESS_TOKEN;

app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    
    body.entry.forEach(function(entry) {
     
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      }  
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = accessToken;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    // Check if the message contains text
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`
    };
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
  "recipient":{
     "id": sender_psid
  },
  "message": response
};

  // Send the HTTP request to the Messenger Platform
   axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${accessToken}`, request_body)
     .then(response=>{
     if(response.status == 200){
       console.log("yay!!")
     }
   }).catch((error)=>{
     console.log(error);
   });
}