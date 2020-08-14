//jshint esversion:6

const express = require("express");
const app = express();
const https = require("https");
const bodyParser = require("body-parser");
// const {
//   JSDOM
// } = require("jsdom");
// const {
//   window
// } = new JSDOM("");
// const $ = require("jquery")(window);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const date = require(__dirname + "/date.js");
// const currentLocation = require(__dirname + "/location.js");



app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// const position = currentLocation.userLocation();

// function userIsInHere(village, town, city) {
//   let arguments = [village, town, city];
//   for (var i = 1; i < 3; i++) {
//     if (arguments[i] != undefined)
//     console.log(arguments[i]);
// let city = arguments[i];
//       return city;
//   }
//   return "ERROR";
// }


function hoursConverter(timestamp) {
  var d = new Date(timestamp * 1000); //timestamp data in miliseconds
  var n = d.getHours(); //hour in READABLE format
  return n;
}

app.get("/home", function(req, res) {
  res.render("home");
});
app.get("/today", function(req, res) {

  res.render("today");
});

app.post("/today", function(req, res) {

  const lat = req.body.latitude;
  const long = req.body.longitude;

  console.log(lat);
  console.log(long);
  const key = "pk.cb4d293dc5b9c4485829a61332d0756f";
  const format = "json";

  const locationUrl = "https://eu1.locationiq.com/v1/reverse.php?key=" + key + "&lat=" + lat + "&lon=" + long + "&format=" + format + "&accept-language=ukr" + "&normalizecity=1";

  const appId = "059c7d620fd0e428b3446b8e192cfe1e";
  const units = "metric";

  console.log(locationUrl);

  //+++++++++++++++++++++GET Request to LocationIQ API++++++++++++++++++
  https.get(locationUrl, function(response) {
    response.setEncoding("utf8");
    let body = "";
    response.on("data", data1 => {

      body += data1;
      console.log(body);

    });
    response.on("end", () => {
      jsonData = JSON.parse(body);

      const locationIqData = jsonData; // Data from LocationIQ API in json format with UTF8 ncoding system

      const userCity = locationIqData.address.city;
      console.log(userCity);

      const userRegion = locationIqData.address.state;
      const userCountry = locationIqData.address.country;

      const userAddress = userCity + ", " + userRegion + ", " + userCountry;
      const today = date.date();
      //+++++++++++++++++++++GET Request to OpenWheatherMap API++++++++++++++++++
      const weatherUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=minutely&appid=" + appId + "&units=" + units;

      https.get(weatherUrl, function(response) {

        console.log(response.statusCode);

        response.on("data", function(data) {
          const weatherData = JSON.parse(data);
          const temp = weatherData.current.temp;
          const wind = weatherData.current.wind_speed;
          const humidity = weatherData.current.humidity;
          const pressure = weatherData.current.pressure;
          const weatherCondition = weatherData.current.weather[0].main;
          const iconID = weatherData.current.weather[0].icon;
          const iconUrl = "http://openweathermap.org/img/wn/" + iconID + "@2x.png";

          const datestampsUpToSix = [];
          const weatherOfHours = weatherData.hourly;

          const hourlyWeatherCharacteristics = {
            dt: [],
            time: [],
            temperature: [],
            icon: [],
            weather: []
          };

          weatherOfHours.every(function(dateTimestamp) {
            const datestampInHours = hoursConverter(dateTimestamp.dt); //Converting date to normal Format and getting hour
            const iconUrl = "http://openweathermap.org/img/wn/" + dateTimestamp.weather[0].icon + "@2x.png";

            hourlyWeatherCharacteristics.dt.push(dateTimestamp.dt);
            hourlyWeatherCharacteristics.time.push(datestampInHours);
            hourlyWeatherCharacteristics.temperature.push(dateTimestamp.temp);
            hourlyWeatherCharacteristics.weather.push(dateTimestamp.weather[0].main);
            hourlyWeatherCharacteristics.icon.push(iconUrl);
            if (datestampInHours == 6) return false;
            else return true;
          });
          console.log(hourlyWeatherCharacteristics);



          res.render("today", {
            userAddress: userAddress,
            today: today,
            temp: temp,
            wind: wind,
            humidity: humidity,
            pressure: pressure,
            weatherCondition: weatherCondition,
            iconUrl: iconUrl,
            hourlyTime: hourlyWeatherCharacteristics.time,
            hourlyTemperature: hourlyWeatherCharacteristics.temperature,
            hourlyIcon: hourlyWeatherCharacteristics.icon,
            hourlyWeatherDescription: hourlyWeatherCharacteristics.weather
          });
        });

      });

    });
  });
  });



  app.listen(3000, function() {
    console.log("Server is running on port 3000");
  });

// app.post("/", function(req, res) {
//   console.log(req.body);
//   const city = req.body.enteredCity;
//   const appId = "059c7d620fd0e428b3446b8e192cfe1e";
//   const units = "metric";
//
//   const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + appId + "&units=" + units;
//   console.log(url);
//   https.get(url, function(response) {
//
//     console.log(response.statusCode);
//     response.on("data", function(data) {
//       const weatherData = JSON.parse(data);
//       const temp = weatherData.main.temp;
//       const city = weatherData.name;
//       const weatherDescription = weatherData.weather[0].description;
//
//       const iconID = weatherData.weather[0].icon;
//       const iconUrl = "http://openweathermap.org/img/wn/" + iconID + "@2x.png";
//
//       res.write("<p>The weather is currently " + weatherDescription + "</p>");
//       res.write("<h1>The temprerature in " + city + " is " + temp + " Celcius degrees. The weather is currently " + weatherDescription + "</h1>");
//       res.write("<img src=" + iconUrl + ">");
//       res.send();
//     });
//
//   });
//
// });
