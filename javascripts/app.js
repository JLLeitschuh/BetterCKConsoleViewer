"use strict";
//If you are reading this. My biggest suggestion to you is: learn AngularJS. It is amazingly easy to use!
console.log('loading app');
angular.
	module('CKConsoleViewerApp', [
		'CKConsoleViewerApp.controllers',
		'CKConsoleViewerApp.services',
		'ngGrid',
		//UI Grid components
		'ui.grid',
		'ui.grid.moveColumns',
		'ui.grid.resizeColumns',
		'ui.grid.grouping',
		'ui.grid.pinning',
		// Other
		'ckServices',
		'ui.bootstrap',
		'ngRoute'
	]).
	/** Defines page navigation */
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when("/home", {templateUrl: "partials/groupsList.html", controller: "groupsListController"}).
			when("/group/:group", {templateUrl: "partials/dataDisplay.html", controller: "dataDisplayController"}).
			when("/group-ngGrid/:group", {templateUrl: "partials/ngGridDataDisplay.html", controller: "ngDataDisplayController"}).
			when("/group-uiGrid/:group", {templateUrl: "partials/uiGridDataDisplay.html", controller: "uiDataDisplayController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
