/**
 * @file app.js
 * @function entry
 * @author zhangzengwei@baidu.com
 */
import 'bootstrap';
import 'bootstrap/less/bootstrap.less';
// import 'angular-material/angular-material.css';
// import './style/foundation-icons/foundation-icons.css';
import 'font-awesome/css/font-awesome.css';
import './style/common.less';
import jquery from 'jquery';
import angular from 'angular';
import 'angular-animate';
import 'angular-aria';
import 'angular-messages';
import 'angular-material';
import 'oclazyload';
import 'angular-sanitize';
import uirouter from 'angular-ui-router';
import basemodel from './services/BaseModel';
import servicesConfig from './servicesConfig';
import config from './app.config';
import shell from './features/shell';
import index from './features/index';
import wall from './features/wall';
import mobile from './features/mobile';
import pc from './features/pc';
import platform from './features/platform';

window.$ = jquery;
let app = angular.module('app', [
    uirouter, 'oc.lazyLoad', 'ngMaterial', 'ngSanitize',
    basemodel, shell, index, wall, mobile, pc, platform
]);

app.config(config)
    .value('SERVICESCONFIG', servicesConfig)
    .run(
        [
            '$http',
            '$rootScope',
            '$timeout',
            function ($http, $rootScope, $timeout) {
                /**
                 * 全局popup提示显示影藏逻辑
                 * @type {Boolean}
                 */
                angular.extend($rootScope, {
                    showLoading: false,
                    showGlobalPopup: false,
                    noAuth: false,
                    title: '友情提示',
                    popupMsg: 'Hey man something wrong....',
                    contentStyle: {
                        minHeight: window.innerHeight - 60
                    },
                    onConfirm() {
                        app.closePopup();
                        if ($rootScope.confirmHandle) {
                            $rootScope.confirmHandle();
                            delete $rootScope.confirmHandle;
                        }
                        // else {
                        //     app.closePopup();
                        // }
                    }
                });

                $rootScope.$watch('showGlobalPopup', function (newValue, oldValue) {
                        $('#error-message').modal(newValue ? 'show' : 'hide').parent().show();
                    }
                );

                $rootScope.$on('$stateChangeStart', function (evt, toState) {
                    $rootScope.isIndexView = toState.url === 'index';
                });
                $rootScope.$on('$stateChangeSuccess', function (evt, toState) {
                    $rootScope.curRouterName = toState.name;
                });

                $rootScope.closePopup = function () {
                    $rootScope.showGlobalPopup = false;
                };

                app.closePopup = $rootScope.closePopup;

                app.toggleLoading = function (isShow) {
                    $rootScope.showLoading = angular.isUndefined(isShow) ? !$rootScope.showLoading : isShow;
                };

                // app.showPopup = function (msg, noAuth) {
                //     $rootScope.showGlobalPopup = true;
                //     $rootScope.popupMsg = msg || $rootScope.popupMsg;
                //     $rootScope.noAuth = !!noAuth;
                // };
                app.showPopup = function (msg, noAction) {
                    $rootScope.showGlobalPopup = true;
                    $rootScope.popupMsg = msg || $rootScope.popupMsg;
                    $rootScope.noAction = noAction === undefined ? 'confirm' : noAction;
                };

                app.showConfirm = function (msg, callback) {
                    $rootScope.confirmHandle = callback || app.closePopup;
                    app.showPopup(msg, false);
                };

                app.showNote = function (msg, noAction) {
                    if (msg !== undefined && noAction) {
                        $rootScope.noAction = true;
                        $rootScope.showGlobalPopup = true;
                        $rootScope.popupMsg = msg || $rootScope.popupMsg;
                        $('#error-message .modal-body').css({
                            'color': '#FFA500'
                        });
                        $timeout(() => {
                            $rootScope.showGlobalPopup = false;
                            $rootScope.noAction = false;
                            $('#error-message .modal-body').css({
                                'color': '#333'
                            });
                        }, 2500);
                    }
                };

                app.forward = function (hash) {
                    location.hash = hash;
                };

                app.getUserInfo = function (key) {
                    return key ? $rootScope.userInfo[key] : $rootScope.userInfo;
                };

                // global error handle
                window.onerror = function (errorMsg, filePath, line, col, errorObj) {
                    app.showPopup(errorMsg + '\n' + filePath + '\nline:' + line + ' col:' + col);
                };
                window.onresize = function () {
                    $rootScope.$broadcast('onresize', 'resize');
                };

                // 获取用户信息name & token
                $.ajax({
                    method: 'get',
                    async: false,
                    url: servicesConfig.USER.getUser.url,
                    contentType: 'application/json',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }).then(function (data) {
                    switch (data.success) {
                        case false: {
                            if (data.message === 'Username is null or have not login!') {
                                let tempData = {
                                    level: 1,
                                    product: '',
                                    username: 'zhangzengwei',
                                    email: 'zhangzengwei@baidu.com'
                                };
                                app.userInfo = tempData;
                                $rootScope.userInfo = tempData;
                            }
                            break;
                        }
                        case 200: {
                            let curMsg = data.message;
                            let goToReg = /^\[ajax-redirected\]=>(.*)/g;
                            let matchArr = goToReg.exec(curMsg);
                            if (matchArr !== null) {
                                window.location.href = matchArr[1];
                            } else {
                                app.userInfo = data.data;
                                $rootScope.userInfo = data.data;
                                $rootScope.userInfo.password = data.data.pwd;
                                // $rootScope.userInfo.password = '3c6f6d5a4b1ede209e2113b92c7e7dd5';
                            }
                            break;
                        }
                        case true: {
                            let curMsg = data.message;
                            let goToReg = /^\[ajax-redirected\]=>(.*)/g;
                            let matchArr = goToReg.exec(curMsg);
                            if (matchArr !== null) {
                                window.location.href = matchArr[1];
                            } else {
                                app.userInfo = data.data;
                                $rootScope.userInfo = data.data;
                                $rootScope.userInfo.password = data.data.pwd;
                                // $rootScope.userInfo.password = '3c6f6d5a4b1ede209e2113b92c7e7dd5';
                            }
                            break;
                        }
                        default: {
                            app.showPopup(data.message || '未知错误');
                            break;
                        }
                    }
                    // ajax-redirected 302重定向
                    // if (data.status === 0) {
                    //     app.userInfo = data.result;
                    //     $rootScope.userInfo = data.result;
                    // }
                    // else if (data.status === 2 || /ajax-redirected/i.test(data.message)) {
                    //     location.reload();
                    // }
                    // else if (data.status === 3) {
                    //     app.showPopup(data.message || '无权限', true);
                    // }
                    // else {
                    //     app.showPopup(data.message || '未知错误');
                    // }
                });
            }
        ]
    );

