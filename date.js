//jshint esversion:6
exports.date = function() {

  const newDate = new Date();
  const formatter = new Intl.DateTimeFormat ("ukr", {
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
  return newDate.toLocaleDateString("ukr", options);

};
