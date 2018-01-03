/**
 * @file compile directive entry
 * @author zhang.com
 */
import angular from 'angular';
import UploadDirective from './upload';

export default angular.module('directives.upload', [])
    .directive('upload', UploadDirective.getInstance)
    .name;