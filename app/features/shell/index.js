/**
 * @file shell entry
 * @author  zhangyou.com
 */
import angular from 'angular';
import uirouter from 'angular-ui-router';
import routes from './shell.routes';
import ShellController from './shell.controller';
import showVerticalOnHover from '../../directives/showVerticalOnHover';

export default angular.module('app.shell', [uirouter, showVerticalOnHover])
    .config(routes)
    .controller('ShellController', ShellController)
    .name;
