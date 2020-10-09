//jshint esversion:6

require("dotenv").config();
const express = require("express");
const app = express();
const https = require("https");
const bodyParser = require("body-parser");

let userIsLocated = false;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

const date = require(__dirname + "/date.js");
const today = date.date();
const dayTime = date.dayTime();
let displayedLocation = "Дізнатися погоду...";
let queryIsmade = false;

// const currentLocation = require(__dirname + "/location.js");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", function (req, res) {
  res.render("home", {
    today: today,
    dayTime: dayTime,
    displayedLocation: displayedLocation,
  });
});
app.get("/today", function (req, res) {
  res.redirect("/");
});

app.post("/today1", function (req, res) {
  const lat = req.body.latitude;
  const long = req.body.longitude;
  const key = process.env.LOCATION_IQ_KEY;
  const format = "json";

  const locationUrl =
    "https://eu1.locationiq.com/v1/reverse.php?key=" +
    key +
    "&lat=" +
    lat +
    "&lon=" +
    long +
    "&format=" +
    format +
    "&accept-language=ukr" +
    "&normalizecity=1";

  //+++++++++++++++++++++GET Request to LocationIQ API++++++++++++++++++
  https.get(locationUrl, function (response) {
    response.setEncoding("utf8");
    let body = "";
    response.on("data", (data1) => {
      body += data1;
    });
    response.on("end", () => {
      jsonData = JSON.parse(body);

      const locationIqData = jsonData; // Data from LocationIQ API in json format with UTF8 ncoding system

      const userCity = locationIqData.address.city;
      const userRegion = locationIqData.address.state;
      const userCountry = locationIqData.address.country;

      const userAddress = userCity + ", " + userRegion + ", " + userCountry;

      res.json({
        responseData: userAddress,
      });
    });
  });
});

