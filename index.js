const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const toxicity = require('@tensorflow-models/toxicity');
//import * as toxicity from '@tensorflow/tfjs-node';

const file = new Discord.MessageAttachment('./toxic_alert.png');



const cors = require("cors");
app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("dotenv").config();

const timePeriod = require("./constants");

//reading of text file with negative words
var fs = require("fs");
var text = fs.readFileSync("./nwords.txt").toString('utf-8');
var textByLine = text.split("\r\n");
//console.log(textByLine);

//reading of text file with positive words
var text2 = fs.readFileSync("./pwords.txt").toString('utf-8');
var textByLine2 = text2.split("\r\n");
//console.log(textByLine2);

//reading of text file with positive words
var text3 = fs.readFileSync("./negate.txt").toString('utf-8');
var textByLine3 = text3.split("\r\n");

//article words
var artwords = ["the","a","an"]


const queue = new Map();
const {
	prefix
} = require('./package.json');

const token = 'NzAyOTg4Mzg0MTU4NzQ0NjE2.XuBfcw.qNpE_a9buoTvMaZdK3eZOMnvZdE';

client.login(token);

var today = new Date();


client.on('ready', ()=>{
    console.log('client online');
    var theChannel = "";
    var theVoiceChannel = 0;
    var theVoiceChannel1 = 0;
    var theVoiceChannel2 = 0;
    var cron = require("cron");
    var TradeChannel = 0;
    var stockAlertToggel = 0;

    //corona statistics
    


    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name)

        // List all channels
        guild.channels.cache.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
            if(channel.name === "general" && guild.name === "Overwatch And Fuck NIzar"){
                theChannel = channel.id;
            }
            if(channel.name === "CS:GO"){
                theVoiceChannel = channel.id;
            }
            if(channel.name === "Overwatch"){
                theVoiceChannel1 = channel.id;
            }
            if(channel.name === "DUNCE"){
                theVoiceChannel2 = channel.id;
            }
            if(channel.name.includes("trading")){
              TradeChannel = channel.id;
            }
        })
    }) 

    var TradingChannel = client.channels.cache.get(TradeChannel);

    var generalChannel = client.channels.cache.get(theChannel); // Replace with known channel ID
    //generalChannel.send("Sabry's bot is online")
  
    function alertStock() {
      if(stockAlertToggel === 0){
        console.log("Alert Open Action executed.");
        TradingChannel.send("[ALERT]Stock Market Open");
      }else{
        console.log("Alert is currently disabled")
      }
    }

    function alertStockClose() {
      if(stockAlertToggel === 0){
        console.log("Alert Close Action executed.");
        TradingChannel.send("[ALERT]Stock Market Closed");
      }else{
        console.log("Alert is currently disabled")
      }
    }

    function getStockTime(){
      if (today.getHours() >= 13){
        TradingChannel.send("Stock Market Closed");
      } 
    }

    let job1 = new cron.CronJob('00 30 06 * * 2-6', alertStock); // fires every day, at 01:05:01 and 13:05:01
    let job2 = new cron.CronJob('00 00 13 * * 2-6', alertStockClose); // fires every day, at 01:05:01 and 13:05:01
    job1.start();
    job2.start();

    client.on('voiceStateUpdate', (oldMember, newMember) => {
        let newUserChannel = newMember.voiceChannel
        let oldUserChannel = oldMember.voiceChannel
        let userName = newMember.member.displayName
        
       // console.log(oldMember.channelID);
       // console.log(newMember.channelID);
        console.log(theVoiceChannel);
        console.log(oldMember.member.displayName);
        //console.log(newMember.voiceChannel.guild);
    
      
        if(oldUserChannel === null && newMember.channelID === theVoiceChannel) {
      
           generalChannel.send(userName+" has joined the CSgo channel", {
            tts: true
           });
        }else if(oldUserChannel === null && newMember.channelID === theVoiceChannel1) {
            generalChannel.send(userName+" has joined the Overwatch channel", {
                tts: true
               });
        }else if(oldUserChannel === null && newMember.channelID === theVoiceChannel2) {
            generalChannel.send(userName+" has joined the Dunce channel", {
                tts: true
               });
        }
      })

      // 0BPH0HT5A5ZIWOGL AV
