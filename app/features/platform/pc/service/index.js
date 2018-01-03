/**
 * @file pc platform service entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './service.routes';

export default angular.module('app.platformPcService', [])
    .config(routing)
    .name;
