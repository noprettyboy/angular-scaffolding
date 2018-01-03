/**
 * @file pc platform class routers
 * @author zhangzengwei@xxx.com
 */
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
    let viewsCt = {
        'platformPcCt': {
            template: require('./class.html'),
            controller: 'PPlatformClassController as pPfClass',
            resolve: {
                modules: [
                    '$q',
                    '$ocLazyLoad',
                    ($q, $ocLazyLoad) => $q(resolve => {
                        require.ensure([], () => {
                            let module = require('./class.controller');
                            $ocLazyLoad.load({name: module.name || module.default.name});
                            resolve(module);
                        }, 'platform.pc.class.bundle');
                    })
                ]
            }
        }
    };
    $stateProvider.state('shell.platform.pc.class', {
        url: '/for-c/:pcType/:action',
        views: viewsCt
    });
    $stateProvider.state('shell.platform.pc.class.id', {
        url: '/:id',
        views: viewsCt
    });
}