//-----------------------------------Start of Stock market code---------------------------------------------------------------------------------------------------------------------
//-----------------------------------Start of Stock market code---------------------------------------------------------------------------------------------------------------------

//single stock
app.post("/stock", cors(), async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body));
  const { ticker, type } = body;
  console.log("stocks-api.js 14 | body", body.ticker);
  const request = await fetch(
    `https://www.alphavantage.co/query?function=${timePeriod(
      type
    )}&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
  );
  const data = await request.json();
  res.json({ data: data });
});

//search
app.post("/results", cors(), async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body));
  const { ticker, type } = body;
  console.log("stocks-api.js 14 | body", body.ticker);
  const request = await fetch(
    `https://www.alphavantage.co/query?function=${timePeriod(
      type
    )}&keywords=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
  );
  const data = await request.json();
  res.json({ data: data });
});


app.post("/stocks", async (req, res) => { //less than 5 stocks per minute
  const body = JSON.parse(JSON.stringify(req.body));
  const { tickers, type } = body;
  console.log("stocks-api.js 14 | body", body.tickers);
  let stocks = await tickers.map(async ticker => {
    const request = await fetch(
      `https://www.alphavantage.co/query?function=${timePeriod(type)}&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await request.json();
    return data;
  });

  Promise.all(stocks)
    .then(values => {
      console.log("stocks-api.js 40 | values", values);
      if (values[0].Note) {
        console.log("stocks-api.js 48 | error", values[0].Note);
        res.json({ error: values[0].Note });
      } else {
        res.json({ data: values, status: "done" });
      }
    })
    .catch(error => {
      console.log("stocks-api.js 47 | error", error);
      res.json({ error: error });
    });
});

app.post("/stocks-unlimited", async (req, res) => {//unlimited stocks in 12 seconds X number of tickers (i.e 10 tickers = 120 seconds to get data.)
  const body = JSON.parse(JSON.stringify(req.body));
  const { tickers, type } = body;
  console.log("stocks-api 74 | tickers length", tickers.length);
  let stocksArray = [];
  console.log("stocks-api.js 14 | body", body.tickers);
  await tickers.forEach(async (ticker, index) => {
    setTimeout(async () => {
      const request = await fetch(
        `https://www.alphavantage.co/query?function=${timePeriod(type)}&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
      );
      const data = await request.json();
      stocksArray.push(Object.values(data));
      console.log("stocks-api 84 | stocks array", stocksArray);
      if (stocksArray.length === tickers.length) {
        res.json({ tickers: stocksArray});
      }
    }, index * 12000);
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("index.js 6 | server started...");
});

//get single stock
const getStock = async ticker => {
  console.log("Getting data");
  const request = await fetch(`http://localhost:8080/stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      ticker: ticker,
      type: "daily"
    })
  });

  const data = await request.json();                      //getStock FUNCTION!@!@!@!@!@!
  //parsedData = JSON.parse(Jdata);
  try {//parsedData[0].Information;
    var StockSymbol = data.data["Meta Data"]["2. Symbol"];
    var lastRefreshed = data.data["Meta Data"]["3. Last Refreshed"];
    var todayStock = data.data["Time Series (Daily)"]["2020-04-30"]["1. open"];
    var todayStockclose = data.data["Time Series (Daily)"]["2020-04-30"]["4. close"];
    console.log(data.data["Meta Data"]["1. Information"]);
    TradingChannel.send("*Stock Request*\n"+"Symbol: "+StockSymbol+"\n"+"last Refreshed: "+lastRefreshed+"\n"+"Open: "+todayStock+"\n"+"Close: "+todayStockclose);
    return data;
  }catch(error) {
    console.log("Symbol not matched");
    TradingChannel.send("No symbol detected");
    searchStock()
  }
};

//search for stock
const searchStock = async ticker => {
  console.log("Getting data");
  const request = await fetch(`http://localhost:8080/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      ticker: ticker,
      type: "search"
    })
  });

  const data = await request.json();                    
  try {
    console.log(data);
    var StockSymbol = data.data["bestMatches"][0]["1. symbol"];
    var stockName = data.data["bestMatches"][0]["2. name"]
    console.log(data.data["bestMatches"][0]);
    TradingChannel.send("*did you mean:*\n"+"Symbol: "+StockSymbol+"\nName: "+stockName);
    return data;
 }catch(error) {
    console.log("Symbol not matched");
    TradingChannel.send("No symbol detected");
 }
};

