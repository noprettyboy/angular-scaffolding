/**
 * @file pc platform service routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    let viewsCt = {
        'platformPcCt': {
            template: require('./service.html'),
            controller: 'PlatformPcServiceController as pfPcService',
            resolve: {
                modules: [
                    '$q',
                    '$ocLazyLoad',
                    ($q, $ocLazyLoad) => $q(resolve => {
                        require.ensure([], () => {
                            let module = require('./service.controller');
                            $ocLazyLoad.load({name: module.name || module.default.name});
                            resolve(module);
                        }, 'platform.pc.service.bundle');
                    })
                ]
            }
        }
    };
    $stateProvider.state('shell.platform.pc.service', {
        url: '/for-s/:pcType/:range/:action',
        views: viewsCt
    });
    $stateProvider.state('shell.platform.pc.service.id', {
        url: '/:id',
        views: viewsCt
    });
}
