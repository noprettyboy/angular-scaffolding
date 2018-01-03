/**
 * @file platform mobile controller
 * @author zhangzengwei@xxx.com
 */
import './mobile.less';
import angular from 'angular';
// import serviceConfig from '../../../servicesConfig';

class PlatformMobileController {
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
            curTab: self.$state.params.mobileType || 'service',
            etFunc: {
            }
        };
    }
}

PlatformMobileController.$inject = ['$scope', '$state', '$stateParams', 'BaseModel'];

export default angular
    .module('platform.mobile.controller', [])
    .controller('PlatformMobileController', PlatformMobileController);

