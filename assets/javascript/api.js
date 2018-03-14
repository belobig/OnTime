
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


var orig;
var dest;
var tdEventName;
var tdOrig = 'Salt Lake City, UT';
var tdDest = 'Boise, ID';
var key;
var travelTime;
var tTimeID;
var directions = [];

// Get info from input fields, and push them to firebase
$("#submitInfo").on("click", function (event) {
	// Prevent form from reloading the page on Submit
	// event.preventDefault();

	// Get the input values
	orig = $("#origin").val().trim();
	dest = $("#dest").val().trim();


	// Save the new data in Firebase
	database.ref().push({
		orig: orig,
		dest: dest,
		dateAdded: firebase.database.ServerValue.TIMESTAMP
	});


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

	// create an origin and destination varibles; initialized to defaults.
	var myOrigin = tdOrig;
	var myDestination = tdDest;
	// console.log(tdOrig, tdDest);
	
	// initialize varible to center map on Salt Lake City
	var saltLake = new google.maps.LatLng(40.569022, -111.893934);

	// object that sets parameters of map when initilized
	var mapOptions = {
		zoom: 14,
		center: saltLake
	}

	// creates map varible and links to html id #map, and adds reference to mapOptiona Object.
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);

	// calls Google's method to display directions using map varible.
	directionsDisplay.setMap(map);

	// empties #directionsPanel -------------------------------NOPE! 
	$("#directionsPanel").html('');

	directionsDisplay.setPanel(document.getElementById('directionsPanel'));

	calcRoute(myOrigin, myDestination, directionsService, directionsDisplay);

	document.getElementById('mode').addEventListener('change', function () {

		calcRoute(myOrigin, myDestination, directionsService, directionsDisplay);

	});
}

function calcRoute(myOrigin, myDestination, directionsService, directionsDisplay) {
	var selectedMode = document.getElementById('mode').value;
	var request = {
		origin: myOrigin,
		destination: myDestination,
		// Note that Javascript allows us to access the constant
		// using square brackets and a string value as its
		// "property."
		travelMode: google.maps.TravelMode[selectedMode],
		drivingOptions: {
			departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
			trafficModel: 'optimistic'
		}
	};
	directionsService.route(request, function (response, status) {
		// console.log(response);
		console.log(response.routes[0].legs[0].duration_in_traffic);
		if (status == 'OK') {
			directionsDisplay.setDirections(response);
			// updateTravelTime(response); // Calling it here causes it to repeat once for each database entry
			directions.push(response);
		}
	});
}

// Each time a child, or trip, is added to the database, add it to the DOM and map
database.ref().on("child_added", function (snapshot) {
	//console.log("I had a child!");
	tdEventName = snapshot.val().dateAdded;
	tdOrig = snapshot.val().orig;
	tdDest = snapshot.val().dest;

	key = snapshot.key;
	// console.log(snapshot);
	// console.log(key);

	tTimeID = 'tTime' + key;

	// appends each event from Firebase to the html table
	$("#all-display").append("<tr><td>" + tdEventName + "</td><td>" + tdDest + "</td><td>" + tdOrig + "</td><td id=" + "'" + tTimeID + "'" + ">loading...</td></tr>");
	
	initMap(tdOrig, tdDest);
});

// To update travel time
function updateTravelTime() {
	database.ref().once("value", function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			travelTime = directions.routes[0].legs[0].duration_in_traffic.text;
			var updtKey = childSnapshot.key;
			var updtTtimeID = 'tTime' + updtKey;
			console.log(travelTime);
			$("#" + updtTtimeID + "").html(travelTime);
		});

	});

}

setTimeout(updateTravelTime, 2000);

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
