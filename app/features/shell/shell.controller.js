/**
 * @file shell controller
 * @author zhangyou04@baidu.com
 */
import './shell.less';

class ShellController {
    constructor($rootScope, $scope, $state, $stateParams) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.headerItems = [
            {
                id: 'index',
                name: '首页'
            },
            {
                id: 'platform',
                name: '平台',
                children: [
                    {
                        id: 'pc',
                        name: '浏览器'
                    },
                    {
                        id: 'mobile',
                        name: '手机'
                    }
                ]
            }
        ];
        this.contentStyle = {
            // minHeight: window.innerHeight - 120
        };
        // this.isIndexView = true;
        // this.state = $state;
        // console.log(this.state.current);
        // this.isActive = function (item) {
        //     return $state.includes('shell.' + item.id);
        // };

        // this.routerStateOn();
        let self = this;
        $scope.$on('$stateChangeSuccess', function (event, toState) {
            $scope.curRouterName = toState.name;
        });
    }
    menuSwitch(menu, curRouterName) {
        let self = this;
        if (menu === curRouterName.split('.')[1]) {
            return false;
        }
        self.$state.go('shell.' + menu);
    }
    subMenuSwitch(menu, subMenu, curRouterName) {
        let self = this;
        switch(menu.id) {
            case 'platform': {
                self.$state.go('shell.platform.' + subMenu.id,
                    {},
                    {
                        location: 'replace',
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                break;
            }
        }
    }
    // routerStateOn() {
    //     let self = this;
    //     $scope.$on('$stateChangeSuccess',  (event, toState) => {
    //         console.log(toState);
    //         self.curRouterName = toState.name;
    //     });
    // }
}

ShellController.$inject = ['$rootScope', '$scope', '$state', '$stateParams'];

module.exports = ShellController;
