//jshint esversion:6
exports.date = function() {

  const newDate = new Date();
  const formatter = new Intl.DateTimeFormat ("ru", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
return formatter.format(newDate);
  //return newDate.toLocaleDateString("ru", options);

};

exports.day = function() {

  const newDate = new Date();
  const options = {
    weekday: "long",
  };
  return newDate.toLocaleDateString("ru", options);

};

exports.timestampConverter = function(timestamp) {
    var d = new Date(timestamp * 1000); //timestamp data in miliseconds

    const formatter = new Intl.DateTimeFormat ("ru", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
return formatter.format(d);
  //return newDate.toLocaleDateString("ru", options);

};

exports.hoursConverter = function (timestamp) {
  var d = new Date(timestamp * 1000); //timestamp data in miliseconds
  var n = d.getHours(); //hour in READABLE format
  return n;
};

exports.dayTime = function () {
  var hours = new Date().getHours(); //timestamp data in miliseconds
  if(hours >= 19){
    return "Добрий вечір!";
  } else if(hours >= 11) {
    return "Доброго дня!";
  } else {return "Доброго ранку!";}

};