const getMultipleStocks = async tickersArray =>{
  const request = await fetch(`http://localhost:8080/stocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tickers: tickersArray,
      type: "daily"
    })
  });

  const data = await request.json();
  console.log(data);
  return data;
}

const getUnlimitedStocks = async tickersArray =>{
  const request = await fetch(`http://localhost:8080/stocks-unlimited`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tickers: tickersArray,
      type: "daily"
    })
  });

  const data = await request.json();
  console.log(data);
  return data;
}

//getStock('AAPL');

//-----------------------------------end of Stock market code---------------------------------------------------------------------------------------------------------------------
//-----------------------------------end of Stock market code---------------------------------------------------------------------------------------------------------------------


//----------------------------------Message Command Detection---------------------------------------------------------------------------------------------------------------------
//-----------------------------------Message Command Detection---------------------------------------------------------------------------------------------------------------------
      client.on("message", async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
      
        const serverQueue = queue.get(message.guild.id);
      
        if (message.content.startsWith(`${prefix}get`)) {
          getStock(message.content.slice(5)); //var res = str.slice(5);
          return;
        } else if (message.content.startsWith(`${prefix}open`)) {
          getStockTime();
          return;
        } else if (message.content.startsWith(`${prefix}stopalert`)) {
          stockAlertToggel = 1;
          console.log("Alert Disabled");
          TradingChannel.send("Disabled Alerts");
          return;
        } else if (message.content.startsWith(`${prefix}search`)) {
          searchStock(message.content.slice(8));
          return;
        } else {
          message.channel.send("You need to enter a valid command!");
        }
      });
})

//----------------------------------[end]Message Command Detection---------------------------------------------------------------------------------------------------------------------
//----------------------------------[end]Message Command Detection---------------------------------------------------------------------------------------------------------------------

client.on('message', msg=>{
    if(msg.content === "Greetings"){
        msg.reply('cyka blyat');
    }
})
/*
client.on('message', msg=>{
  var ncount = 0;
  var pcount = 0;  
  var msgsplit = msg.content.split(" ")
  //console.log(msgsplit)
  if(msg.content.includes("sabry")|| msg.content.includes("Sabry")){
    var x
    var i;
    var j;
    var k;
    var ii;
    var jj;
    var kk;
    var j2;
    var jj2
    var negatecheck = false

    for(x = 0; x<msgsplit.length; x++){
      for(xx = 0; xx<artwords.length; xx++){
        if(msgsplit[x] === artwords[xx]){
          msgsplit.splice(x,1);
        }
      }
    }

  
    for(j = 0; j<msgsplit.length; j++){
      
      for(i = 0; i < textByLine.length; i++){
        
        if(msgsplit[j] === textByLine[i]){
          console.log("negative word at index " +i+" found")
          if(j>0){
            console.log("negative word is not first word of the sentence")
            for(k = 0; k<textByLine3.length; k++){
              if(msgsplit[j-1] === textByLine3[k]){
                console.log("negating word found before negative word at index "+j)
                if(j-1>0){
                  j2 = j-2
                  console.log("negating word is not first word in the sentece, check for more at "+j2)
                  whileloop:
                  while(j2>=0){
                    if(msgsplit[j2] === textByLine3[k]){
                      negatecheck = !negatecheck; 
                      console.log("negate negative add postive count for word combination of "+textByLine3[k] +" and "+textByLine[i]);
                      j2--;
                    }else{
                      break whileloop
                    }
                  }
                }
                console.log("negate negative add postive count for word combination of "+textByLine3[k] +" and "+textByLine[i]);
                negatecheck = !negatecheck
              }
            }
          }
          console.log("negate check is "+negatecheck)
          if(negatecheck === true){
            pcount++
            negatecheck = !negatecheck
          }else{
            ncount++;
          }
          //j++;
        }

      }

    }

    for(jj = 0; jj<msgsplit.length; jj++){
      
      for(ii = 0; ii < textByLine2.length; ii++){
        
        if(msgsplit[jj] === textByLine2[ii]){
          console.log("positve word at index " +ii+" found")
          if(jj>0){
            console.log("positve word is not first word of the sentence")
            for(kk = 0; kk<textByLine3.length; kk++){
              if(msgsplit[jj-1] === textByLine3[kk]){
                console.log("negating word found before positve word at index "+jj)
                if(jj-1>0){
                  jj2 = jj-2
                  console.log("negating word is not first word in the sentece, check for more at "+jj2)
                  while(jj2>=0){
                    if(msgsplit[jj2] === textByLine3[kk]){
                      negatecheck = !negatecheck; 
                      console.log("negate positve add negative count for word combination of "+textByLine3[kk] +" and "+textByLine[ii]);
                      jj2--;
                    }else{
                      break 
                    }
                  }
                }
                console.log("negate positve add negative count for word combination of "+textByLine3[kk] +" and "+textByLine[ii]);
                negatecheck = !negatecheck
              }
            }
          }
          console.log("negate check is "+negatecheck)
          if(negatecheck === true){
            ncount++
            negatecheck = !negatecheck
          }else{
            pcount++;
          }
          //j++;
        }

      }

    }
    if(pcount > ncount){
      msg.reply('Thanks '+msg.member.displayName)
      console.log("p= "+pcount);
      console.log("n= "+ncount);
    }else{
      msg.reply('why you talk about me! Cyka');
      console.log(msg.member.displayName+" is talking shit");
      console.log("p= "+pcount);
      console.log("n= "+ncount);
    }
  }
})
*/

