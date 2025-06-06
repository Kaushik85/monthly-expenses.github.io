
    var app = angular.module("app", []);

    app.controller("home", function($http,$window) {
            var self = this;
            self.timeString = new Date();

            self.authenticate = function(){

                $http({
                            method : 'POST',
                            url: 'http://localhost:9999/authenticate-me',
                            dataType: "json",
                            data: {
                                username: self.username,
                                password: self.password
                            }
                }).success(function(data) {

                        var token = data[0];
                        if(token=='<'){
                            self.authenticated = false;
                            self.unauthenticated = true;

                            if (data.indexOf("500") >= 0){
                                var win = window.open("","_self");
                                win.document.write(data);
                            }
                        }
                        else{
                            self.authenticated = true;
                            $("#token").val(token);
                            $("#userEmail").val(self.username);
                            $("#token-form").submit();
                        }
                      }).error(function(data) {

                        self.authenticated = false;
                        self.unauthenticated = true;
                      });
            }

  });

  /*app.service("UserService", function() {
        return {
           set: set,
           get: get
        }

        var token = "";

        function get(){      //You can forget about the key if you want
            return token;
        }

        function set(value){
            token = value;
        }

  });*/

 /* app.controller("user", function($http,UserService) {
            alert(UserService.get());
            this.updated = UserService.get();
  });*/

 /* app.config(
    function($routeProvider) {

      .when("/student/info", {
          templateUrl:"/templates/signup.html",
          controller: "user"
      })
      .when("/login", {
            templateUrl:"/templates/login.html",
          controller: "home"
        });

  //    $locationProvider.html5Mode(true); //Remove the '#' from URL.
  });*/