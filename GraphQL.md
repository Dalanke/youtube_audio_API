# GraphQL test query/mutation
* Music(url): get music information from  youtube url, examples:
  ``` JavaScript
  query {
  music(url:"https://www.youtube.com/watch?v=jL8p9vteR5g")
  { src title author thumbnail}
  } 
  ```

  ``` JavaScript
  query {
      finduser(username: "111") {
        username
        password 
        playlists{
          id
          name
          description
          musics{
            src
            title
            author
            thumbnail
          }
        }
      }
    }
  ```

* signup(signupinput):
  ```JavaScript
  mutation {
  signup(
    input: { username: "test", email: "test@test.t", password: "testpassword" }
  ) {
    token
    user {
      username
      playlists {
        musics {
          src
          title
          author
          thumbnail
        }
      }
      email
      avatars
      description
    }
  }
  }
  ```
* login(email, password):
  ```JavaScript 
  mutation {
  login(
    email: "test@test.t",
    password: "testpassword"
  ) {
    token
    user {
      _id
      username
      playlists {
        musics {
          src
          title
          author
          thumbnail
        }
      }
      email
      avatars
      description
    }
  }
  }
  ```

* playlistAdd(playlistInput):
  ```JavaScript
  mutation{
    playlistAdd(playlist:{
      name:"p3"
      description:"new playlist3"
    }
    ) {
      id name description
      musics{
        src title author thumbnail
      }
    }
  }
  ```

* playlistDelete(playlistid):
  ```JavaScript
  mutation{
    playlistDelete(playlistid:2) {
      id name description
      musics{
        src title author thumbnail
      }
    }
  }
  ```

* musicAdd(playlistid, musicInput):
  ```JavaScript
  mutation{
    musicAdd(playlistid:1, music:{
      src:"src3"
      title: "title3"
      author: "author3"
      thumbnail: "thumbnail3"
    }
    ) {
      id name description musics{
        src title author thumbnail
      } 
    }
  }
  ```

* musicDelete(playlistid, title):
  ```JavaScript
  mutation{
    musicDelete(playlistid:1, title:"title1") {
      id name description musics{
      src title author thumbnail
      } 
    }
  }
  ```

* searchMuisc(keyword):
  ```JavaScript
  query {
  searchMusic(keyword: "lemon") {
    src
    title
    author
    thumbnail
    }
  }
  ```




