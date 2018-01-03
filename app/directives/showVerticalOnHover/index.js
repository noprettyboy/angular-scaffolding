/**
 * @file 鼠标hover垂直展示相关内容组件
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import ShowVerticalOnHover from './showVerticalOnHover';

export default angular.module('directives.showVerticalOnHover', [])
    .directive('showVerticalOnHover', () => new ShowVerticalOnHover())
    .name;