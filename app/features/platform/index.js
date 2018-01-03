/**
 * @file pc platform entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './platform.routes';
import pfpc from './pc';
import pfmobile from './mobile';

export default angular.module('app.platform',
	[pfpc, pfmobile])
    .config(routing)
    .name;
