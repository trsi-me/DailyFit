
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
// متحكم بيانات المستخدم
appMain.controller('UserDataController', ['$scope', '$localStorage', function ($scope, $localStorage) {
    $scope.userData = {
        name: '',
        email: '',
        weight: 0,
        height: 0,
        age: 0,
        daily_calories: 2000
    };

    // تحميل بيانات المستخدم عند فتح الصفحة
    $scope.$on('$viewContentLoaded', function () {
        loadUserData();
    });

    function loadUserData() {
        var email = storage.getItem('email');
        if (!email) {
            angular.element(document.getElementById('splittermenu')).scope().load('login.html');
            return;
        }

        document.getElementById("ProgressBar").style.visibility = "visible";
        $.ajax({
            url: API_BASE_URL + 'user_data.php?',
            data: {
                action: 'get',
                email: email
            },
            dataType: 'jsonp',
            success: function (response) {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                if (response.status === "true" && response.data) {
                    $scope.userData = response.data;
                    $scope.$apply();
                } else {
                    ons.notification.alert({
                        message: response.message || 'فشل تحميل البيانات'
                    });
                }
            },
            error: function () {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                ons.notification.alert({
                    message: 'خطأ في الاتصال بالخادم'
                });
            }
        });
    }

    $scope.updateUserData = function () {
        var email = storage.getItem('email');
        if (!email) {
            ons.notification.alert({
                message: 'يجب تسجيل الدخول أولاً'
            });
            return;
        }

        document.getElementById("ProgressBar").style.visibility = "visible";
        $.ajax({
            url: API_BASE_URL + 'user_data.php?',
            data: {
                action: 'update',
                email: email,
                weight: $scope.userData.weight,
                height: $scope.userData.height,
                age: $scope.userData.age,
                daily_calories: $scope.userData.daily_calories
            },
            dataType: 'jsonp',
            success: function (response) {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                if (response.status === "true") {
                    ons.notification.alert({
                        message: 'تم حفظ البيانات بنجاح'
                    });
                    if (response.data) {
                        $scope.userData = response.data;
                        $scope.$apply();
                    }
                } else {
                    ons.notification.alert({
                        message: response.message || 'فشل حفظ البيانات'
                    });
                }
            },
            error: function () {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                ons.notification.alert({
                    message: 'خطأ في الاتصال بالخادم'
                });
            }
        });
    };
}]);

