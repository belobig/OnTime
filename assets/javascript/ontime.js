// $(document).ready(function () {

//Initialize tooltips
$('[data-toggle="tooltip"]').tooltip();

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


var signOutBtn = '<button class="btn btn-primary" id="signOutBtn" data-toggle="tooltip" data-placement="left" title="Sign Out"><span class="glyphicon glyphicon-log-out"></span></button>';

// var playArea = '<div class="col-lg-12 text-center whtRndBrdr" id="playArea"><h1>On Time</h1></div>';



initApp = function () {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			// User is signed in.
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var uid = user.uid;
			var phoneNumber = user.phoneNumber;
			var providerData = user.providerData;
			user.getIdToken().then(function (accessToken) {
				$("#firebaseui-auth-container").hide();
				// document.getElementById('sign-in').innerHTML = signOutBtn;
				document.getElementById('account-details').innerHTML = '<img class="userImage img-circle" src="' + photoURL + '" alt="User Image">' + displayName;
				$("#signOutBtn").on("click", function () {
					firebase.auth().signOut().then(function () {
						console.log('Signed Out');
					}, function (error) {
						console.error('Sign Out Error', error);
					});
				});
			});

			// $("#mainArea").html(playArea);
			console.log("User is Signed IN!");

		} else {
			// User is signed out.
			document.getElementById('account-details').innerHTML = '';
			document.getElementById('sign-in').innerHTML = '';
			$("#firebaseui-auth-container").show();
			// $("#mainArea").html('');
			console.log("User is signed out");
		}
	}, function (error) {
		console.log(error);
	});
};

window.addEventListener('load', function () {
	initApp()
});


// });

