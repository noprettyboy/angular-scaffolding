/**
 * @file platform routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    $stateProvider.state('shell.platform', {
        url: 'platform',
        views: {
            'content@': {
                template: require('./platform.html'),
                controller: 'PlatformController as platform',
                resolve: {
                    modules: [
                        '$q',
                        '$ocLazyLoad',
                        ($q, $ocLazyLoad) => $q(resolve => {
                            require.ensure([], () => {
                                let module = require('./platform.controller');
                                $ocLazyLoad.load({name: module.name || module.default.name});
                                resolve(module);
                            }, 'platform.bundle');
                        })
                    ]
                }
            }
        }
    });
}
