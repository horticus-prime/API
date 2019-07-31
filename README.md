# API Server

DevStation, Apprenti, CodeFellows 401 midterm project by 


### Group Members of Horticus-Prime:

* Chloie Parsons
* Ed Dearment
* Matt Wilkin
* Michael Chapman

### Description of Project

In order to increase gardening productivity and to conserve water resources, we have decided to remotely monitor moisture content of soil over time. We will utilize a Raspberry Pi in conjunction with a Grove Moisture Sensor achieve this. The Raspberry Pi will collect moisture sensor data via a direct connection and post at regular intervals to Heroku via a network connection. We have not yet decided what interval at which the data will be posted. The Heroku server will store the collected data in a MongoDB.

We plan on implementing authorization of users and associated capabilities including protecting CRUD routes.

In the future, when the moisture drops below and/or about a certain defined threshold, the app will send a message to the user.

Another possible future feature will incorporate a weather API that will alter the amount of water and/or when to water the plant.

We will design the system for sensor scalability which could include but are not limited to additional moisture sensors, temperature, humidity and sun-light sensors.

### Technologies Utilized 

VSCode, Trello, Github, git, Node.js, Express, Raspberry Pi, a Grove Moisture Sensor, and third-party libraries as necessary.


### Version 1.0.0
### Libraries and Frameworks
* mongoose
* mongoDB
* eslint
* express
* superagent
* express swagger generator
* JSDOC

### Development Environment
* npm install
* npm start
* npm test
* npm test-watch

### API Library
?????

### Problem Domain

Mr. Gardener wants to keep Mrs. Gardener from yelling at him for overwatering and underwatering their plants. They have asked Horticus-Prime to create a method to monitor soil moisture and give them access to the data via the internet.

### Licensing/Attribution


#### MVP1
* Group Title
* Back-end/database/API design
* About Us Page
* 4 Photos & Elevator Pitches
* Learn about the tech (Raspberry PI)
* Get Rapberry PI working
#### MVP 2
Get sensors talking to Raspberry PI

#### MVP Xs

[UML](https://drive.google.com/file/d/1ytFqSaEGy6jKYHJLT9KPCtLAT4O8aoeB/view?usp=sharing)
