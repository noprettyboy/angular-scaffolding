/**
 * @file dialog directive
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import './upload.less';

class UploadDirective {
    constructor($http) {
        this.restrict = 'EA';
        this.transclude = true;
        this.scope = {
            uploadData: '=',
            // callback: '=',
            myModel: '='
        };
        this.template = require('./upload.html');
        this.$http = $http;
        this.app = angular.module('app');
    }

    link(scope, element, attrs) {
        // scope.uploadInfo = angular.merge({}, {
        //     status: (scope.myModel === undefined || scope.myModel === null
        //         || scope.myModel === '') ? 'init' : 'successAndWatch',
        //     browserBtnAble: true,
        //     uploadBtnAble: false,
        //     fileType: [],
        //     filePath: (scope.myModel === undefined || scope.myModel === null
        //         || scope.myModel === '') ? '请选择文件!' : scope.myModel,
        //     note: null
        // }, scope.uploadData);

        scope.browserFile = (event) => {
            // console.log(event.target);
            $('.file-elem', element).trigger('click');
        };
        scope.uploadFile = (event) => {
            let self = this;
            // scope.uploadFunc(event);
            scope.uploadData.browserBtnAble = false;
            scope.uploadData.uploadBtnAble = false;
            scope.uploadData.note = '上传中...';
            let formData = new FormData();
            let file = $('.file-elem', element)[0].files[0];
            formData.append(scope.uploadData.name || 'defaultName', file);
            self.$http({
                method: 'POST',
                url: scope.uploadData.url,
                data: formData,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            })
            .then(
                function (response) {
                    let dataRes = response.data;
                    switch (dataRes.status) {
                        case 200:
                            scope.uploadData.browserBtnAble = true;
                            scope.uploadData.uploadBtnAble = false;
                            // scope.uploadData.filePath
                            scope.uploadData.note = '上传成功!';
                            scope.uploadData.callback && scope.uploadData.callback(dataRes, scope);
                            break;
                        default:
                            self.app.showPopup(dataRes.message || '未知错误');
                            // errorCallback && errorCallback(dataRes.message || '未知错误');
                            // _onError(that.getInfoWithString(response.message), status);
                            break;
                    }
                    // that.app.toggleLoading(false);
                },
                function (data, status) {
                    scope.uploadData.browserBtnAble = true;
                    scope.uploadData.uploadBtnAble = true;
                    scope.uploadData.note = '上传失败,请重新上传!';
                    self.app.showPopup(data || '未知错误');
                }
            );
        };
        $('.file-elem', element).on('change', (event) => {
            let filePath = event.target.value;
            event.target.value = null;
            scope.$apply(() => {
                scope.myModel = null;
                scope.uploadData.filePath = null;
                if (scope.uploadData.fileType.length > 0) {
                    let fileExtensionName = filePath.split('.').pop().toLowerCase();
                    let isCorrectType = scope.uploadData.fileType.indexOf(fileExtensionName);
                    if (isCorrectType < 0) {
                        scope.uploadData.note = '文件格式不对,请重新选择!';
                        scope.uploadData.uploadBtnAble = false;
                        scope.uploadData.status = 'error';
                        return false;
                    }
                }
                scope.uploadData.filePath = filePath;
                scope.uploadData.uploadBtnAble = true;
                scope.uploadData.status = 'correct';
            });
        });
        scope.getFileName = (pm) => {
            return pm.substr(pm.lastIndexOf('/') + 1);
        };
        scope.watchImg = (event, uploadData) => {
            let outRelyView = uploadData.outRelyDom === undefined ? $('html body') : $(uploadData.outRelyDom);
            let outBoundRect = outRelyView[0].getBoundingClientRect();
            let succWatchView = $('.success-watch', element);
            let imgWatchView = $('.img-detail', element);
            let succWatchViewBoundRect = succWatchView[0].getBoundingClientRect();
            // let imgWatchViewBoundRect = imgWatchView[0].getBoundingClientRect();
            let img = new Image();
            img.src = uploadData.filePath;
            img.onload = e => {
                $('img', imgWatchView).attr('src', uploadData.filePath);
            };
            if (succWatchViewBoundRect.bottom + 400 + 10 > outBoundRect.bottom) {
                imgWatchView.css({'margin-top': '-430px'});
            }
            imgWatchView.css({display: 'block'});
        };
        scope.hideImg = (event) => {
            let imgWatchView = $('.img-detail', element);
            imgWatchView.css({display: 'none'});
        };
    }

    static getInstance($http) {
        UploadDirective.instance = new UploadDirective($http);
        return UploadDirective.instance;
    }
}

UploadDirective.getInstance.$inject = ['$http'];

module.exports = UploadDirective;



