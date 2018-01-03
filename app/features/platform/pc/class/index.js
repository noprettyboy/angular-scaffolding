/**
 * @file pc platform class entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './class.routes';

export default angular.module('app.pPlatform.class', [])
    .config(routing)
    .name;
