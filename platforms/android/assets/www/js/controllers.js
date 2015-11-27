//window.localStorage['httparr'] = 'http://huyugui.ddns.net:4343';
//var httparr = 'http://huyugui.eicp.net:4343';
var httparr = 'http://113.31.89.205:4343';
var time;
var get_wifitime;
var check_stuwifitime;

angular.module('starter.controllers', ['pickadate', 'ionic-timepicker'])
    //登录页面控制器
    .controller('LoginCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $http, $timeout, $ionicModal, $cordovaDevice) {
        ////
        //
        $scope.accounttext = '请输入账号';
        $scope.type = '选择登陆类型';
        $scope.floatm = '27%';
        $scope.user = {number: window.localStorage['account'], password: window.localStorage['Password']};
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            //选择登陆类型
            $scope.choose = function (choose) {
                $scope.type = choose;
                if ($scope.type == '学生') {
                    $scope.typeion = 'ion-android-contact';
                    $scope.accounttext = '请输入账号';
                    $scope.floatm = '2%'
                } else if ($scope.type == '教师') {
                    $scope.typeion = 'ion-university';
                    $scope.floatm = '2%'
                    $scope.accounttext = '请输入工号';
                }
            }
            $scope.myalert = function () {
                //
                $ionicPopup.show({
                    title: '选择登陆类型',
                    templateUrl: 'templates/usertypealert.html',
                    scope: $scope,
                    //controller: 'MyPopupCtrl',
                    buttons: [
                        {
                            text: '取消',
                            type: 'button-stable',
                            onTap: function (e) {
                                //
                                $scope.type = '选择登陆类型';
                                $scope.typeion = '';
                                $scope.floatm = '27%'
                            }
                        },
                        {
                            text: '确定',
                            type: 'button-light',
                            onTap: function (e) {
                                //
                            }
                        }
                    ]
                })

            };
            //判断登陆
            $scope.login = function () {

                if ($scope.user.number != '' && $scope.user.password != '' && $scope.type != '选择登陆类型') {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    //

                    $http.get(httparr + '/login', {
                        params: {
                            Number: $scope.user.number,
                            Password: $scope.user.password,
                            type: $scope.type
                        }
                    })
                        .success(function (data) {
                            if (data == '请输入正确的信息') {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '请输入正确的学号和密码'
                                })
                            } else if (data == '设备不正确') {
                                //
                                $ionicPopup.alert({
                                    title: '系统提示',
                                    template: '系统检测到您已在别的手机登陆'
                                })
                            }
                            else {
                                if ($scope.type == '学生') {
                                    $scope.show = !$scope.show;
                                    $scope.myclass = 'well';
                                    $timeout(function () {
                                        window.localStorage['Name'] = data.StudentName;
                                        window.localStorage['Number'] = data.Number;
                                        window.localStorage['Stu_Purview'] = data.Purview;
                                        //window.localStorage['stu_IdCode'] = data.IdCode;
                                        window.localStorage['Classes'] = data.Classes;
                                        window.localStorage['Professions'] = data.Professions;
                                        window.localStorage['Colleges'] = data.Colleges;
                                        window.localStorage['account'] = data.Number;
                                        window.localStorage['Password'] = data.Password;
                                        window.localStorage['_id'] = data._id;
                                        var stutags = [];
                                        stutags.push(data.Colleges.toString());
                                        stutags.push(data.Professions.toString());
                                        stutags.push(data.Classes.toString());
                                        var stuAlias = data._id.toString();
                                        //jpushService.setTagsWithAlias(stutags, stuAlias);
                                        window.localStorage['dege'] = '';
                                        //
                                        face.search(window.localStorage['Number'], function (msg) {
                                            if (JSON.parse(msg).result == "fail") {
                                                $ionicPopup.alert({
                                                    title: '抱歉',
                                                    template: '您的脸良辰不认得，请先前往个人中心注册'
                                                }).then(function (res) {
                                                    if (res) {
                                                        $state.go('index_tab.information');
                                                    }

                                                });
                                            }
                                        });
                                        //
                                        $state.go('index_tab.study');
                                    }, 2000);

                                }
                                else if ($scope.type == '教师') {
                                    $scope.show = !$scope.show;
                                    $scope.myclass = 'well';
                                    $timeout(function () {
                                        window.localStorage['Number'] = data.Number;
                                        window.localStorage['tea_Purview'] = data.Purview;
                                        window.localStorage['tea_Phone'] = data.Phone;
                                        window.localStorage['TeacherName'] = data.Name;
                                        window.localStorage['_id'] = data._id;
                                        window.localStorage['account'] = data.Number;
                                        window.localStorage['Password'] = data.Password;
                                        var teatags = [];
                                        teatags.push(data.Classes[0].toString() + '_' + data.Purview.toString());
                                        //jpushService.setTagsWithAlias(teatags, '123');
                                        $state.go('teachers_tab.index');
                                    }, 2000);
                                }
                            }
                        })
                        .error(function () {
                            var timeout = $timeout(function () {
                                $ionicPopup.alert({
                                    title: '抱歉~',
                                    template: '网络不给力...'
                                }).then(function (result) {
                                    if (result == true) {
                                        $timeout.cancel(timeout);
                                    }
                                });
                                $ionicLoading.hide();
                            }, 30000);
                        })
                        .then(function () {
                            $ionicLoading.hide();
                        })
                }
                else {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请完善相关信息'
                    })
                }
            }

            //注册按钮事件
            $scope.register = function () {
                $state.go('register');
            };
            //    跳转到忘记密码页面
            $scope.forget = function () {
                $state.go('forget_password');
            };
        })
    })
    //忘记密码、找回账号密码界面控制器
    .controller('forget_passwordCtrl', function ($scope, $state, $ionicPopup, $http, $ionicLoading, $timeout) {
        $scope.user = {registerPhone: '', Number: '', code: ''};
        //跳转回到主页
        $scope.back = function () {
            $state.go('login');
        };
        $scope.getCode = function () {
            if ($scope.user.registerPhone != '' && $scope.user.Number != '') {
                //判断手机号码的格式
                var ab = /^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/;
                if (ab.test($scope.user.registerPhone) == false) {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '您输入的手机号码格式不符！'
                    })
                }
                //获取验证码
                else {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    $http.get(httparr + '/check_phone_number', {
                        params: {
                            Phone: $scope.user.registerPhone,
                            Number: $scope.user.Number
                        }
                    })
                        .success(function (data) {
                            if (data != null) {
                                $http.get(httparr + '/code', {
                                    params: {
                                        Phone: $scope.user.registerPhone
                                    }
                                })
                                    .success(function (data) {
                                        if (data == 'success') {
                                            // 60秒后重新获取验证码 (原生javascript代码)
                                            var time = 60;
                                            var btn = document.getElementById("code");

                                            function getCodes(obj) {
                                                if (time == 0) {
                                                    obj.removeAttribute("disabled");
                                                    obj.innerHTML = "获取验证码";
                                                    obj.style.backgroundColor = "#3ab2ec";
                                                    time = 60;
                                                } else {
                                                    obj.setAttribute("disabled", true);
                                                    obj.innerHTML = time + "秒后重新获取";
                                                    obj.style.backgroundColor = "#8b8b8b";
                                                    time--;
                                                    setTimeout(function () {
                                                        getCodes(obj)
                                                    }, 1000)
                                                }
                                            }

                                            btn.onclick = function () {
                                                getCodes(this);
                                            };
                                            $ionicPopup.alert({
                                                title: '注意',
                                                template: '验证码已发送到您的手机，请注意查收!'
                                            });
                                            window.localStorage['Phone'] = $scope.user.registerPhone;
                                            window.localStorage['Number'] = $scope.user.Number;
                                        }
                                        if (data == 'error') {
                                            $ionicPopup.alert({
                                                title: '抱歉',
                                                template: '验证码发送失败，请重新获取!'
                                            });
                                        }
                                    })
                            }
                            else {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '请输入正确的相关信息'
                                });
                            }
                        })
                        .error(function () {
                            var timeout = $timeout(function () {
                                $ionicPopup.alert({
                                    title: '抱歉~',
                                    template: '网络不给力...'
                                }).then(function (result) {
                                    if (result == true) {
                                        $timeout.cancel(timeout);
                                    }
                                });
                                $ionicLoading.hide();
                            }, 30000);
                        })
                        .then(function () {
                            $ionicLoading.hide();
                        })
                }
            }
            else {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请完善您的相关信息'
                })
            }
        };

        //跳转更改密码页面
        $scope.sure = function () {
            if ($scope.user.registerPhone != '' && $scope.user.Number != '' && $scope.user.code) {
                $ionicLoading.show({
                    templateUrl: 'templates/loadingPage.html'
                });
                // 验证验证码
                $http.post(httparr + '/codecheck', {
                    Phone: $scope.user.registerPhone,
                    code: $scope.user.code
                })
                    .success(function (data) {
                        if (data == 'success') {
                            $state.go('change_password');
                        }
                        else {
                            $ionicPopup.alert({
                                title: '警告',
                                template: '请输入正确的验证码或者重新获取验证码'
                            })
                        }
                    })
                    .error(function (data) {
                        var timeout = $timeout(function () {
                            $ionicPopup.alert({
                                title: '抱歉~',
                                template: '网络不给力...'
                            }).then(function (result) {
                                if (result == true) {
                                    $timeout.cancel(timeout);
                                }
                            });
                            $ionicLoading.hide();
                        }, 30000);
                    })
                    .then(function (data) {
                        $ionicLoading.hide();
                    })
            }
            else {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请完善您的相关信息'
                });
            }
        };
    })


    //修改密码，保存最终信息控制器
    .controller('change_passwordCtrl', function ($scope, $state, $http, $ionicPopup, $ionicLoading, $timeout) {
        $scope.user = {new_password: '', sure_password: ''};
        $scope.sure = function () {
            if ($scope.user.new_password != '' && $scope.user.sure_password != '') {
                //判断两次密码是否相等
                if ($scope.user.new_password == $scope.user.sure_password) {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    $http.post(httparr + '/save_password', {
                        Phone: window.localStorage['Phone'],
                        Number: window.localStorage['Number'],
                        Password: $scope.user.sure_password
                    })
                        .success(function (data) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: '修改成功，请重新登陆'
                            }).then(function (res) {
                                if (res) {
                                    window.localStorage['Phone'] = '';
                                    window.localStorage['Number'] = '';
                                    //jpushService.setTagsWithAlias('');
                                    $state.go('login');
                                }
                            })
                        })
                        .error(function (data) {
                            var timeout = $timeout(function () {
                                $ionicPopup.alert({
                                    title: '抱歉~',
                                    template: '网络不给力...'
                                }).then(function (result) {
                                    if (result == true) {
                                        $timeout.cancel(timeout);
                                    }
                                });
                                $ionicLoading.hide();
                            }, 30000);
                        })
                        .then(function (data) {
                            $ionicLoading.hide();
                        })
                }
                else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '您两次输入的密码不一致'
                    });
                }
            }
            else {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请完善您的相关信息'
                });
            }
        }
    })
    //注册页面-手机验证页面控制器
    .controller('Register_phoneCtrl', function ($scope, $state, $http, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.user = {registerPhone: '', code: '', ID_card: ''};
            //隐藏账号提示
            $scope.prompt = 'none';

            //判断手机号码的格式，并传递到后台寻找相对应的信息
            var ab = /^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/;
            $scope.$watch('user.registerPhone', function () {
                if (ab.test($scope.user.registerPhone)) {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    $http.get(httparr + '/check_phone', {
                        params: {Phone: $scope.user.registerPhone}
                    })
                        .success(function (data) {
                            if (data != null) {
                                $scope.prompt = '';
                                $scope.getCode = function () {
                                }
                            }
                            else {
                                $scope.prompt = 'none';
                            }
                        })
                        .error(function () {
                            var timeout = $timeout(function () {
                                $ionicPopup.alert({
                                    title: '抱歉~',
                                    template: '网络不给力...'
                                }).then(function (result) {
                                    if (result == true) {
                                        $timeout.cancel(timeout);
                                    }
                                });
                                $ionicLoading.hide();
                            }, 30000);
                        })
                        .then(function () {
                            $ionicLoading.hide();
                        })
                }
            });


            //获取验证码
            $scope.getCode = function () {
                if ($scope.user.registerPhone != '') {
                    //判断手机号码的格式
                    var ab = /^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/;
                    if (ab.test($scope.user.registerPhone) == false) {
                        $ionicPopup.alert({
                            title: '警告',
                            template: '您输入的手机号码格式不符！'
                        })
                    }
                    else {
                        $ionicLoading.show({
                            templateUrl: 'templates/loadingPage.html'
                        });
                        $http.get(httparr + '/code', {
                            params: {Phone: $scope.user.registerPhone}
                        })
                            .success(function (data) {
                                if (data == 'success') {
                                    // 60秒后重新获取验证码 (原生javascript代码)
                                    var time = 60;
                                    var btn = document.getElementById("code");

                                    function getCodes(obj) {
                                        if (time == 0) {
                                            obj.removeAttribute("disabled");
                                            obj.innerHTML = "获取验证码";
                                            obj.style.backgroundColor = "#3ab2ec";
                                            time = 60;
                                        } else {
                                            obj.setAttribute("disabled", true);
                                            obj.innerHTML = time + "秒后重新获取";
                                            obj.style.backgroundColor = "#8b8b8b";
                                            time--;
                                            setTimeout(function () {
                                                getCodes(obj)
                                            }, 1000)
                                        }
                                    }

                                    btn.onclick = function () {
                                        getCodes(this);
                                    };
                                    $ionicPopup.alert({
                                        title: '注意',
                                        template: '验证码已发送到您的手机，请注意查收!'
                                    });

                                    window.localStorage['Phone'] = $scope.user.registerPhone;
                                }
                                if (data == 'error') {
                                    $ionicPopup.alert({
                                        title: '抱歉',
                                        template: '验证码发送失败，请重新获取!'
                                    });
                                }
                            })
                            .error(function (data) {
                                //
                                var timeout = $timeout(function () {
                                    $ionicPopup.alert({
                                        title: '抱歉~',
                                        template: '网络不给力...'
                                    }).then(function (result) {
                                        if (result == true) {
                                            $timeout.cancel(timeout);
                                        }
                                    });
                                    $ionicLoading.hide();
                                }, 30000);
                            }).then(function () {
                                $ionicLoading.hide();
                            });
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '请输入您的手机号'
                    });
                }

            };

            //验证验证码，并且进入注册页面
            $scope.nextFoot = function () {

                //$state.go('register');
                //
                if ($scope.user.registerPhone == '' && $scope.user.code == '') {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请完善相关信息!'
                    });
                }

                if ($scope.user.registerPhone != '' && $scope.user.code != '') {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    // 验证验证码
                    $http.post(httparr + '/codecheck', {
                        Phone: $scope.user.registerPhone,
                        code: $scope.user.code
                    })
                        .success(function (data) {
                            if (data == 'success') {
                                $state.go('register');
                            }
                            else {
                                $ionicPopup.alert({
                                    title: '警告',
                                    template: '请输入正确的验证码或者重新获取验证码'
                                })
                            }
                        })
                        .error(function (data) {
                            var timeout = $timeout(function () {
                                $ionicPopup.alert({
                                    title: '抱歉~',
                                    template: '网络不给力...'
                                }).then(function (result) {
                                    if (result == true) {
                                        $timeout.cancel(timeout);
                                    }
                                });
                                $ionicLoading.hide();
                            }, 30000);
                        })
                        .then(function (data) {
                            $ionicLoading.hide();
                        })
                }
            };
            //取消返回登陆页面
            $scope.back = function () {
                $state.go('login');
            };
        })
    })

    //注册页面控制器
    .controller('RegisterCtrl', function ($scope, $state, $http, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.user = {ID_card: '', password: '', check_password: ''};
            $scope.register = function () {
                //window.localStorage['Phone']
                if ($scope.user.ID_card != '' && $scope.user.password != '' && $scope.user.check_password != '') {
                    if ($scope.user.password == $scope.user.check_password) {
                        $ionicLoading.show({
                            templateUrl: 'templates/loadingPage.html'
                        });
                        $http.post(httparr + '/register', {
                            ID_card: $scope.user.ID_card,
                            Password: $scope.user.check_password,
                            Phone: window.localStorage['Phone']
                        })
                            .success(function (data) {
                                if (data != null) {
                                    $ionicPopup.alert({
                                        title: '提示',
                                        template: '注册成功,请登录'
                                    }).then(function (res) {
                                        if (res) {
                                            window.localStorage['Phone'] = '';
                                            $state.go('login');
                                        }
                                    })
                                } else {
                                    $ionicPopup.alert({
                                        title: '警告',
                                        template: '请输入正确的身份证号!'
                                    })
                                }
                            })
                            .error(function () {
                                var timeout = $timeout(function () {
                                    $ionicPopup.alert({
                                        title: '抱歉~',
                                        template: '网络不给力...'
                                    }).then(function (result) {
                                        if (result == true) {
                                            $timeout.cancel(timeout);
                                        }
                                    });
                                    $ionicLoading.hide();
                                }, 30000);
                            })
                            .then(function () {
                                $ionicLoading.hide();
                            })
                    }
                    else {
                        $ionicPopup.alert({
                            title: '警告',
                            template: '您两次输入的密码不相等'
                        })
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请完善相关信息'
                    })
                }


            };

            $scope.lastFoot = function () {
                $state.go('register_phone');
            }

        })
    })
    //学生TABS
    .controller('StudentsTabsCtrl', function ($scope, $stateParams, $state, $ionicSlideBoxDelegate) {
        //window.localStorage['dege'] = '1';
        clearInterval(time);
        clearInterval(get_wifitime);
        clearInterval(check_stuwifitime);
        console.log(window.localStorage['dege'])
        if (window.localStorage['dege']) {
            $scope.slideIndex == 0;
            $scope.title = '信息';
            $scope.show1 = '';
            $scope.show2 = '-outline';
            $scope.show3 = '-outline';
            $scope.show4 = '-outline';
            $scope.color1 = '#00B3B3';
            $scope.color2 = '#7d7d7d';
            $scope.color3 = '#7d7d7d';
            $scope.color4 = '#7d7d7d';
            window.localStorage['dege'] = '';
        } else {
            $scope.slideIndex = 1;
            $scope.show1 = '-outline';
            $scope.show2 = '';
            $scope.show3 = '-outline';
            $scope.show4 = '-outline';
            $scope.color1 = '#7d7d7d';
            $scope.color2 = '#00B3B3';
            $scope.color3 = '#7d7d7d';
            $scope.color4 = '#7d7d7d';
            $scope.title = '学习';
        }
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;

            if ($scope.slideIndex == 0) {
                $scope.title = '信息';
                $scope.show1 = '';
                $scope.show2 = '-outline';
                $scope.show3 = '-outline';
                $scope.show4 = '-outline';
                $scope.color1 = '#00B3B3';
                $scope.color2 = '#7d7d7d';
                $scope.color3 = '#7d7d7d';
                $scope.color4 = '#7d7d7d';
            }

            else if ($scope.slideIndex == 1) {
                $scope.title = '学习';
                $scope.show1 = '-outline';
                $scope.show2 = '';
                $scope.show3 = '-outline';
                $scope.show4 = '-outline';
                $scope.color1 = '#7d7d7d';
                $scope.color2 = '#00B3B3';
                $scope.color3 = '#7d7d7d';
                $scope.color4 = '#7d7d7d';
            }

            else if ($scope.slideIndex == 2) {
                $scope.title = '个人信息';
                $scope.show1 = '-outline';
                $scope.show2 = '-outline';
                $scope.show3 = '';
                $scope.show4 = '-outline';
                $scope.color1 = '#7d7d7d';
                $scope.color2 = '#7d7d7d';
                $scope.color3 = '#00B3B3';
                $scope.color4 = '#7d7d7d';
            }
        };
        $scope.activeSlide = function (index) {
            $ionicSlideBoxDelegate.slide(index);
        };

    })
    //首页-消息通知控制器
    .controller('AlertsCtrl', function ($scope, $http, $state, $ionicLoading) {
        //
        $ionicLoading.show({
            templateUrl: 'templates/loadingPage.html'
        });
        $http.get(httparr + '/GetMessage', {
            params: {
                CollegeId: window.localStorage['Colleges'],
                ProfessionId: window.localStorage['Professions'],
                ClassId: window.localStorage['Classes']
            }
        })
            .success(function (data) {
                //
                $scope.messages = data;
            }).error(function (err) {
                //
            }).then(function () {
                //
                $ionicLoading.hide();
            });
        //
        $scope.doRefresh = function () {
            //
            $http.get(httparr + '/GetMessage', {
                params: {
                    CollegeId: window.localStorage['Colleges'],
                    ProfessionId: window.localStorage['Professions'],
                    ClassId: window.localStorage['Classes']
                }
            })
                .success(function (data) {
                    //
                    $scope.messages = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };
    })
    //首页-学习页面控制器
    .controller('StudyCtrl', function ($scope, $state, $timeout, $ionicPlatform, $ionicPopup, $http) {
        //

        $ionicPlatform.ready(function () {
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "网络无法连接",
                        content: "请确保你能够网络畅通再打开本程序"
                    })
                        .then(function (result) {
                            ble.exit();

                        });
                }
            }

        });


        $scope.screenheight = window.innerHeight - 90;
        $scope.jiugongeheight = $scope.screenheight / 3;
        //alert($scope.jiugongeheight);
        $scope.screenwidth = window.innerWidth;
        $scope.leave = function () {
            //跳转至请假
            $state.go('leave_tab.newleave');
        }
        $scope.MySchedule = function () {
            //跳转至我的课表
            $state.go('MySchedule');
        }
        $scope.classmates = function () {
            //跳转至我的班级成员
            $state.go('myclass_students');
        }
        $scope.sign = function () {
            //跳转至签到

            $state.go('student_getpoint')
        }
        $scope.myteachers = function () {
            //跳转至我的老师

            $state.go('myteachers')
        }


    })

    //首页-个人信息页面控制器
    .controller('InformationCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $ionicHistory, $cordovaImagePicker, $http, $cordovaFileTransfer, $ionicLoading, $timeout) {
        //$scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
        $scope.new = {Infors: '', New_password: '', Sure_password: ''};

        $ionicLoading.show({
            templateUrl: 'templates/loadingPage.html'
        });
        $http.get(httparr + '/student_person', {
            params: {Number: window.localStorage['Number']}
        })
            .success(function (data) {

                $ionicLoading.hide();
                $scope.student = data;
            })
            .error(function (err) {

                var timeout = $timeout(function () {
                    $ionicPopup.alert({
                        title: '抱歉~',
                        template: '网络不给力...'
                    }).then(function (result) {
                        if (result == true) {
                            $timeout.cancel(timeout);
                        }
                    });
                    $ionicLoading.hide();
                }, 30000);
            }).then(function () {
                $ionicLoading.hide();
            })

        //以下为设置头像放大的方法
        //第一个为点击头像放大的图层模型
        $ionicModal.fromTemplateUrl('before', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_before = modal;
        });

        //以下为选择图片后的头像预览图层模型
        $ionicModal.fromTemplateUrl('after', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_after = modal;
        });

        //打开图层
        $scope.openModal = function () {
            if (i == 1) {
                $scope.modal_before.show();
            }
            else if (i == 2) {
                $scope.modal_after.show();
            }
        };
        //关闭图层
        $scope.closeModal = function () {
            $scope.modal_before.hide();
        };
        //清楚图层缓存
        $scope.$on('$destroy', function () {
            $scope.modal_before.remove();
        });

        //以下为点击头像放大
        $scope.showImage = function () {
            $scope.openModal(i = 1);
        };
        //    以下为点击更换头像的方法
        //$scope.imgSrc_before = "./img/JS.jpg";
        //$scope.imgSrc_after = "";
        //$scope.changePhoto = function () {
        //    var options = {
        //        maximumImagesCount: 1,
        //        width: 800,
        //        height: 800,
        //        quality: 80
        //    };
        //    $cordovaImagePicker.getPictures(options)
        //        //以下为选好图片后的方法
        //        .then(function (results) {
        //            if (results[0] != null) {
        //                $scope.openModal(i = 2);
        //                $scope.imgSrc_after = results[0];
        //            }
        //        }, function (error) {
        //        });
        //};

        ////以下为选择头像后的方法
        //$scope.returnmodal_after = function () {
        //    $scope.modal_after.hide();
        //};
        ////确定保存更换头像的方法
        //$scope.save = function () {
        //    $scope.modal_after.hide();
        //    $scope.student.Photo = $scope.imgSrc_after;
        //
        //    //以下为上传头像的相关参数
        //    var fileURL = $scope.imgSrc_after;
        //    var options = {
        //        fileKey: "file",
        //        fileName: window.localStorage['Number']+'.jpg',
        //        mimeType: "text/plain",
        //        params:{photo_name:window.localStorage['Number']}
        //    };
        //
        //    //上传头像
        //    $cordovaFileTransfer.upload(httparr+"/stu_files",fileURL, options)
        //        .then(function (data) {
        //            $ionicLoading.hide();
        //        }, function (err) {
        //            var timeout = $timeout(function () {
        //                $ionicPopup.alert({
        //                    title: '抱歉~',
        //                    template: '网络不给力...'
        //                }).then(function(result){
        //                    if(result == true){
        //                        $timeout.cancel(timeout);
        //                    }
        //                });
        //                $ionicLoading.hide();
        //            }, 30000);
        //        }, function (progress) {
        //        });
        //};
        //以下为个人信息修改资料
        $ionicModal.fromTemplateUrl('change_informations', function (modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.open = function () {
            $scope.taskModal.show();
        }
        //关闭图层
        $scope.close = function () {
            $scope.new.Infors = '';
            $scope.New_password = '';
            $scope.Sure_password = '';
            $scope.taskModal.hide();
        };
        $scope.saveInfo = function () {
            $ionicPopup.alert({
                title: '提示',
                template: '点击'
            })
        };

        //    以下为点击修改QQ账号
        $scope.changeQQ = function () {
            $scope.some = {tag: 'QQ', message: '请输入新的QQ账号'};
            $scope.show = 'none';
            $scope.open();
        };

        //    以下为点击修改籍贯
        $scope.changeAreaId = function () {
            $scope.some = {tag: '籍贯', message: '请输入您的籍贯'};
            $scope.show = 'none';
            $scope.open();
        };
        //以下为点击修改手机号
        $scope.changePhone = function () {
            $scope.some = {tag: '手机号码', message: '请输入您更换的手机号码'};
            $scope.show = 'none';
            $scope.open();
        };
        //以下为修改密码
        $scope.changePassword = function () {
            $scope.some = {tag: '密码', message: '请输入您旧的密码'};
            $scope.show = '';
            $scope.open();
        };
        //保存修改信息
        $scope.saveInfo = function () {
            if ($scope.some.tag != '手机号码' && $scope.some.tag != '密码') {
                if ($scope.new.Infors != '') {
                    $http.post(httparr + '/change_informations',
                        {
                            tag: $scope.some.tag,
                            Infors: $scope.new.Infors,
                            Number: window.localStorage['Number']
                        })
                        .success(function (data) {
                            if (data == 'QQ') {
                                $scope.student.QQ = $scope.new.Infors;
                            } else {
                                $scope.student.Native = $scope.new.Infors;
                            }
                            $scope.new.Infors = '';
                            $scope.close();
                        })
                }
                else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: $scope.some.tag + '不能为空'
                    })
                }
            }
            else if ($scope.some.tag == '手机号码') {
                var ab = /^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/;

                if (ab.test($scope.new.Infors) == false) {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请输入正确的手机号码！'
                    })
                } else {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '温馨提示',
                        template: '您确定修改手机号吗?修改手机号需要重新登陆!',
                        cancelText: '取消',
                        okText: '确定'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            $ionicLoading.show({
                                templateUrl: 'templates/loadingPage.html'
                            });
                            $http.post(httparr + '/stu_change_phone', {
                                Number: window.localStorage['Number'],
                                Phone: $scope.new.Infors
                            })
                                .success(function (data) {
                                    if (data == null) {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '此手机号已存在'
                                        }).then(function () {
                                            $scope.new.Infors = '';
                                        })
                                    }
                                    else {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '修改成功'
                                        }).then(function (res) {
                                        })
                                    }
                                })
                                .error(function () {
                                    var timeout = $timeout(function () {
                                        $ionicPopup.alert({
                                            title: '抱歉~',
                                            template: '网络不给力...'
                                        }).then(function (result) {
                                            if (result == true) {
                                                $timeout.cancel(timeout);
                                            }
                                        });
                                        $ionicLoading.hide();
                                    }, 30000);
                                })
                                .then(function () {
                                    $ionicLoading.hide();
                                })
                        }
                    });
                }
            }
            else if ($scope.some.tag == '密码') {
                if ($scope.new.Infors != '' && $scope.new.New_password != '' && $scope.new.Sure_password != '') {

                    if ($scope.new.New_password != $scope.new.Sure_password) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '您输入的两次密码不相等'
                        })
                    }
                    else {
                        var confirmPopup = $ionicPopup.confirm({
                            title: '温馨提示',
                            template: '您确定修改密码吗?修改密码需要重新登陆!',
                            cancelText: '取消',
                            okText: '确定'
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                $ionicLoading.show({
                                    templateUrl: 'templates/loadingPage.html'
                                });
                                //首先判断输入的就密码是否存在
                                $http.post(httparr + '/stu_change_password', {
                                    Old_password: $scope.new.Infors,
                                    Number: window.localStorage['Number'],
                                    Sure_password: $scope.new.Sure_password
                                })
                                    .success(function (data) {
                                        if (data == null) {
                                            $ionicPopup.alert({
                                                title: '提示',
                                                template: '您输入旧的密码不正确'
                                            })
                                        }
                                        else {
                                            $ionicPopup.alert({
                                                title: '提示',
                                                template: '密码修改成功,请重新登陆'
                                            }).then(function (res) {
                                                if (res) {
                                                    window.localStorage['Number'] = '';
                                                    $scope.new.Infors = '';
                                                    $scope.close();
                                                    //jpushService.setTagsWithAlias('');
                                                    $state.go('login');
                                                }
                                            })
                                        }
                                    })
                                    .error(function () {
                                        var timeout = $timeout(function () {
                                            $ionicPopup.alert({
                                                title: '抱歉~',
                                                template: '网络不给力...'
                                            }).then(function (result) {
                                                if (result == true) {
                                                    $timeout.cancel(timeout);
                                                }
                                            });
                                            $ionicLoading.hide();
                                        }, 30000);
                                    })
                                    .then(function () {
                                        $ionicLoading.hide();
                                    })
                            }
                        });
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请完善相关信息'
                    })
                }
            }
        };
        //    以下为注销用户
        $scope.cancellation = function () {

            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '您确定要注销当前用户吗?',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {

                    window.localStorage['Number'] = '';
                    window.localStorage['Classes'] = '';
                    window.localStorage['Professions'] = '';
                    window.localStorage['Colleges'] = '';
                    window.localStorage['Stu_Purview'] = '';
                    //jpushService.setTagsWithAlias('');
                    //$http.post(httparr+'/removeDeviceId', {_id: window.localStorage['_id']})
                    //    .success(function(data){
                    //        //
                    //    });
                    window.localStorage['_id'] = '';
                    $state.go('login');
                }
                else {
                }
            });
        }

        $scope.registFace = function () {
            //
            $ionicLoading.show();
            var success = function (msg) {
                $ionicLoading.hide();
                //var data = msg;
                //alert(JSON.parse(data));
                if (JSON.parse(msg).result == 'success') {
                    $ionicPopup.alert({
                        title: '抱歉',
                        template: '您已经注册过了'
                    });
                } else if (JSON.parse(msg).result == 'fail') {
                    //
                    var success = function (msg) {
                        if (JSON.parse(msg).result == 'success') {

                            //$ionicPopup.alert({
                            //    title: '提示',
                            //    template: '注册成功'+"图片路径为："+JSON.parse(msg).imagePath
                            //}).then(function(){
                            //
                            //});
                        }
                        $scope.currentValue = msg;
                        $scope.$apply();
                    };

                    var failure = function (error) {
                        if (JSON.parse(error).result == 'success') {
                            $scope.student.Photo = JSON.parse(error).imagePath;
                            $ionicPopup.alert({
                                title: '提示',
                                template: '注册成功'
                            }).then(function () {
                                //以下为上传头像的相关参数
                                var fileURL = JSON.parse(error).imagePath;
                                //alert(fileURL);
                                var options = {
                                    fileKey: "file",
                                    fileName: window.localStorage['Number'] + '.jpg',
                                    mimeType: "text/plain",
                                    params: {photo_name: window.localStorage['Number']}
                                };

                                //上传头像
                                $cordovaFileTransfer.upload(httparr + "/stu_files", fileURL, options)
                                    .then(function (data) {
                                        $ionicLoading.hide();
                                    }, function (err) {
                                        var timeout = $timeout(function () {
                                            $ionicPopup.alert({
                                                title: '抱歉~',
                                                template: '网络不给力...'
                                            }).then(function (result) {
                                                if (result == true) {
                                                    $timeout.cancel(timeout);
                                                }
                                            });
                                            $ionicLoading.hide();
                                        }, 30000);
                                    }, function (progress) {
                                    });
                            });
                        }else
                        {
                            $ionicPopup.alert({
                                title: '错误',
                                template:JSON.parse(error).result
                            })
                        }
                        $scope.currentValue = msg;
                        $scope.$apply();
                    };

                    face.register(window.localStorage['Number'], success, failure);
                }
                $scope.currentValue = msg;
                $scope.$apply();
            };

            var failure = function (error) {
                alert(error);
            };

            face.search(window.localStorage['Number'], success, failure);
        }
    })
