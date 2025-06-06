    var app = angular.module("admin", []);

    app.controller("adminController", function($http,$timeout,$window) {
        var self = this;
        self.allStudents = false;
        self.addStudentForm = true;
        self.messageForm = false;
        self.feedbackDetails = false;
        self.textOfPhoto = "click browse to choose photo..";

        self.initialize = function(){
            self.setNumUnreadFeedback();
        }

        self.createOrUpdate = function(){
            if(self.action=='update')
                return self.updateStudent();

            return self.addStudent();
        }

        self.updateStudent = function(){

            var authorizationToken = document.getElementById("token").innerHTML;
            self.operationSuccessUpdate=false;

            var fd = new FormData();

            var imgBlob = dataURItoBlob(self.studentPhoto);

            if(imgBlob != undefined)
                fd.append('photo', imgBlob);

            var studentObject = self.getStudentObject();

            fd.append('student', JSON.stringify(studentObject));

            $http.post('http://localhost:9999/students/update-by-admin',fd,{
                headers: {'Content-Type': undefined,'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                transformRequest: angular.identity,

            }).success(function(data) {

                self.operationSuccessUpdate=true;
                self.showStudents();
                self.clearData();


            }).error(function() {
                alert("failed in updateStudent");
            });
        }

        self.getStudentObject = function(){
            var object = new Object();

            object.id = self.idStudent;
            object.name = self.firstName;
            object.email = self.email;
            object.phoneNumber = self.phone;
            object.stream = self.stream;
            object.semester = self.semester;
            object.address = self.address;
            object.parentName = self.parentName;
            object.instituteName = document.getElementById("institute").value;
            object.bloodGroup = self.bloodGroup;
            object.courseId = "1";
            object.feePaid = self.feePaid;
            object.batch = document.getElementById("batch").value;
            object.idCommon = self.idCommon;

            return object;
        }


        self.addStudent = function(){

            self.idStudent = 0;
            self.operationSuccess=false;
            //self.allStudents = false;
            self.idCommon = new Date().getTime();
            var authorizationToken = document.getElementById("token").innerHTML;

            var fd = new FormData();

            var imgBlob = dataURItoBlob(self.studentPhoto);

            if(imgBlob != undefined)
                fd.append('photo', imgBlob);

            var studentObject = self.getStudentObject();

            fd.append('student', JSON.stringify(studentObject));

            $http.post('http://localhost:9999/students/create',fd,{
                headers: {'Content-Type': undefined,'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                transformRequest: angular.identity,

            }).success(function(data) {
                self.operationSuccess=true;
                self.textOfPhoto = "click browse to choose photo..";
                self.clearData();
                $timeout(function() { self.sendPassword(self.idCommon);}, 10000);

            }).error(function() {
                alert("failed in addStudent");
            });

        }

        self.sendPassword = function(idCommon){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'GET',
                url: 'http://localhost:9999/uaa/user/by-id/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(account) {
                self.sendEmail(account);

            }).error(function() {
                alert("failed in changePassword");
            });
        }


        self.sendEmail = function(account){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'POST',
                url: 'http://localhost:9999/students/send',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                dataType: "json",
                data: {
                id: account.id,
                email: account.email,
                password: account.password,
                userName: account.userName,
                userRoles: account.userRoles,
                isActive: account.isActive,
                idCommon: account.idCommon,

                }
            }).success(function(data) {

            }).error(function() {
                alert("failed in sendEmail");
            });
        }


        self.registerStudent = function(){
            self.operationSuccess=false;
            self.operationSuccessUpdate=false;
            self.allStudents = false;
            self.addStudentForm = true;
            self.messageForm = false;
            self.feedbackDetails = false;
            self.action = 'create';
            self.textOfPhoto="click browse to choose..";
            self.clearData();
        }


        self.showStudents = function(){
            self.allStudents = true;
            self.addStudentForm = false;
            self.messageForm = false;
            self.feedbackDetails = false;
            self.batchName = "All";
            self.operationSuccess=false;
            self.allSelected = 0;

            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students',
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                self.allBatchStudents = data;
            }).error(function() {
                alert("failed in showStudents");
            });
        }

        self.batchSelected = function(batchName){

            self.batchName = batchName;
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/by-batch/' + batchName,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                self.allBatchStudents = data;
            }).error(function() {
                alert("failed in batchSelected");
            });
        }

        self.getStudentByIdCommon = function(idCommon,action){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/by-ts/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {

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

                if(action == 'update'){
                    self.setStudentPhoto(authorizationToken,idCommon);
                    self.textOfPhoto = data.name;
                    document.getElementById("batch").value = data.batch;
                    document.getElementById("institute").value = data.instituteName;
                }
                else{
                    self.batch = data.batch;
                    self.deleteStudentInternal();
                }

            }).error(function() {
                alert("failed in studentByIdCommon");
            });

        }


        self.deleteStudent = function(idCommon){
            self.operationSuccessUpdate=false;
            self.getStudentByIdCommon(idCommon,'delete');
        }

        self.editStudent = function(idCommon){
            self.operationSuccess=false;
            self.operationSuccessUpdate=false;
            self.allStudents = false;
            self.addStudentForm = true;
            self.messageForm = false;
            self.feedbackDetails = false;
            self.action = 'create';

            self.getStudentByIdCommon(idCommon,'update');
            self.action = 'update';
        }

        self.deleteStudentInternal = function(){

            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'POST',
                url: 'http://localhost:9999/students/delete',
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
                    instituteName: self.instituteName,
                    bloodGroup:self.bloodGroup,
                    courseId:"1",
                    feePaid:self.feePaid,
                    batch: self.batch,
                    idCommon: self.idCommon

                }

            }).success(function() {
                $timeout(function() { self.showStudents();}, 1000);
                self.clearData();

            }).error(function() {
                alert("failed in deleteStudentInternal");
            });
        }

        self.setStudentPhoto = function(authorizationToken,idCommon){

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/images/' + idCommon,
                responseType:'arraybuffer',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                var blob = new Blob([data], {type: 'image/jpeg'});
                self.studentPhoto = $window.URL.createObjectURL(blob);

            }).error(function() {
                alert("image download Failed");
            });
        }

        self.messageStudent = function(name,idCommon){
            self.allStudents = false;
            self.addStudentForm = false;
            self.messageForm = true;
            self.idCommon = idCommon;
            self.messageSuccess = false;
            self.feedbackDetails = false;
            self.selectBatchToMessage = false;

            self.selectedStudentsString = idCommon;
            self.email= name;

           /* var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/by-ts/' + idCommon,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                self.email = data.email;
            }).error(function() {
                alert("failed in messageStudent");
            });*/

        }

         self.sendMessage = function(){
            var authorizationToken = document.getElementById("token").innerHTML;
            var postUrl = 'http://localhost:9999/students/message/create';

            if(self.selectBatchToMessage){
                postUrl = 'http://localhost:9999/students/batch/message/create';
                self.selectedStudentsString = '';
                if(self.allBatchesSelected){
                    self.selectedStudentsString = 'All';
                }
                else{
                    if(self.A1Selected){
                        self.selectedStudentsString = self.selectedStudentsString==''?'A-1 4:30 PM':self.selectedStudentsString+','+'A-1 4:30 PM';
                    }
                    if(self.A2Selected){
                        self.selectedStudentsString = self.selectedStudentsString==''?'A-2 6:00 PM':self.selectedStudentsString+','+'A-2 6:00 PM';
                    }
                    if(self.B1Selected){
                        self.selectedStudentsString = self.selectedStudentsString==''?'B-1 4:30 PM':self.selectedStudentsString+','+'B-1 4:30 PM';
                    }
                    if(self.B2Selected){
                        self.selectedStudentsString = self.selectedStudentsString==''?'B-2 6:00 PM':self.selectedStudentsString+','+'B-2 6:00 PM';
                    }
                }
            }

            $http({
                method : 'POST',
                url: postUrl,
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                dataType: "json",
                data: {
                    id:'0',
                    idCommon: self.selectedStudentsString,
                    messageDate: new Date(),
                    messageSubject: self.subjectMessage,
                    messageBody: self.bodyMessage
                }
            }).success(function(data) {
                self.messageSuccess = true;
                self.email = '';
                self.subjectMessage = '';
                self.bodyMessage = '';
                self.selectedStudentsString = '';

            }).error(function() {
                alert("failed in sendMessage");
            });
        }

        self.showFeedback = function(batch){
            self.allStudents = false;
            self.addStudentForm = false;
            self.messageForm = false;
            self.messageSuccess = false;
            self.feedbackDetails = true;

            self.batchNameFeedback = batch;

            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/feedback/' + batch,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                self.allFeedback = data;
            }).error(function() {
                alert("failed in showFeedback");
            });
        }

        self.formatDate = function(currentDate){
            return dateFormat(currentDate, "dd/mm/yyyy h:MM TT");
        }

        self.markFeedbackAsRead = function(feedback){
            var authorizationToken = document.getElementById("token").innerHTML;
            feedback.markedAsRead = true;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/feedback/read/' + feedback.id,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                $timeout(function() { self.setNumUnreadFeedback();}, 1000);
            }).error(function() {
                alert("failed in markFeedbackAsRead");
            });
        }

        self.setNumUnreadFeedback = function(){
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/feedback/unread',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken}

            }).success(function(data) {
                self.numUnreadFeedback = data;
            }).error(function() {
                alert("Failed in setNumUnreadFeedback");
            });
        }

        self.deleteFeedback = function(feedbackId){
            var authorizationToken = document.getElementById("token").innerHTML;

            $http({
                method : 'GET',
                url: 'http://localhost:9999/students/feedback/delete/' + feedbackId,
                headers: {'token': authorizationToken,'Authorization':'bearer '+ authorizationToken}

            }).success(function(data) {
                $timeout(function() { self.showFeedback(self.batchNameFeedback);}, 1000);
                $timeout(function() { self.setNumUnreadFeedback();}, 1000);
            }).error(function() {
                alert("failed in deleteFeedback");
            });
        }


        self.getSelected = function () {
            var selectedStudents = [];
            self.allBatchStudents.filter(
                function (value) {
                    if (value.checked == 1) {
                        selectedStudents.push(value.idCommon);
                    }
                }
            );

            self.deleteSelectedStudents(selectedStudents);
        }

        self.displayMessageSelectedStudents = function(){
            self.allStudents = false;
            self.addStudentForm = false;
            self.messageForm = true;
            self.messageSuccess = false;
            self.feedbackDetails = false;
            self.selectBatchToMessage = false;

            self.email = '';
            self.selectedStudentsString = '';

            self.allBatchStudents.filter(
                function (value) {
                    if (value.checked == 1) {
                        self.email = self.email==''?value.name:self.email+';'+value.name;
                        self.selectedStudentsString = self.selectedStudentsString==''?value.idCommon:self.selectedStudentsString+','+value.idCommon;
                    }
                }
            );
        }


        self.deleteSelectedStudents = function(data){
            var authorizationToken = document.getElementById("token").innerHTML;
            $http({
                method : 'POST',
                url: 'http://localhost:9999/students/delete-selected',
                headers: {'token': authorizationToken,'Authorization': 'bearer ' + authorizationToken},
                data: {
                    data
                }
            }).success(function(data) {
                $timeout(function() { self.showStudents();}, 1000);
                self.allSelected = 0;

            }).error(function() {
                alert("failed in deleteSelectedStudents");
            });
        }

        self.selectAllClicked = function(){

             self.allBatchStudents.filter(
                function (value) {
                    value.checked = self.allSelected;
                }
             );
        }

        self.sendBatchMessage = function(){
            self.allStudents = false;
            self.addStudentForm = false;
            self.messageForm = true;
            self.messageSuccess = false;
            self.feedbackDetails = false;
            self.selectBatchToMessage = true;

            self.email = '';
            self.selectedStudentsString = '';

            self.A1Selected = false;
            self.A2Selected = false;
            self.B1Selected = false;
            self.B2Selected = false;
        }

        self.clearData = function(){
            self.idStudent = '';
            self.firstName = '';
            self.email = '';
            self.phone = '';
            self.stream = '';
            self.semester = '';
            self.address = '';
            self.parentName = '';
            self.instituteName = '';
            self.bloodGroup = '';
            self.feePaid = '';
            self.batch = '';
            self.textOfPhoto = "click browse to choose photo..";
            self.studentPhoto = undefined;
        }


        function dataURItoBlob(dataURI) {
            if(dataURI == undefined || dataURI.startsWith("blob:http://"))
                return undefined;
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }

    });


    app.directive("fileread", [
      function() {
        return {
          scope: {
            fileread: "="
          },
          link: function(scope, element, attributes) {
            element.bind("change", function(changeEvent) {
              var reader = new FileReader();
              reader.onload = function(loadEvent) {
                scope.$apply(function() {
                  scope.fileread = loadEvent.target.result;
                });
              }
              reader.readAsDataURL(changeEvent.target.files[0]);
            });
          }
        }
      }
    ]);


