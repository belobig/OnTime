// Initialize Firebase
var config = {
	apiKey: "AIzaSyBotbBY-lxslbb-cQaeMtvpFeZuRQNYyvA",
	authDomain: "ontime-7e71b.firebaseapp.com",
	databaseURL: "https://ontime-7e71b.firebaseio.com",
	projectId: "ontime-7e71b",
	storageBucket: "ontime-7e71b.appspot.com",
	messagingSenderId: "680626336941"
};
firebase.initializeApp(config);

var database = firebase.database();


// FirebaseUI config.
var uiConfig = {
	signInSuccessUrl: 'index.html',
	signInOptions: [
		// Leave the lines as is for the providers you want to offer your users.
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	],
	// Terms of service url.
	tosUrl: '<your-tos-url>'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

///////----------------------------------------------------------------------------------------------------------------------------------
// Google Maps API
///////----------------------------------------------------------------------------------------------------------------------------------
function initMap() {

	// var origin1 = new google.maps.LatLng(55.930385, -3.118425);
	var origin2 = 'Salt Lake City, Utah';
	var destinationA = 'Boise, Idaho';
	// var destinationB = new google.maps.LatLng(50.087692, 14.421150);

	var destinationIcon = 'https://chart.googleapis.com/chart?' +
		'chst=d_map_pin_letter&chld=D|FF0000|000000';

	var originIcon = 'https://chart.googleapis.com/chart?' +
		'chst=d_map_pin_letter&chld=O|FFFF00|000000';
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: { lat: 40.34937, lng: -111.534000 }

	});

	var trafficLayer = new google.maps.TrafficLayer();
	trafficLayer.setMap(map);
}
var geocoder = new google.maps.Geocoder;


//////
// Distance calculations
//////


var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
	{
		origins: [origin2],
		destinations: [destinationA],
		travelMode: 'DRIVING',
		drivingOptions: {
			departureTime: new Date(Date.now() + N), //leaveing now-ish
			trafficModel: 'pessimistic'
		},
		unitSystem: google.maps.UnitSystem.IMPERIAL,
		avoidHighways: false,
		avoidTolls: false
	}, callback);

// blank callback function
// function callback(response, status) {
//	// See Parsing the Results for
//	// the basics of a callback function.
//}

function callback(response, status) {
	if (status == 'OK') {
		console.log(response);
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;

		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				var element = results[j];
				var distance = element.distance.text;
				var duration = element.duration.text;
				var from = origins[i];
				var to = destinations[j];
			}
		}
	}
}

// callback();


///////----------------------------------------------------------------------------------------------------------------------------------
// Google calendar API
///////----------------------------------------------------------------------------------------------------------------------------------

// Client ID and API key from the Developer Console
var CLIENT_ID = '680626336941-jq4kcktr2ghv678kmlittf9th7sndsak.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAlI91WupqEYc4XBk5dBrfcNKekA_e9aZ0';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('firebaseui-auth-container');
var signoutButton = document.getElementById('signOutBtn');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
			// Listen for sign-in state changes.
			gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

			// Handle the initial sign-in state.
			updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
			authorizeButton.onclick = handleAuthClick;
			signoutButton.onclick = handleSignoutClick;
		});//-was inbetween curly and semi
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
// function updateSigninStatus(isSignedIn) {
// 	if (isSignedIn) {

// from ontime.js -----------------------------
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// -----------------------------------------
		// authorizeButton.style.display = 'none';
		// signoutButton.style.display = 'block';

		// from ontime.js-------------------------------------------
		var displayName = user.displayName;
		var email = user.email;
		var emailVerified = user.emailVerified;
		var photoURL = user.photoURL;
		var uid = user.uid;
		var phoneNumber = user.phoneNumber;
		var providerData = user.providerData;
		user.getIdToken().then(function (accessToken) {
			$("#firebaseui-auth-container").hide();
			document.getElementById('account-details').innerHTML = '<img class="userImage img-circle" src="' + photoURL + '" alt="User Image">' + displayName;
			$("#signOutBtn").on("click", function () {
				firebase.auth().signOut().then(function () {
					console.log('Signed Out');
				}, function (error) {
					console.error('Sign Out Error', error);
				});
			});
		});

		console.log("User is Signed IN!");
		// --------------------------------------------------------------
		listUpcomingEvents();
	} else {
		// authorizeButton.style.display = 'block';
		// signoutButton.style.display = 'none';

		// From ontime.js -------------------------------------------
		// User is signed out.
		document.getElementById('account-details').innerHTML = '';
		document.getElementById('sign-in').innerHTML = '';
		$("#firebaseui-auth-container").show();
		console.log("User is signed out");
		//-------------------------------------------------------------
	}
});

/**
 *  Sign in the user upon button click.
//  */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

// /**
//  *  Sign out the user upon button click.
//  */
function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	var pre = document.getElementById('calendar');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
	gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': (new Date()).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': 10,
		'orderBy': 'startTime'
	}).then(function (response) {
		var events = response.result.items;
		appendPre('Upcoming events:');

		if (events.length > 0) {
			for (i = 0; i < events.length; i++) {
				var event = events[i];
				var when = event.start.dateTime;
				if (!when) {
					when = event.start.date;
				}
				appendPre(event.summary + ' (' + when + ')')
			}
		} else {
			appendPre('No upcoming events found.');
		}
	});
}