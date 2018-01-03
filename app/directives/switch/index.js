/**
 * @file switch directive entry
 * @author zhang.com
 */

import Switch from './switch';

export default angular.module('ui.switch', [])
    .directive('uiSwitch', Switch.getInstance)
    .name;
