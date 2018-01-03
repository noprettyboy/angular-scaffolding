/**
 * @file platform pc controller
 * @author zhangzengwei@xxx.com
 */
import './pc.less';
import angular from 'angular';
// import serviceConfig from '../../../servicesConfig';

class PlatformPcController {
    constructor($scope, $state, $stateParams, model) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        // this.model = model.setConfig(serviceConfig.PC);
        this.init();
    }
    init() {
        let self = this;
        self.platformInfo = {
            curTab: self.$state.params.pcType || 'service',
            etFunc: {
                switchTab: pcType => {
                    self.platformInfo.curTab = pcType;
                    if (pcType === 'service') {
                        self.$state.go('shell.platform.pc.service',
                            {pcType: 'service', range: 'myservice', action: 'list'});
                    } else if (pcType === 'class') {
                        self.$state.go('shell.platform.pc.class', {pcType: 'class', action: 'list'});
                    }
                }
            }
        };
    }
}

PlatformPcController.$inject = ['$scope', '$state', '$stateParams', 'BaseModel'];

export default angular
    .module('platform.pc.controller', [])
    .controller('PlatformPcController', PlatformPcController);