//请假-提交申请页面控制器
    .controller('NewleaveCtrl', function ($scope, $cordovaDatePicker, $ionicLoading, $filter, $state, $ionicModal, $ionicPopup, $http) {
        //
        $scope.studentname = window.localStorage['Name'];
        $scope.leave = {why: ''};
        //返回按钮
        $scope.back = function () {
            $state.go('index_tab.study');
            $scope.datepicker_start = '';
            $scope.datepicker_end = '';
            $scope.leave.why = '';
            $scope.datetime = '';
            $scope.enddatetime = '';
        };
        //提交按钮
        $scope.submit = function () {
            if ($scope.datepicker_start == '' || $scope.datepicker_end == '' || $scope.leave.why == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请完善请假信息'
                })
            } else {
                $ionicLoading.show();
                $http.post(httparr + '/vacation', {
                    Student: window.localStorage['_id'],
                    ClassesId: window.localStorage['Classes'],
                    BeginDate: $scope.datepicker_start,
                    EndDate: $scope.datepicker_end,
                    Reason: $scope.leave.why,
                    VacationTime: new Date()
                })
                    .success(function (data) {
                        //
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: '提示',
                            template: '提交申请成功'
                        }).then(function () {
                            $scope.datepicker_start = '';
                            $scope.datepicker_end = '';
                            $scope.leave.why = '';
                        })
                    }).error(function (err) {
                        //
                    });

            }

        };
        //显示与隐藏
        $scope.display = 'none';
        $scope.opentime = function () {
            if ($scope.display == 'none') {
                $scope.display = '';
            } else {
                $scope.display = 'none'
            }
        }
        $scope.beginTime = "选取开始时点"
        $scope.beginTimePickerObject = {
            inputEpochTime: ((new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60),  //Optional
            step: 10,  //Optional
            format: 24,  //Optional
            titleLabel: '24-hour Format',  //Optional
            closeLabel: '取消',  //Optional
            setLabel: '选择',  //Optional
            setButtonType: 'button-balanced',  //Optional
            closeButtonType: 'button-positive',  //Optional
            callback: function (val) {    //Mandatory
                //
                if (val != null) {
                    $scope.beginTimePickerObject.inputEpochTime = val;
                    $scope.beginSelectedTime = new Date(val * 1000);
                    $scope.beginTime = $scope.beginSelectedTime.getUTCHours() + ':' + $scope.beginSelectedTime.getMinutes();
                }
                //
            }
        };
        $scope.endTime = "选取结束时点"
        $scope.endTimePickerObject = {
            inputEpochTime: ((new Date()).getHours() * 60 * 60 + (new Date()).getMinutes() * 60),  //Optional
            step: 10,  //Optional
            format: 24,  //Optional
            titleLabel: '24-hour Format',  //Optional
            closeLabel: '取消',  //Optional
            setLabel: '选择',  //Optional
            setButtonType: 'button-balanced',  //Optional
            closeButtonType: 'button-positive',  //Optional
            callback: function (val) {    //Mandatory
                //
                if (val != null) {
                    $scope.endTimePickerObject.inputEpochTime = val;
                    $scope.endSelectedTime = new Date(val * 1000);
                    $scope.endTime = $scope.endSelectedTime.getUTCHours() + ':' + $scope.endSelectedTime.getMinutes();
                }
                //
            }
        };
        //开始日期选择器
        $ionicModal.fromTemplateUrl('templates/datemodal-start.html',
            function (modal) {
                $scope.datemodal_statr = modal;

            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        //结束日期选择器
        $ionicModal.fromTemplateUrl('templates/datemodal-end.html',
            function (modal) {
                $scope.datemodal_end = modal;
            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        //开始日期选择
        $scope.opendateModal_start = function () {
            $scope.datemodal_statr.show();
        };
        //结束日期选择
        $scope.opendateModal_end = function () {
            if ($scope.datepicker_start == '' || $scope.datetime == '') {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请先选择开始时间'
                })
            } else {
                $scope.datemodal_end.show();
            }

        };
        $scope.close = function () {
            $scope.datemodal_statr.hide();
            $scope.datemodal_end.hide();
        }
        //关闭日期选择
        $scope.closedateModal = function (modal, datetime) {
            if (modal && datetime) {
                $scope.datemodal_statr.hide();
                $scope.datetime = datetime.getUTCHours() + ':' + datetime.getMinutes();
                $scope.datepicker_st = modal;
                $scope.datepicker_start = modal + ' ' + $scope.datetime;
            } else {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请完善日期时间'
                })
            }
        };
        $scope.closedateModal_end = function (modal, datetime) {
            if (modal && datetime) {
                // 计算天数
                $scope.enddatetime = datetime.getUTCHours() + ':' + datetime.getMinutes();
                var arr1 = $scope.datepicker_st.split('-');
                var arr2 = modal.split('-');
                var d1 = new Date(arr1[0], arr1[1], arr1[2]);
                var d2 = new Date(arr2[0], arr2[1], arr2[2]);
                $scope.day = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24) + 1;
                if ($scope.day < 1) {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请假日期错误！请重新选择'
                    })
                    $scope.datepicker_end = '';
                } else {
                    $scope.datemodal_end.hide();
                    $scope.display = 'none';
                    $scope.datepicker_end = modal + ' ' + $scope.enddatetime;
                }
            } else {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请完善信息'
                })
            }

        };
    })
    //请假-我的请假控制器
    .controller('MyleaveCtrl', function ($scope, $state, $http, $ionicLoading) {
        $ionicLoading.show({
            templateUrl: 'templates/loadingPage.html'
        });
        $scope.back = function () {
            $state.go('index_tab.study');
        };
        //$scope.BeginDate = '2015/08/01';
        //$scope.EndDate = '2015/08/10';
        //$scope.Text = '病假';
        //$scope.Status = true;
        //if($scope.Status = true){
        //    $scope.color = '';
        //    $scope.StatusText = '审核通过'
        //}else{
        //    $scope.color = 'red';
        //    $scope.StatusText = '审核中……'
        //}
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            //
            $http.get(httparr + '/viewResults', {params: {Student: window.localStorage['_id']}})
                .success(function (data) {
                    //
                    $scope.vacations = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $ionicLoading.hide();
                });
        });
        $scope.doRefresh = function () {
            //
            $http.get(httparr + '/viewResults', {params: {Student: window.localStorage['_id']}})
                .success(function (data) {
                    //
                    $scope.vacations = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };
    })
    //课表控制器
    .controller('MyScheduleCtrl', function ($scope, $http, $filter, $state, $ionicLoading) {
        //
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $ionicLoading.show({
                templateUrl: 'templates/loadingPage.html'
            });
            $http.get(httparr + '/getClassName', {params: {ClassId: window.localStorage['Classes']}})
                .success(function (data) {
                    //
                    $http.get(httparr + '/gkb', {params: {classes: data}})
                        .success(function (data) {
                            //
                            //alert(data[3].data[8][1]);
                            $scope.gkb = data;
                        }).error(function (err) {
                            //
                            console.error(err);
                        }).then(function () {
                            $ionicLoading.hide();
                        });
                }).error(function (err) {
                    //
                });

            $scope.array = [];
            for (var i = 8; i <= 27; i++) {
                $scope.array.push(i);
            }
            console.log($scope.array);

            $scope.week = ['一', '二', '三', '四', '五'];

            $scope.back = function () {
                $state.go('index_tab.study');
            }
            $scope.getdate = function () {
                var date = new Date();
                date = $filter('date')(date, 'EEEE');
                $http.get(httparr + '/getdate', {params: {date: date}})
                    .success(function (data) {
                        //
                    }).error(function (err) {
                        //
                        console.error(err);
                    }).then();
            }
        })

    })

    //学生端、定位签到页面控制器
    .controller('student_getpointCtrl', function ($scope, $state, $ionicPopup, $http, $ionicLoading, $timeout, $cordovaDevice, $ionicModal) {
        //$scope.height = window.innerHeight
        //$scope.width = window.innerWidth
        //$scope.signbutton = '0';
        //$scope.sign_button_state = 'button-stable';
        //$scope.signout_button_state = 'button-stable';
        //蓝牙
        $scope.height = window.innerHeight
        $scope.width = window.innerWidth
        $scope.width2 = $scope.width / 4
        $scope.screenheight = $scope.height / 2 - 50;
        $scope.screenwidth = $scope.width / 2 - 50;
        $scope.radarwidth = $scope.width / 2;
        $scope.marginradarwidth = $scope.width / 3;
        $scope.wifialert_show = 'none';
        $scope.checkbutton_show = 'none';
        $scope.signbutton = '0';
        //alert($scope.screenheight+','+$scope.screenwidth);
        var student_sign = function () {
            var date = new Date();
            $http.get(httparr + '/CheackIfSign', {
                params: {
                    date: date,
                    StudentId: window.localStorage['_id']
                }
            })
                .success(function (data) {
                    if (data == '没课') {
                        //没课不需要签到
                        $scope.signbutton = '0';
                        $scope.sign_button_state = 'button-positive';
                        $scope.sign = function () {
                            $ionicPopup.alert({
                                title: '系统提醒',
                                template: '现在没课，不需要签到'
                            })
                        }
                    } else {
                        if (data.FirstSignInState == 0 && data.SecondSignInState == 0) {
                            //
                            $ionicPopup.alert({
                                title: '系统提醒',
                                template: '你在签到地点,可以可以签到了!'
                            });
                            //未签到
                            $scope.wifialert_show = '2';
                            $scope.signbutton = '0';
                            $scope.sign_button_state = 'button-positive';
                            //
                        } else if (data.FirstSignInState != 0 && data.SecondSignInState == 0) {
                            //
                            $ionicPopup.alert({
                                title: '系统提醒',
                                template: '你在签到地点,可以可以签退了!'
                            });
                            // 已签到 未签退
                            $scope.wifialert_show = '3';
                            $scope.signbutton = '1';
                            $scope.signout_button_state = 'button-positive';

                        } else {
                            // 已经签到 且 签退
                            $scope.wifialert_show = '3';
                            $scope.signbutton = '-1';
                            $scope.bluebtn = '-3';
                            $ionicPopup.alert({
                                title: '提示',
                                template: '你已经完成了本节课的考勤，无需再重复签到'
                            });
                            //$scope.sign_button_state = 'button-stable';
                        }
                    }
                });
        }
        //$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        //    if (toState.name == "index_tab.student_getpoint")
        //    {
        //        alert(JSON.stringify(state));
        //    }
        //
        //});

        $scope.back =function(){
            $state.go("index_tab.study");
        }
        //$scope.$on('$ionicView.afterEnter', function (viewInfo, state) {
        //
        //
        //    $ionicLoading.show({
        //        templateUrl: 'templates/loadingPage.html'
        //    });
        //    var date=new Date();
        //    $http.get(httparr + '/getpoint', {
        //
        //
        //        params: {
        //            date:  date,
        //            StudentId: window.localStorage['_id'],
        //            tag: 'ClassRoom'
        //        }
        //    }).success(function(data) {
        //
        //        if(data=="没课"){
        //            $ionicLoading.hide();
        //            $ionicPopup.alert({
        //                title: '提示',
        //                template: "当前时间没课,不需要签到"
        //            });
        //            $scope.sign_button_state = 'button-stable';
        //            $scope.signout_button_state = 'button-stable';
        //            $scope.signbutton = '-1';
        //        }
        //        else {
        //            ble.scanBlue(data.tag, function (message) {
        //
        //                var res = JSON.parse(message);
        //                if (res.result == "success") {
        //                    $ionicLoading.hide();
        //
        //                    student_sign();
        //
        //                } else {
        //                    $ionicLoading.hide();
        //                    $ionicPopup.alert({
        //                        title: '提示',
        //                        template: "当前位置不存在指定的蓝牙设备,无法进行签到"
        //                    });
        //                    $scope.sign_button_state = 'button-stable';
        //                    $scope.signout_button_state = 'button-stable';
        //                    $scope.signbutton = '-1';
        //                }
        //            });
        //        }
        //    });
        //
        //})
        //点击签到按钮
        $scope.sign = function () {

            //
            var success = function (msg) {
                if (JSON.parse(msg).result == 'success') {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    //定义一个获取时间的方法
                    var date = new Date();
                    $http.post(httparr + '/SignIn', {
                        date: date,
                        StudentId: window.localStorage['_id']
                    })
                        .success(function (data) {
                            //alert(data);
                            $ionicLoading.hide();
                            if (data == '你已经签到了') {
                                $ionicPopup.alert({
                                    title: '系统提醒',
                                    template: "你已经签到了",
                                    okText: '确定'
                                }).then(function (res) {
                                    if (res) {
                                        $scope.signbutton = '1';
                                        $scope.signout_button_state = 'button-positive';
                                    }

                                })
                            }
                            else if (data == '现在不是签到时间') {
                                $ionicPopup.alert({
                                    title: '系统提醒',
                                    template: "当前不是签到时间",
                                    okText: '确定'
                                })
                            }
                            else {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: data
                                }).then(function () {
                                    $scope.signbutton = '1';
                                    $scope.sign_button_state = 'button-stable';
                                    $scope.signout_button_state = 'button-positive';
                                    $scope.sign = function () {
                                    }
                                })
                            }
                        })
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: JSON.parse(msg).result
                    });
                }
            };
            var failure = function (error) {
                alert(error);
            };
            face.verify(window.localStorage['Number'], success, failure);
        }
        //
        //点击签退按钮
        $scope.signout = function () {
            $ionicPopup.confirm({
                title: '系统提醒',
                template: '你确定要现在签退吗？',
                okText: '确定',
                cancelText: '取消'
            }).then(function (res) {
                if (res) {
                    //确定
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingPage.html'
                    });
                    var date = new Date();
                    $http.get(httparr + '/CheackIfSign', {
                        params: {
                            date: date,
                            StudentId: window.localStorage['_id']
                        }
                    })
                        .success(function (data) {
                            $ionicLoading.hide();
                            if (data == '没课') {
                                $scope.signout = function () {
                                    $ionicPopup.alert({
                                        title: '系统提醒',
                                        template: '现在不需要签退'
                                    })
                                }
                            } else {
                                var success = function (msg) {
                                    $ionicLoading.hide();
                                    if (JSON.parse(msg).result == 'success') {
                                        $ionicLoading.show({
                                            templateUrl: 'templates/loadingPage.html'
                                        });
                                        //定义一个获取时间的方法
                                        var date = new Date();
                                        $http.post(httparr + '/SignOut', {
                                            date: date,
                                            StudentId: window.localStorage['_id']
                                        })
                                            .success(function (data) {
                                                $ionicPopup.alert({
                                                    title: '系统提醒',
                                                    template: data
                                                })
                                                if (data == '签退成功') {
                                                    $scope.signbutton = '0';
                                                }
                                            })
                                            .error(function () {
                                            })
                                            .then(function () {
                                                $ionicLoading.hide();
                                                $scope.signbutton = -1;
                                            })

                                    } else {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: JSON.parse(msg).result
                                        });
                                    }
                                    $scope.currentValue = msg;
                                    $scope.$apply();
                                };

                                var failure = function (error) {
                                    alert(error);
                                };

                                face.verify(window.localStorage['Number'], success, failure);

                            }
                        })
                }
            })
        }
    })


