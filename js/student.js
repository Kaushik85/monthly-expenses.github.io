    var app = angular.module("student", []);

    app.controller("studentController", function($http,$window,$timeout) {
        var self = this;
        self.updateDetails = false;
        self.courseDetails = true;
        self.displayCalendar = false;
        self.messageDetails = false;
        self.displayFeedback = false;
        self.feedbackSuccess=false;

        self.downloadMe = function(file){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'GET',
                url: 'http://localhost:9999/courses/' + self.clickedCourse + '/' + file,
                responseType:'arraybuffer',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                var blob = new Blob([data], {type: 'application/pdf'});
                var link=document.createElement('a');
                link.href=$window.URL.createObjectURL(blob);
                link.download=file + ".pdf";
                link.click();

            }).error(function() {
                alert("download Failed");
            });
        }

        self.initialize = function(courseName){
            self.setNumUnreadMessage();
            self.showFilesForCourse(courseName);
        }

        self.setNumUnreadMessage = function(){
            var authorizationToken = document.getElementById("token").innerHTML;
            var idCommon = document.getElementById("idCommon").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/messages/unread/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                self.numUnreadMessages = data;
            }).error(function() {
                alert("Failed in setNumUnreadMessage");
            });
        }

        self.showFilesForCourse = function(courseName){

            self.clickedCourse = courseName;
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/courses/'+courseName,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                self.allFiles = data;

            }).error(function() {
                alert("Failed in showFilesForCourse");
            });

            self.setStudentPhoto();
        }

        self.setStudentPhoto = function(){

            var authorizationToken = document.getElementById("token").innerHTML;
            var idCommon = document.getElementById("idCommon").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/images/' + idCommon,
                responseType:'arraybuffer',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                var blob = new Blob([data], {type: 'image/jpeg'});
                self.studentImage = $window.URL.createObjectURL(blob);

            }).error(function() {
                alert("image download Failed");
            });
        }


        self.showUpdateForm = function(idCommon){
            self.updateDetails = true;
            self.courseDetails = false;
            self.displayCalendar = false;
            self.messageDetails = false;
            self.displayFeedback = false;
            self.feedbackSuccess=false;

            self.operationSuccessUpdate=false;
            self.profileSelected = true;
            self.passwordSelected = false;
            self.currentSetting = 'Profile';

            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/by-ts/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {

                self.updateDetails = true;

                self.idStudent = data.id;
                self.firstName = data.name;
                self.email = data.email;
                self.phone = data.phoneNumber;
                self.stream = data.stream;
                self.semester = data.semester;
                self.address = data.address;
                self.parentName = data.parentName;
                self.instituteName = data.instituteName;
                self.bloodGroup = data.bloodGroup;
                self.feePaid = data.feePaid;
                self.idCommon = data.idCommon;
                self.batch = data.batch;
                document.getElementById("institute").value = data.instituteName;

            }).error(function() {
                alert("failed in showUpdateForm");
            });
        }

        self.updateStudent = function(){

            self.operationSuccessUpdate=false;
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'POST',
                url: 'http://localhost:9999/students/update-by-student',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                dataType: "json",
                data: {
                id: self.idStudent,
                name: self.firstName,
                email: self.email,
                phoneNumber: self.phone,
                stream: self.stream,
                semester: self.semester,
                address: self.address,
                parentName: self.parentName,
                feePaid: self.feePaid,
                instituteName: document.getElementById("institute").value,
                bloodGroup:self.bloodGroup,
                courseId:"1",
                batch: self.batch,
                idCommon:self.idCommon

            }
            }).success(function(data) {
                self.operationSuccessUpdate=true;
                document.getElementById("initialUserName").innerHTML = self.firstName;
                document.getElementById("initialPhoneNumber").innerHTML = self.phone;
                document.getElementById("initialStream").innerHTML = self.stream;
                document.getElementById("initialSemester").innerHTML = self.semester;
                document.getElementById("initialInstitute").innerHTML = document.getElementById("institute").value;

            }).error(function() {
                alert("failed in updateStudent");
            });
        }

        self.homeClicked = function(){
            self.setNumUnreadMessage();
            self.updateDetails = false;
            self.courseDetails = true;
            self.displayCalendar = false;
            self.messageDetails = false;
            self.displayFeedback = false;
            self.feedbackSuccess=false;

            self.gotoElement('header');

        }

        self.showCourses = function(){
            self.setNumUnreadMessage();
            self.updateDetails = false;
            self.courseDetails = true;
            self.displayCalendar = false;
            self.messageDetails = false;
            self.displayFeedback = false;
            self.feedbackSuccess=false;
        }

        self.showMessages = function(){
            self.updateDetails = false;
            self.courseDetails = false;
            self.displayCalendar = false;
            self.displayFeedback = false;
            self.feedbackSuccess=false;
            self.messageDetails = true;

            var authorizationToken = document.getElementById("token").innerHTML;
            var idCommon = document.getElementById("idCommon").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/messages/' + idCommon,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                self.allMessages = data;
            }).error(function() {
                alert("failed in showMessages");
            });
        }

        self.formatDate = function(currentDate){
            return dateFormat(currentDate, "dd/mm/yyyy h:MM TT");
        }

        self.deleteMessage = function(messageId){
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/message/delete/' + messageId,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                $timeout(function() { self.showMessages();}, 1000);
            }).error(function() {
                alert("failed in deleteMessage");
            });
        }

        self.markMessageAsRead = function(message){
            var authorizationToken = document.getElementById("token").innerHTML;
            message.markedAsRead = true;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/message/read/' + message.id,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
            }).error(function() {
                alert("failed in markMessageAsRead");
            });
        }

        self.gotoElement = function(element){
            if ($("#btnCollapse").css('display')!='none'){
                $("#btnCollapse").click();
            }
            document.getElementById(element).scrollIntoView();
        }

        self.profileClicked = function(){
            self.currentSetting = 'Profile';
            self.profileSelected = true;
            self.passwordSelected = false;

            self.oldPasswordMismatch = false;
            self.newPasswordMismatch = false;
        }

        self.passwordClicked = function(){
            self.currentSetting = 'Password';
            self.profileSelected = false;
            self.passwordSelected = true;

            self.oldPasswordMismatch = false;
            self.newPasswordMismatch = false;

        }

        self.changePassword = function(){
            self.oldPasswordMismatch = false;
            self.newPasswordMismatch = false;
            var idCommon = document.getElementById("idCommon").innerHTML;

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'GET',
                url: 'http://localhost:9999/uaa/user/by-id/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(account) {

                if(account.password != self.oldPassword){
                self.oldPasswordMismatch = true;
                }
                else if(self.newPassword != self.confirmPassword){
                self.newPasswordMismatch = true;
                }
                else{
                self.updateUserPassword(self.newPassword,account);
                }

            }).error(function() {
                alert("failed in changePassword");
            });
        }

        self.updateUserPassword = function(newPassword,account){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'POST',
                url: 'http://localhost:9999/account/change-password',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                dataType: "json",
                data: {
                    id: account.id,
                    email: account.email,
                    password: newPassword,
                    userName: account.userName,
                    userRoles: account.userRoles,
                    isActive: account.isActive,
                    idCommon: account.idCommon,

                }
            }).success(function(data) {
                self.operationSuccessUpdate=true;

            }).error(function() {
                alert("failed in updateUserPassword");
            });
        }

        self.showCalendar = function(){
            self.displayCalendar = true;
            self.updateDetails = false;
            self.courseDetails = false;
            self.messageDetails = false;
            self.displayFeedback = false;
            self.feedbackSuccess=false;

            var ApiKey;
            var calendarId;

            var batch = document.getElementById("batch").innerHTML;

            if(batch.startsWith('A-1')){
                ApiKey = 'AIzaSyD9h3dnnLDJLdJCJuRoIhpPUa2ytghREI4';
                calendarId = 'a1430pm@gmail.com';
            }
            else if(batch.startsWith('A-2')){
                ApiKey = 'AIzaSyCtYGi3_DURmgXfTVw-_vogmHliogKswmU';
                calendarId = 'a2600pm@gmail.com';
            }
            else if(batch.startsWith('B-1')){
                ApiKey = 'AIzaSyC8lU_MxG8uho33eCyVHg9AVbyTGiHs52Y';
                calendarId = 'b1430pm@gmail.com';
            }
            else if(batch.startsWith('B-2')){
                ApiKey = 'AIzaSyA6sAuTC16kDXCcLrcuCr0dBi-PeNHMtk0';
                calendarId = 'b2600pm@gmail.com';
            }

            $timeout(function() { self.renderCalendar(ApiKey,calendarId);}, 1);


        }

        self.renderCalendar = function(ApiKey,calendarId){
            $('#myCalendar').fullCalendar({
                googleCalendarApiKey:ApiKey,
                events:{
                    googleCalendarId:calendarId,
                    backgroundColor:'orange',
                    borderColor:'orange'
                },

                eventRender: function( event, element, view ) {
                     if (event.description == "holiday") {
                         //apply your logic here, make changes to element.
                         element.css('background', 'red');
                         element.css('border', 'red');
                     }

                }

             });
        }

        self.showFeedback = function(){
            self.displayFeedback = true;
            self.displayCalendar = false;
            self.updateDetails = false;
            self.courseDetails = false;
            self.messageDetails = false;
            self.feedbackSuccess=false;
        }

        self.sendFeedbackMessage = function(){
            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'POST',
                url: 'http://localhost:9999/students/feedback',
                headers: {'Authorization': 'bearer ' + authorizationToken},
                dataType: "json",
                data: {
                    id: '0',
                    idCommon: document.getElementById("idCommon").innerHTML,
                    date: new Date(),
                    studentName: document.getElementById("initialUserName").innerHTML,
                    batch: document.getElementById("batch").innerHTML,
                    feedbackMessage: self.feedbackMessage
                }
            }).success(function(data) {
                self.feedbackSuccess=true;
                self.feedbackMessage = '';

            }).error(function() {
                alert("failed in sendFeedbackMessage");
            });
        }

    });