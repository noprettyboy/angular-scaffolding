/**
 * @file platform pc routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    $stateProvider.state('shell.platform.pc', {
        url: '/pc',
        views: {
            'platformCt': {
                template: require('./pc.html'),
                controller: 'PlatformPcController as platformPc',
                resolve: {
                    modules: [
                        '$q',
                        '$ocLazyLoad',
                        ($q, $ocLazyLoad) => $q(resolve => {
                            require.ensure([], () => {
                                let module = require('./pc.controller');
                                $ocLazyLoad.load({name: module.name || module.default.name});
                                resolve(module);
                            }, 'platformPc.bundle');
                        })
                    ]
                }
            }
        }
    });
}
