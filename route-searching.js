'use strict';

class Node {
    constructor() {
        this._edges = new Map();
    }

    /**
     * 
     * @param {Node} to 
     * @param {number} cost 
     * @param {*} data 
     */
    addEdgeTo(to, cost) {
        if (this.isConnectedTo(to)) throw new Error('This node is already conencted to the node.');
        const edge = new Edge(this, to, cost);
        this._addEdge(edge)
        edge.getAnotherNode(this)._addEdge(edge);
        return edge;
    }

    _addEdge(edge) {
        const anotherNode = edge.getAnotherNode(this);
        this._edges.set(anotherNode, edge)
    }

    getEdges() {
        return Array.from(this._edges.values());
    }

    getConenctedNodes() {
        return this.getEdges()
            .map(e => e.getAnotherNode(this));
    }

    /**
     * このノードと指定したノードへの接続を表すリンクを取得します。
     * @param {Node} node 
     * @returns 
     */
    getEdge(node) {
        return this._edges.get(node);
    }

    isConnectedTo(node) {
        return this._edges.has(node);
    }
}

class Edge {
    /**
     * 
     * @param {Node} from 
     * @param {Node} to 
     * @param {number} cost 
     */
    constructor(from, to, cost) {
        this.from = from;
        this.to = to;
        this.cost = cost;
    }

    getNodes() {
        return [from, to];
    }

    /**
     * このエッジが指定したノードに接続されているかどうかを調べます。
     * @param {Node} node 接続されているかどうかを調べるノード。
     */
    isConnectedTo(node) {
        return this.from === node || this.to === node;
    }

    /**
     * このエッジに接続されているノードのうち、指定したノードとは逆側のノードを取得します。
     * @param {Node} node このエッジに接続されているノードで、取得するノードと逆側のノード。
     */
    getAnotherNode(node) {
        if (this.from === node) return this.to;
        if (this.to === node) return this.from;
        throw new Error(`This edge is not connected to the node.`);
    }
}

class Route {
    constructor(lastNode, prevRoute) {
        this.lastNode = lastNode;
        this.prevRoute = prevRoute;
        if (prevRoute) {
            this.edge = prevRoute.lastNode.getEdge(lastNode);
            if (!this.edge) throw new Error('The prevRoute\'s lastNode is not connected to the node.');
            this.cost = prevRoute.cost + this.edge.cost;
        } else {
            this.edge = null;
            this.cost = 0;
        }
    }

    *_getNodes() {
        let cur = this;
        while (cur) {
            yield cur.lastNode;
            cur = cur.prevRoute;
        }
    }

    /**
     * この経路に含まれるノードを始点から順に格納した配列を取得します。
     */
    getNodes() {
        return Array.from(this._getNodes()).reverse();
    }

    /**
     * 経路上に指定したノードが存在するかどうかを調べます。
     * @param {Node} node 存在するかどうかを調べるノード。
     */
    contains(node) {
        for (const n of this._getNodes()) {
            if (n === node) return true;
        }
        return false;
    }

    /**
     * 経路の先に指定したノードを加えた新しい経路を返します。
     * @param {Node} node 経路の先に加えるノード。
     */
    append(node) {
        return new Route(node, this);
    }
}

class DFSRouteSearcher {
    constructor() {
        this.state = 'instantiated';
    }

    init(start, goal) {
        this.start = start;
        this.goal = goal;
        this.curRoute = new Route(start);
        this.stack = [this.curRoute];
        this.state = 'init';
    }

    next() {
        if (this.isFinished()) return;
        this.state = 'searching';
        const route = this.stack.pop();
        const lastNode = route.lastNode;
        const neighbors = lastNode.getConenctedNodes();
        for (const neighbor of neighbors) {
            if (route.contains(neighbor)) continue;
            const newRoute = route.append(neighbor);
            this.stack.push(newRoute);
        }

        this.curRoute = route;
        if (this.stack.length < 1) {
            this.state = 'finished';
        }
    }

    /**
     * 現在探索しているノードを取得します。
     */
    getNode() {
        return this.curRoute.lastNode;
    }

    /**
     * 現在探索している経路を取得します。
     */
    getCurrentRoute() {
        return this.curRoute;
    }

    /**
     * 探索が終了したかどうかを調べます。
     */
    isFinished() {
        return this.state === 'finished';
    }
}

class PointNode extends Node {
    constructor(id, x, y) {
        super();
        this.id = id;
        this.x = x;
        this.y = y;
    }

    getDistanceTo(node) {
        return Math.sqrt(
            (this.x - node.x) * (this.x - node.x)
            + (this.y - node.y) * (this.y - node.y)
        );
    }

    toString() {
        return `PointNode(${this.id})@(${this.x}, ${this.y})`;
    }
}