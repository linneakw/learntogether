(function () {

	var app = angular.module('AppConstants', []);

	app.constant('UserRoles', {
		"userRoles": {
			"admin": 300,
			"leader": 200,
			"user": 100
		}
	});

})();
(function () {

	var dynamicInjector = angular.module('DynamicStaticFileInjector', []);

})();

(function () {

	var userModelApp = angular.module('LmsUserModel', []);
	userModelApp.service('UserModelManager', ['UserModelService', '$q', '$log', function (userModelService, $q, $log) {

		"use strict";

		/*
		*PRIVATE PROPERTIES
		*/
		var loadingPromise;
		var userModel = {
			//need to set both to false. Temporarily true for testing
			"isLoaded": false,
			"isApproved": false,
			"isAdmin": false,
			"firstName": null,
			"lastName": null,
			"email": null,
			"role": null
		};

		/*
		*PRIVATE METHODS
		*/
		function createMessageObj(cause) {
				return {
					"messageCode": "NOT_AUTHENTICATED",
					"message": "Could not authenticate the user",
					"causeBy": cause,

				};
		}

		function init() {
			if(!loadingPromise) {
					loadingPromise = userModelService.getUserAuthorization().then(function (data) {
						var authUser = data.data.data.user;
						userModel.isLoaded = true;
						userModel.firstName = authUser.firstName;
						userModel.lastName = authUser.lastName;
						userModel.isApproved = authUser.isApproved;
						userModel.isAdmin = authUser.isAdmin;
						userModel.email =authUser.email;
						userModel.role = authUser.role;
						//Perform necessary data and business tuning here
						return userModel;
					}, function (error) {
						$log.error('Could not authenticate the user because :' + JSON.stringify(cause));
						userModel.isLoaded = true;
						userModel.failureCause = createMessageObj(cause);
						return $q.reject(userModel.failureCause);

					});
				}

		}

		// PUBLIC DATA & METHODS

		/**
		* Provides array of all the roles assigned to current authenticated user
		* @returns {Array}
		*/
		userModel.getRoles = function () {
			if (userModel.isAuthenticated) {
					return userModel.role;
				}
		};

		/**
			*  Checks if current authenticated user has a role
			* @param {string} role - role to be checked
			* @returns {boolean|undefined}
		*/
		userModel.hasRole = function (role) {
			if (angular.isArray(userModel.role)) {
				if (_.indexOf(userModel.role, role) >= 0) {
					return true;
				}
			}
			else if(angular.equals(userModel.role, role)) {
				return true;
			}
			return false;
		};


		/**
			*  Checks if current authenticated user has a role
			* @param {string} role - role to be checked
			* @returns {boolean|undefined}
		*/
		userModel.hasAuthorization = function (role) {
			var isAuthorized = false;

			if (angular.isArray(userModel.role)) {
				userModel.role.forEach(function (userRole) {
					if(userRole >= role) {
						isAuthorized = true;
					}
				});
			}
			else if(userModel.role >= role) {
				isAuthorized = true;
			}
			return isAuthorized;
		}


		/**
			* Checks if current authenticated user is a superuser
			* @returns {boolean|undefined}
		*/

		userModel.isUserSuperUser = function () {
			return userModel.hasRole(300);
		};

		/**
			* Checks if UserModel has been initialized - maintains singleton status
			* @returns {promise}
		*/

		userModel.whenInitialized = function () {
			return loadingPromise;
		}

		init();

		return userModel;

	}]);

})();
(function () {

	var userModelApp = angular.module('LmsUserModel');
	userModelApp.service('UserModelService', ['$q', '$http', function ($q, $http) {
		var deferred = $q.defer(), userModelService;
		userModelService = {
			getUserAuthorization : function () {
				var promise = $http.get('/api/v1/auth/current');
				promise.then(function (data) {
					deferred.resolve(data);
				}, function (error) {
					deferred.reject(error);
				});
				return deferred.promise;
			}
		};

		return userModelService;
	}]);

})();
(function () {
	//Directive designed for this dummy object
	// {
	// 		"stepperItem": [
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 1,
	// 	                "stepName": "Title",
	// 	                "stepComplete": true
	// 	            }
	// 	        },
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 2,
	// 	                "stepName": "Description",
	// 	                "stepComplete": true
	// 	            }
	// 	        },
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 3,
	// 	                "stepName": "Methods",
	// 	                "stepComplete": true
	// 	            }
	// 	        },
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 4,
	// 	                "stepName": "Conclusions",
	// 	                "stepComplete": false
	// 	            }
	// 	        },
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 5,
	// 	                "stepName": "Bilbliography",
	// 	                "stepComplete": false
	// 	            }
	// 	        },
	// 	        {
	// 	            "stepDetails": {
	// 	                "stepNo": 6,
	// 	                "stepName": "Other stuff",
	// 	                "stepComplete": false
	// 	            }
	// 	        }
	// 	    ],
	// 	    "currentStep": 3
	// 	};
	var stepsCompletedModule = angular.module("LMSStepsCompleted", []);
	stepsCompletedModule.directive('lmsStepsTracker', [function () {
		return {
			"restrict": 'A',
			"scope": {
				"stepObject": "="
			},
			"templateUrl": "/static/private/apps/common/PartialViews/StepsCompleted.html",
			"link": function ($scope, $element, $attr, ctrl, $transclude) {
				$scope.moveToStep = function (step) {
					if(step.stepDetails.stepComplete) {
						$scope.stepObject.currentStep = step.stepDetails.stepNo;
					}

				};
				$scope.moveNextStep = function () {
					$scope.stepObject.currentStep++;
				};
				$scope.isCurrentStep = function (step) {
					if($scope.stepObject.currentStep === step.stepDetails.stepNo) {
						return true;
					}
					else {
						return false;
					}
				};
				$scope.isCompletedStep = function (step) {
					return step.stepDetails.stepComplete;
				};
			}
		};


	}]);
})();


