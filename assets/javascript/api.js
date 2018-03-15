
///////----------------------------------------------------------------------------------------------------------------------------------
// Google Maps API
///////----------------------------------------------------------------------------------------------------------------------------------
// function initMap() {


// 	var origin2 = 'Salt Lake City, Utah';
// 	var destinationA = 'Boise, Idaho';

// 	var destinationIcon = 'https://chart.googleapis.com/chart?' +
// 		'chst=d_map_pin_letter&chld=D|FF0000|000000';

// 	var originIcon = 'https://chart.googleapis.com/chart?' +
// 		'chst=d_map_pin_letter&chld=O|FFFF00|000000';
// 	var map = new google.maps.Map(document.getElementById('map'), {
// 		zoom: 13,
// 		center: { lat: 40.569022, lng: -111.893934 }

// 	});

// 	var trafficLayer = new google.maps.TrafficLayer();
// 	trafficLayer.setMap(map);

// 	var geocoder = new google.maps.Geocoder;


// //////
// // Distance calculations
// //////


// var service = new google.maps.DistanceMatrixService();
// service.getDistanceMatrix(
// 	{
// 		origins: [origin2],
// 		destinations: [destinationA],
// 		travelMode: 'DRIVING',
// 		drivingOptions: {
// 			departureTime: new Date(Date.now()), //leaveing now-ish
// 			trafficModel: 'pessimistic'
// 		},
// 		unitSystem: google.maps.UnitSystem.IMPERIAL,
// 		avoidHighways: false,
// 		avoidTolls: false
// 	}, callback);

// }

var eventName = '';
var eventTime = '';
var orig = '';
var dest = '';
var tdEventName;
var tdOrig = '';
var tdDest = '';
var tdTtime;
var tdEventTime;
var key;
var getKey;
var travelTime;
var tTimeID;
var leaveBy;
var tdLeaveBy;

// Get info from input fields, and push them to firebase
$("#submitInfo").on("click", function (event) {
	// Prevent form from reloading the page on Submit
	event.preventDefault();

	// Get the input values
	eventName = $("#name").val().trim();
	eventTime = $("#time").val();
	orig = $("#origin").val().trim();
	dest = $("#dest").val().trim();


	initMap(orig, dest);


});

// Directions Service API
function initMap() {

	// Google map directions varibles
	// // links to direction service
	var directionsService = new google.maps.DirectionsService();

	// // renders directions
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	// var haight = new google.maps.LatLng(37.7699298, -122.4469157);
	// var oceanBeach = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
<<<<<<< HEAD

	// object that sets parameters of map when initilized
=======
>>>>>>> master
	var myOrigin = orig;
	var myDestination = dest;
	// console.log(tdOrig, tdDest);
	var uofuSandy = new google.maps.LatLng(40.569022, -111.893934);
	var mapOptions = {
		zoom: 14,
		center: uofuSandy
	}

	// creates map varible and links to html id #map, and adds reference to mapOptiona Object.
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);

	// calls Google's method to display directions using map varible.
	directionsDisplay.setMap(map);

	// empties #directionsPanel -------------------------------NOPE! 
	$("#directionsPanel").html('');
	// directionsDisplay.setPanel(document.getElementById('directionsPanel')); //TODO: uncomment this to show directions
	calcRoute(myOrigin, myDestination, directionsService, directionsDisplay);
	$('#modes').change(function () {
		calcRoute(myOrigin, myDestination, directionsService, directionsDisplay);
	}); // For some reason, this calls calcRoute twice on changes from the modes dropdowns
	// document.getElementById('traffic').addEventListener('change', function () {
	// 	calcRoute(myOrigin, myDestination, directionsService, directionsDisplay);
	// });
}

function calcRoute(myOrigin, myDestination, directionsService, directionsDisplay) {
	var selectedMode = document.getElementById('mode').value;
	var selectedTraffic = document.getElementById('traffic').value;
	var request = {
		origin: orig,
		destination: dest,
		// Note that Javascript allows us to access the constant
		// using square brackets and a string value as its
		// "property."
		travelMode: google.maps.TravelMode[selectedMode],
		drivingOptions: {
			departureTime: new Date(Date.now()),// - 300000),  // TODO: for the time N milliseconds from now. need to change this to arrival time
			trafficModel: google.maps.TrafficModel[selectedTraffic]
		}
	};

	directionsService.route(request, function (response, status) {
		// console.log(response);
		console.log(response.routes[0].legs[0].duration_in_traffic);
		if (status == 'OK') {
			directionsDisplay.setDirections(response);
			travelTime = response.routes[0].legs[0].duration_in_traffic.text;
			var travelTimeVal = response.routes[0].legs[0].duration_in_traffic.value;
			leaveBy = moment(eventTime).subtract(travelTimeVal, 'seconds').format("MM-DD-YYYY h:mm A");
			console.log("Travel time: " + travelTime);
			console.log("Event Time: " + moment(eventTime).format("MM-DD-YYYY h:mm A"));
			console.log("Leave By: " + leaveBy);

			// Save the new data in Firebase -- may need to move this so it doesn't add a row each time traffic or travel modes are changed.
			
			database.ref().push({
				FBeventName: eventName,
				FBeventTime: eventTime,
				FBorig: orig,
				FBdest: dest,
				FBtTime: travelTime,
				FBleaveBy: leaveBy,
				FBdateAdded: firebase.database.ServerValue.TIMESTAMP
			});
		}
	});
}

