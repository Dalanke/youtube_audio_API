/* global db print */
/* eslint no-restricted-globals: "off" */

db.user.remove({});

const usersDB = [
  {
    id: 1,
    username: "111",
    password: "222",
    phone: "333",
    email: "444",
    address: "555",
    avatars: "666",
    description: "777",       
    playlists: [
      {
        id: 1,
        name: "playlist1",
        description: "des",
        musics:[
          {
            src: 'http://localhost:7777/stream?id=9q7JOQfcJQM',
            title: '以父之名 In The Name of The Father',
            author: 'Jay Chou',
            thumbnail: '',
          },
          {
            src: 'http://localhost:7777/stream?id=qIZ5MAwbeCg',
            title: 'Wounds of War',
            author: 'Jay Chou',
            thumbnail: '',
          }
        ] 
      },
      {
        id:2,
        name: "playlist2",
        description: "des",
        musics: [
          {
            src: 'http://localhost:7777/stream?id=AdkkF6MT0R0',
            title: 'Chapter Seven',
            author: 'Jay Chou',
            thumbnail: '',
          },
          {
            src: 'http://localhost:7777/stream?id=pYyfKSf-VfA',
            title: 'Poppin Party- STAR BEAT',
            author: 'Poppin Party',
            thumbnail: '',
          },
          {
            src: 'http://localhost:7777/stream?id=E8S2IHiuWZA',
            title: 'Kizuna Music キズナミュージック♪ [Piano+Sheet]',
            author: 'Poppin Party',
            thumbnail: '',
          },
        ]
      }
    ]
  },
  {
    id: 2,
    username: "aaa",
    password: "bbb",  
    phone: "ccc",
    email: "ddd",
    address: "eee",
    avatars: "fff",
    description: "ggg",    
    playlists: [
      {
        id: 1,
        name: "playlist1",
        description: "des",
        musics: [
          {
            src: 'http://localhost:7777/stream?id=AdkkF6MT0R0',
            title: 'Chapter Seven',
            author: 'Jay Chou',
            thumbnail: '',
          },
          {
            src: 'http://localhost:7777/stream?id=pYyfKSf-VfA',
            title: 'Poppin Party- STAR BEAT',
            author: 'Poppin Party',
            thumbnail: '',
          },
          {
            src: 'http://localhost:7777/stream?id=E8S2IHiuWZA',
            title: 'Kizuna Music キズナミュージック♪ [Piano+Sheet]',
            author: 'Poppin Party',
            thumbnail: '',
          },
        ]
      }
    ] 
  }, 
];

db.user.insertMany(usersDB);
const count = db.user.count();
print('Inserted', count, 'user');

// db.user.createIndex({ id: 1 }, { unique: true });
