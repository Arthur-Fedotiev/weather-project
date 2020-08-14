//jshint esversion:6

exports.userLocation = function(){
    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position, options){
        return position.coords;
      });
  }
    };

    //LocatioIQ token:    e857cc22eeb247

    //Access token: pk.cb4d293dc5b9c4485829a61332d0756f