// Each time a child, or trip, is added to the database, add it to the DOM and map
database.ref().on("child_added", function (snapshot) {
	//console.log("I had a child!");
	tdEventName = snapshot.val().FBeventName;
	tdOrig = snapshot.val().FBorig;
	tdDest = snapshot.val().FBdest;
	tdEventTime = moment(snapshot.val().FBeventTime).format("MM-DD-YYYY h:mm A");
	tdTtime = snapshot.val().FBtTime;
	tdLeaveBy = snapshot.val().FBleaveBy;

	key = snapshot.key;
	// console.log(snapshot);
	// console.log(key);


	$("#all-display").append("<tr id=" + "'" + key + "'" + "><td><label><input type='radio' name='optionsRadios' class='mapRadio' id=" + "'optionsRadios" + key + "'" + " value=" + "'option" + key + "'" + "></label></td><td>" + tdEventName + "</td><td>" + tdDest + "</td><td>" + tdEventTime + "</td><td>" + tdTtime + "</td><td>" + tdLeaveBy + "</td><td><button class='removeBtn btn btn-danger btn-xs'>x</button></td></tr>");

	sortTable();
});

// Remove the row of appointment information when the Remove button is clicked
$("body").on("click", ".removeBtn", function () {
	$(this).closest('tr').remove();
	getKey = $(this).parent().parent().attr('id');
	database.ref().child(getKey).remove();
});

// Show the directions on the map for selected row when the radio button is clicked
$("body").on("click", ".mapRadio", function () {
	getKey = $(this).parent().parent().parent().attr('id');
	database.ref("/" + getKey + "").once("value", function (childSnapshot) {
		// console.log(childSnapshot.val().FBorig);
		orig = childSnapshot.val().FBorig;
		dest = childSnapshot.val().FBdest;
		initMapAgain(orig, dest);
	});

});

// Display route on the map when an existing appointment is selected
function initMapAgain() {
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	// var haight = new google.maps.LatLng(37.7699298, -122.4469157);
	// var oceanBeach = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
	var myOrigin = orig;
	var myDestination = dest;
	// console.log(tdOrig, tdDest);
	var uofuSandy = new google.maps.LatLng(40.569022, -111.893934);
	var mapOptions = {
		zoom: 14,
		center: uofuSandy
	}
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	directionsDisplay.setMap(map);
	$("#directionsPanel").html('');
	// directionsDisplay.setPanel(document.getElementById('directionsPanel')); //TODO: uncomment this to show directions

	// From calcRoute
	var selectedMode = document.getElementById('mode').value;
	var selectedTraffic = document.getElementById('traffic').value;
	var request = {
		origin: orig,
		destination: dest,
		// Note that Javascript allows us to access the constant
		// using square brackets and a string value as its
		// "property."
		travelMode: google.maps.TravelMode[selectedMode],
		drivingOptions: {
			departureTime: new Date(Date.now()),// - 300000),  // TODO: for the time N milliseconds from now. need to change this to arrival time
			trafficModel: google.maps.TrafficModel[selectedTraffic]
		}
	};
	console.log(selectedTraffic);
	directionsService.route(request, function (response, status) {
		// console.log(response);
		// console.log(response.routes[0].legs[0].duration_in_traffic);
		if (status == 'OK') {
			directionsDisplay.setDirections(response);
		}
	});
}

