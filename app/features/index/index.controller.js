/**
 * @file index controller
 * @author zhang.com
 */
import './index.less';
import angular from 'angular';
import carousel from '../../directives/carousel';
import serviceConfig from '../../servicesConfig';

class IndexController {
    constructor($scope, $timeout, model) {
        this.$timeout = $timeout;
        this.model = model.setConfig(serviceConfig.INDEX);
        this.domView = $('.index-view');
        this.carouselData = {
            type: 'img',
            list: [
                {
                    id: 'carousel1',
                    src: '/img/carousel1.png'
                },
                {
                    id: 'carousel2',
                    src: '/img/carousel2.png'
                },
                {
                    id: 'carousel3',
                    src: '/img/carousel3.png'
                },
                {
                    id: 'carousel4',
                    src: '/img/carousel4.png'
                },
                {
                    id: 'carousel5',
                    src: '/img/carousel5.png'
                },
                {
                    id: 'carousel6',
                    src: '/img/carousel6.png'
                }
            ]
        };
        let self = this;
        $(window).bind('scroll', () => {
            let carouselBoxHeight = $('.carousel-box', self.domView[0]).height();
            if ($(window).scrollTop() > 10
                && $(window).scrollTop() <= 100) {
                $('.header').css({
                    'background-color': 'rgba(24, 25, 74, .4)'
                });
            }
            if ($(window).scrollTop() > 100
                && $(window).scrollTop() <= 200) {
                $('.header').css({
                    'background-color': 'rgba(24, 25, 74, .5)'
                });
            }
            if ($(window).scrollTop() > 200
                && $(window).scrollTop() <= 300) {
                $('.header').css({
                    'background-color': 'rgba(24, 25, 74, .6)'
                });
            }
            if ($(window).scrollTop() > 300
                && $(window).scrollTop() <= carouselBoxHeight - 60) {
                $('.header').css({
                    'background-color': 'rgba(24, 25, 74, .7)'
                });
            }
            if ($(window).scrollTop() > carouselBoxHeight - 60) {
                $('.header').css({
                    'background-color': 'rgba(24, 25, 74, .8)'
                });
            }
        });
        $scope.$on('$destroy', () => {
            $(window).unbind('scroll');
            self.$timeout(() => {
                $('.header').attr('style', 'rgba(24, 25, 74, .9)');
            }, 100);
        });
        this.init();
    }
    init() {
        let self = this;
        self.indexInfo = {
            summaryData: {
                interCallNum: [],
                testServiceNum: []
            },
            topProductData: []
        };
        self.getSummaryData();
    }
    getSummaryData() {
        let self = this;
        let params = {};
        console.log(self.model);
        self.model.getSummaryData(
            params,
            data => {
                self.indexInfo.summaryData.interCallNum = data.apirecordnum;
                self.indexInfo.summaryData.testServiceNum = data.testtypenum;
            }
        );
    }
}

IndexController.$inject = ['$scope', '$timeout', 'BaseModel'];

export default angular
    .module('index.controller', [carousel])
    .controller('IndexController', IndexController);

