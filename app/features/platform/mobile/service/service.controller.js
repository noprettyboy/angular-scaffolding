/**
 * @file platform mobile service controller
 * @author zhangzengwei@xxx.com
 */
import './service.less';
import angular from 'angular';
// 代码编辑器
import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
// 支持代码折叠
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
// 支持括号匹配
import 'codemirror/addon/edit/matchbrackets.js';
// 支持代码高亮
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/javascript/javascript.js';
// 支持编辑器风格
import 'codemirror/theme/eclipse.css';

import serviceConfig from '../../../../servicesConfig';
import pagination from '../../../../directives/paginationZZW';
import modalPanel from '../../../../directives/modal';
import upload from '../../../../directives/upload';
import selectList from '../../../../directives/select';
import tree from '../../../../directives/tree';

class PlatformMobileServiceController {
    constructor($rootScope, $scope, $state, $stateParams, $timeout, $interval, model) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$interval = $interval;
        this.model = model.setConfig(serviceConfig.PF);
        this.init();
    }
    init() {
        let self = this;
        self.originalSchConf = {
            id: null,
            name: null,
            username: null,
            pageNum: 1,
            pageCount: 12
        };
        self.originalPubConf = {
            step1: {
                platformName: 'android',
                name: null,
                info: null,
                filePath: null,
                className: null,
                overtime: 300,
                testType: 'normal',
                productId: null,
                username: self.$rootScope.userInfo.username
            },
            sourceFileUpload: {
                status: 'init',
                browserBtnAble: true,
                uploadBtnAble: false,
                fileType: ['java'],
                name: 'file',
                filePath: null,
                watch: false,
                note: '请上传UTF-8编码的java类型文件!',
                url: serviceConfig.PF.mobileServiceSourceCodeUpload.url,
                callback: (pm, uploadScope) => {
                    uploadScope.myModel = pm.data.filePath;
                    uploadScope.uploadData.filePath = pm.data.filePath;
                    uploadScope.uploadData.status = 'successAndWatch';
                }
            }
        };
        self.serviceInfo = {
            curRange: self.$state.params.range || 'myservice',
            curAction: self.$state.params.action || 'list',
            schConf: {
                commSch: angular.copy(self.originalSchConf)
            },
            data: {
                curServiceInitList: [],
                allServiceData: {
                    pageInfo: {
                        total: 0,
                        pageSize: 12,
                        currentPage: 1
                    },
                    list: [],
                    pageChange: pm => {
                        self.serviceInfo.schConf.commSch.pageNum = pm;
                        self.pfServiceList('all');
                    }
                },
                myServiceData: {
                    pageInfo: {
                        total: 0,
                        pageSize: 12,
                        currentPage: 1
                    },
                    list: [],
                    pageChange: pm => {
                        self.serviceInfo.schConf.commSch.pageNum = pm;
                        self.pfServiceList('own');
                    }
                },
                treeData: [],
                codeMirrorEdit: null
            },
            pubConf: {
                createInfo: {
                    step1: angular.copy(self.originalPubConf.step1)
                },
                otherInfo: {
                    pubForProduct: []
                },
                selectBoxConf: {},
                uploadConf: {
                    sourceFileUpload: {
                        status: 'init',
                        browserBtnAble: true,
                        uploadBtnAble: false,
                        fileType: ['java'],
                        name: 'file',
                        filePath: null,
                        watch: false,
                        note: '请上传UTF-8编码的java类型文件!',
                        url: serviceConfig.PF.mobileServiceSourceCodeUpload.url,
                        callback: (pm, uploadScope) => {
                            uploadScope.myModel = pm.data.filePath;
                            uploadScope.uploadData.filePath = pm.data.filePath;
                            uploadScope.uploadData.status = 'successAndWatch';
                        }
                    }
                },
                etFunc: {
                    testPlatFormChange: pm => {
                        pm === 'ios'
                            ? self.serviceInfo.pubConf.createInfo.step1.testType = 'appium'
                            : self.serviceInfo.pubConf.createInfo.step1.testType = 'normal';
                    },
                    serviceBuild: pm => {
                        if (pm === 'close') {
                            self.serviceInfo.panelConf.servicePub.show = false;
                            self.pLocationSwitch({action: 'list'});
                        } else {
                            self.pfServiceBuild(pm);
                        }
                    },
                    serviceClassDeal: action => {
                        self.pfServiceClassSave(action);
                    }
                }
            },
            etFunc: {
                serviceRangeChanged: pm => {
                    self.serviceInfo.schConf.commSch = angular.copy(self.originalSchConf);
                    self.pLocationSwitch({range: pm});
                    self.serviceInfo.schConf.commSch.pageNum = 1;
                    if (pm === 'allservice') {
                        self.pfServiceList('all');
                    } else if (pm === 'myservice') {
                        self.pfServiceList('own');
                    }
                },
                servicePub: () => {
                    self.pLocationSwitch({action: 'create'});
                    self.serviceInfo.curAction = 'create';
                    self.getPProductTreeData();
                    self.serviceInfo.pubConf.createInfo.step1 = angular.copy(self.originalPubConf.step1);
                    self.serviceInfo.pubConf.uploadConf.sourceFileUpload
                        = angular.copy(self.originalPubConf.sourceFileUpload);
                    self.serviceInfo.panelConf.servicePub.show = true;
                },
                productSelect: pm => {
                    self.serviceInfo.pubConf.otherInfo.pubForProduct = [+pm.id];
                    self.serviceInfo.pubConf.createInfo.step1.productId = +pm.id;
                },
                dealService: (action, service) => {
                    self.pfServiceDeal(action, service);
                },
                serviceFilter: () => {
                    self.serviceInfo.schConf.commSch.pageNum = 1;
                    let tempInitData = angular.copy(self.serviceInfo.data.curServiceInitList);
                    let tempFilterData = angular.copy(self.serviceInfo.schConf.commSch);
                    let newListData = tempInitData.filter((item, index) => {
                        return (tempFilterData.id === null
                            || tempFilterData.id === ''
                            || String(item.id).indexOf(tempFilterData.id) >= 0)
                            && (tempFilterData.name === null
                                || tempFilterData.name === ''
                                || item.name.indexOf(tempFilterData.name) >= 0)
                                && (tempFilterData.username === null
                                    || tempFilterData.username === ''
                                    || item.creator.indexOf(tempFilterData.username) >= 0);
                    });
                    switch (self.$state.params.range) {
                        case 'myservice': {
                            self.serviceInfo.data.myServiceData.list = angular.copy(newListData);
                            break;
                        }
                        case 'allservice': {
                            self.serviceInfo.data.allServiceData.list = angular.copy(newListData);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
            },
            panelConf: {
                servicePub: {
                    show: self.$state.params.action === 'create' ? true : 'init',
                    title: '发布服务',
                    button: 'private',
                    click: pm => {
                        self.pfServicePubPanelConfReplace(pm);
                    }
                },
                classCode: {
                    show: self.$state.params.action === 'modify' ? true : 'init',
                    title: '代码',
                    button: 'private',
                    click: pm => {
                        self.pfServiceClassPanelConfReplace(pm);
                    }
                }
            }
        };
    }

    // comm
    pLocationSwitch(pm) {
        let self = this;
        let urlParam = {
            range: self.serviceInfo.curRange,
            action: 'list',
            mobileType: 'service'
        };
        if (pm !== undefined) {
            urlParam = angular.merge({}, urlParam, pm);
        }
        let curState = 'shell.platform.mobile.service';
        if (urlParam.id !== undefined) {
            curState += '.id';
        }
        self.$state.go(curState,
            urlParam,
            {location: 'replace', reload: false, inherit: false, notify: false});
    }

    // pPlatform service action
    pfServiceList(pm) {
        let self = this;
        let params = angular.copy(self.serviceInfo.schConf.commSch);
        if (pm === 'all') {
            // params.range = 'allservice';
            // params.type = 'special';
            // params.status = 'release';
            self.getAllServiceList(params);
        } else if (pm === 'own') {
            // params.range = 'myservice';
            params.username = self.$rootScope.userInfo.username;
            self.getMyServiceList(params);
        }
        // self.getServiceList(params);
    }
    pfServicePubPanelConfReplace(pm) {
        let self = this;
        self.pLocationSwitch();
    }
    pfServiceClassPanelConfReplace(pm) {
        let self = this;
        self.pLocationSwitch();
    }
    pfServiceBuild(pm) {
        let self = this;
        let param = angular.copy(self.serviceInfo.pubConf.createInfo.step1);
        if (pm === 'save') {
            self.postServiceBuildData(param);
        } else if (pm === 'update') {
            self.putServiceBuildData(param);
        }
    }
    pfServiceDeal(action, service) {
        let self = this;
        if (action === 'edit') {
            self.pLocationSwitch({action: 'edit', id: service.id});
            self.serviceInfo.curAction = 'edit';
            let params = {
                testTypeId: service.id
            };
            self.getServiceById(params);
        } else if (action === 'modify') {
            self.pLocationSwitch({action: 'modify', id: service.id});
            self.serviceInfo.curAction = 'modify';
            self.getServiceSourceCodeData({testTypeId: service.id});
        } else if (action === 'watch') {
            self.pLocationSwitch({action: 'watch', id: service.id});
            self.serviceInfo.curAction = 'watch';
            self.getServiceSourceCodeData({testTypeId: service.id});
        }
    }
    pfServiceClassSave(pm) {
        let self = this;
        if (pm === 'close') {
            self.serviceInfo.panelConf.classCode.show = false;
            self.pLocationSwitch({action: 'list'});
        } else if (pm === 'save') {
            let params = {
                testTypeId: self.$state.params.id,
                sourceCode: self.serviceInfo.data.codeMirrorEdit.getDoc().getValue()
            };
            self.putServiceSourceCodeData(params);
        }
    }

    // pPlatform service data
    getServiceSourceCodeData(params) {
        let self = this;
        self.model.getMobileServiceSourceCodeData(
            params,
            data => {
                self.serviceInfo.panelConf.classCode.show = true;
                $('#codeView').html('');
                self.$timeout(() => {
                    self.serviceInfo.data.codeMirrorEdit = CodeMirror(document.getElementById('codeView'), {
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        selectionPointer: true,
                        mode: 'javascript',
                        theme: 'eclipse',
                        foldGutter: true,
                        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
                    });
                    self.serviceInfo.data.codeMirrorEdit.setValue(data);
                }, 600);
            }
        );
    }
    putServiceSourceCodeData(param) {
        let self = this;
        let params = angular.copy(param);
        self.model.putMobileServiceSourceCodeData(
            params,
            data => {
                self.serviceInfo.panelConf.classCode.show = false;
                self.pLocationSwitch({action: 'list'});
                if (self.serviceInfo.curRange === 'myservice') {
                    self.pfServiceList('own');
                } else if (self.serviceInfo.curRange === 'allservice') {
                    self.pfServiceList('all');
                }
            }
        );
    }
}

PlatformMobileServiceController.$inject = ['$rootScope', '$scope', '$state', '$stateParams',
    '$timeout', '$interval', 'BaseModel'];

export default angular
    .module('pfmobileService.controller', [pagination, modalPanel, upload, selectList, tree])
    .controller('PlatformMobileServiceController', PlatformMobileServiceController);

