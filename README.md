# Readme

### Installation

1. Install NodeJS https://nodejs.org/en/
2. Clone project
 * git clone https://github.com/FKlomp/music_moves.git
3. In config.js, modify:
 * ECHONEST_API_KEY
 * MONGODB_URL
 * MONGODB_USERNAME
 * MONGODB_PASSWORD
4. From root folder, execute "npm install"
5. From root folder, Run "node ."

### Music Moves
Sample App located in /public folder available at:
http://localhost:3000/

App API available through:
http://localhost:3000/api/

*TODO Create own API calls at endpoint needed for App, for example combining EchoNest and Streamwatch:

### StreamWatch
StreamWatch API calls at endpoint:
http://localhost:3000/api/streamwatch/

**Search artists**

* **URL**
   /artist
* **Method:**
   `GET`
*  **URL Params**
   `q=[string]` => name of artist
*  **Example**
    http://localhost:3000/api/streamwatch/artist?q=hazes

**Search songs**

* **URL**
   /song
* **Method:**
   `GET`
*  **URL Params**
   `q=[string]` => title of artist
*  **Example**
    http://localhost:3000/api/streamwatch/song?q=vlieger

*TODO Add nessecary API calls, needed for App.

### EchoNest
Use EchoNest API calls at endpoint:
http://localhost:3000/api/echonest/{ECHONEST_METHOD}

EchoNest methods can be found at:
http://developer.echonest.com/docs/v4

For example:
http://localhost:3000/api/echonest/artist/search?name=radiohead&bucket=id:musicbrainz&format=json&results=1

### Modules

Webserver
[Express](http://expressjs.com/)

EchoNest Library
[EchoNestJS](https://github.com/dinostheo/echonestjs)

MongoDB module
[MongoDB Driver](http://mongodb.github.io/node-mongodb-native/2.1/)