client.on('message', msg=>{
  toxictext(msg);
})




//----------------------------------BOT ALGORITHM GOES HERE!!!!!!!---------------------------------------------------------------------------------------------------------------------
//----------------------------------BOT ALGORITHM GOES HERE!!!!!!!---------------------------------------------------------------------------------------------------------------------

function toxictext(themessage){

  const threshold = 0.9;

  // Load the model. Users optionally pass in a threshold and an array of
  // labels to include.
  toxicity.load(threshold).then(model => {
    const sentences = [themessage.content];

    model.classify(sentences).then(predictions => {
      // `predictions` is an array of objects, one for each prediction head,
      // that contains the raw probabilities for each input along with the
      // final prediction in `match` (either `true` or `false`).
      // If neither prediction exceeds the threshold, `match` is `null`.
      console.log(predictions);
      /*
      prints:
      {
        "label": "identity_attack",
        "results": [{
          "probabilities": [0.9659664034843445, 0.03403361141681671],
          "match": false
        }]
      },
      {
        "label": "insult",
        "results": [{
          "probabilities": [0.08124706149101257, 0.9187529683113098],
          "match": true
        }]
      },
      ...
      */
      var responseMessage = " "

      ida =  predictions[0].results[0].match
      console.log(predictions[0].results[0])
      ins = predictions[1].results[0].match
      console.log(predictions[1].results[0])
      obs = predictions[2].results[0].match
      console.log(predictions[2].results[0])
      sev = predictions[3].results[0].match
      console.log(predictions[3].results[0])
      sex = predictions[4].results[0].match
      console.log(predictions[4].results[0])
      thr = predictions[5].results[0].match
      console.log(predictions[5].results[0])
      tox = predictions[6].results[0].match
      console.log(predictions[6].results[0])
      //console.log(ins_input)
    if(ida === true ){
      responseMessage += "ouch you hurt my feelings "
    }
    if(ins === true){
      responseMessage += "please dont Insult me! ";
    }
    if(obs=== true){
      responseMessage += "and thats taking it too far with that type of langauge! "
    }
    if(sev === true){
      responseMessage += "Wow! okay... "
    }
    if(sex === true ){
      responseMessage += "ewww thats disgusting! "
    }else if(sex === null){
      responseMessage += "I dont think this is approriate. "
    }
    if(thr === true || thr === null){
      responseMessage += "Nooooo! fear for my life. "
    }
    if(tox === true){
      responseMessage += "Dont be toxic. "
    }else if(tox === null){
      responseMessage += "I dont think this is approriate. "
    }
    
    if(ida === false && ins === false && obs === false && sev === false && sex === false && thr === false && tox === false){
      ;
    }else{
      themessage.reply(responseMessage);
      try{
        themessage.delete();
      }catch(error){
        console.log("cant delete");
      }
    }
    });
  });
}










//----------------------------------BOT ALGORITHM GOES HERE!!!!!!!---------------------------------------------------------------------------------------------------------------------
//----------------------------------BOT ALGORITHM GOES HERE!!!!!!!---------------------------------------------------------------------------------------------------------------------
