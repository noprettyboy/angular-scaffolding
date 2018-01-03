/**
 * @file compile directive entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import ImgCropDirective from './imgCrop';

export default angular.module('directives.imgCrop', [])
    .directive('imgCrop', ImgCropDirective.getInstance)
    .name;
