/**
 * @file BaseModel
 * @author zhangyou04@baidu.com
 */
import angular from 'angular';

class BaseModel {
    constructor($http, config) {
        this.$http = $http;
        this.config = config || {};
        this.initMethodsByConfig(this.config);
        this.app = angular.module('app');
    }

    excute(config, callback, errorCallback, oCtx) {
        let that = this;
        // let _onError = errorCallback || this.errorHandle.bind(this);

        that.app.toggleLoading(true && config.showLoading !== false);
        that.$http(config).then(
            function (response) {
                let dataRes = null;
                console.log(typeof response.data);
                if (typeof response.data === 'object') {
                    dataRes = response.data;
                } else {
                    let tempJsonData = {
                        success: true,
                        message: 'ok',
                        data: response.data.toString('utf8', 0)
                    };
                    dataRes = tempJsonData;
                }
                // let dataRes = response.data;
                switch (dataRes.success) {
                    case true:
                        callback && callback.call(oCtx, dataRes.data || dataRes.result, dataRes);
                        break;
                    default:
                        that.app.showPopup(dataRes.message || '未知错误');
                        errorCallback && errorCallback(dataRes.message || '未知错误');
                        // _onError(that.getInfoWithString(response.message), status);
                        break;
                }
                that.app.toggleLoading(false);
            },
            function (data, status) {
                that.errorHandle(that.getErrorMsg(data, status), status);
                that.app.toggleLoading(false);
            }
        );
        // that.$http(config).success(function (response) {
        //     switch (response.status) {
        //         case true: //success
        //             callback && callback.call(oCtx, response.data || response.result, response);
        //             break;
        //         default: // other error
        //             that.app.showPopup(response.info || '未知错误');
        //             errorCallback && errorCallback(response.info || '未知错误');
        //             // _onError(that.getInfoWithString(response.message), status);
        //             break;
        //     }
        //     that.app.toggleLoading(false);
        // }).error(function (data, status) {
        //     that.errorHandle(that.getErrorMsg(data, status), status);
        //     that.app.toggleLoading(false);
        // });
    }

    errorHandle(data, status, headers, config) {
        this.app.showPopup(this.getErrorMsg(data, status, headers, config));
        this.app.toggleLoading(false);
    }

    getErrorMsg(data, status, headers, config) {
        let errorMsg = 'status: ' + status + '\n';

        errorMsg += angular.isObject(data) ? JSON.stringify(data, null, 4) : data;

        return errorMsg;
    }

    getInfoWithString(info) {
        let msg = '';

        if (angular.isObject(info)) {
            for (let key in info) {
                msg += info[key] + ';';
            }
            msg = msg.substring(0, msg.length - 1);
        }
        else {
            msg = info;
        }

        return msg;
    }

    buildUrl(url, params) {
        let hasParamReg = /{.*}/i;

        // url += (url.indexOf('?') > -1 ? '&' : '?') + 'username={username}&token={token}';
        // angular.extend(params, app.userInfo);

        if (hasParamReg.test(url)) {
            for (let key in params) {
                let reg = new RegExp('{' + key + '}', 'i');
                if (hasParamReg.test(url) && reg.test(url)) {
                    url = url.replace(reg, params[key]);
                    delete params[key];
                }
            }
        }
        return url;
    }

    initMethodsByConfig(config) {
        let that = this;
        let value = '';

        for (let key in config) {
            value = config[key];

            if (angular.isObject(value)) {
                this[key] = (function (value) {
                    return function (params, callback, errorCallback, oCtx) {
                        let showLoading = (params || {}).showLoading;
                        delete params.showLoading;
                        params = angular.copy(params);
                        for (let pmkey in params) {
                            if (params[pmkey] === '' || params[pmkey] === null) {
                                // params[pmkey] = null;
                                delete params[pmkey];
                            }
                        }
                        that.excute({
                            showLoading: showLoading,
                            method: (value.method || 'get'),
                            url: this.buildUrl(value.url, params),
                            data: params,
                            params: /get/i.test(value.method) ? params : ''
                        }, callback, errorCallback, oCtx);
                    };
                })(value);
            }
        }
    }

    clone(config) {
        return new BaseModel(this.$http, config);
    }

    setConfig(config) {
        this.initMethodsByConfig(config);
        return this;
    }
}

BaseModel.$inject = ['$http'];

export default angular.module('app.basemodel', [])
    .service('BaseModel', BaseModel)
    .name;
