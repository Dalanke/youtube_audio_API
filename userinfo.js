const { getDb, getNextPlaylistID } = require('./db.js');
const { verifyUser } = require('./auth.js');

//add a new playlist
async function addPlaylist(_, { playlist }, context) {
  const user = verifyUser(context);
  const db = getDb();
  const newPlaylist = { ...playlist };
  newPlaylist.musics = [];
  newPlaylist.id = await getNextPlaylistID(user.email);
  console.log(newPlaylist);
  await db.collection('user').updateOne({"email": user.email}, {$push:{"playlists": newPlaylist}});
  const savedPlaylist = await db.collection('user').findOne({ "email": user.email });
  console.log(savedPlaylist.playlists);
  return savedPlaylist.playlists;
}

//delete a playlist according to playlist id
async function deletePlaylist(_, { playlistid }, context) {
  const user = verifyUser(context);
  const db = getDb();
  await db.collection('user').updateOne({"email": user.email}, {$pull: {"playlists": {"id":playlistid}}});
  const savedPlaylist = await db.collection('user').findOne({ "email": user.email });
  return savedPlaylist.playlists;
}

//add a music into a playlist
async function addMusic(_, { playlistid, music }, context) {
  const user = verifyUser(context);
  const db = getDb();
  const newMusic = { ...music };
  await db.collection('user').updateOne({"email": user.email, "playlists.id":playlistid}, {$push:{"playlists.$.musics": newMusic}});

  const savedPlaylist = await db.collection('user').findOne({ "email": user.email });
//  console.log(savedPlaylist.playlists[playlistid-1]);
  return savedPlaylist.playlists;
}

//delete a playlist according to playlist id and music's title
async function deleteMusic(_, { playlistid, title }, context) {
  const user = verifyUser(context);
  const db = getDb();
  await db.collection('user').updateOne({"email": user.email, "playlists.id":playlistid}, {$pull: {"playlists.$.musics": {"title":title}}});
  const savedPlaylist = await db.collection('user').findOne({ "email": user.email });
  return savedPlaylist.playlists;
}

//edit description and avatars
async function editUser(_, { description, avatars }, context) {
  const user = verifyUser(context);
  const db = getDb();
  await db.collection('user').updateOne({"email": user.email},{$set:{"description": description, "avatars":avatars}});
  const savedUser = await db.collection('user').findOne({ "email": user.email });
  return savedUser;
}

module.exports = {
  addPlaylist,
  deletePlaylist,
  addMusic,
  deleteMusic,
  editUser
}