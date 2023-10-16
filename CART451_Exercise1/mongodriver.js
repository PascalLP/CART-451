const { MongoClient } = require('mongodb');

require('dotenv').config();

// Getting our connection url from the file
const mongo_connection_url = process.env.MONGO_DB_URI;
const mongo_connection_local = process.env.MONGO_DB_LOCAL;

//const url = mongo_connection_local;
const url = mongo_connection_url;

// Creating ne MongoClient
const client = new MongoClient(url);

// Database Name
const dbName = 'pascalTest';

async function run() {
    try{
        // Use connect method to connect to the server
        await client.connect();
        console.log('Connected successfully to server');

        // Listing all databases 
        // const dbList = await client.db().admin().listDatabases();
        // console.log("Databases: ");
        // dbList.databases.forEach(db => console.log(` - ${db.name}`));

        const db = await client.db(dbName);
        const netflixMovies = await db.collection('NetflixMovies');
        const netflixDocs = await db.collection('NetflixDocumentaries');
        const netflixSpecials = await db.collection('NetflixSpecials');
      
        let totalContent = db.netflixMovies.count() + db.netflixDocs.count() + db.netflixSpecials.count();
        console.log("Total content in 2022: " + totalContent);

        // QUERY 1: Movies that are shorter than 2 hours
        let shortMovies = await netflixMovies.aggregate([
          {$match:{Runtime:{$regex:"1 h"}}},
          {$project:{Title:1, Runtime:1}}
          ]).toArray();
          console.log(shortMovies);
      
        // QUERY 2: Movies that are longer than 2 hours
        let longMovies = await netflixMovies.aggregate([
          {$match:{Runtime:{$regex:"2 h"}}},
          {$project:{Title:1, Runtime:1}}
          ]).toArray();
          console.log(longMovies);
      
        // QUERY 3: Movies that are not in english
        let foreignMovies = await netflixMovies.aggregate([
            {$match:{Language:{$not:{$eq: "English"}}}},
            {$project:{Title:1, Language:1}}
            ]).toArray();
            console.log(foreignMovies);
        
        // QUERY 4: Top 3 most popular languages
        let popularLanguages = await netflixMovies.aggregate([
            { $group: { _id: "$Language", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
          ]).toArray();
          console.log(popularLanguages);

        // QUERY 5: Romantic movies that came out in January and February
        let romanticMovies = await netflixMovies.find({
            "Premiere": { $regex: /January|February/ },
            "Genre": { $regex: /Romantic/ }
          }).toArray();
        console.log(romanticMovies);

        // QUERY 6: Horror movies that came out in September and October
        let horrorMovies = await netflixMovies.find({
            "Premiere": { $regex: /September|October/ },
            "Genre": { $regex: /Horror|Thriller/ }
          }).toArray();
        console.log(horrorMovies);

        return 'done.';

    } catch(error){
        console.log(error);
    } finally {
        await client.close();
    }
}

run()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());