/**
 * @file mobile platform service entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './service.routes';

export default angular.module('app.platformMobileService', [])
    .config(routing)
    .name;