app.post("/today", function (req, res) {
  queryIsmade = true;

  const key = process.env.LOCATION_IQ_KEY;
  const format = "json";
  let searchRequestFromUser = {
    locationUrl: "",
    cityToFind: "",
    lat: "",
    long: "",
  };
  let userLocationData = {
    userCity: "",
    userRegion: "",
    userCountry: "",
    userAddress: "",
  };

  if (req.body.city) {
    searchRequestFromUser.cityToFind = req.body.city;
    searchRequestFromUser.locationUrl =
      "https://eu1.locationiq.com/v1/search.php?key=" +
      key +
      "&format=" +
      format +
      "&accept-language=ukr" +
      "&q=" +
      searchRequestFromUser.cityToFind +
      "&addressdetails=1" +
      "&normalizecity=1";
  } else {
    searchRequestFromUser.lat = req.body.latitude;
    searchRequestFromUser.long = req.body.longitude;
    searchRequestFromUser.locationUrl =
      "https://eu1.locationiq.com/v1/reverse.php?key=" +
      key +
      "&lat=" +
      searchRequestFromUser.lat +
      "&lon=" +
      searchRequestFromUser.long +
      "&format=" +
      format +
      "&accept-language=ukr" +
      "&normalizecity=1";
  }

  //+++++++++++++++++++++GET Request to LocationIQ API++++++++++++++++++
  https.get(searchRequestFromUser.locationUrl, function (response) {
    response.setEncoding("utf8");
    let body = "";
    response.on("data", (data1) => {
      body += data1;
    });
    response.on("end", () => {
      jsonData = JSON.parse(body);
      const locationIqData = jsonData; // Data from LocationIQ API in json format with UTF8 ncoding system

      if (req.body.city) {
        searchRequestFromUser.lat = locationIqData[0].lat;
        searchRequestFromUser.long = locationIqData[0].lon;

        userLocationData.userCity = locationIqData[0].address.city + ", ";
        userLocationData.userCity = locationIqData[0].address.city
          ? locationIqData[0].address.city + ", "
          : locationIqData[0].address.county + ", ";
        userLocationData.userRegion = locationIqData[0].address.state
          ? locationIqData[0].address.state + ", "
          : "";
        userLocationData.userCountry = locationIqData[0].address.country;
      } else {
        userLocationData.userCity = locationIqData.address.city + ", ";
        userLocationData.userRegion = locationIqData.address.state + ", ";
        userLocationData.userCountry = locationIqData.address.country;
      }

      userLocationData.userAddress =
        userLocationData.userCity +
        userLocationData.userRegion +
        userLocationData.userCountry;
      displayedLocation = userLocationData.userAddress;

      //+++++++++++++++++++++GET Request to OpenWheatherMap API++++++++++++++++++
      const appId = process.env.OPEN_WEATHER_KEY;
      const units = "metric";

      const weatherUrl =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        searchRequestFromUser.lat +
        "&lon=" +
        searchRequestFromUser.long +
        "&exclude=minutely&appid=" +
        appId +
        "&units=" +
        units +
        "&lang=ua";
      https.get(weatherUrl, function (response) {
        response.setEncoding("utf8");
        let body2 = "";
        response.on("data", (data2) => {
          body2 += data2;
        });

        response.on("end", () => {
          const weatherData = JSON.parse(body2);
          const temp = weatherData.current.temp;
          const feelsLike = weatherData.current.feels_like;
          const wind = weatherData.current.wind_speed;
          const humidity = weatherData.current.humidity;
          const pressure = weatherData.current.pressure;
          const weatherCondition = weatherData.current.weather[0].description;
          const iconID = weatherData.current.weather[0].icon;
          const iconUrl =
            "http://openweathermap.org/img/wn/" + iconID + "@2x.png";

          //------------------- Weahter for each HOUR of the current day------------------------------------

          const weatherOfHours = weatherData.hourly;

          const hourlyWeatherCharacteristics = {
            dt: [],
            time: [],
            temperature: [],
            icon: [],
            weather: [],
          };

          weatherOfHours.every(function (dateTimestamp) {
            const datestampInHours = date.hoursConverter(dateTimestamp.dt); //Converting date to normal Format and getting hour
            const iconUrl =
              "http://openweathermap.org/img/wn/" +
              dateTimestamp.weather[0].icon +
              "@2x.png";

            hourlyWeatherCharacteristics.dt.push(dateTimestamp.dt);
            hourlyWeatherCharacteristics.time.push(datestampInHours);
            hourlyWeatherCharacteristics.temperature.push(dateTimestamp.temp);
            hourlyWeatherCharacteristics.weather.push(
              dateTimestamp.weather[0].description
            );
            hourlyWeatherCharacteristics.icon.push(iconUrl);

            if (datestampInHours == 6) return false;
            else return true;
          });
          // MAX & MIN temperature for Current Day
          const maxTemp = hourlyWeatherCharacteristics.temperature.reduce(
            function (total, num) {
              return Math.max(total, num);
            }
          );
          const minTemp = hourlyWeatherCharacteristics.temperature.reduce(
            function (total, num) {
              return Math.min(total, num);
            }
          );

          //------------------- Weather for Tomorrow ------------------------------------
          const tomorrowWeatherData = weatherData.daily[1];
          const tomorrowDayTemp = Math.floor(tomorrowWeatherData.temp.day);
          const tomorrowNightTemp = Math.floor(tomorrowWeatherData.temp.night);
          const tomorrowWeatherDescription =
            tomorrowWeatherData.weather[0].description;
          const tomorrowIconUrl =
            "http://openweathermap.org/img/wn/" +
            tomorrowWeatherData.weather[0].icon +
            "@2x.png";

          const beginOfTomorrow = weatherData.daily[1].dt - 5 * 3600; //12PM - 5hours = 7 a.m.
          const tomorrow = date.timestampConverter(beginOfTomorrow);
          //Find the index of the element of 7 a.m.
          let indexOfbeginOfTomorrow;
          weatherOfHours.forEach(function (dt, index) {
            if (dt.dt == beginOfTomorrow) {
              indexOfbeginOfTomorrow = index;
            }
          });
          //Get Array of Weather Data for 24hours, starting from 7 a.m
          const tomorrowHourlyWeather = weatherData.hourly.slice(
            indexOfbeginOfTomorrow,
            indexOfbeginOfTomorrow + 24
          );
          const tomorrowWeatherCharacteristics = {
            dt: [],
            time: [],
            temperature: [],
            icon: [],
            weather: [],
          };

          tomorrowHourlyWeather.forEach((hour) => {
            const tomorrowHourIconUrl =
              "http://openweathermap.org/img/wn/" +
              hour.weather[0].icon +
              "@2x.png";

            tomorrowWeatherCharacteristics.dt.push(hour.dt);
            tomorrowWeatherCharacteristics.time.push(
              date.hoursConverter(hour.dt)
            );
            tomorrowWeatherCharacteristics.temperature.push(hour.temp);
            tomorrowWeatherCharacteristics.icon.push(tomorrowHourIconUrl);
            tomorrowWeatherCharacteristics.weather.push(
              hour.weather[0].description
            );
          });

          //------------------- Weahter for 8 DAYS of the Week------------------------------------

          const daylyForecast = weatherData.daily;

          const todayPrecipitationProbability = weatherData.daily[0].pop * 100;
          const tomorrowPrecipitationProbability =
            weatherData.daily[1].pop * 100;

          const weekDay = daylyForecast.map((day) =>
            date.timestampConverter(day.dt)
          );

          //----------------------------- RENDERING --------------------------------------
          res.render("today", {
            userAddress: userLocationData.userAddress,
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
            hourlyWeatherDescription: hourlyWeatherCharacteristics.weather,
            minTemp: minTemp,
            maxTemp: maxTemp,
            feelsLike: feelsLike,
            todayPrecipitationProbability: todayPrecipitationProbability,

            daylyForecast: daylyForecast,
            weekDay: weekDay,

            // tomorrowHourlyWeather: tomorrowHourlyWeather,
            tomorrowDayTemp: tomorrowDayTemp,
            tomorrowNightTemp: tomorrowNightTemp,
            tomorrowWeatherDescription: tomorrowWeatherDescription,
            tomorrowIconUrl: tomorrowIconUrl,
            tomorrowHourlyTime: tomorrowWeatherCharacteristics.time,
            tomorrowHourlyTemperature:
              tomorrowWeatherCharacteristics.temperature,
            tomorrowHourlyIcon: tomorrowWeatherCharacteristics.icon,
            tomorrowHourlyWeatherDescription:
              tomorrowWeatherCharacteristics.weather,
            tomorrow: tomorrow,
            tomorrowPrecipitationProbability: tomorrowPrecipitationProbability,

            displayedLocation: displayedLocation,
          });
        });
      });
    });
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