// To sort items in the table by time, oldest first
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("all-display");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 0; i < (rows.length -1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[3];
			y = rows[i + 1].getElementsByTagName("TD")[3];
      //check if the two rows should switch place:
      if (moment(x.innerHTML) > moment(y.innerHTML)) {
        //if so, mark as a switch and break the loop:
        shouldSwitch= true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}


// function callback(response, status) {
// 	if (status == 'OK') {
// 		// console.log(response);
// 		var origins = response.originAddresses;
// 		var destinations = response.destinationAddresses;
// 		// console.log(response.originAddresses);
// 		// console.log(response.destinationAddresses);
// 		for (var i = 0; i < origins.length; i++) {
// 			var results = response.rows[i].elements;
// 			console.log(results);
// 			for (var j = 0; j < results.length; j++) {
// 				var element = results[j];
// 				var distance = element.distance.text;
// 				var duration = element.duration.text;
// 				var from = origins[i];
// 				var to = destinations[j];
// 				console.log(element);
// 				console.log(distance);
// 				console.log(duration);
// 				console.log(from);
// 				console.log(to);
// 			}
// 		}
// 	}
// }

// callback();


///////----------------------------------------------------------------------------------------------------------------------------------
// Google calendar API
///////----------------------------------------------------------------------------------------------------------------------------------

// // Client ID and API key from the Developer Console
// var CLIENT_ID = '680626336941-jq4kcktr2ghv678kmlittf9th7sndsak.apps.googleusercontent.com';
// var API_KEY = 'AIzaSyAlI91WupqEYc4XBk5dBrfcNKekA_e9aZ0';

// // Array of API discovery doc URLs for APIs used by the quickstart
// var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// // Authorization scopes required by the API; multiple scopes can be
// // included, separated by spaces.
// var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// var authorizeButton = document.getElementById('firebaseui-auth-container');
// var signoutButton = document.getElementById('signOutBtn');

// /**
//  *  On load, called to load the auth2 library and API client library.
//  */
// function handleClientLoad() {
// 	gapi.load('client:auth2', initClient);
// }

// /**
//  *  Initializes the API client library and sets up sign-in state
//  *  listeners.
//  */
// function initClient() {
// 	gapi.client.init({
// 		apiKey: API_KEY,
// 		clientId: CLIENT_ID,
// 		discoveryDocs: DISCOVERY_DOCS,
// 		scope: SCOPES
// 	}).then(function () {
// 			// Listen for sign-in state changes.
// 			gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

// 			// Handle the initial sign-in state.
// 			updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
// 			authorizeButton.onclick = handleAuthClick;
// 			signoutButton.onclick = handleSignoutClick;
// 		});//-was inbetween curly and semi
// }

// /**
//  *  Called when the signed in status changes, to update the UI
//  *  appropriately. After a sign-in, the API is called.
//  */
// // function updateSigninStatus(isSignedIn) {
// // 	if (isSignedIn) {

// // from ontime.js -----------------------------
// firebase.auth().onAuthStateChanged(function (user) {
// 	if (user) {
// 		// -----------------------------------------
// 		// authorizeButton.style.display = 'none';
// 		// signoutButton.style.display = 'block';

// 		// from ontime.js-------------------------------------------
// 		var displayName = user.displayName;
// 		var email = user.email;
// 		var emailVerified = user.emailVerified;
// 		var photoURL = user.photoURL;
// 		var uid = user.uid;
// 		var phoneNumber = user.phoneNumber;
// 		var providerData = user.providerData;
// 		user.getIdToken().then(function (accessToken) {
// 			$("#firebaseui-auth-container").hide();
// 			document.getElementById('account-details').innerHTML = '<img class="userImage img-circle" src="' + photoURL + '" alt="User Image">' + displayName;
// 			$("#signOutBtn").on("click", function () {
// 				firebase.auth().signOut().then(function () {
// 					console.log('Signed Out');
// 				}, function (error) {
// 					console.error('Sign Out Error', error);
// 				});
// 			});
// 		});

// 		console.log("User is Signed IN!");
// 		// --------------------------------------------------------------
// 		listUpcomingEvents();
// 	} else {
// 		// authorizeButton.style.display = 'block';
// 		// signoutButton.style.display = 'none';

// 		// From ontime.js -------------------------------------------
// 		// User is signed out.
// 		document.getElementById('account-details').innerHTML = '';
// 		document.getElementById('sign-in').innerHTML = '';
// 		$("#firebaseui-auth-container").show();
// 		console.log("User is signed out");
// 		//-------------------------------------------------------------
// 	}
// });

// /**
//  *  Sign in the user upon button click.
// //  */
// function handleAuthClick(event) {
// 	gapi.auth2.getAuthInstance().signIn();
// }

// // /**
// //  *  Sign out the user upon button click.
// //  */
// function handleSignoutClick(event) {
// 	gapi.auth2.getAuthInstance().signOut();
// }

// /**
//  * Append a pre element to the body containing the given message
//  * as its text node. Used to display the results of the API call.
//  *
//  * @param {string} message Text to be placed in pre element.
//  */
// function appendPre(message) {
// 	var pre = document.getElementById('calendar');
// 	var textContent = document.createTextNode(message + '\n');
// 	pre.appendChild(textContent);
// }

// /**
//  * Print the summary and start datetime/date of the next ten events in
//  * the authorized user's calendar. If no events are found an
//  * appropriate message is printed.
//  */
// function listUpcomingEvents() {
// 	gapi.client.calendar.events.list({
// 		'calendarId': 'primary',
// 		'timeMin': (new Date()).toISOString(),
// 		'showDeleted': false,
// 		'singleEvents': true,
// 		'maxResults': 10,
// 		'orderBy': 'startTime'
// 	}).then(function (response) {
// 		var events = response.result.items;
// 		appendPre('Upcoming events:');

// 		if (events.length > 0) {
// 			for (i = 0; i < events.length; i++) {
// 				var event = events[i];
// 				var when = event.start.dateTime;
// 				if (!when) {
// 					when = event.start.date;
// 				}
// 				appendPre(event.summary + ' (' + when + ')')
// 			}
// 		} else {
// 			appendPre('No upcoming events found.');
// 		}
// 	});
// }
