'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
mongoose.connect(process.env.MONGO_URI);
const Schema = mongoose.Schema;
const shortenerSchema = new Schema({original_url : { type: String, required: true },short_url : {type: Number, required: true},typeName:{ type: String, required: true }});
const ShortenerUrl = mongoose.model('ShortenerUrl', shortenerSchema);
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: false}));

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res) => {
  const url = req.body.url;
  if(validUrl.isUri(url)) {
    ShortenerUrl.count().then(count=>{
      const shortenerUrl = new ShortenerUrl({ original_url: url ,short_url:++count,typeName:'shortenerUrl' });
      shortenerUrl.save().then(data => {
        res.json({original_url:data.original_url,short_url:data.short_url});
      });
    });
  } else {
    res.json({error:"invalid URL"});
  }
});

app.get('/api/shorturl/:reqshorturl',(req, res) => {
  const shortUrlNumber=req.params.reqshorturl;
  ShortenerUrl.findOne({ short_url: shortUrlNumber}).then(data=>{
    res.writeHead(301,{Location: data.original_url});
    res.end();
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
