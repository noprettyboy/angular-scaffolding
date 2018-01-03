/**
 * @file switch directive
 * @author zhang.com
 */

import './switch.less';

class SwitchDirective {
    constructor($timeout) {
        this.restrict = 'AE';
        this.replace = 'true';
        this.template = require('./switch.html');
        this.scope = {
            on: '=?',
            onChange: '&'
        };
    }

    link(scope, element, attrs) {
        let onText = attrs.onText || 'on';
        let offText = attrs.offText || 'off';

        angular.extend(scope, {
            getText(on) {
                return on ? onText : offText;
            }
        });

        scope.toggle = () => {
            if (!attrs.disabled) {
                scope.on = !scope.on;
                if (scope.onChange) {
                    scope.$eval(scope.onChange);
                }
            }
        };
    }

    static getInstance() {
        SwitchDirective.instance = new SwitchDirective();
        return SwitchDirective.instance;
    }
}

SwitchDirective.getInstance.$inject = [];

module.exports = SwitchDirective;
