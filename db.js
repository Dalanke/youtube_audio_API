require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;

async function connectToDb() {
  const url = process.env.DB_URL;
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log(`${new Date()}: Connected to MongoDB at ${url}`);
  db = client.db();
}

//calcalate the next playlist's id
async function getNextPlaylistID(email) {
  const result = await db.collection('user').findOne({ email }) ;
  //console.log("array length" + result.playlists.length+1);
  return result.playlists.length ? result.playlists[result.playlists.length-1].id +1 : 1 ;
  // return result.playlists.length ? result.playlists.length+ 1 : 1;
}

function getDb() {
  return db;
}

module.exports = { connectToDb, getDb, getNextPlaylistID };