//班委tabs 班级成员签到
    .
    controller('MembersCtrl', function ($scope, $state, $ionicPopup, $http, $ionicLoading) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $ionicLoading.show({
                templateUrl: 'templates/loadingPage.html'
            });
            $scope.return = function () {
                $state.go('index_tab.study');
            }

            $scope.array = [];

            //获取班级学生
            $http.get(httparr + '/getStudents', {
                params: {classes: window.localStorage['Classes']}
            })
                .success(function (data) {
                    for (i = 0; i < data.length; i++) {
                        $scope.array.push(data[i]);
                    }
                    $scope.menbers = $scope.array;

                    //获取当前需要签到的课程
                    var nowdate = new Date();
                    $http.get(httparr + '/getSubject', {

                        params: {
                            date: nowdate,
                            StudentId: window.localStorage['_id']
                        }
                    })
                        .success(function (dd) {
                            if (data != null) {
                                $scope.SubjectName = dd;
                            }
                            else {
                                $scope.SubjectName = '该时间段为休息时间';
                            }
                        })
                        .error(function () {
                        })
                        .then(function () {
                        })

                    $scope.Sign = function (StudentId) {
                        for (k = 0; k < $scope.array.length; k++) {
                            if ($scope.array[k]._id == window.localStorage['_id']) {
                                var CheckSigin = $scope.array[k].IsSignIn;
                            }
                        }
                        if (CheckSigin == 1) {
                            $ionicPopup.confirm({
                                title: '警告',
                                template: '是否代替其签到？一旦确定不可修改！',
                                okText: '确定',
                                cancelText: '取消'
                            }).then(function (res) {
                                if (res) {
                                    var date = new Date();

                                    $http.post(httparr + '/help_sign', {
                                        StudentId: StudentId,
                                        date: date
                                    })
                                        .success(function (data) {
                                            for (j = 0; j < $scope.array.length; j++) {
                                                if ($scope.array[j]._id == data._id) {
                                                    $scope.array[j].IsSignIn = '1';
                                                }
                                            }
                                        })
                                        .then(function () {
                                        })
                                        .error(function () {
                                        })
                                } else {
                                }
                            })
                        }
                        else {
                            $ionicPopup.alert({
                                title: '警告',
                                template: '请您先自行签到'
                            })
                        }
                    }
                })
                .then(function () {
                    $ionicLoading.hide();
                })
        })
    })


    //我的班级成员页面控制器
    .controller('myclass_studentsCtrl', function ($scope, $state, $ionicPopup, $http, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $ionicLoading.show({
                templateUrl: 'templates/loadingPage.html'
            });
            $scope.array = [];
            $http.get(httparr + '/myclass', {
                params: {
                    Classes: window.localStorage['Classes']
                }
            })
                .success(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].Number == window.localStorage['Number']) {
                        }
                        else {
                            $scope.array.push(data[i]);
                        }
                    }
                    $scope.students = $scope.array
                })
                .error(function () {
                    var timeout = $timeout(function () {
                        $ionicPopup.alert({
                            title: '抱歉~',
                            template: '网络不给力...'
                        }).then(function (result) {
                            if (result == true) {
                                $timeout.cancel(timeout);
                            }
                        });
                        $ionicLoading.hide();
                    }, 30000);
                })
                .then(function () {
                    $ionicLoading.hide();
                })
            $scope.return = function () {
                $state.go('index_tab.study');
            }
        })
    })

    //我的班级成员详细信息页面控制器
    .controller('myclass_stu_presonCtrl', function ($scope, $state, $ionicPopup, $http, $stateParams, $ionicModal, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $ionicLoading.show({
                templateUrl: 'templates/loadingPage.html'
            });
            $http.get(httparr + '/myclass_infor', {
                params: {id: $stateParams.StuId}
            })
                .success(function (data) {
                    $scope.student = data;
                })
                .error(function () {
                    var timeout = $timeout(function () {
                        $ionicPopup.alert({
                            title: '抱歉~',
                            template: '网络不给力...'
                        }).then(function (result) {
                            if (result == true) {
                                $timeout.cancel(timeout);
                            }
                        });
                        $ionicLoading.hide();
                    }, 30000);
                }).then(function () {
                    $ionicLoading.hide();
                });
            //定义图层管理器
            $ionicModal.fromTemplateUrl('big_image', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.big_image = modal;
            });

            //打开图层
            $scope.openModal = function () {
                $scope.big_image.show();
            };
            //关闭图层
            $scope.closeModal = function () {
                $scope.big_image.hide();
            };

            $scope.return = function () {
                $state.go('myclass_students');
            }
        })
    })
    //我的老师页面控制器
    .controller('MyTeachersCtrl', function ($scope, $state, $http, $ionicLoading) {
        $ionicLoading.show({
            templateUrl: 'templates/loadingPage.html'
        });
        $scope.back = function () {
            $state.go('index_tab.study');
        }
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $http.get(httparr + '/MyTeachers', {
                params: {
                    classes: window.localStorage['Classes']
                }
            })
                .success(function (data) {
                    if (data == '') {
                        //alert('空的')
                    }
                    else {
                        $scope.teachers = data;
                    }
                })
                .error(function () {
                })
                .then(function () {
                    $ionicLoading.hide();
                })
        })
    })

    .controller('TeachersTabsCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $ionicPopup) {
        $scope.slideIndex = 0;
        $scope.show1 = '';
        $scope.show2 = '-outline';
        $scope.color1 = '#00B3B3';
        $scope.color2 = '#7d7d7d';
        $scope.title = '首页';
        //$state.go('teachers_tab.index.information');
        //$state.go('teachers_tab.index');
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
            if ($scope.slideIndex == 0) {
                $scope.title = '首页';
                $scope.show1 = '';
                $scope.show2 = '-outline';
                $scope.color1 = '#00B3B3';
                $scope.color2 = '#7d7d7d';
            }

            else if ($scope.slideIndex == 1) {
                $scope.title = '个人信息';
                $scope.show1 = '-outline';
                $scope.show2 = '';
                $scope.color1 = '#7d7d7d';
                $scope.color2 = '#00B3B3';
            }
        };
        if (window.localStorage['tea_Phone'] == '') {
            $scope.teracher = {}
            // An elaborate, custom popup
            $ionicPopup.show({
                title: '系统检测',
                subTitle: '您的账号还未绑定手机号码，将不能使用密码找回功能，请前往个人信息中绑定手机号',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '<b>绑定</b>', type: 'button-positive',
                        onTap: function (e) {
                            $scope.slideIndex = 1;
                            $scope.show1 = '-outline';
                            $scope.show2 = '';
                            $scope.color1 = '#7d7d7d';
                            $scope.color2 = '#00B3B3';
                            $scope.title = '个人信息';
                        }
                    }
                ]
            })
        }
        $scope.activeSlide = function (index) {
            $ionicSlideBoxDelegate.slide(index);
        };
    })

    //教师-首页九宫格控制器
    .controller('TeachersIndexCtrl', function ($scope, $state, $ionicPopup, $http, $ionicLoading, $timeout) {
        //$state.go('teachers_tab.index.information');
        $scope.screenheight = window.innerHeight - 90;
        $scope.jiugongeheight = $scope.screenheight / 3;
        $scope.sigongeheight = $scope.screenheight / 2;
        $scope.send = function () {
            $state.go('teacher_send');
        }
        $scope.course = function () {
            if (window.localStorage['tea_Purview'] == '1') {
                $state.go('teacher_Adjustreview');
            } else {
                $state.go('teachaer_CourseAdjust_tab.CourseAdjustment');
            }

        }
        $scope.attendance = function () {
            $state.go('teacher_attendance_college');
        }
        $scope.classmates = function () {
            $state.go('teacher_college');
        };
        $scope.leavereview = function () {
            $state.go('teacher_leavereview');
        }


    })

    //教师-个人信息控制器
    .controller('TeachersInformationCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $cordovaImagePicker, $http, $cordovaFileTransfer, $ionicLoading, $timeout) {
        $scope.new = {Infors: '', New_password: '', Sure_password: ''};
        $scope.check = 'none';
        if (window.localStorage['tea_Phone'] == '') {
            $scope.check = '';
        }
        else {
            $scope.check = 'none';
        }
        $ionicLoading.show({
            templateUrl: 'templates/loadingPage.html'
        });
        $http.get(httparr + '/teacher_person', {
            params: {Number: window.localStorage['Number']}
        })
            .success(function (data) {
                $scope.teacher = data;
            })
            .error(function (err) {
                var timeout = $timeout(function () {
                    $ionicPopup.alert({
                        title: '抱歉~',
                        template: '网络不给力...'
                    }).then(function (result) {
                        if (result == true) {
                            $timeout.cancel(timeout);
                        }
                    });
                    $ionicLoading.hide();
                }, 30000);
            }).then(function () {
                $ionicLoading.hide();
            })

        //以下为设置头像放大的方法
        //第一个为点击头像放大的图层模型
        $ionicModal.fromTemplateUrl('before', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_before = modal;
        });

        //以下为选择图片后的头像预览图层模型
        $ionicModal.fromTemplateUrl('after', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_after = modal;
        });

        //打开图层
        $scope.openModal = function () {
            if (i == 1) {
                $scope.modal_before.show();
            }
            else if (i == 2) {
                $scope.modal_after.show();
            }
        };
        //关闭图层
        $scope.closeModal = function () {
            $scope.modal_before.hide();
        };
        //清楚图层缓存
        $scope.$on('$destroy', function () {
            $scope.modal_before.remove();
        });

        //以下为点击头像放大
        $scope.showImage = function () {
            $scope.openModal(i = 1);
        };
        //    以下为点击更换头像的方法
        //$scope.imgSrc_before = "./img/JS.jpg";
        $scope.imgSrc_after = "";
        $scope.changePhoto = function () {
            var options = {
                maximumImagesCount: 1,
                width: 800,
                height: 800,
                quality: 80
            };
            $cordovaImagePicker.getPictures(options)
                //以下为选好图片后的方法
                .then(function (results) {
                    if (results[0] != null) {
                        $scope.openModal(i = 2);
                        $scope.imgSrc_after = results[0];
                        alert($scope.imgSrc_after)
                    }
                }, function (error) {
                });
        };

        //以下为选择头像后的方法
        $scope.return = function () {
            $scope.modal_after.hide();
        };
        //确定保存更换头像的方法
        $scope.save = function () {
            $scope.modal_after.hide();
            $scope.teacher.Photo = $scope.imgSrc_after;

            //以下为上传头像的相关参数
            var fileURL = $scope.imgSrc_after;
            var options = {
                fileKey: "file",
                fileName: window.localStorage['Number'] + '.jpg',
                mimeType: "text/plain",
                params: {photo_name: window.localStorage['Number']}
            };

            //上传头像
            $cordovaFileTransfer.upload(httparr + "/tea_files", fileURL, options)
                .then(function (data) {
                    $ionicLoading.hide();
                }, function (err) {
                    var timeout = $timeout(function () {
                        $ionicPopup.alert({
                            title: '抱歉~',
                            template: '网络不给力...'
                        }).then(function (result) {
                            if (result == true) {
                                $timeout.cancel(timeout);
                            }
                        });
                        $ionicLoading.hide();
                    }, 30000);
                }, function (progress) {
                });
        };
        //以下为个人信息修改资料
        $ionicModal.fromTemplateUrl('change_informations', function (modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
        $scope.open = function () {
            $scope.taskModal.show();
        }
        //关闭图层
        $scope.close = function () {
            $scope.taskModal.hide();
        };
        $scope.saveInfo = function () {
            $ionicPopup.alert({
                title: '提示',
                template: '点击'
            })
        };

        //    以下为点击修改QQ账号
        $scope.changeQQ = function () {
            $scope.some = {tag: 'QQ', message: '请输入新的QQ账号'};
            $scope.show = 'none';
            $scope.open();
        };

        //    以下为点击修改籍贯
        $scope.changeEamail = function () {
            $scope.some = {tag: '邮箱', message: '请输入您的邮箱'};
            $scope.show = 'none';
            $scope.open();
        };
        //以下为点击修改手机号
        $scope.changePhone = function () {
            $scope.some = {tag: '手机号码', message: '请输入您更换的手机号码'};
            $scope.show = 'none';
            $scope.open();
        };
        //以下为修改密码
        $scope.changePassword = function () {
            $scope.some = {tag: '密码', message: '请输入您旧的密码'};
            $scope.show = '';
            $scope.open();
        };
        //保存修改信息
        $scope.saveInfo = function () {
            if ($scope.some.tag != '手机号码' && $scope.some.tag != '密码') {
                if ($scope.new.Infors != '') {
                    $http.post(httparr + '/tea_change_informations',
                        {
                            tag: $scope.some.tag,
                            Infors: $scope.new.Infors,
                            Number: window.localStorage['Number']
                        })
                        .success(function (data) {
                            if (data == 'QQ') {
                                $scope.teacher.QQ = $scope.new.Infors;
                            } else {
                                $scope.teacher.Eamail = $scope.new.Infors;
                            }
                            $scope.new.Infors = '';
                            $scope.close();
                        })
                }
                else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: $scope.some.tag + '不能为空'
                    })
                }
            }
            else if ($scope.some.tag == '手机号码') {
                var ab = /^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/;

                if (ab.test($scope.new.Infors) == false) {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请输入正确的手机号码！'
                    })
                } else {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '温馨提示',
                        template: '您确定修改手机号吗?',
                        cancelText: '取消',
                        okText: '确定'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            $ionicLoading.show({
                                templateUrl: 'templates/loadingPage.html'
                            });
                            $http.post(httparr + '/tea_change_phone', {
                                Number: window.localStorage['Number'],
                                Phone: $scope.new.Infors
                            })
                                .success(function (data) {
                                    if (data == null) {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '此手机号已存在'
                                        })
                                    }
                                    else {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: '修改成功'
                                        })
                                    }
                                })
                                .error(function () {
                                    var timeout = $timeout(function () {
                                        $ionicPopup.alert({
                                            title: '抱歉~',
                                            template: '网络不给力...'
                                        }).then(function (result) {
                                            if (result == true) {
                                                $timeout.cancel(timeout);
                                            }
                                        });
                                        $ionicLoading.hide();
                                    }, 30000);
                                })
                                .then(function () {
                                    $ionicLoading.hide();
                                })
                        }
                    });
                }
            }
            else if ($scope.some.tag == '密码') {
                if ($scope.new.Infors != '' && $scope.new.New_password != '' && $scope.new.Sure_password != '') {

                    if ($scope.new.New_password != $scope.new.Sure_password) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '您输入的两次密码不相等'
                        })
                    }
                    else {
                        var confirmPopup = $ionicPopup.confirm({
                            title: '温馨提示',
                            template: '您确定修改密码吗?修改密码需要重新登陆!',
                            cancelText: '取消',
                            okText: '确定'
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                $ionicLoading.show({
                                    templateUrl: 'templates/loadingPage.html'
                                });
                                //首先判断输入的就密码是否存在
                                $http.post(httparr + '/tea_change_password', {
                                    Old_password: $scope.new.Infors,
                                    Number: window.localStorage['Number'],
                                    Sure_password: $scope.new.Sure_password
                                })
                                    .success(function (data) {
                                        if (data == null) {
                                            $ionicPopup.alert({
                                                title: '提示',
                                                template: '您输入旧的密码不正确'
                                            })
                                        }
                                        else {
                                            $ionicPopup.alert({
                                                title: '提示',
                                                template: '密码修改成功,请重新登陆'
                                            }).then(function (res) {
                                                if (res) {
                                                    window.localStorage['Number'] = '';
                                                    $scope.new.Infors = '';
                                                    $scope.close();
                                                    //jpushService.setTagsWithAlias('');
                                                    $state.go('login');
                                                }
                                            })
                                        }
                                    })
                                    .error(function () {
                                        var timeout = $timeout(function () {
                                            $ionicPopup.alert({
                                                title: '抱歉~',
                                                template: '网络不给力...'
                                            }).then(function (result) {
                                                if (result == true) {
                                                    $timeout.cancel(timeout);
                                                }
                                            });
                                            $ionicLoading.hide();
                                        }, 30000);
                                    })
                                    .then(function () {
                                        $ionicLoading.hide();
                                    })
                            }
                        });
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: '警告',
                        template: '请完善相关信息'
                    })
                }
            }
        };
        //    以下为注销用户
        $scope.cancellation = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '您确定要注销当前用户吗?',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    window.localStorage['Number'] = '';
                    window.localStorage['Name'] = '';
                    window.localStorage['tea_Phone'] = '';
                    window.localStorage['TeacherName'] = '';
                    window.localStorage['_id'] = '';
                    window.localStorage['ClassId'] = '';
                    window.localStorage['ProfessionId'] = '';
                    window.localStorage['CollegeId'] = '';
                    window.localStorage['Teacher'] = '';
                    window.localStorage['tea_Purview'] = '';
                    //jpushService.setTagsWithAlias('');
                    //window.localStorage['infor'] = '';
                    $state.go('login');
                }
                else {
                }
            });
        }
    })


    //信息发送控制器
    .controller('TeacherSendCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $http) {
        //
        //判断权限
        $http.get(httparr + '/CheckPurview', {params: {TeacherId: window.localStorage['_id']}})
            .success(function (data) {
                //
                $scope.Purview = data;
            }).error(function () {
                //
            }).then(function () {
                //
            })
        //
        if ($scope.Purview == '3') {
            //班主任权限

        } else if ($scope.Purview == '2') {
            //辅导员权限

        } else if ($scope.Purview == '1') {
            //校领导权限
        }
        $scope.college = '';
        $scope.profession = '';
        $scope.banji = '';
        $scope.cancel = function () {
            $scope.college = '';
            $scope.profession = '';
            $scope.banji = '';
            $scope.message.title = '';
            $scope.message.content = '';
        }
        $scope.back = function () {
            $state.go('teachers_tab.index');
        };
        //
        $scope.message = {
            college: '',
            profession: '',
            classes: '',
            title: '',
            content: '',
            activePlace: '',
            activeTime: ''
        };
        $http.get(httparr + '/GetInformation', {params: {tag: 'GetCollege'}})
            .success(function (data) {
                //
                $scope.schools = data;
            }).error(function (err) {
                //
            }).then(function () {
            });
        //学院
        $ionicModal.fromTemplateUrl('templates/send-college.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.sned_college = modal;
        });
        //专业
        $ionicModal.fromTemplateUrl('templates/send-professional.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.send_professional = modal;
        });
        //学院选择
        $scope.ChooseCollege = function () {
            $scope.sned_college.show();
        }
        //专业选择
        $scope.ChooseProfessional = function () {
            if ($scope.college == '') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '请先选择学院'
                });
            } else {
                $scope.send_professional.show();
            }
        }
        //班级选择
        $scope.ChooseClass = function (classes) {
            if (classes == '全专业') {
                //
                window.localStorage['ClassId'] = '全专业';
                $scope.banji = '全专业';
            } else {
                //
                window.localStorage['ClassId'] = classes._id;
                $scope.banji = classes.ClassName;
            }
        }
        $scope.Choose = function () {
            //
            if ($scope.college == '') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '请先选择学院'
                });
            } else if ($scope.profession == '') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '请先选择专业'
                });
            } else if ($scope.profession == '全院') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '已选择“全院”'
                });
            } else {
                $ionicPopup.confirm({
                    title: '选择班级',
                    templateUrl: 'templates/send-class.html',
                    scope: $scope,
                    //controller: 'MyPopupCtrl',
                    buttons: [
                        {
                            text: '取消',
                            onTap: function (e) {
                                //
                                $scope.banji = '';
                            }
                        },
                        {
                            text: '确定',
                            type: 'button-positive',
                            onTap: function (e) {
                                //
                            }
                        }
                    ]
                })
            }

        };
        $scope.close = function () {
            $scope.sned_college.hide();
            $scope.send_professional.hide();
        };
        $scope.determineCollege = function (college) {
            $scope.sned_college.hide();
            college = JSON.parse(college);
            $scope.college = college.CollegeName;
            window.localStorage['CollegeId'] = college._id;
            $http.get(httparr + '/GetInformation', {params: {tag: 'GetProfession', CollegeName: college.CollegeName}})
                .success(function (data) {
                    //
                    $scope.professions = data;
                }).error(function () {
                    //
                }).then();
        };
        $scope.determineProfession = function (profession) {
            $scope.send_professional.hide();
            if (profession == '全院') {
                //
                window.localStorage['ProfessionId'] = '全院';
                $scope.profession = '全院';
                $scope.banji = '';
                window.localStorage['ClassId'] = '全院';
            } else {
                //
                profession = JSON.parse(profession);
                $scope.profession = profession.ProfessionName;
                window.localStorage['ProfessionId'] = profession._id;
                $http.get(httparr + '/GetInformation', {
                    params: {
                        tag: 'GetClasses',
                        ProfessionName: profession.ProfessionName
                    }
                })
                    .success(function (data) {
                        //
                        $scope.classes = data;
                    }).error(function () {
                        //
                    }).then();
            }
        };
        //
        $scope.send = function () {
            //
            //$scope.college = '';
            //$scope.profession = '';
            //$scope.banji = '';
            if ($scope.college == '' && $scope.profession == '' && $scope.banji == '') {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请选择学院'
                });
            } else if ($scope.college != '' && $scope.profession == '' && $scope.banji == '') {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请选择专业'
                });
            } else if ($scope.profession != '' && $scope.profession != '全院' && $scope.banji == '') {
                $ionicPopup.alert({
                    title: '警告',
                    template: '请选择班级'
                });
            } else if ($scope.message.title == '' || $scope.message.content == '') {
                //
                $ionicPopup.alert({
                    title: '警告',
                    template: '请输入完整的信息'
                });
            } else {
                console.log(window.localStorage['ProfessionId'] + " " + window.localStorage['ClassId']);
                $http.post(httparr + '/SendMessage', {
                    //
                    Title: $scope.message.title,
                    Content: $scope.message.content,
                    //MessageDate: new Date(), // 信息发送的时间
                    Teacher: window.localStorage['Teacher'],
                    CollegeId: window.localStorage['CollegeId'], // 信息接受的学院
                    ProfessionId: window.localStorage['ProfessionId'], // 信息接受的专业
                    ClassId: window.localStorage['ClassId'] // 信息接受的班级
                    //ActivityDate: req.body.ActivityDate, // 活动时间(选填)
                    //Address: req.body.Address // 活动地点(选填)
                }).success(function (data) {
                    //
                    $ionicPopup.alert({
                        title: '恭喜',
                        template: data
                    });
                }).error(function () {
                    //
                }).then();
            }
            //

        };
    })
    //教师调课申请页面
    .controller('CourseAdjustmentCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $http) {
        //console.log(window.localStorage['TeacherName']);

        $scope.AdjustDate = '';
        $scope.choosesection = {
            value1: '',
            value2: '',
            value3: '',
            value4: ''
        };
        $scope.value1 = '';
        $scope.value2 = '';
        $scope.value3 = '';
        $scope.value4 = '';
        $scope.before_date = '';
        $scope.before_section = '';
        $scope.after_date = '';
        $scope.after_section = '';
        $scope.adjust = {
            why: '',
            class: '',
            beforeaddress: '',
            AdjustSection: '',
            afteraddress: '',
            AdjustSectionafter: '',
            address: '',
            classroom: '',
            subjects: '',
            teacherName: window.localStorage['TeacherName']
        };
        $scope.beforebuild = '';
        $scope.classroom = '';
        $scope.beforeclassroom = '';
        $scope.afterclassroom = '';
        $scope.beforestatrtime = [];//调课前开始时间
        $scope.beforeendtime = [];//调课前结束时间
        $scope.afterstarttime = [];//调课后开始时间
        $scope.afterendtime = [];//调课后结束时间
        //返回按钮控制器
        $scope.back = function () {
            $scope.adjust.why = '';
            $scope.adjust.class = '';
            $scope.adjust.AdjustSection = '';
            $scope.adjust.AdjustSectionafter = '';
            $scope.adjust.beforeplace = '';
            $scope.adjust.afterplace = '';
            $scope.adjust.beforeaddress = '';
            $scope.adjust.afteraddress = '';
            $scope.adjust.subjects = '';
            $state.go('teachers_tab.index');
        }
        //重置按钮控制器
        $scope.reset = function () {
            $scope.adjust.why = '';
            $scope.adjust.class = '';
            $scope.adjust.AdjustSection = '';
            $scope.adjust.AdjustSectionafter = '';
            $scope.adjust.beforeplace = '';
            $scope.adjust.afterplace = '';
            $scope.adjust.beforeaddress = '';
            $scope.adjust.afteraddress = '';
            $scope.adjust.subjects = '';

        }
        //提交按钮控制器
        $scope.submit = function () {
            //
            //$scope.beforebuild调课前教学楼
            //$scope.afterbuild调课后教学楼
            //beforeclassroom调课前上课教室
            //afterclassroom调课后上课教室
            if ($scope.adjust.why != '' && $scope.adjust.class != '' && $scope.adjust.AdjustSection != '' && $scope.adjust.AdjustSectionafter != '' && $scope.adjust.beforeaddress != '' && $scope.adjust.afteraddress != '' && $scope.adjust.subjects != '') {
                //$ionicPopup.alert({
                //    title: '抱歉',
                //    template: '调课原因:'+$scope.adjust.why+', 调课班级:'+$scope.adjust.class+', 调课前上课地点:'+$scope.afterstarttime+', 调课前上课时间:'+$scope.adjust.AdjustSection+', 调课后上课地点:'+$scope.adjust.afterplace+', 调课后上课时间:'+$scope.adjust.AdjustSectionafter
                //});
                $http.post(httparr + '/applyTransferClass', {
                    //
                    SubjectName: $scope.adjust.subjects,//调课课程名
                    //OriginalDate: $scope.before_date, // 调课前日期
                    OldBeginSubjectDate: $scope.beforestatrtime, // 调课前-起始时间
                    OldEndSubjectDate: $scope.beforeendtime, // 调课前-结束时间
                    //NewDate: $scope.after_date, // 调课后日期
                    NewBeginSubjectDate: $scope.afterstarttime, // 调课后-起始时间
                    NewEndSubjectDate: $scope.afterendtime, // 调课后-结束时间
                    OriginalAddressName: $scope.beforebuild, // 调课前-教学楼
                    NewAddressName: $scope.afterbuild, // 调课后-教学楼
                    OriginalClassRoom: $scope.beforeclassroom, // 调课前-教室
                    NewClassRoom: $scope.afterclassroom, // 调课后-教室
                    ClassId: $scope.ClassId, // 被调课的班级
                    ClassName: $scope.adjust.class, //班级名称
                    ApplyReason: $scope.adjust.why, // 调课原因
                    ApplyTeacherName: window.localStorage['TeacherName'], // 申请教师
                    OriginalSession: $scope.before_section, // 调课前-节次
                    NewSession: $scope.after_section, // 调课后-节次
                    ApplyTime: new Date(), // 申请时间
                    ApplyTeacher: window.localStorage['_id']
                }).success(function (data) {
                    $scope.alertText = data;
                    console.log(data);
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $ionicPopup.alert({
                        title: '提示',
                        template: $scope.alertText
                    });
                })
            } else {
                $ionicPopup.alert({
                    title: '抱歉',
                    template: '请完善调课信息'
                })
            }

        }
        //调课班级
        $ionicModal.fromTemplateUrl('templates/courseadjustclass.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.courseclass = modal;
        });
        //调课班级选择
        $scope.choosecourseclass = function () {
            $scope.courseclass.show();
            $http.get(httparr + '/getClassesName', {_id: window.localStorage['_id']})
                .success(function (data) {
                    $scope.ClassNames = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                });
        }
        //关闭调课班级选择页面
        $scope.close = function () {
            $scope.courseclass.hide();
            $scope.adjust.class = '';
        }
        //确定选择按钮
        $scope.determineclass = function (data) {
            $scope.courseclass.hide();
            console.log(data);
            var CLASS = JSON.parse(data);
            $scope.adjust.class = CLASS.ClassName;
            $scope.ClassId = CLASS._id;
            console.log($scope.adjust.class);
            console.log($scope.ClassId);

        }

        //调课前上课地点
        $ionicModal.fromTemplateUrl('templates/courseadjustaddress.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.courseaddress = modal;
        });
        //调课前上课地点选择
        $scope.choosecourseaddress = function () {
            $scope.courseaddress.show();
        }
        //关闭调课前上课地点选择页面
        $scope.closeaddress = function () {
            $scope.courseaddress.hide();
        }
        //确定选择调课前上课地点按钮
        $scope.determineaddress = function () {
            $scope.courseaddress.hide();
            $scope.beforeclassroom = $scope.adjust.classroom;
            $scope.adjust.beforeaddress = $scope.beforebuild + ' ' + $scope.adjust.classroom;
        }
        //调课前上课地点-教学楼选择
        $scope.choosecoursebuilding = function () {
            $ionicPopup.confirm({
                title: '选择教学楼',
                templateUrl: 'templates/courseadjustbuilding.html',
                scope: $scope,
                buttons: [
                    {
                        text: '取消',

                        onTap: function (e) {
                            //
                            $scope.beforebuild = '';
                        }
                    },
                    {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function (e) {
                            //
                            $scope.beforebuild = $scope.adjust.address
                        }
                    }
                ]
            })
        }

        //调课前上课时间
        $ionicModal.fromTemplateUrl('templates/coursebeforetime.html',
            function (modal) {
                $scope.befortime = modal;
            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        //打开调课前上课时间
        $scope.openbefortime = function () {
            $scope.choosesection.value1 = '';
            $scope.choosesection.value2 = '';
            $scope.choosesection.value3 = '';
            $scope.choosesection.value4 = '';
            $scope.beforestatrtime = [];//调课前开始时间
            $scope.beforeendtime = [];//调课前结束时间
            $scope.befortime.show();
        };
        //关闭调课前上课时间
        $scope.closebefortime = function () {
            $scope.before_date = '';
            $scope.before_section = '';
            $scope.adjust.AdjustSection = '';
            $scope.befortime.hide();
        };

        //调课日期选择器
        $ionicModal.fromTemplateUrl('templates/datemodal-adjust.html',
            function (modal) {
                $scope.datemodal_adjust = modal;
            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        $scope.opendateModal_adjust = function () {
            $scope.datemodal_adjust.show();
        };
        $scope.closedateModal = function (modal) {
            $scope.datemodal_adjust.hide();
            $scope.before_date = modal;
        };
        $scope.section = function () {
            //
            if ($scope.before_date == '') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '请先选择日期'
                });
            } else {
                $ionicPopup.confirm({
                    title: '选择节次',
                    templateUrl: 'templates/courseadjust.html',
                    scope: $scope,
                    //controller: 'MyPopupCtrl',
                    buttons: [
                        {
                            text: '取消',

                            onTap: function (e) {
                                //
                                $scope.before_section = '';
                            }
                        },
                        {
                            text: '确定',
                            type: 'button-positive',
                            onTap: function (e) {
                                //
                                $scope.before_section = $scope.choosesection.value1 + '  ' + $scope.choosesection.value2 + '  ' + $scope.choosesection.value3 + '  ' + $scope.choosesection.value4 + '节'
                                $scope.before_section = $scope.choosesection.value1 + '  ' + $scope.choosesection.value2 + '  ' + $scope.choosesection.value3 + '  ' + $scope.choosesection.value4 + '节'
                                $scope.value1 = $scope.choosesection.value1;
                                $scope.value2 = $scope.choosesection.value2;
                                $scope.value3 = $scope.choosesection.value3;
                                $scope.value4 = $scope.choosesection.value4;
                            }
                        }
                    ]
                })
            }

        };
        //确定调课前上课时间的选择
        $scope.determinetime = function () {
            $scope.adjust.AdjustSection = $scope.before_date + " " + $scope.before_section;
            if ($scope.value1 == '1-2 ') {
                $scope.beforestatrtime.push($scope.before_date + ' 8:10');
                $scope.beforeendtime.push($scope.before_date + ' 9:50');
            }
            if ($scope.value2 == '3-4 ') {
                $scope.beforestatrtime.push($scope.before_date + ' 10:10');
                $scope.beforeendtime.push($scope.before_date + ' 11:50');
            }
            if ($scope.value3 == '5-7 ') {
                $scope.beforestatrtime.push($scope.before_date + ' 14:30');
                $scope.beforeendtime.push($scope.before_date + ' 17:05');
            }
            if ($scope.value4 == '8-10 ') {
                $scope.beforestatrtime.push($scope.before_date + ' 19:00');
                $scope.beforeendtime.push($scope.before_date + ' 21:40');
            }
            $scope.befortime.hide();
        }

        //调课后上课地点
        $ionicModal.fromTemplateUrl('templates/courseadjustaddressafter.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.courseaddressafter = modal;
        });
        //调课后上课地点选择
        $scope.choosecourseaddressafter = function () {
            $scope.courseaddressafter.show();
        }
        //关闭调课后上课地点选择页面
        $scope.closeaddressafter = function () {
            $scope.courseaddressafter.hide();
        }
        //确定选择调课后上课地点按钮
        $scope.determineaddressafter = function () {
            $scope.courseaddressafter.hide();
            $scope.afterclassroom = $scope.adjust.classroom;
            $scope.adjust.afteraddress = $scope.beforebuild + ' ' + $scope.adjust.classroom;
        }
        //调课后上课地点-教学楼选择
        $scope.choosecoursebuilding = function () {
            $ionicPopup.confirm({
                title: '选择教学楼',
                templateUrl: 'templates/courseadjustbuilding.html',
                scope: $scope,
                buttons: [
                    {
                        text: '取消',

                        onTap: function (e) {
                            //
                            $scope.beforebuild = '';
                        }
                    },
                    {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function (e) {
                            //
                            $scope.beforebuild = $scope.adjust.address;
                            $scope.afterbuild = $scope.beforebuild;
                        }
                    }
                ]
            })
        }


        //调课后上课时间
        $ionicModal.fromTemplateUrl('templates/courseaftertime.html',
            function (modal) {
                $scope.aftertime = modal;
            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        //打开调课后上课时间
        $scope.openaftertime = function () {
            $scope.choosesection.value1 = '';
            $scope.choosesection.value2 = '';
            $scope.choosesection.value3 = '';
            $scope.choosesection.value4 = '';
            $scope.afterstarttime = [];//调课后开始时间
            $scope.afterendtime = [];//调课后结束时间
            $scope.aftertime.show();
        };
        //关闭调课后上课时间
        $scope.closeaftertime = function () {
            $scope.after_date = '';
            $scope.after_section = '';
            $scope.adjust.AdjustSectionafter = '';
            $scope.aftertime.hide();
        };
        //调课后日期选择器
        $ionicModal.fromTemplateUrl('templates/datemodal-adjustafter.html',
            function (modal) {
                $scope.datemodal_adjustafter = modal;
            },
            {
                // Use our scope for the scope of the modal to keep it simple
                scope: $scope,
                // The animation we want to use for the modal entrance
                animation: 'slide-in-up'
            }
        );
        $scope.opendateModal_adjustafter = function () {
            $scope.datemodal_adjustafter.show();
        };
        $scope.closedateModalafter = function (modal) {
            $scope.datemodal_adjustafter.hide();
            $scope.after_date = modal;
        };
        $scope.sectionafter = function () {
            //
            if ($scope.after_date == '') {
                $ionicPopup.alert({
                    title: '抱歉~',
                    template: '请先选择日期'
                });
            } else {
                $ionicPopup.confirm({
                    title: '选择节次',
                    templateUrl: 'templates/courseadjust.html',
                    scope: $scope,
                    //controller: 'MyPopupCtrl',
                    buttons: [
                        {
                            text: '取消',
                            onTap: function (e) {
                                //
                                $scope.after_section = '';
                            }
                        },
                        {
                            text: '确定',
                            type: 'button-positive',
                            onTap: function (e) {
                                //
                                $scope.after_section = $scope.choosesection.value1 + '  ' + $scope.choosesection.value2 + '  ' + $scope.choosesection.value3 + '  ' + $scope.choosesection.value4 + '节'
                                $scope.value1 = $scope.choosesection.value1;
                                $scope.value2 = $scope.choosesection.value2;
                                $scope.value3 = $scope.choosesection.value3;
                                $scope.value4 = $scope.choosesection.value4;
                            }
                        }
                    ]
                })
            }

        };
        //确定调课后上课时间的选择
        $scope.determinetimeafter = function () {
            $scope.adjust.AdjustSectionafter = $scope.after_date + " " + $scope.after_section;
            if ($scope.value1 == '1-2 ') {
                $scope.afterstarttime.push($scope.after_date + ' 8:10');
                $scope.afterendtime.push($scope.after_date + ' 9:50');
            }
            if ($scope.value2 == '3-4 ') {
                $scope.afterstarttime.push($scope.after_date + ' 10:10');
                $scope.afterendtime.push($scope.after_date + ' 11:50');
            }
            if ($scope.value3 == '5-7 ') {
                $scope.afterstarttime.push($scope.after_date + ' 14:30');
                $scope.afterendtime.push($scope.after_date + ' 17:05');
            }
            if ($scope.value4 == '8-10 ') {
                $scope.afterstarttime.push($scope.after_date + ' 19:00');
                $scope.afterendtime.push($scope.after_date + ' 21:40');
            }
            $scope.aftertime.hide();
        }
        $scope.close = function () {
            $scope.datemodal_adjust.hide();
            $scope.datemodal_adjustafter.hide();
        }

    })
    //教师调课申请情况页面
    .controller('CourseAdjustSituationCtrl', function ($scope, $state, $http) {
        $scope.back = function () {
            $state.go('teachers_tab.index');
        }
        //
        $http.get(httparr + '/viewResult', {params: {ApplyTeacher: window.localStorage['_id']}})
            .success(function (data) {
                //
                $scope.transferclasses = data;
            }).error(function (err) {
                //
            }).then(function () {
                //
            });
        //$scope.teacher_name//教师名字
        //$scope.adjustclass//调课班级
        //$scope.adjustwhy//调课原因
        //$scope.AdjustSection//调课前上课时间
        //$scope.beforeplace//调课前上课地点
        //$scope.AdjustSectionafter//调课后上课时间
        //$scope.afterplace//调课后上课地点
        //如果审核通过则：
        //$scope.situation = 'situation_pass';
        //$scope.situation_text = '已通过';
        ////如果正在审核中则：
        //$scope.situation = 'situation_review';
        //$scope.situation_text = '审核中…';
        //如果被驳回
        //$scope.situation = 'situation_rejected';
        //$scope.situation_text = '申请被驳回';
    })
