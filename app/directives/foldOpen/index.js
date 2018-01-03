/**
 * @file  fold open Component
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import FoldOpenDirective from './foldOpen';

export default angular.module('directives.foldOpen', [])
    .directive('foldOpen', () => new FoldOpenDirective())
    .name;