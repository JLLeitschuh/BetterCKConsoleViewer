"use strict";
console.log('loading controllers');
angular.module('CKConsoleViewerApp.controllers', []).
	controller('navigationController', function($scope, $modal, $log){
		$scope.openAbout = function (size) {
			var modalInstance = $modal.open({
				templateUrl: 'aboutModal.html',
				controller: 'ModalInstanceController',
				size: size
			});

			modalInstance.result.then(function () {}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
		$scope.openHelp = function (size) {
			var modalInstance = $modal.open({
				templateUrl: 'helpModal.html',
				controller: 'ModalInstanceController',
				size: size
			});

			modalInstance.result.then(function () {}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
	}).
	controller('ModalInstanceController', function($scope, $modalInstance){
		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

	}).
	controller('groupsListController', function($scope, GroupListService){

		$scope.dataList = GroupListService.groupList;
		$scope.recorders = GroupListService.recorders;

		$scope.ignoreNullComparator = function(actual, expected){
			if (expected === null) {
				return true;
			} else {
				return angular.equals(expected, actual);
			}
		};

		$scope.hasMediaSelection = [
			'True',
			'False'
		];
	}).


	/*
	 * OLD WAY OF VIEWING DATA. VERY HACKY.
	 * XXX: Will eventually be removed
	 */
	controller('dataDisplayController', function($scope, $routeParams, ckConsole){
		var groupName = $routeParams.group;

		$scope.progressPercent = 10;


		function Data(id, birthCert, data, mediaList){
			function ImageURLData(id, imageDataSet){
				this.id = id;
				this.thumb = imageDataSet.thumb;
				this.small = imageDataSet.small;
				this.medium = imageDataSet.medium;
				this.original = imageDataSet.original;
			}

			this.id = id;
			this.birthCert = birthCert;
			this.data = data;
			this.dataHeaders = [];
			this.mediaList = [];
			for(var d in data){
				this.dataHeaders[this.dataHeaders.length] = d;
			}
			if(mediaList == null){
				this.hasMedia = false;
				return;
			}

			if($scope.mediaSizeMax < Object.keys(mediaList).length){
				$scope.mediaSizeMax = Object.keys(mediaList).length;
			}
			this.hasMedia = true;
			for(var mediaName in mediaList){
				this.mediaList[this.mediaList.length] = new ImageURLData(mediaName, mediaList[mediaName]);
			}
		}

		$scope.dataName = groupName;
		$scope.dataList = [];
		$scope.simpleDataList = [];
		$scope.mediaSizeMax = 0;
		ckConsole.getGroup(groupName).then(function(infoData){
			$scope.progressPercent = 30;
			$scope.$apply;
			var completePercent = 80;
			var step = ((completePercent - $scope.progressPercent) / Object.keys(infoData.members).length);

			console.log(infoData);
			$scope.dataHeaders = [];
			for(var id in infoData.members){
				$scope.progressPercent += step;
				var member = infoData.members[id];
				var images = null;
				try{
					images = member.media.images;
				} catch (e){
				}
				var memberData = new Data(id, member.birth_certificate, member.data, images);
				$scope.dataList[$scope.dataList.length] = memberData;
				//Find the longest header
				$scope.dataHeaders = _.uniq($scope.dataHeaders.concat(memberData.dataHeaders));
				//$scope.dataHeaders = memberData.dataHeaders;
			}

			console.log($scope.dataList);
			$scope.$apply;


			var maxIterateSize = 100;
			var iterateSize = ($scope.dataList.length < maxIterateSize ? $scope.dataList.length : maxIterateSize);
			//Check to see if its worth it to create a dropdown for a header
			var tableValuesForHeader = {};
			$scope.tableValuesForHeader = tableValuesForHeader;
			for(var j in $scope.dataHeaders){
				var header = $scope.dataHeaders[j];
				var valuesChecked = 0;
				tableValuesForHeader[header] = {
					duplicateFound: false, // Should this field have a dropdown?
					values : [], // List of values for a given row
					valuesWithCount: {},
					selectedValues : [],
					dropDownOpen: false,
					toggleDropDown: function(){
						//Store what the value was
						var valueWas = this.dropDownOpen;
						//Close all of the other drop downs
						for(var otherHeader in $scope.tableValuesForHeader){
							$scope.tableValuesForHeader[otherHeader].dropDownOpen = false;
						}
						//Toggle this one
						this.dropDownOpen = !valueWas;
					},
					checkAll : function(){
						this.dropDownOpen = true;
						this.selectedValues = this.values;
					},
					setSelected : function(value){
						this.dropDownOpen = true;
						console.log("setSelected called with:");
						console.log(value);
						if (_.contains(this.selectedValues, value)) {
							this.selectedValues = _.without(this.selectedValues, value);
						} else {
							this.selectedValues.push(value);
						}
						return false;
					},
					isChecked : function(value){
						if (_.contains(this.selectedValues, value)) {
							return 'glyphicon glyphicon-ok pull-right';
						}
						return 'glyphicon glyphicon-ok pull-right hide';
					}
				};
				for(var i = 0; i < (tableValuesForHeader[header].duplicateFound ? $scope.dataList.length : iterateSize); i++){
					var data = $scope.dataList[i].data;
					if(data[header] == ""){
						//If the field is undefined then skip it but search one space further
						iterateSize = (iterateSize + 1 > $scope.dataList.length ? $scope.dataList.length : iterateSize + 1);
						continue;
					}
					if(tableValuesForHeader[header].values.indexOf(data[header]) == -1){
						tableValuesForHeader[header].values.push(data[header]);
						tableValuesForHeader[header].valuesWithCount[data[header]] = 1;
					} else {
						tableValuesForHeader[header].duplicateFound = true;
						tableValuesForHeader[header].valuesWithCount[data[header]] ++;
					}
				}
			}

			console.log(tableValuesForHeader);
			$scope.progressPercent = 100;

			$scope.totalDisplayed = ($scope.dataList.length < 500 ? $scope.dataList.length : 500);
		});

		$scope.filtered = null;
		$scope.excludeText = "";
		$scope.loadMore = function () {
			$scope.totalDisplayed += 500;
		};

		$scope.uncheckAll = function() {
			angular.forEach($scope.tableValuesForHeader, function(headerData){
				headerData.selectedValues = [];
			});
		}

		$scope.filtersAdditiveSelection = [false, true];
		$scope.filtersAdditive = false;

		$scope.gridOptions = {
			data: 'simpleDataList',
			enableSorting: true,
			showColumnMenu: true,
			enableColumnReordering: true,
			enableColumnResize: true
		};

	}).
	/*
	 * Uses the now outdated ng-grid framework
	 */
	controller('ngDataDisplayController',function($scope, $routeParams, ckConsole){
		var groupName = $routeParams.group;
		var getImageHeaderName = function(value){
			return "Image " + value;
		};
		$scope.dataName = groupName;
		$scope.simpleDataList = [];
		$scope.columnDefs = [
			{field: 'id', width: '100px', groupable: false},
			{field: 'birthID', width: '50px'},
			{field: 'dor', width: '100px'},
			{field: 'lat', width: '75px'},
			{field: 'lon', width: '75px'},
		];
		//$scope.dataHeaders = _.uniq($scope.dataHeaders.concat(memberData.dataHeaders));
		ckConsole.getGroup(groupName).then(function(infoData){
			console.log(infoData);

			var maxImageCount = 0;
			var headerFieldNames = [];
			function SimpleData(id, dataObj){
				this.id = id;
				this.birthID = dataObj.birth_certificate.birthID;
				this.dor = dataObj.birth_certificate.dor;
				this.lat = dataObj.birth_certificate.lat;
				this.lon = dataObj.birth_certificate.lon;

				var images = null;
				try{
					images = dataObj.media.images;
					var imageCount = 0;
					for(var imageId in images){
						this[getImageHeaderName(imageCount)] = images[imageId].thumb;
						this[getImageHeaderName(imageCount) + 'original'] = images[imageId].original;
						imageCount ++;
					}
					maxImageCount = maxImageCount < imageCount ? imageCount : maxImageCount;
				} catch (e){}

				for(var id in dataObj.data){
					this[id] = dataObj.data[id];
					headerFieldNames.push(id);
				}
			}
			// Generate the list elements to show
			for(var id in infoData.members){
				var member = infoData.members[id];
				var listElement = new SimpleData(id, member);
				$scope.simpleDataList.push(listElement);
			}

			//Generate the header elements to show
			$scope.getImageOriginalSize = function(field){
				return field + 'original';
			}

			for(var i = 0; i < maxImageCount; i++){
				$scope.columnDefs.push({
					field: getImageHeaderName(i),
					width: '200px',
					groupable: false,
					cellTemplate: '<div ng-class=\"col.colIndex()\"><a ng-href=\"{{row.getProperty(getImageOriginalSize(col.field))}}\"><img ng-src=\"{{row.getProperty(col.field)}}\" lazy-src ></a></div>'
				});
			}

			headerFieldNames = _.uniq(headerFieldNames);
			//console.log(headerFieldNames);
			for (var elt in headerFieldNames){
				var element = headerFieldNames[elt];
				$scope.columnDefs.push({
					field: element,
					width: '100px',
				});
			}
		});

		$scope.gridOptions = {
			data: 'simpleDataList',
			columnDefs: 'columnDefs',
			showGroupPanel: true,
			enableSorting: true,
			showColumnMenu: true,
			enableColumnReordering: true,
			enableColumnResize: true,
			enablePinning: true,
		};

	}).
	/*
	 * Uses the new (ALPHA) versions of ui-grid framework.
	 */
	controller('uiDataDisplayController',function($scope, $routeParams, ckConsole){
		var groupName = $routeParams.group;
		var getImageHeaderName = function(value){
			return "Image " + value;
		};
		$scope.dataName = groupName;
		$scope.simpleDataList = [];
		$scope.columnDefs = [
			{field: 'id', width: 100, groupable: false},
			{field: 'birthID', displayName:'birthID', width: 50},
			{field: 'dor', width: 100},
			{field: 'lat', width: 75},
			{field: 'lon', width: 75},
		];
		//$scope.dataHeaders = _.uniq($scope.dataHeaders.concat(memberData.dataHeaders));
		ckConsole.getGroup(groupName).then(function(infoData){
			console.log(infoData);

			var maxImageCount = 0;
			var headerFieldNames = [];
			function SimpleData(id, dataObj){
				this.id = id;
				this.birthID = dataObj.birth_certificate.birthID;
				this.dor = dataObj.birth_certificate.dor;
				this.lat = dataObj.birth_certificate.lat;
				this.lon = dataObj.birth_certificate.lon;

				var images = null;
				try{
					images = dataObj.media.images;
					var imageCount = 0;
					for(var imageId in images){
						this[getImageHeaderName(imageCount)] = images[imageId].thumb;
						this[getImageHeaderName(imageCount) + 'original'] = images[imageId].original;
						imageCount ++;
					}
					maxImageCount = maxImageCount < imageCount ? imageCount : maxImageCount;
				} catch (e){}

				for(var id in dataObj.data){
					this[id] = dataObj.data[id];
					headerFieldNames.push(id);
				}
			}
			// Generate the list elements to show
			for(var id in infoData.members){
				var member = infoData.members[id];
				var listElement = new SimpleData(id, member);
				$scope.simpleDataList.push(listElement);
			}

			//Generate the header elements to show
			$scope.getImageOriginalSize = function(field){
				return field + 'original';
			}

			for(var i = 0; i < maxImageCount; i++){
				$scope.columnDefs.push({
					field: getImageHeaderName(i),
					width: 170,
					groupable: false,
					cellTemplate: '<div class=\"ui-grid-cell-contents\"><a ng-href=\"{{COL_FIELD}}\"><img ng-src=\"{{COL_FIELD}}\" lazy-src /></a></div>'
				});
			}

			headerFieldNames = _.uniq(headerFieldNames);
			//console.log(headerFieldNames);
			for (var elt in headerFieldNames){
				var element = headerFieldNames[elt];
				$scope.columnDefs.push({
					field: element,
					width: 100,
				});
			}
		});

		$scope.gridOptions = {
			data: $scope.simpleDataList,
			columnDefs: $scope.columnDefs,
			showGroupPanel: true,
			enableSorting: true,
			enableGridMenu: true,
			enableColumnMoving: true,
			enableColumnResizing: true,
			enablePinning: true,
		};
	}).
	filter('columnFilter', function(){
		return function(elements, allheaderData){
			if (!angular.isUndefined(elements) && !angular.isUndefined(allheaderData) && _.flatten(_.pluck(allheaderData, 'selectedValues')).length > 0){
				var tempElements = [];
				angular.forEach(allheaderData, function(headerData, header){
					angular.forEach(headerData.selectedValues, function(selectedValue){
						angular.forEach(elements, function(element){
							if(angular.equals(element.data[header], selectedValue) && !_.contains(tempElements, element)){
								tempElements.push(element);
							}
						});
					});
				});
				return tempElements;
			} else {
				return elements;
			}
		}
	}).


	filter('range', function() {
		return function(input, total) {
			total = parseInt(total);
			for (var i=0; i<total; i++)
				input.push(i);
			return input;
		};
	});
