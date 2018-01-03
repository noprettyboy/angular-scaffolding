/**
 * @file platform pc entry
 * @author zhangzengwei@xxx.com
 */
import angular from 'angular';
import routing from './pc.routes';
import pcservice from './service';
import pcclass from './class';

export default angular.module('app.platformPc',
	[pcservice, pcclass])
    .config(routing)
    .name;
