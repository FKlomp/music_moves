# Readme

### Installation

* Install NodeJS https://nodejs.org/en/
* Download source
* In index.js, modify:
1. ECHONEST_API_KEY
2. MONGODB_URL
3. MONGODB_USERNAME
4. MONGODB_PASSWORD
* From root folder, execute "npm install"
* From root folder, Run "node ."

### Music Moves
Sample App located in /public folder available at:
http://localhost:3000/

App API available through:
http://localhost:3000/api/

*TODO Create own API calls at endpoint needed for App, for example combining EchoNest and Streamwatch:

### StreamWatch
StreamWatch API calls at endpoint:
http://localhost:3000/api/streamwatch/

**Get Artist Info**

* **URL**
  /artist_info
* **Method:**
  `GET`
*  **URL Params**
   `mbId=[string]`

Example for retrieving artist_info:
http://localhost:3000/api/streamwatch/artist_info?mbId=453f1594-112e-4d3c-921a-8d14e9c97b2e

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
