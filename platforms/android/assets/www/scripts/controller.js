
var storage = window.localStorage;
var Class_ID;
var Class_Name;




var appMain = angular.module('appMaps', ['chart.js', 'onsen', 'uiGmapgoogle-maps', 'ngStorage']);


appMain.factory('myService', function () {
        var savedData = {};

        function set(ClassID) {
            savedData = { ClassID };

        }

        function get() {
            return savedData;

        }

        return {
            set: set,
            get: get
        };

     

    });



appMain.controller('ItemController', function ($scope, myService) {
    $scope.items = [];
    var savedData = {};

    addDatatoMysql("fill", "data", "00", "MainData");

    
    $scope.filldata = function (dataarray) {
        $scope.items = dataarray;
        $scope.$apply();
    };

    $scope.addItem = function () {
        if ($scope.addname !== '' && $scope.addname !== undefined)
            if ($scope.items.indexOf($scope.addname) === -1) {
                addDatatoMysql("add", "data", $scope.addname, 'MainData');
            }
            else
                ons.notification.alert({
                    message: 'The name is exist. Please chose a different name'
                });
        else {
            ons.notification.alert({
                message: 'Please enter a valid name'
            });
        }

    };
    $scope.addItem_results = function (data) {


        $scope.items.push(data);
        $scope.addclasstext = "";
        $scope.$apply();



    };



    $scope.deleteItem = function (id) {
        addDatatoMysql("delete", "Class", id, 'ManageClasses');

    };

    $scope.deleteItem_result = function (data) {
        for (i = 0; i < $scope.items.length; i++) {
            if (data.ID === $scope.items[i].ID + "") {
                $scope.items.splice(i, 1);
                $scope.$apply();
                i = $scope.items.length + 1;

            }
        }


    };

    $scope.editItem = function (id, name) {
        if (name !== '' && $scope.addclasstext !== undefined)
            if ($scope.items.indexOf(name) === -1) {
                addDatatoSchool("update", "Class", id + ":" + name, 'ManageClasses');
            }
            else
                ons.notification.alert({
                    message: 'The class name is exist. Please chose a different name'
                });
        else
            ons.notification.alert({
                message: 'Please enter a valid name'
            });
    };
    $scope.editItem_result = function (data) {
        for (i = 0; i < $scope.items.length; i++) {
            if (data.ID === $scope.items[i].ID + "") {
                $scope.items[i].Name = data.Name;
                $scope.$apply();
                i = $scope.items.length + 1;

            }
        }


    };


    $scope.ClassChild = function (page, ClassID, ClassName, TeacherID) {

        myService.set(ClassID, ClassName, '', '', '', '', TeacherID);
        $scope.$root.$broadcast('LoadPageChild', page);
    };



});
//*****************************************************************************
    appMain.controller('homecontroller', ['$scope', '$localStorage', function ($scope, $localStorage) {

    $scope.items = [];
    var savedData = {};



    $scope.adddata = function () {
        ons.notification.alert({
            message: 'The class name is exist. Please chose a different name'
        });

    }
}]);

//*****************************************************************************


appMain.controller('AppController', ['$scope', '$localStorage', function ($scope, $localStorage) {


    $scope.$on('LoadPage', function (event, args) {
        $scope.load(args);
    });


    $scope.$on('LoadPageChild', function (event, args) {
        $scope.loadChild(args);
    });

    $scope.loadChild = function(page) {
        $scope.splitter.content.load(page);
     
      
           
     
    };




        $scope.load = function(page) {
            $scope.splitter.content.load(page);
            if (page === 'home.html') {
                $scope.$emit("CallChart", {});
            }
            

            if (page === 'configurationpage.html') {
               angular.element(document).ready (function () {
                    schoolconfiguration();

                });
               
            }

            if (page === 'login.html') {
                angular.element(document).ready(function () {
                    logout();

                });

            }



            $scope.splitter.left.close();
     
        };
        $scope.toggle = function() {
            $scope.splitter.left.toggle();
        };


        $scope.$storage = $localStorage;

        $scope.init = function () {
                    
        };
   
    }]);

