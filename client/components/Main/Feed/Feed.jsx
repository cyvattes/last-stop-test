var React = require("react");
var request = require("superagent");
// var AppStops = require("../stops.jsx");
var Loading = require('../Loading.jsx');

var Stops = React.createClass({
  getInitialState: function() {
    return {
      stops: [],
      loaded: false
    }
  },

  getInfo: function(that) {
    var position = navigator.geolocation.getCurrentPosition(function(position){
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      fetch("https://last-stop-backup.herokuapp.com/apis/stops?lat="+lat+"&lon="+lon)
      // fetch("https://last-stop-backup.herokuapp.com/apis/stops?lat=37.600377&lon=-122.3875")
        .then(function(res){
          res.json().then(function(data){
              that.setState({stops: data, loaded:true});
          })
        });
      });
    },

  componentWillMount: function () {
    this.getInfo(this);
  },

  // componentDidMount: function() {
  //   setInterval(forceUpdate(), 3000);
  // },

  render:function(){
    if (this.state.loaded !== false ) {
      var feedStyle = {
        textAlign:'right'
      }

      // old code above
      var dataClone = JSON.parse(JSON.stringify(this.state.stops));
      dataClone.sort(function(a, b){
        if (a.stop_name < b.stop_name){
          return 1;
        } else if (a.stop_name > b.stop_name){
          return -1;
        }
        return 0;
      })

      var agencyList = {};
      for (var stop in dataClone) {
        if (agencyList.hasOwnProperty(dataClone[stop].stop_name)) {
          agencyList[dataClone[stop].stop_name] += 1;
        } else {
          agencyList[dataClone[stop].stop_name] = 1;
        }
      }

      function formatTime(stop){
        var departure_time = stop.departure_time
        var check = parseInt(departure_time.slice(0,2))
        if (check >= 24) {
          departure_time = "0" + (check-24).toString() + departure_time.slice(2);
        }
        var date = moment(departure_time, "HH:mm:ss")
        if (date.diff(moment()) < 0) {
          date.add(24, 'hours');
          check -= 24
        }
        function depTimeSlicer(dep){
          departure_time = dep.slice(0,5);
          if (departure_time.slice(-1) == ":") {
            departure_time = departure_time.slice(0,-1);
          }
          return departure_time
        }
        if (check > 12) {
          departure_time = (check-12).toString() + departure_time.slice(2);
          departure_time = depTimeSlicer(departure_time) + " PM";
        } else {
          departure_time = depTimeSlicer(departure_time) + " AM";
        }
        if (departure_time.slice(0,2) === "00") {
          departure_time = departure_time.replace("00:", "12:");
        } else if (departure_time.slice(0,1) === "0") {
          departure_time = departure_time.slice(1);
        }
        return [date, departure_time];
      }
      function timerSwap(date, dep){
          var timeTilChange = (3600000) * 1 // Time in Hours
          if (date.diff(moment()) < timeTilChange && date.diff(moment()) > 0) {
             return date.fromNow(true).replace("minute","min");
          } else {
            return dep;
          }
        }

      function destinationViewer(key, counter){
        var destArr = [];
        var timerArr = [];
        for (var i=1;i<=agencyList[key];i++){
          var route = React.createElement(
            "div",
            {className: "route-short col-sm-12 col-md-12 col-lg-12"},
            dataClone[counter].route_short_name
          );
          var dest = React.createElement(
            "div",
            {className: "fa fa-arrow-circle-right stop-dest col-sm-12 col-md-12 col-lg-12"},
            dataClone[counter].destination
          );
          destArr.push(route, dest);
          var dateTime = formatTime(dataClone[counter]);
          var time = timerSwap(dateTime[0], dateTime[1]);
          timerArr.push(time);
          counter++;
        }
        ////
        // This return should use objects instead of arrays
        ////
        return (
          <div className="info-block col-sm-12 col-md-12 col-lg-12">
            <div className="route-destination-block col-sm-4 col-md-4 col-lg-4">
              <div>{destArr}</div>
            </div>
            <div className="time-block col-sm-8 col-md-8 col-lg-8">
              {timerArr}
            </div>
          </div>
        );
      }

      var counter = 0;
      var stopNameViewer = Object.keys(agencyList).map(function(stop){
        return (
          <div className="stop-container col-sm-12 col-md-12 col-lg-12">
            <div className="header-block col-sm-12 col-md-12 col-lg-12">
              <div className="transit-agency col-sm-4 col-md-4 col-lg-4">{dataClone[counter].agency_id}</div>
              <div className="stop-name col-sm-8 col-md-8 col-lg-8">{stop}</div>
            </div>
            {destinationViewer(stop, counter)}
          </div>
        );
      })


      var stops = function(){
        return stopNameViewer;
      }



      return (
      <div className="col-sm-12 col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
        {stops()}
      </div>
      );
    } else {
      return <div><Loading/></div>
    }
  }
});

module.exports = Stops
