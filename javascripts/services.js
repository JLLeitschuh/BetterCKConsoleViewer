"use strict";
console.log('loading service');
angular.module('CKConsoleViewerApp.services', []).
	factory('GroupListService', function(ckConsole, CookieManager){
		var serviceCookieName = "CKGroupService"
		var service = {
			groupList: [],
			recorders: []
		};

		var serviceCookieString = CookieManager.getCookie(serviceCookieName);
		console.log("Cookie?");
		console.log(serviceCookieString);
		if(serviceCookieString != ""){
			var newService = JSON.parse(serviceCookieString);
			console.log("New Service");
			console.log(newService);
			for(var g in newService.groupList){
				service.groupList.push(newService.groupList[g]);
			}
			for(var r in newService.recorders){
				service.recorders.push(newService.recorders[r]);
			}
		}

		ckConsole.getGroupList().then(function(groupList){
			function CompressedData (name, birthCert, members, size){
				this.name = name;
				this.requestName = encodeURI(name);
				this.size = size;
				this.birthCert = birthCert;

				//Formats the account email correctly
				//console.log(this.birthCert);
				try{
					this.birthCert.recorder = this.birthCert.recorder.replace(/\(at\)/g, "@").replace(/\(dot\)/g, ".");
					this.recorder = this.birthCert.recorder;
					if($.inArray(this.recorder, service.recorders) == -1){
						service.recorders.push(this.recorder);
					}
				} catch(e){
					this.recorder = "";
				}
				this.members = members;
				this.hasMedia = 'Loading';
				var _this = this;
				var count = 0;
				for(var id in members){
					if(count > 5 || this.hasMedia != 'Loading') break;
					ckConsole.getData(id).then(function(dataSet){
						//This peice of data has images associated with it
						//console.log(dataSet);
						try{
							Object.keys(dataSet.media.images).length;
							_this.hasMedia = 'True';
						} catch (e){
							_this.hasMedia = 'False';
						}
					});
					count ++;
				}
			}

			while(service.groupList.length > 0) {
				service.groupList.pop();
			}
			while(service.recorders.length > 0) {
				service.recorders.pop();
			}

			for(var name in groupList){
				var size;
				try{
					size = Object.keys(groupList[name].members).length;
				} catch (e){
					size = 'Undefined';
					continue;
				}
				service.groupList.push(new CompressedData(name, groupList[name].birth_certificate, groupList[name].members, size));
			}
			console.log(service.groupList);
			var cookieString = JSON.stringify(service);
			CookieManager.setCookie(serviceCookieName, cookieString , 1)

		});
		return service;
	}).

	factory('DataListService', function(){

	}).

	factory("CookieManager", function(){
		return {
			setCookie: function(cname, cvalue, exdays) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays*24*60*60*1000));
				var expires = "expires="+d.toUTCString();
				document.cookie = cname + "=" + cvalue + "; " + expires;
			},
			getCookie: function(cname) {
				var name = cname + "=";
				var ca = document.cookie.split(';');
				for(var i=0; i<ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0)==' ') c = c.substring(1);
					if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
				}
				return "";
			}
		};
	});