appMain.controller('MAPX', function ($rootScope, $scope, $log, $timeout) {
    $scope.map = {
        center: {
            latitude: storage.getItem("lat"),
            longitude: storage.getItem("lng")
        },
        showOverlay: true,
        zoom: 2,
        markers: [],
        markersEvents: {
            click: function (map, eventName, events) {
                var event = events[0];
                var x = event.latLng.lat();
                var y = event.latLng.lng();
                $scope.map.center = {
                    latitude: x,
                    longitude: y
                };

                var marker = {
                    id: 1,
                    coords: {
                        latitude: x,
                        longitude: y
                    }
                };

                $scope.map.markers = [];

                $scope.map.markers.push(marker);
                //  $scope.markerId++;
                $scope.$apply();


            }
        }

    };



    var events = {
        places_changed: function (searchBox) {
            var place = searchBox.getPlaces();
            if (!place || place === 'undefined' || place.length === 0) {
                console.log('no place data :(');
                return;
            }

            $scope.map = {
                "center": {
                    "latitude": place[0].geometry.location.lat(),
                    "longitude": place[0].geometry.location.lng()
                },
                "zoom": 18
            };
            var marker = {
                id: 1,
                coords: {
                    latitude: place[0].geometry.location.lat(),
                    longitude: place[0].geometry.location.lng()
                }
            };

            $scope.map.markers = [];

            $scope.map.markers.push(marker);
            //  $scope.markerId++;
            $scope.$apply();

        }
    };



    $scope.searchbox = { template: 'searchbox.tpl.html', events: events };

    $scope.markerId = 1;



    $scope.position = function () {

        var onSuccess = function (position) {
            var x = position.coords.latitude;
            var y = position.coords.longitude;


            $scope.map.center = {
                latitude: x,
                longitude: y
            };

            var marker = {
                id: 1,
                coords: {
                    latitude: x,
                    longitude: y
                }
            };

            $scope.map.markers = [];
            $scope.map.zoom = 10;
            $scope.map.markers.push(marker);
            //  $scope.markerId++;
            $scope.$apply();


            //  currentlocatio(Latitude, Longitude);

        };


        function onError(error) {
            alert('code: ' + error.code + '\n' +
                  'message: ' + error.message + '\n');
        }



        navigator.geolocation.getCurrentPosition
          (onSuccess, onError, { enableHighAccuracy: true });

    };


    $scope.position();
    //Map initialization  

    $scope.selectLocation = function () {
        //store gps data in local storage
        storage.setItem("lat", $scope.map.markers[0].coords.latitude);
        storage.setItem("lng", $scope.map.markers[0].coords.longitude);
        $rootScope.lat = $scope.map.markers[0].coords.latitude;
        $rootScope.lng = $scope.map.markers[0].coords.longitude;
        document.getElementById('splittermenu')._gestureDetector.enabled = true;
        
        $scope.$root.$broadcast('LoadPage', 'map_result.html');
   

    };

    $timeout(function () {

        var myOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        $scope.overlay = new google.maps.OverlayView();
        $scope.overlay.draw = function () { }; // empty function required
        // $scope.overlay.setMap($scope.map);
        $scope.element = document.getElementById('map_canvas');



    }, 100);

    //Delete all Markers
    $scope.deleteAllMarkers = function () {

        if ($scope.map.markers.length === 0) {
            ons.notification.alert({
                message: 'There are no markers to delete!!!'
            });
            return;
        }

        for (var i = 0; i < $scope.map.markers.length; i++) {

            //Remove the marker from Map                  
            $scope.map.markers[i] = null;
        }

        //Remove the marker from array.
        $scope.map.markers.length = 0;
        $scope.markerId = 0;

        ons.notification.alert({
            message: 'All Markers deleted.'
        });
    };

    $scope.rad = function (x) {
        return x * Math.PI / 180;
    };

    //Calculate the distance between the Markers
    $scope.calculateDistance = function () {

        if ($scope.map.markers.length < 2) {
            ons.notification.alert({
                message: 'Insert at least 2 markers!!!'
            });
        }
        else {
            var totalDistance = 0;
            var partialDistance = [];
            partialDistance.length = $scope.map.markers.length - 1;

            for (var i = 0; i < partialDistance.length; i++) {
                var p1 = $scope.map.markers[i];
                var p2 = $scope.map.markers[i + 1];


                var R = 6378137; // Earth’s mean radius in meter
                var dLat = $scope.rad(p2.coords.latitude - p1.coords.latitude);
                var dLong = $scope.rad(p2.coords.longitude - p1.coords.longitude);
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos($scope.rad(p1.coords.latitude)) * Math.cos($scope.rad(p2.coords.latitude)) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                totalDistance += R * c / 1000; //distance in Km
                partialDistance[i] = R * c / 1000;
            }


            ons.notification.confirm({
                message: 'Do you want to see the partial distances?',
                callback: function (idx) {

                    ons.notification.alert({
                        message: "The total distance is " + totalDistance.toFixed(1) + " km"
                    });

                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            for (var i =partialDistance.length - 1; i>= 0; i--) {

                                ons.notification.alert({
                                    message: "The partial distance from point " + (i + 1) + " to point " + (i + 2) + " is " + partialDistance[i].toFixed(1) + " km"
                                });
                            }
                            break;
                    }
                }
            });
        }
    };



});



