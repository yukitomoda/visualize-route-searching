'use strict';

const nodes = [];
for (let i = 0; i < 36; i++) {
    const x = 50 + Math.floor(i % 6) * 100;
    const y = 50 + Math.floor(i / 6) * 100;
    nodes[i] = new PointNode(i, x, y);
}

const edges = [];
function addEdge(fromIndex, toIndex) {
    const from = nodes[fromIndex];
    const to = nodes[toIndex];
    const edge = from.addEdgeTo(to, from.getDistanceTo(to));
    edges.push(edge);
}

function addEdges(map) {
    const fromIds = Object.keys(map);
    for (let i = 0; i < fromIds.length; i++) {
        const fromId = Number(fromIds[i]);
        const toIds = map[fromIds[i]];
        for (let j = 0; j < toIds.length; j++) {
            const toId = toIds[j];
            addEdge(fromId, toId);
        }
    }
}

addEdges({
    0: [1, 6, 7],
    1: [7],
    2: [3, 7, 8],
    3: [4],
    4: [5],
    5: [11],
    6: [19],
    7: [13],
    8: [19, 28],
    9: [10, 15],
    10: [16, 17],
    11: [17],
    12: [18],
    13: [19],
    14: [],
    15: [16],
    16: [],
    17: [23],
    18: [31],
    19: [25],
    20: [21, 26],
    21: [27],
    22: [29],
    23: [29],
    24: [30, 31],
    25: [31],
    26: [27],
    27: [],
    28: [34],
    29: [35],
    30: [31],
    31: [32],
    32: [33],
    33: [34],
    34: [35],
});


// Vue
Vue.filter('toPrecision', function (value, precision) {
    return value.toPrecision(precision);
});

const app = new Vue({
    el: '#app',
    data: {
        selectedAlgorithm: 'DFS',
        autoEnabled: false,
        autoInterval: 30,
        nodes: nodes,
        edges: edges,
        searcher: new DFSRouteSearcher(),
        currentRoute: null,
        bestRoute: null
    },
    created() {
        this.searcher.init(nodes[0], nodes[22]);
    },
    computed: {
        currentRoutePath() {
            if (this.currentRoute) {
                const nodes = this.currentRoute.getNodes();
                return nodes.map(n => `${n.x},${n.y}`).join(' ');
            } else {
                return null;
            }
        },
        bestRoutePath() {
            if (this.bestRoute) {
                const nodes = this.bestRoute.getNodes();
                return nodes.map(n => `${n.x},${n.y}`).join(' ');
            } else {
                return null;
            }
        }
    },
    methods: {
        next() {
            if (this.searcher.isFinished()) return;
            this.searcher.next();
            this.currentRoute = this.searcher.getCurrentRoute();
            if (this.currentRoute) {
                console.log(this.currentRoute.getNodes().map(n => n.toString()));
                if (this.currentRoute.lastNode === this.searcher.goal) {
                    if (!this.bestRoute || this.currentRoute.cost < this.bestRoute.cost) {
                        this.bestRoute = this.currentRoute;
                    }
                }
            }
        },
        start() {
            this.autoEnabled = true;
            setTimeout(() => {
                if (!this.autoEnabled) return;
                this.next();
                this.start();
            }, this.autoInterval);
        },
        stop() {
            this.autoEnabled = false;
        }
    }
});
