const { match } = require("assert");
const { count } = require("console");
// Requiring and using instance of express
const express = require('express');
const app = express();
const server = require("http").createServer(app);
// Port number
const portnumber = 4200;
// Create a server (using the Express framework object)
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({extended: true}));

app.use("/client", clientRoute);

const { MongoClient } = require('mongodb');
// Getting our connection url from the file
require('dotenv').config();
const mongo_connection_url = process.env.MONGO_DB_URI;

const client = new MongoClient(mongo_connection_url,{});

// Defining default path of the webserver
app.get('/', function(req,res){
    res.send("Hello world, I am a local webserver thanks to Express");
});

// Connecting
async function run(){
    try {
      await client.connect();// nothing happens until the client connects
      await client.db("admin").command({ping:1});
      console.log("Connected successfully");
      
      // Link to database
      const db = await client.db("pascalTest");
      const netflixMovies = await db.collection('NetflixMovies');
        const netflixDocs = await db.collection('NetflixDocumentaries');
        const netflixSpecials = await db.collection('NetflixSpecials');
      
    // QUERY 1 : Total things produced
    let totalMovies = await netflixMovies.aggregate([
      {$match:{Runtime: /min/}},
      {$group:{_id: null, count:{$sum:1}}}
    ]).toArray();
    console.log("Total Movies:");
    console.log(totalMovies);
    let totalDocs = await netflixDocs.aggregate([
      {$match:{Runtime: /min/}},
      {$group:{_id: null, count:{$sum:1}}}
    ]).toArray();
    console.log("Total Documentaries:");
    console.log(totalDocs);
    let totalSpecials = await netflixSpecials.aggregate([
      {$match:{Runtime: /min/}},
      {$group:{_id: null, count:{$sum:1}}}
    ]).toArray();
    console.log("Total Specials:");
    console.log(totalSpecials);

    // let totalDocs = await db.netflixDocs.countDocuments({});
    // let totalSpecials = await db.netflixSpecials.countDocuments({});
    // console.log("There was a total of " + (totalMovies+totalDocs+totalSpecials) + " pieces of content in 2022.");

    // QUERY 2 : The number of movies with a runtime shorter than 2 hours.
    let longMovies = await netflixMovies.aggregate([
        {$match:{Runtime: /1 h/}},
        {$group:{_id: null, count:{$sum:1}}}
    ]).toArray();
    console.log("Movies shorter than 2 hours:")
    console.log(longMovies);
    

    // QUERY #3: The number of movies with a runtime longer than 2 hours.
    let shortMovies = await netflixMovies.aggregate([
        {$match:{Runtime: /2 h|3 h/}},
        {$group:{_id:null, count:{$sum:1}}}
    ]).toArray();
    console.log("Movies longer than 2 hours:")
    console.log(shortMovies);

    // QUERY 4: Top 5 most popular languages in Movies, Documentaries and Specials
    let popularLanguagesMovies = await netflixMovies.aggregate([
        { $group: { _id: "$Language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();
      console.log("\nMovies:");
      console.log(popularLanguagesMovies);
      let popularLanguagesDocs = await netflixDocs.aggregate([
        { $group: { _id: "$Language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();
      console.log(" \nDocumentaries:");
      console.log(popularLanguagesDocs);
      let popularLanguagesSpecials = await netflixSpecials.aggregate([
        { $group: { _id: "$Language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();
      console.log(" \nSpecials:");
      console.log(popularLanguagesSpecials);

     // QUERY #5: The number of Romantic movies that came out around Valentine’s Day (January & February ) vs rest of the year
     let romanticMoviesVal = await netflixMovies.find({
        "Premiere": { $regex: /January|February/ },
        "Genre": { $regex: /Romantic/ }
      }).toArray();
      console.log("Romantic movies released around Valentine's day:")
    console.log(romanticMoviesVal);
    let romanticMovies = await netflixMovies.find({
        "Premiere": { $not: {$regex: /January|February/ }},
        "Genre": { $regex: /Romantic/ }
      }).toArray();
      console.log("Romantic movies released during the rest of the year:")
    console.log(romanticMovies);

    // QUERY #6: The number of Horror or Thriller movies that came out around Halloween (September & October) vs rest of the year
    let horrorMoviesHal = await netflixMovies.find({
        "Premiere": { $regex: /September|October/ },
        "Genre": { $regex: /Horror|Thriller/ }
      }).toArray();
    console.log(horrorMoviesHal);
    let horrorMovies = await netflixMovies.find({
      "Premiere": { $not: {$regex: /September|October/ }},
      "Genre": { $regex: /Horror|Thriller/ }
    }).toArray();
  console.log(horrorMovies);

    return "Queries done";
  
    } catch (error) { // happens if the client doesn't connect
        console.log(" THERE WAS AN ERROR ")
      console.log(error);
    } finally {
      await client.close();
    }
  }
  run();

// Get request for the mongo query
app.get('/search', function(req,res){
    const query = req.query.q;
    MongoClient.connect(mongo_connection_url, (err, db) => {
        if(err) throw err;
        const dbo = db.db('pascalTest');
        dbo.collection('NetflixMovies').find({name : query}).toArray((err, result) => {
            if(err)throw err;
            res.json(result);
            db.close();
        });
    });
});

// Make server listen for incoming response
app.listen(portnumber, function(){
    console.log("Webserver listening on port:: " + portnumber);
})

function clientRoute(req, res, next) {
    res.sendFile(__dirname + "/public/client.html");
}