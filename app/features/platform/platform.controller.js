/**
 * @file platform controller
 * @author zhangzengwei@xxx.com
 */
import './platform.less';
import angular from 'angular';
// import serviceConfig from '../../servicesConfig';

class PlatformController {
    constructor($scope, $state, $stateParams, model) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        if (this.$state.current.name === 'shell.platform'
            || this.$state.current.name === 'shell.platform.pc') {
            this.$state.go('shell.platform.pc.service', {
                pcType: 'service',
                range: 'myservice',
                action: 'list'
            });
        } else if (this.$state.current.name === 'shell.platform.mobile') {
            this.$state.go('shell.platform.mobile.service', {
                mobileType: 'service',
                range: 'myservice',
                action: 'list'
            });
        }
    }
}

PlatformController.$inject = ['$scope', '$state', '$stateParams', 'BaseModel'];

export default angular
    .module('platform.controller', [])
    .controller('PlatformController', PlatformController);

