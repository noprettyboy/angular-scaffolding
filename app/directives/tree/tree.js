/**
 * @file  Tree view UI Component
 * @author zhang.com
 */
// import angular from 'angular';
import './tree.less';
import './node';

export default class TreeViewDirective {
    constructor() {
        this.template = require('./tree.html');
        this.restrict = 'E';
        this.replace = 'true';
        this.scope = {
            nodes: '=data',
            selectedNodes: '=',
            showLine: '=?',
            collapsed: '=?',
            getIconClass: '=',
            getToggleIconClass: '=',
            getNodeText: '=',
            onToggleExpand: '=',
            onEdit: '=',
            onDelete: '=',
            onSelect: '=',
            onDragStart: '=',
            onDrop: '=',
            onBeforeDrop: '='
        };
    }

    link(scope, element, attrs) {
        let $ = angular.element;
        // console.log(scope.selectedNodes);
        // 相关属性参数初始化
        scope.animation = !!attrs.animation;
        scope.multiple = !!attrs.multiple;
        scope.editable = !!attrs.editable;
        scope.id = attrs.key || 'id';
        scope.name = attrs.name || 'name';
        scope.tooltip = attrs.tooltip || attrs.name || 'name';
        scope.children = attrs.children || 'children';
        scope.isChecked = (node, type) => {
            let children = node[scope.children] || [];
            let hasChecked = false;
            let hasNoChecked = false;

            for (let i = 0, len = children.length; i < len; i++) {
                hasNoChecked = hasNoChecked || !children[i].isSelected;
                hasChecked = hasChecked || !!children[i].isSelected;
            }

            return type === 'part' ? (hasNoChecked && hasChecked) : (hasChecked && !hasNoChecked);
        };
        scope.makeIconClass = function (node) {
            let iconClass = [];
            if (typeof scope.getIconClass === 'function') {
                iconClass.push(scope.getIconClass(node));
            }
            if (typeof attrs.icon === 'string') {
                iconClass.push(attrs.icon);
            }
            return iconClass.join(' ');
        };
        scope.makeToggleIconClass = node => {
            var iconClass = 'ui-tree-switcher';
            if (typeof scope.getToggleIconClass === 'function') {
                iconClass = scope.getToggleIconClass(node);
            }

            if (typeof attrs.toggleIcon === 'string') {
                iconClass = attrs.toggleIcon;
            }

            return iconClass;
        };
        scope.getCollapsed = node => {
            node.isCollapsed = angular.isUndefined(node.isCollapsed) ? !!scope.collapsed : node.isCollapsed;
            return node.isCollapsed;
        };
        let id = scope.id;
        let children = scope.children;
        let findNode = function (node, nodes, callback, parent) {
            let result = null;

            for (let i = 0, len = nodes.length; i < len; i++) {
                if (nodes[i][scope.id] + '' === node[scope.id] + '') {
                    result = nodes[i];
                    callback && callback(i, nodes, parent);
                }
                else {
                    result = findNode(node, nodes[i][scope.children] || [], callback, nodes[i]);
                }

                if (result) {
                    return result;
                }
            }

            return result;
        };
        let goThroughNodes = function (nodes, callback) {
            if (typeof callback !== 'function') {
                return;
            }

            (nodes || []).forEach(function (node, i) {
                if (callback(node)) {
                    return;
                }
                else {
                    goThroughNodes(node.children, callback);
                }
            });
        };

        // events
        angular.extend(
            scope,
            {
                toggle: function (node, evt) {
                    node.isCollapsed = !node.isCollapsed;
                    angular.isFunction(scope.onToggleExpand) && scope.onToggleExpand(node, evt);
                },
                edit: function (node, nodes, evt) {
                    goThroughNodes(nodes, function (node) {
                        node.isEdit = false;
                    });
                    node.isEdit = true;
                    angular.isFunction(scope.onEdit) && scope.onEdit(node, evt);
                },
                del: function (node, nodes, evt) {
                    findNode(node, nodes, function (index, nodes) {
                        nodes.splice(index, 1);
                    });
                    angular.isFunction(scope.onDelete) && scope.onDelete(node, evt);
                },
                select: function (node, nodes, evt) {
                    if (scope.multiple) {
                        // 处理子节点
                        goThroughNodes(node[scope.children], function (item) {
                            item.isSelected = !node.isSelected;
                        });

                        node.isSelected = !node.isSelected;
                        let tempNode = {};
                        let parentNode = node;
                        while (angular.isDefined(parentNode.$parentId)) {
                            tempNode[id] = parentNode.$parentId;
                            parentNode = findNode(tempNode, nodes);
                            parentNode.isSelected = scope.isChecked(parentNode);
                        }
                    } else {
                        if (!node.isSelected) {
                            goThroughNodes(nodes, function (node) {
                                node.isSelected = false;
                            });
                        }
                        node.isSelected = true;
                    }

                    angular.isFunction(scope.onSelect) && scope.onSelect(node, evt);
                },
                finishEdit: function (node) {
                    node.isEdit = false;
                },
                inputKeyup: function (node, e) {
                    if (e.keyCode === 13) {
                        this.finishEdit(node, e);
                    }
                },
                dragStart: function (node, nodes, e) {
                    e.originalEvent.dataTransfer.setData('id', node[id]);
                    e.handleObj.data = node;
                    console.log('dragStart...');
                },
                dragOver: function (node, nodes, e) {
                    e.preventDefault();
                },
                drop: function (node, nodes, e) {

                }
            }
        );
            
        let isDraging = false;
        let dragNodeId;
        let INSERT_TYPE = {
            BEFORE: 1, // 前兄弟节点插入
            IN: 2, // 子节点插入
            AFTER: 3 // 后兄弟节点插入
        };
        // 获取插入节点的位置，三种位置: 前兄弟，后兄弟，子节点
        let getInsertType = function (ele, e) {
            let rect = ele.getBoundingClientRect();
            let eventPos = {
                x: e.originalEvent.pageX,
                y: e.originalEvent.pageY - (document.body.scrollTop || document.documentElement.scrollTop)
            };
            let height = rect.height;
            let offsetY = eventPos.y - rect.top;
            let start = height / 4;
            let end = (height / 4) * 3;
            let insertType = INSERT_TYPE.IN;
            // console.log(start + '-' + offsetY + '-' + end + ' | ' + eventPos.y + '-' + rect.top);

            // 中间区域 作为孩子节点插入
            if (offsetY >= start && offsetY <= end) {
                insertType = INSERT_TYPE.IN;
            }

            // 中间偏上 作为前兄弟节点插入
            if (offsetY < start) {
                insertType = INSERT_TYPE.BEFORE;
            }

            // 中间偏下 作为后兄弟节点插入
            if (offsetY > end) {
                insertType = INSERT_TYPE.AFTER;
            }

            return insertType;
        };
        let dragHandler = function (e) {
            isDraging = true;
            let target = $(e.currentTarget);
            let nodeId = target.data('id');
            let node = {};
            node[id] = nodeId;
            node = findNode(node, scope.nodes);
            dragNodeId = nodeId;

            e.originalEvent.dataTransfer.effectAllowed = 'move';
            e.originalEvent.dataTransfer.setData('dragTarget', 'treenode');
            e.originalEvent.dataTransfer.setData('id', nodeId);
            e.originalEvent.dataTransfer.setData('data', JSON.stringify(node));

            scope.$apply(function () {
                node.isCollapsed = true;
                angular.isFunction(scope.onDragStart) && scope.onDragStart(node, e);
            });
        };
        let dragoverHandler = function (e) {
            e.preventDefault();
            let target = $(e.currentTarget);
            let nodeId = target.data('id');
            let insertType = getInsertType(target[0], e);

            if (isDraging && dragNodeId === nodeId) {
                return;
            }
            // console.log(nodeId + '-' + dragNodeId);

            // console.log('dragover:' + insertType);

            switch (insertType) {
                case INSERT_TYPE.BEFORE:
                    target.removeClass('insert-after insert-in').addClass('insert-before'); 
                    break;
                case INSERT_TYPE.IN:
                    target.removeClass('insert-after insert-before').addClass('insert-in');
                    break;
                case INSERT_TYPE.AFTER:
                    target.removeClass('insert-in insert-before').addClass('insert-after');
                    break;
            }
        };
        let dragleaveHandler = function (e) {
            $(e.currentTarget).removeClass('insert-before insert-in insert-after');
        };
        let dragendHandler = function (e) {
            isDraging = false;
        };
        let dropHandler = function (e) {
            let target = $(e.currentTarget);
            let nodeId = target.data('id');
            let node = findNode({id: nodeId}, scope.nodes);
            let parentNodeId = target.closest('ul').data('pid');
            let parentNode = findNode({id: parentNodeId}, scope.nodes);
            let dragNodeId = e.originalEvent.dataTransfer.getData('id');
            let insertNodeByType = (node, parentNode, addNode, insertIndex, insertType) => {
                let insertNodes = [];

                if (node && addNode) {
                    switch (insertType) {
                        case INSERT_TYPE.BEFORE:
                            insertNodes = parentNode ? parentNode[scope.children] : scope.nodes;
                            break;
                        case INSERT_TYPE.IN:
                            node[scope.children] = node[scope.children] || [];
                            insertNodes = node[scope.children];
                            insertIndex = insertNodes.length;
                            break;
                        case INSERT_TYPE.AFTER:
                            insertNodes = parentNode ? parentNode[scope.children] : scope.nodes;
                            insertIndex++;
                            break;
                    }
                    insertNodes.splice(insertIndex, 0, addNode);
                }
            };
            let moveNode = (node, parentNode, dragNode, nodes, insertType) => {
                if (node && dragNode) {
                    let insertIndex = 0;

                    if (parentNode) {
                        for (let i = 0, len = parentNode[children].length; i < len; i++) {
                            if (parentNode[children][i].id === node.id) {
                                insertIndex = i;
                                break;
                            }
                        }
                    }

                    // 当前tree 进行拖拽时，需先将该节点从当前位置删除
                    if (isDraging) {
                        findNode(dragNode, nodes, (index, children) => {
                            children.splice(index, 1);
                        });
                    }

                    insertNodeByType(node, parentNode, dragNode, insertIndex, insertType);
                }
            };

            let isTreeNode = e.originalEvent.dataTransfer.getData('dragTarget') === 'treenode';
            let dragNode = isTreeNode ? JSON.parse(e.originalEvent.dataTransfer.getData('data')) : null;

            // drop位置边界值判断，如果drop在元素竖直方向的中间区域，则将drop节点作为其子节点加入
            // 若在中间偏上的位置则作为前兄弟节点， 若在中间位置偏下则作为后兄弟节点加入
            let insertType = getInsertType(target[0], e);
            let preventDrop = scope.onBeforeDrop && !scope.onBeforeDrop(e, node, parentNode, dragNode, insertType);

            // 若拖拽的节点不是drop到自己，且onBeforeoDrop 外部回调未阻止drop则内部执行移动节点
            if (nodeId != dragNodeId && !preventDrop) {
                scope.$apply(() => {
                    moveNode(node, parentNode, dragNode, scope.nodes, insertType);
                });
            }

            angular.isFunction(scope.onDrop) && scope.onDrop(e, node, parentNode, dragNode, insertType);
            target.removeClass('insert-before insert-in insert-after');
            e.preventDefault();
        };

        scope.$watch('selectedNodes', selectedNodes => {
            console.log(selectedNodes, scope.id);
            selectedNodes = selectedNodes || [];
            let findNodeCount = 0;
            goThroughNodes(scope.nodes, node => {
                node.isSelected = selectedNodes.some(selectedNode => {
                    let selectedId = angular.isObject(selectedNode) ? selectedNode[scope.id] : selectedNode;
                    if (selectedId === node[scope.id]) {
                        findNodeCount++;
                    }
                    return selectedId === node[scope.id];
                });
                return findNodeCount === selectedNodes.length;
            }, scope.children);

            // 展开选中节点的所有祖先节点
            let parentNode;
            selectedNodes.forEach(selectedNode => {
                // console.log('selectedNodes', selectedNode);
                // debugger;
                let temp = {};
                if (angular.isObject(selectedNode)) {
                    temp = selectedNode;
                }
                else {
                    temp[scope.id] = selectedNode;
                }
                let parentId;
                let currentNode = findNode(temp, scope.nodes, (i, nodes, parent) => {
                    // debugger;
                    parentId = parent && parent[scope.id];
                });
                // console.log('currentNode', currentNode);
                if (currentNode && currentNode[scope.id]) {
                    parentNode = findNode(
                        {[scope.id]: parentId || currentNode.$parentId},
                        scope.nodes,
                        (i, nodes, parent) => {
                            parentId = parent && parent[scope.id];
                        }
                    );
                    // console.log('parentNode', parentNode);
                    while (parentNode && parentNode[scope.id]) {
                        // console.log('parentNode', parentNode);
                        parentNode.isCollapsed = false;
                        parentNode = findNode(
                            {[scope.id]: parentId || parentNode.$parentId},
                            scope.nodes,
                            (i, nodes, parent) => {
                                parentId = parent && parent[scope.id];
                            }
                        );
                    }
                }
            });
            // console.log(scope.nodes);
        });

        if (attrs.draggable) {
            // add drag & drop events
            $(element).on('dragstart', '.node-info', dragHandler);
            $(element).on('dragover', '.node-info', dragoverHandler);
            $(element).on('dragleave', '.node-info', dragleaveHandler);
            $(element).on('dragend', '.node-info', dragendHandler);
            $(element).on('drop', '.node-info', dropHandler);
        }
    }
}
