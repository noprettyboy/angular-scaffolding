/**
 * @file pc platform class controller
 * @author zhangzengwei@xxx.com
 */
import './class.less';
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

class PPlatformClassController {
    constructor($scope, $state, $stateParams, $timeout, model) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
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
            action: 'list',
            pcType: 'class'
        };
        if (pm !== undefined) {
            urlParam = angular.merge({}, urlParam, pm);
        }
        let curState = 'shell.platform.pc.class';
        if (urlParam.id !== undefined) {
            curState += '.id';
        }
        self.$state.go(curState,
            urlParam,
            {location: 'replace', reload: false, inherit: false, notify: false});
    }

    // event


    // data
    getClassList(params) {
        let self = this;
        self.model.getClassList(
            params,
            data => {
                
            }
        );
    }
    getClassSourceCode(params) {
        let self = this;
        self.model.getClassSourceCode(
            params,
            data => {
                self.pLocationSwitch({action: 'modify', id: params.publicClassId});
                self.classInfo.curAction = 'modify';
                self.classInfo.panelConf.classCode.show = true;
                $('#classCodeView').html('');
                self.$timeout(() => {
                    self.classInfo.data.codeMirrorEdit = CodeMirror(document.getElementById('classCodeView'), {
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        selectionPointer: true,
                        mode: 'javascript',
                        theme: 'eclipse',
                        foldGutter: true,
                        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
                    });
                    self.classInfo.data.codeMirrorEdit.setValue(data);
                }, 600);
            }
        );
    }
    putClassSouceCode(params) {
        let self = this;
        self.model.putClassSouceCode(
            params,
            data => {
                self.pLocationSwitch({action: 'list'});
                self.classInfo.panelConf.classCode.show = false;
                let params = angular.copy(self.classInfo.schConf);
                self.getClassList(params);
            }
        );
    }
}

PPlatformClassController.$inject = ['$scope', '$state', '$stateParams', '$timeout', 'BaseModel'];

export default angular
    .module('class.controller', [pagination, modalPanel, upload, selectList])
    .controller('PPlatformClassController', PPlatformClassController);