(function () {

	var userAuthorizationApp = angular.module('LmsAuthorizationModule', []);

	userAuthorizationApp.directive("lmsShowForRole", ['UserModelManager', function (userModel) {

		function requiredRoleAvailable(roles) {
				var roleAvailable = false;
				if (angular.isArray(roles)){
					roleList.forEach(function(role){
						if (userModel.hasAuthorization(role)) {
							roleAvailable = true;
						}
					});
				}
					else if(roles) {
							if(userModel.hasAuthorization(roles)) {
									roleAvailable = true;
							}
					}
				return roleAvailable;
			}

		return {
			"transclude": "true",
			"restrict": 'A',
				"scope": {
						"lmsVisibleToRole": "="
				},
				"link": function ($scope, $element, $attr, ctrl, $transclude) {

					$scope.$watch('lmsVisibleToRole', function(rolesList) {
						userModel.whenInitialized().then(function () {
							if($element) {
									if(requiredRoleAvailable(rolesList)) {
											$element.removeClass('hidden');
											//temporary to be removed
											if(userModel.role === 300) {
												$element.addClass('adminDiv');
											}
											else if(userModel.role === 200) {
												$element.addClass('leaderDiv');
											}
											else {
												$element.addClass('userDiv');
											}
									}
									else {
											$element.addClass('hidden');
									}
							}

						}, function (error) {});


					});

				}

		};

	}]);


})();
(function () {
	'use strict';


	angular.module('HomePage', ['AppConstants'])

		.controller(
			'HomePageController',
			[
				'$scope',
				'HomePageManager',
				function ($scope, HomePageManager) {
					$scope.manager = HomePageManager;
				}
			]
		);


})();
(function () {
	'use strict';


	angular.module('HomePage')

		.factory(
			'HomePageManager',
			[
				'HomePageService',
				function (HomePageService) {

					// private variables

					// public interface
					return {};
				}
			]
		);


})();
(function () {
	'use strict';


	angular.module('HomePage')

		.service(
			'HomePageService',
			[
				'$q',
				'$http',
				function ($q, $http) {

					// private variables

					// public interface
					return {};
				}
			]
		);


})();
(function () {

	var userProfileModule = angular.module('UserProfile', ["AppConstants"]);
	userProfileModule.controller('UserProfileController', ['$scope', 'UserProfileManager', 'UserRoles', function ($scope, userProfileManager,userRoles) {
		$scope.manager = userProfileManager;

		$scope.userRoles = userRoles.userRoles;
		$scope.getUserId = function () {
			$scope.manager.getUserId();
		}

		$scope.trialStepObject = {
			"stepperItem": [
		        {
		            "stepDetails": {
		                "stepNo": 1,
		                "stepName": "Title",
		                "stepComplete": true
		            }
		        },
		        {
		            "stepDetails": {
		                "stepNo": 2,
		                "stepName": "Description",
		                "stepComplete": true
		            }
		        },
		        {
		            "stepDetails": {
		                "stepNo": 3,
		                "stepName": "Methods",
		                "stepComplete": true
		            }
		        },
		        {
		            "stepDetails": {
		                "stepNo": 4,
		                "stepName": "Conclusions",
		                "stepComplete": false
		            }
		        },
		        {
		            "stepDetails": {
		                "stepNo": 5,
		                "stepName": "Bilbliography",
		                "stepComplete": false
		            }
		        },
		        {
		            "stepDetails": {
		                "stepNo": 6,
		                "stepName": "Other stuff",
		                "stepComplete": false
		            }
		        }
		    ],
		    "currentStep": 3
		};



	}]);

})();
(function () {

	var userProfileModule = angular.module('UserProfile');
	userProfileModule.factory('UserProfileManager', ['UserProfileService', function (userProfileService) {

		//Private Variables
		var managerInstance;

		//Manager definition
		managerInstance = {
			//Manager properties accessible using "this"
			userId : null,

			getUserId: function () {
				//promises will not hold "this" property. Copy into variable within function scope
				var manager = this;
				userProfileService.getUserId().then(function (data) {
					manager.userId = data.data.data.user.email;
				}, function (data, status) {
					manager.userId = "Error: " + status
				})
			}
		};
		//Return the entire manager
		return managerInstance;
	}]);

})();
(function () {

	var userProfileModule = angular.module('UserProfile');
	userProfileModule.service('UserProfileService', ['$q', '$http', function ($q, $http) {
		//$q helps resolve promises
		var deferred = $q.defer(), userProfileService;
		userProfileService = {
			getUserId : function () {
				var promise = $http.get("/api/v1/auth/current");
				promise.then(function (data, status) {
					deferred.resolve(data);
				}, function (data) {
					deferred.reject(data.status);
				});
				return deferred.promise;
			}
		};
		return userProfileService;
	}]);

})();


(function () {

	var app = angular.module('LearnTogetherMainApp', [
		'ngRoute',
		'mainRoutes',
		'HomePage',
		'UserProfile',
		'LmsUserModel',
		'LmsAuthorizationModule',
		'LMSStepsCompleted'
	]);

})();
(function () {

	//this is currently the only app route. But in the future there will be many app routes
	// This file will be renamed to ITSMODULENAME_route.js
	angular.module('mainRoutes', [])

		.config([
			'$routeProvider',
			'$locationProvider',
			function ($routeProvider, $locationProvider) {
				$routeProvider

					// homepage
					.when('/', {
						templateUrl: '/static/private/apps/main/views/HomePage.html',
						controller: 'HomePageController'
					})

					// user profile page
					.when('/user-profile', {
						templateUrl: '/static/private/apps/main/views/UserProfile.html',
						controller: 'UserProfileController'
					})

					.otherwise('/');

				$locationProvider.html5Mode(true);

			}
		]);

})();