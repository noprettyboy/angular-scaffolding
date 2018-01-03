/**
 * @file datemodel directive
 * @author zhang.com
 */
class DateModelDirective {
    constructor($parse) {
        this.$parse = $parse;
    }

    link(scope, element, attrs, ctrl) {
        let key = attrs.dateModel;
        let getter = this.$parse(key);
        let setter = getter.assign;

        element.on('change', evt => {
            scope.$apply(() => {
                setter(scope, evt.currentTarget.value);
                attrs.onChange && attrs.onChange.call(context || scope, evt.currentTarget.value);
            });
        });
    }

    static getInstance($parse) {
        DateModelDirective.instance = new DateModelDirective($parse);
        return DateModelDirective.instance;
    }
}

DateModelDirective.getInstance.$inject = ['$parse'];

module.exports = DateModelDirective;
