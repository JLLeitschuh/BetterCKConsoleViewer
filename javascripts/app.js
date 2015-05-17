"use strict";
//If you are reading this. My biggest suggestion to you is: learn AngularJS. It is amazingly easy to use!
console.log('loading app');
angular.
	module('CKConsoleViewerApp', [
		'CKConsoleViewerApp.controllers',
		'CKConsoleViewerApp.services',
		'ngGrid',
		'ckServices',
		'ui.bootstrap',
		'ngRoute'
	]).
	/** Defines page navigation */
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when("/home", {templateUrl: "partials/groupsList.html", controller: "groupsListController"}).
			when("/group/:group", {templateUrl: "partials/dataDisplay.html", controller: "dataDisplayController"}).
			when("/group-ngGrid/:group", {templateUrl: "partials/ngGridDataDisplay.html", controller: "dataDisplayController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
