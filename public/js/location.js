//jshint esversion:6


function getCoords() {
  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position, options) {
      console.log(position.coords);
      $("#latitude").val(position.coords.latitude);
      $("#longitude").val(position.coords.longitude);

      $.post("/today1", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }, // data to be submit
        function(data, status, xhr) { // success callback function
          $("#search-input").attr("placeholder", data.responseData);
          console.log(data);
        },
        'json');

      //  window.location.replace("/today");
    });
  }
}

getCoords();

$(document).ready(function() {

  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position, options) {
      console.log(position.coords);
      $("#latitude").val(position.coords.latitude);
      $("#longitude").val(position.coords.longitude);

    });
  }
});
