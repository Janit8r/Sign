// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

    .run(function ($ionicPlatform, $ionicPopup, $state) {
//
        //主页面显示退出提示框
        $ionicPlatform.registerBackButtonAction(function (e) {

            e.preventDefault();

            function showConfirm() {
                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>退出应用?</strong>',
                    template: '你确定要退出应用吗?',
                    okText: '退出',
                    cancelText: '取消'
                });

                confirmPopup.then(function (res) {
                    if (res) {

                        ionic.Platform.exitApp();
                    } else {
                        // Don't close
                    }
                });
            };
            showConfirm();
            return false;
        }, 101);



        $ionicPlatform.ready(function () {
            //cordova.plugins.locationManager.enableBluetooth();
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);


            }
            if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "网络无法连接",
                        content: "请确保你能够网络畅通再打开本程序"
                    })
                        .then(function(result) {
                           ble.exit();

                        });
                }
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
            //var setTagsWithAliasCallback=function(event){
                //window.alert('result code:'+event.resultCode+' tags:'+event.tags+' alias:'+event.alias);
            //}\

            //安卓设备下的消息打开
            var openNotificationInAndroidCallback = function (data) {
                if (typeof data === 'string') {
                    var hh = JSON.parse(data);
                    //window.alert(hh.alert);
                    console.log(hh.alert);
                    if(hh.alert == '您的请假审核有结果了'){
                        if (window.localStorage['Name']) {
                            $state.go('leave_tab.myleave');
                        }else {
                            $ionicPopup.alert({
                                template: '请先登录账号！'
                            })
                            $state.go('login');
                        }
                    }else if(hh.alert == '有新的请假申请'){
                        if (window.localStorage['TeacherName']) {
                            $state.go('teacher_leavereview');
                        } else {
                            $ionicPopup.alert({
                                template: '请先登录账号！'
                            })
                            $state.go('login');
                        }
                    }else{
                        if (window.localStorage['Name']) {
                            window.localStorage['dege'] = '1';
                            $state.go('students_tabs.study');
                        } else if (window.localStorage['TeacherName']) {
                            $state.go('teacher_leavereview');
                        } else {
                            $ionicPopup.alert({
                                template: '请先登录账号！'
                            })
                            $state.go('login');
                        }
                    }
                }
            }
            var onOpenNotification = function (event) {
                var alertContent;
                if (device.platform == "Android") {
                    //alertContent = window.plugins.jPushPlugin.openNotification.alert;
                    //console.log(alertContent);

                } else {
                    //window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                    // alertContent = event.aps.alert;
                    //console.log(alertContent)
                    //if(alertContent == '您的请假审核有结果了'){
                    //    if (window.localStorage['Name']) {
                    //        $state.go('students_tabs');
                    //    }else {
                    //        $ionicPopup.alert({
                    //            template: '请先登录账号！'
                    //        })
                    //        $state.go('login');
                    //    }
                    //}else if(alertContent == '有新的请假申请'){
                    //    if (window.localStorage['TeacherName']) {
                    //        $state.go('teacher_leavereview');
                    //    } else {
                    //        $ionicPopup.alert({
                    //            template: '请先登录账号！'
                    //        })
                    //        $state.go('login');
                    //    }
                    //}else{
                    //    if (window.localStorage['Name']) {
                    //        window.localStorage['dege'] = '1';
                    //        $state.go('students_tabs.alerts');
                    //    } else if (window.localStorage['TeacherName']) {
                    //        $state.go('teacher_leavereview');
                    //    } else {
                    //        $ionicPopup.alert({
                    //            template: '请先登录账号！'
                    //        })
                    //        $state.go('login');
                    //    }
                    //}
                }
            }
            var config = {
                stac: onOpenNotification,
                oniac: openNotificationInAndroidCallback
            };
            //jpushService.init(config);
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        if(window.localStorage['Stu_Purview']){
            var Page_address = '/index_tab/study'
        }else if(window.localStorage['tea_Purview']){
            var Page_address = '/teachers_tab/index'
        }else{
            var Page_address = '/login'
        }

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            //登录界面
            .state('login', {
                url: '/login',
                cache: false,
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })

            //忘记密码界面
            .state('forget_password', {
                url: '/forget_password',
                templateUrl: 'templates/forget_password.html',
                controller: 'forget_passwordCtrl'
            })
            //忘记密码、修改密码界面
            .state('change_password', {
                url: '/change_password',
                templateUrl: 'templates/change_password.html',
                controller: 'change_passwordCtrl'
            })
            //注册界面



            //系统版本4.4以下学生TABS
            .state('index_tab',{
                url:'/index_tab',
                abstract: true,
                templateUrl: 'templates/index-tabs.html'
            })
            .state('index_tab.alerts', {
                url: '/alerts',
                cache: false,
                views: {
                    'index_tab-alerts': {
                        templateUrl: 'templates/index-alerts.html',
                        controller: 'AlertsCtrl'
                    }
                }
            }).state('index_tab.study', {
                url: '/study',
                cache: false,
                views: {
                    'index_tab-study': {
                        templateUrl: 'templates/index-study.html',
                        controller: 'StudyCtrl'
                    }
                }
            })
            .state('index_tab.information', {
                url: '/information',
                cache: false,
                views: {
                    'index_tab-information': {
                        templateUrl: 'templates/index-information.html',
                        controller: 'InformationCtrl'
                    }
                }
            })
            .state('leave_tab', {
                url: '/leave_tab',
                abstract: true,
                templateUrl: 'templates/Leave-tabs.html'
            })
            //请假-提交请假页面
            .state('leave_tab.newleave', {
                url: '/newleave',
                views: {
                    'leave_tab-newleave': {
                        templateUrl: 'templates/Leave-newleave.html',
                        controller: 'NewleaveCtrl'
                    }
                }
            })
            //请假-我的请假页面
            .state('leave_tab.myleave', {
                url: '/myleave',
                views: {
                    'leave_tab-myleave': {
                        templateUrl: 'templates/Leave-myleave.html',
                        controller: 'MyleaveCtrl'
                    }
                }
            })
            //学生签到
            .state('index_tab.student_getpoint', {
                url: '/student_getpoint',
                views: {
                    'index_tab-study': {
                    templateUrl: 'templates/student_getpoint.html',
                    controller: 'student_getpointCtrl'
                }
                }
            })
            //班委签到tabs
            .state('Getpoint_tabs', {
                url: '/Getpoint_tabs',
                cache: false,
                abstract: true,
                templateUrl: 'templates/Getpoint-tabs.html'
            })
            //签到-班委个人签到页面
            .state('Getpoint_tabs.getpointstudent', {
                url: '/getpointstudent',
                cache: false,
                views: {
                    'Getpoint_tabs-getpointstudent': {
                        cache: false,
                        templateUrl: 'templates/student_getpoint.html',
                        controller: 'student_getpointCtrl'
                    }
                }
            })
            //签到-班级成员签到页面
            .state('Getpoint_tabs.members', {
                url: '/members',
                cache: false,
                views: {
                    'Getpoint_tabs-members': {
                        cache: false,
                        templateUrl: 'templates/Getpoint-members.html',
                        controller: 'MembersCtrl'
                    }
                }
            })

            //我的课表
            .state('MySchedule', {
                url: '/MySchedule',
                templateUrl: 'templates/MySchedule.html',
                controller: 'MyScheduleCtrl'
            })
            //      我的班级成员信息
            .state('myclass_students', {
                url: '/myclass_students',
                templateUrl: 'templates/myclass_students.html',
                controller: 'myclass_studentsCtrl'
            })
            //      我的班级成员详细信息
            .state('myclass_stu_preson', {
                url: '/myclass_students/:StuId',
                templateUrl: 'templates/myclass_stu_preson.html',
                controller: 'myclass_stu_presonCtrl'
            })
            //我的老师页面
            .state('myteachers', {
                url: '/myteachers',
                templateUrl: 'templates/students-myteacher.html',
                controller: 'MyTeachersCtrl'
            })
            //系统版本4.4以下教师TABS
            .state('teachers_tab',{
                url:'/teachers_tab',
                abstract: true,
                templateUrl: 'templates/teacher_tabs.html'
            })
            .state('teachers_tab.index', {
                url: '/index',
                views: {
                    'teachers_index': {
                        templateUrl: 'templates/teachers-index.html',
                        controller: 'TeachersIndexCtrl'
                    }
                }
            })
            .state('teachers_tab.information', {
                url: '/information',
                views: {
                    'teachers_information': {
                        templateUrl: 'templates/teachers-information.html',
                        controller: 'TeachersInformationCtrl'
                    }
                }
            })

            //系统版本4.4教师TABS
            //.state('teachers_tab', {
            //    url: '/teachers_tab',
            //    cache: false,
            //    views: {
            //        '': {
            //            templateUrl: 'templates/teachers-tabs.html',
            //            controller: 'TeachersTabsCtrl'
            //        },
            //        'index@teachers_tab': {
            //            templateUrl: 'templates/teachers-index.html',
            //            controller: 'TeachersIndexCtrl',
            //            cache: false
            //        },
            //        'information@teachers_tab': {
            //            templateUrl: 'templates/teachers-information.html',
            //            controller: 'TeachersInformationCtrl',
            //            cache: false
            //        }
            //
            //    }
            //})
            //教师-信息发送页面
            .state('teacher_send', {
                url: '/teacher_send',
                templateUrl: 'templates/teacher-send.html',
                controller: 'TeacherSendCtrl'
            })

            //教师-调课tabs页面
            .state('teachaer_CourseAdjust_tab', {
                url: '/teachaer_CourseAdjust_tab',
                abstract: true,
                templateUrl: 'templates/teachaer-CourseAdjust-tabs.html'
            })
            //教师-调课申请页面
            .state('teachaer_CourseAdjust_tab.CourseAdjustment', {
                url: '/CourseAdjustment',
                views: {
                    'teachaer_CourseAdjust_tab-CourseAdjustment': {
                        templateUrl: 'templates/teacher-CourseAdjustment.html',
                        controller: 'CourseAdjustmentCtrl'
                    }
                }
            })
            //教师-申请情况页面
            .state('teachaer_CourseAdjust_tab.information', {
                url: '/CourseAdjustSituation',
                views: {
                    'teachaer_CourseAdjust_tab-CourseAdjustSituation': {
                        templateUrl: 'templates/teacher-CourseAdjustSituation.html',
                        controller: 'CourseAdjustSituationCtrl'
                    }
                }
            })
            //老师班级页面的学院列表
            .state('teacher_college',{
                url:'/teacher_college',
                templateUrl:'templates/teacher_class_college.html',
                controller:'teacher_collegeCtrl'
            })
            //老师班级页面的专业列表
            .state('teacher_profession',{
                url:'/teacher_college/:ColId',
                templateUrl:'templates/teacher_class_profession.html',
                controller:'teacher_professionCtrl'
            })
            //    老师页面的班级列表
            .state('teacher_class', {
                url: '/teacher_college/:ColId/:ProId',
                templateUrl: 'templates/teacher_class.html',
                controller: 'teacher_classCtrl'
            })
            //      老师页面的班级成员
            .state('teacher_students', {
                url: '/teacher_college/:ColId/:ProId/:ClaId',
                templateUrl: 'templates/teacher_students.html',
                controller: 'teacher_studentsCtrl'
            })
            //      老师页面的班级成员详情
            .state('teacher_stu_preson', {
                url: '/teacher_college/:ColId/:ProId/:ClaId/:StuId',
                templateUrl: 'templates/teacher_stu_preson.html',
                controller: 'teacher_stu_presonCtrl'
            })
            //老师审核请假页面
            .state('teacher_leavereview', {
                url: '/teacher_leavereview',
                templateUrl: 'templates/teacher-leavereview.html',
                controller: 'LeaveReviewCtrl'
            })
            //审核详情
            .state('teacher_leavereview_details', {
                url: '/teacher_leavereview/:LeaveId',
                templateUrl: 'templates/teacher-leavereview-details.html',
                controller: 'LeaveReviewDetailsCtrl'
            })
            //领导审核调课页面
            .state('teacher_Adjustreview', {
                url: '/teacher_Adjustreview',
                templateUrl: 'templates/teachaer-Adjustreview.html',
                controller: 'AdjustReviewCtrl'
            })
            //调课审核详情
            .state('teacher_Adjustreview_details', {
                url: '/teacher_Adjustreview/:AdjustId',
                templateUrl: 'templates/teachaer-Adjustreview-details.html',
                controller: 'AdjustReviewDetailsCtrl'
            })


            //教师权限在辅导员以上时候的考勤页面
            //考勤页面-学院列表
            .state('teacher_attendance_college',{
                url:'/teacher_attendance_college',
                templateUrl:'templates/teacher-attendance-college.html',
                controller:'AttCollegeCtrl'
            })
            //考勤页面-专业列表
            .state('teacher_attendance_profession',{
                url:'/teacher_attendance_college/:ColId',
                templateUrl:'templates/teacher-attendance-profession.html',
                controller:'AttProfessionCtrl'
            })
            //考勤页面-班级列表
            .state('teacher_attendance_class',{
                url:'/teacher_attendance_college/:ColId/:ProId',
                templateUrl:'templates/teacher-attendance-class.html',
                controller:'AttClassCtrl'
            })
            //考勤页面-班级考勤情况
            .state('teacher_attendance_personal',{
                url:'/teacher_attendance_college/:ColId/:ProId/:ClaId',
                templateUrl:'templates/teacher-attendance-personal.html',
                controller:'AttPersonalCtrl'
            })
            //考勤页面-班级成员个人旷课详情
            .state('teacher_attendance_personal_details',{
                url: '/teacher_attendance_college/:ColId/:ProId/:ClaId/:PreId',
                templateUrl: 'templates/teacher-attendance-personal-details.html',
                controller: 'AttDetailsCtrl'
            })



            //教师权限为3时的考勤页面
            //考勤情况
            .state('teacher_attendance',{
                url:'/teacher_attendance',
                templateUrl:'templates/teacher-attendance.html',
                controller:'AttendanceCtrl'
            })
            //考勤旷课详情
            .state('teacher_attendance_details',{
                url: '/teacher_attendance/:AttId',
                templateUrl: 'templates/teacher-attendance-details.html',
                controller: 'AttendanceDetailsCtrl'
            })

            .state('face',{
                url: '/face',
                templateUrl: 'templates/face.html',
                controller: 'FaceCtrl'
            })




        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(Page_address);
        //$urlRouterProvider.otherwise('face');
        //$urlRouterProvider.otherwise('/voice_verify');
        $ionicConfigProvider.backButton.text('返回').icon('ion-chevron-left');
        $ionicConfigProvider.navBar.alignTitle("center"); //Places them at the bottom for all OS
        $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
        $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
        $ionicConfigProvider.views.swipeBackEnabled(false); //禁用滑动返回
        var configProperties = {
            views: {
                maxCache: 10,
                forwardCache: true,
                transition: 'ios'
            }, //界面切换效果
            navBar: {
                alignTitle: 'center',
                positionPrimaryButtons: 'ios',
                positionSecondaryButtons: 'ios',
                transition: 'ios'
            },//标题效果
            backButton: {
                icon: 'ion-chevron-left',
                text: '返回',
                previousTitleText: true
            },//返回按钮效果
            form: {
                checkbox: 'ios'
            },//表单效果
            //tabs: {
            //    style: 'standard',
            //    position: 'bottom'
            //},//tabs的位置
            templates: {
                maxPrefetch: 10
            }
        };//只针对IOS
        $ionicConfigProvider.setPlatformConfig('android', configProperties);
    })

