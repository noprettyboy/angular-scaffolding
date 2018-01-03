/**
 * @file compile directive entry
 * @author zhang.com
 */
import angular from 'angular';
import SetScrollDirective from './setScroll';

export default angular.module('directives.setScroll', [])
    .directive('setScroll', SetScrollDirective.getInstance)
    .name;
