/**
 * @file showVerticalOnHover directive
 * @author zhangzengwei@xxx.com
 */
import './showVerticalOnHover.less';

export default class ShowVerticalOnHover {
    constructor() {
        this.restrict = 'EA';
        this.transclude = true;
        // this.replace = true;
        this.scope = {
            myModel: '=',
            myData: '='
        };
        // this.template = '<span class="show-vertical-on-hover-box" ng-transclude></span>';
        this.template = require('./showVerticalOnHover.html');
    }

    link(scope, element, attrs) {
        // console.log(attrs);
        scope.myselfInfo = {
            focus: attrs.focus !== undefined
        };
    }
}
