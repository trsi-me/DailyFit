// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.

(function () {
    "use strict";
    var map;
    var db = null;

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    var storage = window.localStorage;
    /*
    document.addEventListener('init', function (event) {
        if (event.target.matches('#InitialPage')) {
            ons.notification.alert('Page 1 is initiated.');
            // Set up content...
        }
    }, false);
    */











    //Login Page
    window.checkLogin = function (page) {


        var content = document.getElementById('myNavigator');
        var email = document.getElementById('login-email').value;
        var password = document.getElementById('login-password').value;




        if (email === '' || password === '') {
            ons.notification.alert({
                message: 'The email and/or password is empty'
            });
        }
        else if (!isValidEmailAddress(email)) {
            ons.notification.alert({
                message: 'Please enter a valid email address'
            });
        }

        else {
            document.getElementById("ProgressBar").style.visibility = "visible";
            $.ajax({
                url: API_BASE_URL + 'login.php?',
                data: { username: email, password: password },
                dataType: 'jsonp',
                success: function (data) {
                    $('#ProgressBar').hide;
                    if (data.status === "true") {
                        document.getElementById("ProgressBar").style.visibility = "hidden";
                        ons.notification.alert({
                            message: 'تم تسجيل الدخول بنجاح'
                        });

                        storage.setItem("loggedin", "true");
                        storage.setItem("email", email);
                        storage.setItem("session", data.data ? data.data.session : '');
                        angular.element(document.getElementById('splittermenu')).scope().load('user_data.html');
                    }
                    else {
                        document.getElementById("ProgressBar").style.visibility = "hidden";
                        ons.notification.alert({
                            message: data.message || 'فشل تسجيل الدخول'
                        });
                    }
                },
                error: function (textStatus) {
                    document.getElementById("ProgressBar").style.visibility = "hidden";
                    ons.notification.alert({
                        message: 'فشل تسجيل الدخول. يرجى التحقق من الاتصال بالإنترنت.'
                    });
                }
            });


        }


        function jsonpCallback(data) {
            alert("I am in callback");
        }




    };















    //sign up page -- save signup data to mysql

    window.signup = function () {
        var content = document.getElementById('myNavigator');
        var email = document.getElementById('signup-email').value;
        var password = document.getElementById('signup-password').value;
        var phone = document.getElementById('signup-phone').value;
        var name = document.getElementById('signup-name').value;




        if (email === '' || password === '' || name === '') {
            ons.notification.alert({
                message: 'The email and/or password and/or password is empty'
            });
        }
        else if (!isValidEmailAddress(email)) {
            ons.notification.alert({
                message: 'Please enter a valid email address'
            });
        }

        else {
            document.getElementById("ProgressBar").style.visibility = "visible";
            $.ajax({
                url: API_BASE_URL + 'signup.php?',
                data: { name: name, email: email, phone: phone, password: password },
                dataType: 'jsonp',
                success: function (status) {
                    if (status.status === "true") {
                        ons.notification.alert({
                            message: 'تم التسجيل بنجاح'
                        });

                        document.getElementById("ProgressBar").style.visibility = "hidden";
                        angular.element(document.getElementById('splittermenu')).scope().load('login.html');
                    }
                    else {
                        document.getElementById("ProgressBar").style.visibility = "hidden";
                        ons.notification.alert({
                            message: status.message || 'البريد الإلكتروني مستخدم بالفعل'
                        });
                    }
                },
                error: function (textStatus, errorThrown) {
                    document.getElementById("ProgressBar").style.visibility = "hidden";
                    ons.notification.alert({
                        message: 'يرجى المحاولة مرة أخرى. تعذر الوصول إلى الخادم'
                    });
                }
            });
        }


    };






    //validate email address function

    window.isValidEmailAddress = function (emailAddress) {
        var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        return pattern.test(emailAddress);
    };


    window.logout = function () {

        storage.setItem("loggedin", "false");


    };


    //Add Data to mysql database
    window.addDatatoMysql = function (actionType, action, data, CLASS) {

        document.getElementById("ProgressBar").style.visibility = "visible";
        $.ajax({

            url: 'https://www.ragamy.com/sample/data.php?',
            data: { actionType: actionType, action: action, data: data, email: storage.getItem('email'), session: storage.getItem('session') },
            dataType: 'jsonp',
            success: function (data) {
                $('#ProgressBar').hide;
                if (data.status === "true") {
                    document.getElementById("ProgressBar").style.visibility = "hidden";
                    //        ons.notification.alert({
                    //            message: 'Operation successfull'
                    //           });


                    switch (actionType) {
                        case 'add':
                            angular.element(document.getElementById(CLASS)).scope().addItem_results(data.array);
                            break;
                        case 'fill':
                            angular.element(document.getElementById(CLASS)).scope().filldata(data.array);
                            break;
                        case 'delete':
                            angular.element(document.getElementById(CLASS)).scope().deleteItem_result(data.array);
                            break;

                        case 'update':
                            angular.element(document.getElementById(CLASS)).scope().editItem_result(data.array);
                            break;
                        case 'update_inout':
                            angular.element(document.getElementById(CLASS)).scope().update_inout(data.array);
                            break;
                    }

                    //    changepage('home.html');

                }
                else {
                    document.getElementById("ProgressBar").style.visibility = "hidden";
                    ons.notification.alert({
                        message: 'Operation Failed'



                    });
                }
            },
            error: function (textStatus) {

                document.getElementById("ProgressBar").style.visibility = "hidden";
                ons.notification.alert({
                    message: 'Operation Failed. Please check your internet connection.'

                });


            }



        });


    };





    ons.ready(function () {


        var content = document.getElementById('myNavigator');
        if (storage.getItem("loggedin") === "true" && storage.getItem("email") !== '' && storage.getItem("session") !== '') {
            angular.element(document.getElementById('splittermenu')).scope().load('user_data.html');
        }


    });




    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);


        //   db = window.sqlitePlugin.openDatabase({ name: 'demo.db', location: 'default' });

        //   nfc.addNdefListener(nfcHandler, success, failure);








        /*
      
              window.onload = function () {
      
                  document.addEventListener('init', function (event) {
                      var page = event.target;
      
                      if (page.id === 'LoginPage') {
      
                          document.getElementById("loginButton").onclick = function () {
                          //    content.popPage();
                              document.querySelector('#myNavigator').pushPage('login.html');
      
                          };
                      } else if (page.id === 'SignupPage') {
                          content.popPage();
                          document.querySelector('#myNavigator').pushPage('login.html');
                      }
                  });
      
      
      
      
      
              };
           */
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.

        if (storage.getItem("loggedin") === "")
            mySplitter.setActive(flase);



        //********************************************* Map



    }



    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();

