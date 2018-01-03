/**
 * @file dialog entry
 * @author zhang.com
 */
import angular from 'angular';
import DialogDirective from './dialog';

export default angular.module('directives.dialog', [])
    .directive('dialog', DialogDirective.getInstance)
    .name;