//老师页面、

//老师页面的相关信息

//老师页面、学院列表
    .controller('teacher_collegeCtrl', function ($scope, $state, $http, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.return = function () {
                $state.go('teachers_tab.index');
            }

            $http.get(httparr + '/tea_college')
                .success(function (data) {
                    $scope.colleges = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })
//老师页面、专业列表
    .controller('teacher_professionCtrl', function ($scope, $stateParams, $state, $http, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.collegeId = $stateParams.ColId;

            $http.get(httparr + '/tea_profession', {
                params: {
                    collegeId: $scope.collegeId
                }
            })
                .success(function (data) {
                    $scope.professions = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })
//    老师页面、班级列表
    .controller('teacher_classCtrl', function ($scope, $state, $http, $ionicPopup, $stateParams, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.professionId = $stateParams.ProId;

            $http.get(httparr + '/tea_class', {
                params: {professionId: $scope.professionId}
            })
                .success(function (data) {
                    $scope.classes = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })

//老师页面、班级成员列表
    .controller('teacher_studentsCtrl', function ($scope, $state, $http, $stateParams, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.classId = $stateParams.ClaId;

            $http.get(httparr + '/tea_student', {
                params: {ClassId: $stateParams.ClaId}
            })
                .success(function (data) {
                    $scope.students = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })

//老师页面、班级成员详细信息
    .controller('teacher_stu_presonCtrl', function ($scope, $state, $http, $stateParams, $ionicModal, $ionicPopup, $ionicLoading, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $http.get(httparr + '/tea_stu_preson', {
                params: {StudentId: $stateParams.StuId}
            })
                .success(function (data) {
                    $scope.student = data;
                })
                .error(function () {
                })
                .then(function () {
                })

            //定义图层管理器
            $ionicModal.fromTemplateUrl('big_image', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.big_image = modal;
            });

            //打开图层
            $scope.openModal = function () {
                $scope.big_image.show();
            };
            //关闭图层
            $scope.closeModal = function () {
                $scope.big_image.hide();
            };
        })
    })
    //教师-请假审核界面控制器
    .controller('LeaveReviewCtrl', function ($scope, $state, $ionicPopup, $http) {
        //
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.return = function () {
                $state.go('teachers_tab.index');
            }
            $http.get(httparr + '/checkVacation', {params: {AgreeTeacher: window.localStorage['_id']}})
                .success(function (data) {
                    //
                    $scope.vacations = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                });
            $scope.doRefresh = function () {
                //
                $http.get(httparr + '/checkVacation', {params: {AgreeTeacher: window.localStorage['_id']}})
                    .success(function (data) {
                        //
                        $scope.vacations = data;
                    }).error(function (err) {
                        //
                    }).then(function () {
                        //
                        $scope.$broadcast('scroll.refreshComplete');
                    });
            };


        })
    })
    //教师-请假审核详情页面
    .controller('LeaveReviewDetailsCtrl', function ($scope, $state, $ionicPopup, $http, $stateParams) {
        //
        //$scope.student.name //姓名
        //$scope.student.class //所属班级
        //$scope.student.datepicker_start //请假开始时间
        //$scope.student.datepicker_end //请假结束时间
        //$scope.student.why //请假理由
        //
        $scope.status = '-1';
        console.log($stateParams.LeaveId.split(" "));
        var ids = $stateParams.LeaveId.split(" ");
        $scope.VacationId = ids[0];
        $scope.ClassId = ids[1];
        $http.get(httparr + '/checkVacation', {params: {_id: $scope.VacationId}})
            .success(function (data) {
                //
                $scope.vacations = data;
            }).error(function (err) {
                //
            }).then(function () {
                //
            });
        //
        $http.get(httparr + '/checkVacation', {params: {_id: $scope.ClassId, tag: 'GetClass'}})
            .success(function (data) {
                //
                $scope.classes = data;
            }).error(function (err) {
                //
            }).then(function () {
                //
            });
        //驳回请假按钮事件
        $scope.rejected = function () {
            $ionicPopup.confirm({
                title: '警告',
                template: '确定驳回该请假吗？',
                cancelText: '取消',
                okText: '确定'
            }).then(function (res) {
                if (res) {
                    //点击了确定
                    console.log('驳回请假');
                    $http.put(httparr + '/verify', {_id: $scope.VacationId, Status: 0})
                        .success(function (data) {
                            //
                            $scope.status = '0'
                            $scope.show = !$scope.show;
                        }).error(function (err) {
                            //
                        }).then(function () {
                            //

                        });


                } else {
                    //点击了取消
                    console.log('取消');
                }
            })
        }
        //同意请假按钮事件
        $scope.Agreed = function () {
            $ionicPopup.confirm({
                title: '警告',
                template: '确定同意该请假吗？',
                cancelText: '取消',
                okText: '确定'
            }).then(function (res) {
                if (res) {
                    //点击了确定
                    console.log('同意请假');
                    $http.put(httparr + '/verify', {_id: $scope.VacationId, Status: 1})
                        .success(function (data) {
                            //
                            $scope.show = !$scope.show;
                            $scope.status = '1'
                        }).error(function (err) {
                            //
                        }).then(function () {
                            //
                        });
                } else {
                    //点击了取消
                    console.log('取消');
                }
            })
        }
    })
    //领导审核调课页面控制器
    .controller('AdjustReviewCtrl', function ($scope, $state, $http) {
        $scope.return = function () {
            $state.go('teachers_tab.index')
        };
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $http.get(httparr + '/viewTransferClass', {params: {}})
                .success(function (data) {
                    //
                    $scope.transferclasses = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    //
                });
        })
        $scope.doRefresh = function () {
            //
            $http.get(httparr + '/viewTransferClass', {params: {}})
                .success(function (data) {
                    //
                    $scope.transferclasses = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };
    })
    //调课申请详情页面控制器
    .controller('AdjustReviewDetailsCtrl', function ($scope, $state, $stateParams, $http, $ionicPopup) {
        $scope.transferclassId = $stateParams.AdjustId;
        $http.put(httparr + '/verifyTransferClass', {_id: $scope.transferclassId})
            .success(function (data) {
                //
                $scope.transferclasses = data;
                $scope.Status = data.Status;
                if ($scope.Status == '0' || $scope.Status == '1') {
                    $scope.show = !$scope.show;
                } else {
                }

            }).error(function (err) {
                //
            }).then(function () {
                //
            });
        //
        $scope.rejected = function () {
            //
            $ionicPopup.confirm({
                title: '警告',
                template: '确定驳回该申请吗？驳回后无法再次修改',
                okText: '确定',
                cancelText: '取消'
            }).then(function (res) {
                if (res) {
                    $http.put(httparr + '/verifyTransferClass', {_id: $scope.transferclassId, Status: 0})
                        .success(function (data) {
                            //
                            if (data) {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '已驳回'
                                });
                            } else {
                            }
                        }).error(function (err) {
                            //
                        }).then(function () {
                            //
                        });
                    $scope.Status = '0';
                    $scope.show = !$scope.show;
                } else {

                }
            })

        };
        $scope.aggree = function () {
            //
            $ionicPopup.confirm({
                title: '警告',
                template: '确定同意该申请吗？同意后无法再次修改',
                okText: '确定',
                cancelText: '取消'
            }).then(function (res) {
                if (res) {
                    $http.put(httparr + '/verifyTransferClass', {_id: $scope.transferclassId, Status: 1})
                        .success(function (data) {
                            //
                            if (data) {
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '已同意'
                                });
                            } else {
                            }
                        }).error(function (err) {
                            //
                        }).then(function () {
                            //
                        });
                    $scope.Status = '1';
                    $scope.show = !$scope.show;
                } else {

                }
            })
        };
    })

    //教师权限为辅导员以上时的考勤控制器
    //读取学院列表控制器
    .controller('AttCollegeCtrl', function ($scope, $state, $http) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $http.get(httparr + '/tea_college')
                .success(function (data) {
                    $scope.colleges = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
        $scope.return = function () {
            $state.go('teachers_tab.index');
        }
    })
    //读取专业列表控制器
    .controller('AttProfessionCtrl', function ($scope, $state, $http, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.collegeId = $stateParams.ColId;

            $http.get(httparr + '/tea_profession', {
                params: {
                    collegeId: $scope.collegeId
                }
            })
                .success(function (data) {
                    $scope.professions = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })
    //读取班级列表控制器
    .controller('AttClassCtrl', function ($scope, $state, $http, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.professionId = $stateParams.ProId;

            $http.get(httparr + '/tea_class', {
                params: {professionId: $scope.professionId}
            })
                .success(function (data) {
                    $scope.classes = data;
                })
                .error(function () {
                })
                .then(function () {
                })
        })
    })
    //读取班级成员列表控制器
    .controller('AttPersonalCtrl', function ($scope, $state, $http, $stateParams, $ionicLoading) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            $scope.classId = $stateParams.ClaId;
            $ionicLoading.show({
                templateUrl: 'templates/loadingPage.html'
            });
            $http.get(httparr + '/getSignIn', {params: {ClassId: $stateParams.ClaId}})
                .success(function (data) {
                    //
                    //alert('11'+data);
                    $scope.attendance_students = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                    $ionicLoading.hide();
                });
        })

    })
    //读取班级成员旷课详情控制器
    .controller('AttDetailsCtrl', function ($scope, $state, $http, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            var str = $stateParams.PreId;
            str = str.split(';');
            $scope.name = str[1];
            $http.get(httparr + '/tea_stu_preson', {params: {StudentId: str[0]}})
                .success(function (data) {
                    //
                    $scope.Stu_Photo = data.Photo;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                });
            $http.get(httparr + '/StudentViewCtnot', {params: {StudentId: str[0]}})
                .success(function (data) {
                    //
                    $scope.attendance_studentsInfors = data;
                }).error(function (err) {

                }).then(function () {

                });
        })
    })


    //教师权限为3的考勤详情
    //考勤详情
    .controller('AttendanceCtrl', function ($scope, $state, $http) {
        $http.get(httparr + '/getSignIn', {params: {}})
            .success(function (data) {
                //
                if (data) {
                    console.log(data);
                    $scope.attendance_students = data;
                } else {
                    $scope.atten = '1';
                }

            }).error(function (err) {
                //
            }).then(function () {
                //
            });


        $scope.return = function () {
            $state.go('teachers_tab.index');
        }
    })
    //考勤旷课详情页面
    .controller('AttendanceDetailsCtrl', function ($stateParams, $scope, $http) {
        $scope.$on('$ionicView.beforeEnter', function (viewInfo, state) {
            var str = $stateParams.PreId;
            str = str.split(';');
            $scope.name = str[1];
            $http.get(httparr + '/tea_stu_preson', {params: {StudentId: str[0]}})
                .success(function (data) {
                    //
                    $scope.Stu_Photo = data.Photo;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                });
            $http.get(httparr + '/getSignInfor', {params: {StudentId: str[0]}})
                .success(function (data) {
                    //
                    $scope.attendance_studentsInfors = data;
                }).error(function (err) {
                    //
                }).then(function () {
                    //
                });
        })
    })

    .controller('FaceCtrl', function ($scope, $http, $ionicPopup, $ionicLoading) {
        //
        $scope.scanBlue = function () {
            //
            $ionicLoading.show();
            ble.scanBlue("E-Beacon_73378A", function (message) {


                if (message == "success") {
                    alert(message);
                    $ionicLoading.hide();
                } else {
                    alert(message);
                    $ionicLoading.hide();
                }
            });
        };
        //
        $scope.name = "linhehe47";
        $scope.register = function () {
            //
            var success = function (msg) {
                if (JSON.parse(msg).result == 'success') {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '注册成功' + "图片路径为：" + JSON.parse(msg).imagePath
                    });
                }
                $scope.currentValue = msg;
                $scope.$apply();
            };

            var failure = function (error) {
                alert(error);
            };

            face.register($scope.name, success, failure);
            // alert(JSON.stringify(cordova.plugins));
            //WifiHot.coolMethod("herer",function(were){},function(error){});;
            //  window.WifiHot.coolMethod("herer");
        };
        $scope.verify = function () {

            var success = function (msg) {
                if (JSON.parse(msg).result == 'success') {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '验证通过'
                    });
                } else {
                    $ionicPopup.alert({
                        title: '提示',
                        template: JSON.parse(msg).result
                    });
                }
                $scope.currentValue = msg;
                $scope.$apply();
            };

            var failure = function (error) {
                alert(error);
            };

            face.verify($scope.name, success, failure);

        };
        $scope.searchRegister = function () {
            $ionicLoading.show();
            var success = function (msg) {
                $ionicLoading.hide();
                //var data = msg;
                //alert(JSON.parse(data));
                if (JSON.parse(msg).result == 'success') {
                    $ionicPopup.alert({
                        title: '抱歉',
                        template: '您已经注册过了'
                    });
                } else if (JSON.parse(msg).result == 'fail') {
                    $ionicPopup.alert({
                        title: '抱歉',
                        template: '您还未注册'
                    });
                }
                $scope.currentValue = msg;
                $scope.$apply();
            };

            var failure = function (error) {
                alert(error);
            };

            face.search('jieyufeng', success, failure);
        };
    })