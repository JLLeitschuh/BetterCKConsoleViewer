"use strict";
//If you are reading this. My biggest suggestion to you is: learn AngularJS. It is amazingly easy to use!
console.log('loading app');
angular.
	module('CKConsoleViewerApp', [
		'CKConsoleViewerApp.controllers',
		'CKConsoleViewerApp.services',
		// Old NG Grid
		'ngGrid',
		//UI Grid components
		'ui.grid',
		'ui.grid.moveColumns',
		'ui.grid.resizeColumns',
		'ui.grid.grouping',
		'ui.grid.pinning',

		//NGWidgets
		'ngwidgets',
		// Angular Grid
		'angularGrid',
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
			when("/group-ngWidgetsGrid/:group", {templateUrl: "partials/ngWidgetsGridDataDisplay.html", controller: "ngWidgetsDataDisplayController"}).
			when("/group-agGrid/:group", {templateUrl: "partials/agGridDataDisplay.html", controller: "agGridDataDisplayController"}).
			otherwise({redirectTo: '/home'});
		}
	]);
