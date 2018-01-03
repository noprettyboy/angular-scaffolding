/**
 * @file directed graph directive
 * @author zhangyou04
 */
import './directedGraph.less';
import angular from 'angular';
import echarts from 'echarts';
import DirectionGraphLayout from './layout';
import $ from 'jquery';

export default class DirectedGraphDirective {
    constructor() {
        this.restrict = 'AE';
        this.replace = true;
        this.scope = {
            option: '=',
            beforeDraw: '='
        };
        this.template = '<div style="width: 100%;" class="directed-graph-box"></div>';
    }

    link(scope, element, attrs) {
        scope.option = scope.option || {};
        scope.option.nodes = (scope.option || {}).data || [];
        element.height(attrs.height || 500);
        element.width(attrs.width || '100%');

        this.init(scope, element, attrs);

        scope.$watch('option.nodes', nodes => {
            if (nodes) {
                this.render(nodes || [], scope, element);
            }
        });
        scope.$watch('option.refreshId', refreshId => {
            if (refreshId) {
                this.render(scope.option.nodes || [], scope, element);
            }
        });
    }

    init(scope, element, attrs) {
        let lineStyle = {
            width: 1,
            color: '#eee'
        };
        scope.option = $.extend(true, {
            title: {
                text: scope.option.name,
                x: 'center'
            },
            tooltip: {
                formatter(node) {
                    // console.log('formatter', arguments);
                    return 'name: ' + node.name + '<br/>'
                        + 'product: ' + (node.data.product || '-') + '<br/>';
                        // + 'task name: ' + (node.data.task_name || '-');
                }
            },
            animationDurationUpdate: 0, // 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'none',
                    symbolSize: 20, // default 50
                    // symbolOffset: [0, '100%'],
                    roam: false,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            textStyle: {
                                fontSize: 16
                            },
                            formatter(node) {
                                // let nodes = scope.nodes || [];
                                // let source = nodes[node.data.source] || {};
                                // let target = nodes[node.data.target] || {};
                                // return node.dataType === 'edge'
                                //     ? source.name + '>' + target.name
                                //     : node.data.name;
                                return node.dataType === 'edge' ? '' : node.data.name;
                            }
                        }
                    },
                    edgeSymbol: attrs.withArrow === 'true' ? ['circle', 'arrow'] : ['circle'],
                    edgeSymbolSize: [2, 5], //[4, 10],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 12
                            },
                            // formatter: function () {
                            //  console.log(arguments);
                            // },
                            formatter: '{a}{b}{c}'
                        },
                        emphasis: {
                            show: true,
                            formatter: '{a}{b}{c}'
                        }
                    },
                    data: [],
                    links: [],
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: lineStyle.width,
                            curveness: 0
                        }
                    }
                }
            ]
        }, scope.option || {});

        scope.nodes = scope.nodes || [];
        angular.extend(
            scope,
            {
                callbacks: {},
                canvasBox: element[0],
                chartInst: echarts.init(element[0]),
                nodes: scope.option.nodes || [],
                parentsQueue: [],
                pageSize: scope.option.pageSize || 10,
                pageIndex: scope.option.pageIndex || 1,
                pageCount: Math.ceil(scope.nodes.length / scope.pageSize),
                width: +attrs.width ? +attrs.width : element.width(),
                height: +attrs.height ? +attrs.height : element.height(),
                radius: scope.option.series[0].symbolSize || 60
            }
        );

        // EventEmitter
        angular.extend(
            this,
            {
                on(eventName, handle) {
                    scope.callbacks[eventName] = scope.callbacks[eventName] || [];
                    scope.callbacks[eventName].push(handle);
                },
                off(eventName, handle) {
                    if (arguments.length === 1) {
                        delete scope.callbacks[eventName];
                    }

                    if (arguments.length === 2) {
                        if (scope.callbacks[eventName]) {
                            let index = scope.callbacks[eventName].indexOf(handle);
                            if (index !== -1) {
                                scope.callbacks[eventName].splice(index, 1);
                            }
                        }
                    }
                },
                trigger(eventName, params) {
                    params = [].slice.call(arguments, 1);
                    if (scope.callbacks[eventName]) {
                        scope.callbacks[eventName].forEach(function (handle) {
                            handle && handle.apply(null, params);
                        });
                    }
                }
            }
        );

        // events
        scope.chartInst.on('click', this.clickNodeHandle.bind(this, scope));
    }

    render(nodes, scope, element) {
        nodes = nodes || scope.option.nodes;
        scope.nodes = nodes;
        scope.chartInst = echarts.init(element[0]);

        if (scope.chartInst) {
            this.drawChart(nodes, scope.option, scope);
            this.addEventListners(scope);
        }
    }

    drawChart(nodes, option, scope) {
        scope.option = this.generateOption(nodes, scope);
        scope.nodes = nodes;
        scope.option.grid = {
            x: 0,
            y: 0
        };

        scope.beforeDraw && scope.beforeDraw(scope.option);

        if (nodes.length) {
            scope.chartInst.setOption(scope.option);
            $(scope.canvasBox).find('canvas').css({
                left: 0,
                top: 0
            });
        }
        else {
            $(scope.canvasBox).html([
                '<div class="empty-chart">',
                '   <h5>' + (option.title.text || '') + '</h5>',
                '   <p>暂无数据，如有查询条件请设置条件</p>',
                '</div>'
            ].join(''));
        }
    }

    generateOption(nodes, scope) {
        let edgesInfo = this.getEdges(nodes);
        let option = scope.option;
        
        new DirectionGraphLayout(nodes, edgesInfo.edges, scope.width, scope.height, scope.radius);
        option.series[0].data = nodes.map(node => {
            if (node.children && node.children.length) {
                node.itemStyle = {
                    normal: {
                        color: '#00bfa5'
                    }
                };
            }
            return node;
        });
        option.series[0].links = edgesInfo.links;

        return option;
    }

    addEventListners(scope) {
        let canvasEl = scope.canvasBox.querySelector('canvas');

        // this.drag(
        //     canvasEl,
        //     canvasEl,
        //     (moveInfo, evt) => {
        //         scope.pageIndex += moveInfo.x > 0 ? 1 : -1;
        //         scope.pageIndex = Math.max(1, scope.pageIndex);
        //         scope.pageIndex = Math.min(scope.pageCount, scope.pageIndex);
        //         console.log('drag end', scope.pageIndex);
        //         this.trigger('swipe', {
        //             originalEvent: evt,
        //             moveInfo: moveInfo,
        //             pageIndex: scope.pageIndex,
        //             direction: moveInfo.x > 0 ? 'right' : 'left'
        //         });
        //         this.drawChart(this.getNodesByPageIndex(scope.pageIndex, scope.option, scope), scope.option, scope);
        //     }
        // );

        if (canvasEl) {
            canvasEl.addEventListener(
                document.mozHidden !== undefined ? 'DOMMouseScroll' : 'mousewheel',
                this.mousewheelHandle.bind(this, scope)
            );
        }

        // events
        scope.chartInst.on('click', this.clickNodeHandle.bind(this, scope));
    }

    drag(el, target, callback) {
        let mousedownHandle = function (evt) {
            let isMousedown = true;
            let startPos = {
                x: evt.clientX,
                y: evt.clientY
            };
            let prePos = $.extend(true, {}, startPos);
            let mousemoveHandle = function (evt) {
                if (isMousedown) {
                    let offset = $(target).offset();
                    $(target).css({
                        left: offset.left + evt.clientX - prePos.x + 'px',
                        top: offset.top + evt.clientY - prePos.y + 'px'
                    });
                    prePos = {
                        x: evt.clientX,
                        y: evt.clientY
                    };
                }
            };
            let mouseupHandle = function (evt) {
                isMousedown = false;
                el.removeEventListener('mousemove', mousemoveHandle);
                document.removeEventListener('mouseup', mouseupHandle);
                if (Math.abs(evt.clientX - startPos.x) > 10) {
                    callback && callback({
                        x: evt.clientX - startPos.x,
                        y: evt.clientY - startPos.y
                    }, evt);
                }
            };
            el.addEventListener('mousemove', mousemoveHandle);
            document.addEventListener('mouseup', mouseupHandle);
        };

        el.addEventListener('mousedown', mousedownHandle);
    }

    mousewheelHandle(scope, event) {
        if (scope._isWheeling) {
            return false;
        }
        scope._isWheeling = true;
        event.preventDefault();
        let delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;

        if (delta < 0) {
            if (scope.parentsQueue && scope.parentsQueue.length) {
                scope.nodes = scope.parentsQueue.pop();
                scope.pageIndex = 1;
                this.trigger('mousewheel', {
                    originalEvent: event,
                    direction: 'up'
                });
                this.drawChart(this.getNodesByPageIndex(scope.pageIndex, scope.option, scope), scope.option, scope);
            }
        }
        else {
            this.trigger('mousewheel', {
                originalEvent: event,
                direction: 'down'
            });
        }

        setTimeout(function () {
            scope._isWheeling = false;
        }, 1000);
    }

    clickNodeHandle(scope, evt) {
        if (evt.dataType === 'node') {
            if (!(evt.data.children && evt.data.children.length)) {
                // alert('no children please select green node :)');
                return;
            }
            scope.parentsQueue = scope.parentsQueue || [];
            scope.parentsQueue.push($.extend(true, [], scope.nodes));
            scope.pageIndex = 1;
            scope.nodes = $.extend(true, [], evt.data.children);
            scope.pageCount = Math.ceil(scope.nodes.length / scope.pageSize);
            let drawNodes = this.getNodesByPageIndex(scope.pageIndex, scope.option, scope);
            // let parentNode = {
            //  id: evt.data.id,
            //  name: evt.data.name,
            //  info: evt.data.info,
            //  deps: drawNodes.map(function (item) {
            //      return {
            //          id: item.id
            //      };
            //  })
            // };
            // drawNodes.unshift(parentNode);
            // let notes = scope.nodes;
            drawNodes.forEach(function (node, i) {
                node.deps = node.deps || [];
                node.deps.push({
                    id: drawNodes[Math.max(0, i - 1)].id
                });
            });
            this.trigger('selectNode', evt.data);
            this.drawChart(drawNodes, scope.option, scope);
        }
    }

    getNodesByPageIndex(pageIndex, option, scope) {
        let nodes = scope.nodes || option.nodes || [];
        return nodes.slice((pageIndex - 1) * scope.pageSize, scope.pageIndex * scope.pageSize - 1);
    }

    getEdges(nodes, key) {
        let links = [];
        let edges = [];
        let lineStyle = {
            normal: {
                width: 1,
                curveness: 0.2
            }
        };
        let edgesKeyMap = {};

        nodes.forEach(function (node, i) {
            if (node.deps && node.deps.length) {
                node.deps.forEach(function (dep, j) {
                    let targetIndex = 0;
                    let target = nodes.filter(function (item, k) {
                        if (item.id === dep.id) {
                            targetIndex = k;
                        }

                        return item.id === dep.id;
                    })[0];

                    if (!target) {
                        return false;
                    }
                    let link = {
                        source: i,
                        target: targetIndex
                    };
                    let edge = {
                        source: node,
                        target: target
                    };

                    if (edgesKeyMap[edge.target.id + '_' + edge.source.id]) {
                        link.lineStyle = lineStyle;
                        links.filter(item => item.source === link.target && item.target === link.source)[0]
                            .lineStyle = lineStyle;
                    }
                    edgesKeyMap[edge.source.id + '_' + edge.target.id] = true;
                    links.push(link);
                    edges.push({
                        source: node,
                        target: target
                    });
                });
            }
        });
        let result = {links, edges};

        return key ? result[key] : result;
    }
}
