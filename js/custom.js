
// Numeric part of the project ID assigned by the Google API console.
var GCM_SENDER_ID = '792160202199';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function () {
        function onOffline() {
            // Handle the offline event
            $("#offline").show();
        }

        function onOnline() {
            // Handle the online event
            $("#offline").hide();
        }
        document.addEventListener("offline", onOffline, false);
        document.addEventListener("online", onOnline, false);
        navigator.splashscreen.hide();

        // #region notification-registration			
        // Define the PushPlugin.
        var pushNotification = window.plugins.pushNotification;

        // Platform-specific registrations.
        if (device.platform == 'android' || device.platform == 'Android') {
            // Register with GCM for Android apps.
            pushNotification.register(
               app.successHandler, app.errorHandler,
               {
                   "senderID": GCM_SENDER_ID,
                   "ecb": "app.onNotificationGCM"
               });
        } else if (device.platform === 'iOS') {
            // Register with APNS for iOS apps.			
            pushNotification.register(
                app.tokenHandler,
                app.errorHandler, {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "app.onNotificationAPN"
                });
        }
        else if (device.platform === "Win32NT") {
            // Register with MPNS for WP8 apps.
            pushNotification.register(
				app.channelHandler,
				app.errorHandler,
				{
				    "channelName": "MyPushChannel",
				    "ecb": "app.onNotificationWP8",
				    "uccb": "app.channelHandler",
				    "errcb": "app.ErrorHandler"
				});
        }
        // #endregion notifications-registration
    },
    // #region notification-callbacks
    // Callbacks from PushPlugin
    onNotificationGCM: function (e) {
        switch (e.event) {
            case 'registered':
                // Handle the registration.
                if (e.regid.length > 0) {
                    console.log("gcm id " + e.regid);
                    window.localStorage.setItem("RegID", e.regid);
                    window.localStorage.setItem("pushPlatform", "gcm");
                }
                break;

            case 'message':

                if (e.foreground) {
                    // Handle the received notification when the app is running
                    // and display the alert message. 
                    console.log(e.payload.message);
					var ref = window.open("http://" + cmService.shortName + ".customermantra.com/bookwidget/offers", '_system');
                    // Reload the items list.
                    //refreshTodoItems();
                }
                break;

            case 'error':
                console.log('GCM error: ' + e.message);
                break;

            default:
                console.log('An unknown GCM event has occurred');
                break;
        }
    },

    // Handle the token from APNS and create a new hub registration.
    tokenHandler: function (result) {

        window.localStorage.setItem("RegID", result);
        window.localStorage.setItem("pushPlatform", "apns");
        
    },

    // Handle the notification when the iOS app is running.
    onNotificationAPN: function (event) {

        if (event.alert) {
            // Display the alert message in an alert.
            console.log(event.alert);
			var ref = window.open("http://" + cmService.shortName + ".customermantra.com/bookwidget/offers", '_system');
            // Reload the items list.
            //refreshTodoItems();
        }

        // Other possible notification stuff we don't use in this sample.
        if (event.sound){
			var snd = new Media(event.sound);
			snd.play();
        }

        if (event.badge){
			pushNotification.setApplicationIconBadgeNumber(app.successHandler, app.errorHandler, event.badge);
        }

    },

    // Handle the channel URI from MPNS and create a new hub registration. 
    channelHandler: function (result) {
        if (result.uri !== "") {

            window.localStorage.setItem("RegID", result.uri);
            window.localStorage.setItem("pushPlatform", "mpns");
        }
        else {
            console.log('channel URI could not be obtained!');
        }
    },

    // Handle the notification when the WP8 app is running.
    onNotificationWP8: function (event) {
        if (event.jsonContent) {
            // Display the alert message in an alert.
            console.log(event.jsonContent['wp:Text1']);

            // Reload the items list.
            refreshTodoItems();
        }
    },
    // #endregion notification-callbacks

    successHandler: function (result) {
        console.log("callback success, result = " + result);
    },

    errorHandler: function (error) {
        console.log(error);
    }
};
//Custom JS code
var $ = jQuery.noConflict();
$(function(){
});
