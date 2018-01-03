/**
 * @file platform mobile routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    $stateProvider.state('shell.platform.mobile', {
        url: '/mobile',
        views: {
            'platformCt': {
                template: require('./mobile.html'),
                controller: 'PlatformMobileController as platformMobile',
                resolve: {
                    modules: [
                        '$q',
                        '$ocLazyLoad',
                        ($q, $ocLazyLoad) => $q(resolve => {
                            require.ensure([], () => {
                                let module = require('./mobile.controller');
                                $ocLazyLoad.load({name: module.name || module.default.name});
                                resolve(module);
                            }, 'platformMobile.bundle');
                        })
                    ]
                }
            }
        }
    });
}
