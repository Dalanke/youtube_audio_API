const { getDb } = require('./db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const db = require('./db.js');
const fetch = require('node-fetch');

require('dotenv').config();
// jwt secert setting
let { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  JWT_SECRET = 'defaultSecret';
  console.log('Missing env var JWT_SECRET. Using unsafe dev secret');
}

// signup resolver
async function signup(parent, args, context, info) {
  const db = getDb();

  // get signup input 
  const input = args.input;
  // test if already exits(unique email)
  const result = await db.collection('user').findOne({ email: input.email });
  if (result) {
    throw new UserInputError('Account already exist');
  }

  const newUser = { ...input };
  // if it is a new user, encrypt the password
  const password = await bcrypt.hash(input.password, 10);
  newUser.password = password;
  // initialize playlist
  newUser.playlists = [];
  // initialize avatar if null
  if (!newUser.avatars) {
    newUser.avatars = '';
  }
  // initialize description if null
  if (!newUser.description) {
    newUser.description = '';
  }


  // insert and get result
  const createdResult = await db.collection('user').insertOne(newUser);
  const createdUser = await db.collection('user').findOne({ _id: createdResult.insertedId });

  const token = generateToken(createdUser);

  return {
    token,
    user: createdUser
  }

}

// login resolver
async function login(parent, args, context, info) {
  const db = getDb();

  const user = await db.collection('user').findOne({ email: args.email });
  if (!user) {
    throw new UserInputError('User not found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new UserInputError('Invalid password');
  }

  const token = generateToken(user);

  return {
    token,
    user
  }

}

// reCAPTCHA verification
async function reCAPTCHAVerify(parent, args, context, info) {
  const { token } = args;
  const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY
  const headers = {
    "Accept": "application/json",
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers,
      body: `secret=${RECAPTCHA_KEY}&response=${token}`,
    })
    const resText = await response.text();
    const result = JSON.parse(resText);
    const newRes = { ...result, 'error_codes': result['error-codes']};
    delete newRes['error-codes'];
    return newRes;
  } catch (error) {
    new Error('reCAPTCHA verification failed');
  }

}


// Note that this function will delete the password!
function generateToken(user) {
  // delete password first
  delete user.password;
  // generate token
  return token = jwt.sign({
    email: user.email,
    user: user.username,
  }, JWT_SECRET, { expiresIn: "2 days" });
}

// call this function if needs auth, if verify failed, throw new error
function verifyUser(context) {
  const Authorization = context.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    try {
      const user = jwt.verify(token, JWT_SECRET);
      return user;
    } catch (error) {
      // if verify failed, throw out error
      throw new Error('Not authenticated');
    }
  }

  throw new Error('Not authenticated');
}

async function getUserInfo(parent, args, context, info) {
  const db = getDb();

  const user = verifyUser(context)
  if (user) {
    const userInfo = await db.collection('user').findOne({ email: user.email });
    if (userInfo) {
      return userInfo
    } else {
      throw AuthenticationError('Authenticate Failed')
    }
  }

  throw AuthenticationError('Authenticate Failed');
}

module.exports = { signup, login, verifyUser, getUserInfo, reCAPTCHAVerify };