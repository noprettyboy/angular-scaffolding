/**
 * @file platform mobile entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './mobile.routes';
import mobileservice from './service';
// import mobileclass from './class';

export default angular.module('app.platformMobile',
	[mobileservice])
    .config(routing)
    .name;
