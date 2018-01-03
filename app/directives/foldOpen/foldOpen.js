/**
 * @file fold-open directive
 * @author zhangzengwei.com
 */
import './foldOpen.less';

export default class FoldOpenDirective {
    constructor() {
        this.restrict = 'EA';
        this.transclude = true;
        this.scope = {
        };
        this.template = require('./foldOpen.html');
    }

    link(scope, element, attrs) {
        scope.foldOpenInfo = {
            status: 'open',
            type: (attrs.foldOpenType === undefined ||　attrs.foldOpenType === '')
                ? 'left' : attrs.foldOpenType
        };
        scope.foldOpen = () => {
            if (scope.foldOpenInfo.type === 'left'
                || scope.foldOpenInfo.type === 'right') {
                if (scope.foldOpenInfo.status === 'open') {
                    scope.foldOpenInfo.status = 'fold';
                    $(element).css({
                        width: '15px'
                    });
                } else {
                    scope.foldOpenInfo.status = 'open';
                    $(element).attr('style', '');
                }
            } else {
                if (scope.foldOpenInfo.status === 'open') {
                    scope.foldOpenInfo.status = 'fold';
                    $(element).css({
                        height: '15px'
                    });
                } else {
                    scope.foldOpenInfo.status = 'open';
                    $(element).attr('style', '');
                }
            }
        };
    }
}
