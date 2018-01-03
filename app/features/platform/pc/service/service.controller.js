/**
 * @file platform pc service controller
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

class PlatformPcServiceController {
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
    }

    // comm 
    pLocationSwitch(pm) {
        let self = this;
        let urlParam = {
            range: self.serviceInfo.curRange,
            action: 'list',
            pcType: 'service'
        };
        if (pm !== undefined) {
            urlParam = angular.merge({}, urlParam, pm);
        }
        let curState = 'shell.platform.pc.service';
        if (urlParam.id !== undefined) {
            curState += '.id';
        }
        self.$state.go(curState,
            urlParam,
            {location: 'replace', reload: false, inherit: false, notify: false});
    }
}

PlatformPcServiceController.$inject = ['$rootScope', '$scope', '$state', '$stateParams',
    '$timeout', '$interval', 'BaseModel'];

export default angular
    .module('pfpcService.controller', [pagination, modalPanel, upload, selectList, tree])
    .controller('PlatformPcServiceController', PlatformPcServiceController);

