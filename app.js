require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const https = require('https');
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}))
// static dosyalar bir yerde toplanır kullanılmak üzere
app.use(express.static('public'));


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
})

app.post("/", function(req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const eMail = req.body.email;

  // object for posting to mailchimp
  const data = {
    members: [{
      email_address: eMail,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }],
    update_existing: true
  }

  const jsonData = JSON.stringify(data);

  const url = process.env.URL;
  const options = {
    method: "POST",
    auth: process.env.AUTH
  }

  // request tanımlanır
  const request = https.request(url, options, function(response) {
    response.on("data", function(data) {
      var resData = JSON.parse(data);


      // result pages according to success or failure
      if (resData.error_count === 0) {
        res.sendFile(__dirname + "/success.html");
      } else {
        console.log(resData.errors[0].error);
        res.sendFile(__dirname + "/failure.html");
      }
    })
  })


  // request kullanılır
  request.write(jsonData);
  request.end();

})

app.post("/failure.html", function(req, res) {
  res.redirect("/");
})






app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running both on Heroku or localhost:3000");
})