// متحكم التمارين اليومية
appMain.controller('ExercisesController', ['$scope', '$localStorage', function ($scope, $localStorage) {
    $scope.exercises = [];
    $scope.currentDayName = '';
    $scope.selectedDay = 0;
    $scope.totalCaloriesBurned = 0;

    // تحميل التمارين عند فتح الصفحة
    $scope.$on('$viewContentLoaded', function () {
        var today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        var dayNumber = today === 0 ? 7 : today; // Convert to 1-7 format
        $scope.loadDayExercises(dayNumber);
    });

    $scope.loadDayExercises = function (dayNumber) {
        var email = storage.getItem('email');
        if (!email) {
            angular.element(document.getElementById('splittermenu')).scope().load('login.html');
            return;
        }

        $scope.selectedDay = dayNumber;
        $scope.exercises = [];
        $scope.totalCaloriesBurned = 0;

        var days = ['', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        $scope.currentDayName = days[dayNumber];

        document.getElementById("ProgressBar").style.visibility = "visible";
        $.ajax({
            url: API_BASE_URL + 'exercises.php?',
            data: {
                action: 'get_daily',
                email: email,
                day_number: dayNumber
            },
            dataType: 'jsonp',
            success: function (response) {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                if (response.status === "true" && response.data) {
                    $scope.exercises = response.data.exercises || [];
                    $scope.currentDayName = response.data.day_name;

                    // حساب إجمالي السعرات المحروقة
                    $scope.totalCaloriesBurned = 0;
                    $scope.exercises.forEach(function (ex) {
                        if (ex.completed) {
                            $scope.totalCaloriesBurned += ex.calories_per_minute * ex.duration_minutes;
                        }
                    });

                    $scope.$apply();
                } else {
                    ons.notification.alert({
                        message: response.message || 'فشل تحميل التمارين'
                    });
                }
            },
            error: function () {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                ons.notification.alert({
                    message: 'خطأ في الاتصال بالخادم'
                });
            }
        });
    };

    $scope.completeExercise = function (exercise) {
        var email = storage.getItem('email');
        if (!email) {
            ons.notification.alert({
                message: 'يجب تسجيل الدخول أولاً'
            });
            return;
        }

        if (!exercise.exercise_id) {
            ons.notification.alert({
                message: 'خطأ في بيانات التمرين'
            });
            return;
        }

        document.getElementById("ProgressBar").style.visibility = "visible";
        $.ajax({
            url: API_BASE_URL + 'exercises.php?',
            data: {
                action: 'complete',
                email: email,
                exercise_id: exercise.exercise_id,
                day_number: exercise.day_number
            },
            dataType: 'jsonp',
            success: function (response) {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                if (response.status === "true") {
                    exercise.completed = true;
                    exercise.completed_at = new Date();
                    $scope.totalCaloriesBurned += exercise.calories_per_minute * exercise.duration_minutes;
                    $scope.$apply();

                    ons.notification.alert({
                        message: 'تم إكمال التمرين بنجاح!'
                    });
                } else {
                    ons.notification.alert({
                        message: response.message || 'فشل تحديث التمرين'
                    });
                }
            },
            error: function () {
                document.getElementById("ProgressBar").style.visibility = "hidden";
                ons.notification.alert({
                    message: 'خطأ في الاتصال بالخادم'
                });
            }
        });
    };
}]);

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
    // تهيئة splitter بعد تحميل الصفحة
    $scope.$on('$viewContentLoaded', function () {
        if (typeof splitter !== 'undefined') {
            $scope.splitter = splitter;
        }
    });

    $scope.$on('LoadPage', function (event, args) {
        $scope.load(args);
    });

    $scope.$on('LoadPageChild', function (event, args) {
        $scope.loadChild(args);
    });

    $scope.loadChild = function (page) {
        if ($scope.splitter && $scope.splitter.content) {
            $scope.splitter.content.load(page);
        }
    };




    $scope.load = function (page) {
        // الحصول على splitter من DOM إذا لم يكن معرفاً
        if (!$scope.splitter) {
            var splitterElement = document.getElementById('mySplitter');
            if (splitterElement && splitterElement.splitter) {
                $scope.splitter = splitterElement.splitter;
            } else if (typeof splitter !== 'undefined') {
                $scope.splitter = splitter;
            }
        }

        if ($scope.splitter && $scope.splitter.content) {
            $scope.splitter.content.load(page);
        }

        if (page === 'home.html') {
            $scope.$emit("CallChart", {});
        }

        if (page === 'configurationpage.html') {
            angular.element(document).ready(function () {
                if (typeof schoolconfiguration === 'function') {
                    schoolconfiguration();
                }
            });
        }

        if (page === 'login.html') {
            angular.element(document).ready(function () {
                if (typeof logout === 'function') {
                    logout();
                }
            });
        }

        if ($scope.splitter && $scope.splitter.left) {
            $scope.splitter.left.close();
        }
    };

    $scope.toggle = function () {
        if (!$scope.splitter) {
            var splitterElement = document.getElementById('mySplitter');
            if (splitterElement && splitterElement.splitter) {
                $scope.splitter = splitterElement.splitter;
            } else if (typeof splitter !== 'undefined') {
                $scope.splitter = splitter;
            }
        }
        if ($scope.splitter && $scope.splitter.left) {
            $scope.splitter.left.toggle();
        }
    };


    $scope.$storage = $localStorage;

    $scope.init = function () {
        // تهيئة splitter بعد تحميل الصفحة
        setTimeout(function () {
            var splitterElement = document.getElementById('mySplitter');
            if (splitterElement) {
                $scope.splitter = splitterElement.splitter || window.splitter;
                if (!$scope.splitter && typeof splitter !== 'undefined') {
                    $scope.splitter = splitter;
                }
            }
        }, 100);
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
                            for (var i = partialDistance.length - 1; i >= 0; i--) {

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



