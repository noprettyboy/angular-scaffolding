/**
 * @file layout calculate points and edges position
 * @author zhang.com
 */
export default class DirectionGraphLayout {
    constructor(nodes, edges, width, height, radius, callback) {
        console.log(nodes, edges, width, height, radius);
        this.graph = {
            nodes: nodes,
            edges: edges,
            layoutMinX: 0,
            layoutMaxX: 0,
            layoutMinY: 0,
            layoutMaxY: 0
        };

        this.factorX = 0;
        this.factorY = 0;
        this.iterations = 500; // default 500
        this.maxRepulsiveForceDistance = 4; // default 6
        this.k = 2;
        this.c = 0.01;
        this.maxVertexMovement = 0.5;

        this.width = width || 960;
        this.height = height || 320;
        this.radius = radius || 40;

        this.layout();
    }

    layout() {
        // console.time('layout');
        // console.time('layoutPrepare');
        this.layoutPrepare();

        // console.timeEnd('layoutPrepare');
        for (let i = 0; i < this.iterations; i++) {
            // console.time('layoutIteration' + i);
            this.layoutIteration();
            // console.timeEnd('layoutIteration' + i);
        }
        // console.time('layoutCalcBounds');
        this.layoutCalcBounds();
        // console.timeEnd('layoutCalcBounds');
        // console.time('calculatePosintPos');
        this.calculatePosintPos();
        // console.timeEnd('calculatePosintPos');
        // console.timeEnd('layout');
    }
    
    layoutPrepare() {
        for (let i in this.graph.nodes) {
            let node = this.graph.nodes[i];
            node.layoutPosX = 0;
            node.layoutPosY = 0;
            node.layoutForceX = 0;
            node.layoutForceY = 0;
        }
    }
    
    layoutCalcBounds() {
        let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;

        for (let i in this.graph.nodes) {
            let x = this.graph.nodes[i].layoutPosX;
            let y = this.graph.nodes[i].layoutPosY;
            
            if(x > maxx) maxx = x;
            if(x < minx) minx = x;
            if(y > maxy) maxy = y;
            if(y < miny) miny = y;
        }

        this.graph.layoutMinX = minx;
        this.graph.layoutMaxX = maxx;
        this.graph.layoutMinY = miny;
        this.graph.layoutMaxY = maxy;

        if (this.graph.layoutMaxX === this.graph.layoutMinX) {
            this.graph.layoutMaxX = this.width;
        }
        if (this.graph.layoutMaxY === this.graph.layoutMinY) {
            this.graph.layoutMaxY = this.height;
        }
    }
    
    layoutIteration() {
        // Forces on nodes due to node-node repulsions

        // console.group('layoutRepulsives');
        // console.time('layoutRepulsive');
        let prev = new Array();
        for(let c in this.graph.nodes) {
            let node1 = this.graph.nodes[c];
            for (let d in prev) {
                let node2 = this.graph.nodes[prev[d]];
                this.layoutRepulsive(node1, node2);
                
            }
            prev.push(c);
        }

        // console.timeEnd('layoutRepulsive');
        // console.groupEnd('layoutRepulsives');
        
        // console.time('layoutAttractives');
        // console.group('layoutAttractives');
        // Forces on nodes due to edge attractions
        for (let i = 0; i < this.graph.edges.length; i++) {
            let edge = this.graph.edges[i];
            // console.time('layoutAttractive' + i);
            this.layoutAttractive(edge);
            // console.timeEnd('layoutAttractive' + i);          
        }
        // console.groupEnd('layoutAttractives');
        // console.timeEnd('layoutAttractives');
        
        // Move by the given force
        for (let i in this.graph.nodes) {
            let node = this.graph.nodes[i];
            let xmove = this.c * node.layoutForceX;
            let ymove = this.c * node.layoutForceY;

            let max = this.maxVertexMovement;
            if(xmove > max) xmove = max;
            if(xmove < -max) xmove = -max;
            if(ymove > max) ymove = max;
            if(ymove < -max) ymove = -max;
            
            node.layoutPosX += xmove;
            node.layoutPosY += ymove;
            node.layoutForceX = 0;
            node.layoutForceY = 0;
        }
        // console.log('nodes:', this.graph.nodes);
    }

    layoutRepulsive(node1, node2) {
        if (typeof node1 == 'undefined' || typeof node2 == 'undefined')
            return;
        let dx = node2.layoutPosX - node1.layoutPosX;
        let dy = node2.layoutPosY - node1.layoutPosY;
        let d2 = dx * dx + dy * dy;
        let randNum1 = Math.random();
        let randNum2 = Math.random();
        // console.log(randNum1, randNum2);
        if(d2 < 0.01) {
            dx = 0.1 * randNum1 + 0.1;
            dy = 0.1 * randNum2 + 0.1;
            d2 = dx * dx + dy * dy;
        }
        let d = Math.sqrt(d2);
        // console.group('node pos calc');
        // console.log(node1.layoutForceX, node1.layoutForceY);
        if(d < this.maxRepulsiveForceDistance) {
            let repulsiveForce = this.k * this.k / d;
            node2.layoutForceX += repulsiveForce * dx / d;
            node2.layoutForceY += repulsiveForce * dy / d;
            node1.layoutForceX -= repulsiveForce * dx / d;
            node1.layoutForceY -= repulsiveForce * dy / d;
        }
        // console.log(node1.layoutForceX, node1.layoutForceY);
        // console.groupEnd('node pos calc');
    }

    layoutAttractive(edge) {
        let node1 = edge.source;
        let node2 = edge.target;
        
        let dx = node2.layoutPosX - node1.layoutPosX;
        let dy = node2.layoutPosY - node1.layoutPosY;
        let d2 = dx * dx + dy * dy;
        if(d2 < 0.01) {
            dx = 0.1 * Math.random() + 0.1;
            dy = 0.1 * Math.random() + 0.1;
            d2 = dx * dx + dy * dy;
        }
        let d = Math.sqrt(d2);
        if(d > this.maxRepulsiveForceDistance) {
            d = this.maxRepulsiveForceDistance;
            d2 = d * d;
        }
        let attractiveForce = (d2 - this.k * this.k) / this.k;
        if(edge.attraction == undefined) edge.attraction = 1;
        attractiveForce *= Math.log(edge.attraction) * 0.5 + 1;
        
        node2.layoutForceX -= attractiveForce * dx / d;
        node2.layoutForceY -= attractiveForce * dy / d;
        node1.layoutForceX += attractiveForce * dx / d;
        node1.layoutForceY += attractiveForce * dy / d;
    }

    calculatePosintPos() {
        this.factorX = (this.width - 2 * this.radius) / (this.graph.layoutMaxX - this.graph.layoutMinX);
        this.factorY = (this.height - 2 * this.radius) / (this.graph.layoutMaxY - this.graph.layoutMinY);
        for (let i in this.graph.nodes) {
            this.graph.nodes[i].point = this.getPointPos(this.graph.nodes[i]);
        }
        // for (let i = 0; i < this.graph.edges.length; i++) {
        //     this.drawEdge(this.graph.edges[i]);
        // }
    }

    getPointPos(node) {
        let point = {
            x: (node.layoutPosX - this.graph.layoutMinX) * this.factorX + this.radius,
            y: (node.layoutPosY - this.graph.layoutMinY) * this.factorY + this.radius
        };
        node.point = point;
        node.x = point.x;
        node.y = point.y;

        return point;
    }
}
