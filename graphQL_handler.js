const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');

const { getMusicInfo, searchMusic } = require('./music.js');
const { signup, login, getUserInfo, reCAPTCHAVerify } = require('./auth.js');
const { addPlaylist, deletePlaylist, addMusic, deleteMusic, editUser} = require('./userinfo.js');

const resolvers = {
  Query: {
    test: () => 'Hello world',
    music: getMusicInfo,
    searchMusic: searchMusic,
    user: getUserInfo,
    rcVerify: reCAPTCHAVerify,
  },
  Mutation: {
    playlistAdd: addPlaylist,
    signup: signup,
    login: login,
    userEdit: editUser,
    playlistDelete: deletePlaylist,
    musicAdd: addMusic,
    musicDelete: deleteMusic,
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
  context: ({ req }) => {
    return req;
  },
  formatError: err => {
    console.log(err);
    return err
  },
  introspection: true,
  playground: true,
});

// cors setting
const cors = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'POST',
  credentials: true
}

function installHandler(app) {
  server.applyMiddleware({ app, path: '/graphql', cors });
}

module.exports = { installHandler };