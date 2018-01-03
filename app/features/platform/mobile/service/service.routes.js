/**
 * @file mobile platform service routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    let viewsCt = {
        'platformMobileCt': {
            template: require('./service.html'),
            controller: 'PlatformMobileServiceController as pfMobileService',
            resolve: {
                modules: [
                    '$q',
                    '$ocLazyLoad',
                    ($q, $ocLazyLoad) => $q(resolve => {
                        require.ensure([], () => {
                            let module = require('./service.controller');
                            $ocLazyLoad.load({name: module.name || module.default.name});
                            resolve(module);
                        }, 'platform.mobile.service.bundle');
                    })
                ]
            }
        }
    };
    $stateProvider.state('shell.platform.mobile.service', {
        url: '/for-s/:mobileType/:range/:action',
        views: viewsCt
    });
    $stateProvider.state('shell.platform.mobile.service.id', {
        url: '/:id',
        views: viewsCt
    });
}
