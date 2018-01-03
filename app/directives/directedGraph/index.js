/**
 * @file directed graph entry
 * @author zhang.com
 */
import angular from 'angular';
import DirectedGraphDierective from './directedGraph';

export default angular.module('directves.directedGraph', [])
    .directive('directedGraph', () => new DirectedGraphDierective())
    .name;
