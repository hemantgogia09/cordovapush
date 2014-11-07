/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 // Azure Mobile Service. 
var MOBILE_SERVICE_URL = 'https://cmantramobile.azure-mobile.net/';
var MOBILE_SERVICE_APP_KEY = 'MZkjfYNFccppxwLbWrymEOpuiKhUjA96';

// Numeric part of the project ID assigned by the Google API console.
var GCM_SENDER_ID = '792160202199';

// Define the MobileServiceClient as a global variable.
var mobileClient;
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
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		// Define the Mobile Services client.
        mobileClient = new WindowsAzure.MobileServiceClient(MOBILE_SERVICE_URL, MOBILE_SERVICE_APP_KEY);
	    
        // #region notification-registration			
        // Define the PushPlugin.
		var pushNotification = window.plugins.pushNotification;
		
		// Platform-specific registrations.
        if ( device.platform == 'android' || device.platform == 'Android' ){
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
					"badge":"true",
					"sound":"true",
					"alert":"true",
                    "ecb": "app.onNotificationAPN"
                });
        }
		else if(device.platform === "Win32NT"){
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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	// #region notification-callbacks
    // Callbacks from PushPlugin
    onNotificationGCM: function (e) {
        switch (e.event) {
            case 'registered':
                // Handle the registration.
                if (e.regid.length > 0) {
                    console.log("gcm id " + e.regid);

                    if (mobileClient) {

                        // Create the integrated Notification Hub client.
                        var hub = new NotificationHub(mobileClient);

                        // Template registration.
                        var template = "{ \"data\" : {\"message\":\"$(message)\"}}";

						// Register for notifications.
                        // (gcmRegId, ["tag1","tag2"], templateName, templateBody)
                        hub.gcm.register(e.regid, ["phonegap"], "myTemplate", template).done(function () {
                            console.log("Registered with hub!");
                        }).fail(function (error) {
                            console.log("Failed registering with hub: " + error);
                        });
                    }
                }
                break;

            case 'message':
			
				if (e.foreground)
				{
					// Handle the received notification when the app is running
					// and display the alert message. 
					console.log(e.payload.message);
					
					// Reload the items list.
					refreshTodoItems();
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
        if (mobileClient) {

            // Create the integrated Notification Hub client.
			var hub = new NotificationHub(mobileClient);

            // This is a template registration.
            var template = "{\"aps\":{\"alert\":\"$(message)\"}}";

			// Register for notifications.
            // (deviceId, ["tag1","tag2"], templateName, templateBody, expiration)
            hub.apns.register(result, null, "myTemplate", template, null).done(function () {
                console.log("Registered with hub!");
            }).fail(function (error) {
                console.log("Failed registering with hub: " + error);
            });
        }
    },

    // Handle the notification when the iOS app is running.
    onNotificationAPN: function (event) {
 
		if (event.alert){
			 // Display the alert message in an alert.
			console.log(event.alert);
			
			// Reload the items list.
			refreshTodoItems();
		}

		// // Other possible notification stuff we don't use in this sample.
		// if (event.sound){
			// var snd = new Media(event.sound);
			// snd.play();
		// }

		// if (event.badge){
			
			// pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
		// }

    },
		
    // Handle the channel URI from MPNS and create a new hub registration. 
    channelHandler: function(result) {
        if (result.uri !== "")
        {
            if (mobileClient) {

                // Create the integrated Notification Hub client.
                var hub = new NotificationHub(mobileClient);

                // This is a template registration.
                var template = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                    "<wp:Notification xmlns:wp=\"WPNotification\">" +
                        "<wp:Toast>" +
                            "<wp:Text1>$(message)</wp:Text1>" +
                        "</wp:Toast>" +
                    "</wp:Notification>";
               
				// Register for notifications.
                // (channelUri, ["tag1","tag2"] , templateName, templateBody)
                hub.mpns.register(result.uri, null, "myTemplate", template).done(function () {
                    console.log("Registered with hub!");
                }).fail(function (error) {
                    console.log("Failed registering with hub: " + error);
                });
            }
        }
        else{
            console.log('channel URI could not be obtained!');
        }
    },
		
    // Handle the notification when the WP8 app is running.
    onNotificationWP8: function(event){
        if (event.jsonContent)
        {
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
