'use strict';

function generateRandomMap() {
    const nodes = [];
    for (let i = 0; i < 36; i++) {
        const x = 50 + Math.floor(i % 6) * 100;
        const y = 50 + Math.floor(i / 6) * 100;
        nodes[i] = new PointNode(i, x, y);
    }

    const edges = [];
    const edgeProbability = 0.4;

    for (let i = 0; i < 36; i++) {
        const currentNode = nodes[i];
        const row = Math.floor(i / 6);
        const col = i % 6;

        // Potential right neighbor
        if (col < 5) {
            const rightNeighbor = nodes[i + 1];
            if (Math.random() < edgeProbability) {
                const edge = currentNode.addEdgeTo(rightNeighbor, currentNode.getDistanceTo(rightNeighbor));
                edges.push(edge);
            }
        }

        // Potential down neighbor
        if (row < 5) {
            const downNeighbor = nodes[i + 6];
            if (Math.random() < edgeProbability) {
                const edge = currentNode.addEdgeTo(downNeighbor, currentNode.getDistanceTo(downNeighbor));
                edges.push(edge);
            }
        }

        // Potential bottom-right diagonal neighbor
        if (col < 5 && row < 5) {
            const diagonalNeighbor = nodes[i + 7];
            if (Math.random() < edgeProbability) {
                const edge = currentNode.addEdgeTo(diagonalNeighbor, currentNode.getDistanceTo(diagonalNeighbor));
                edges.push(edge);
            }
        }
    }

    // Ensure basic connectivity: each node has at least one edge
    for (let i = 0; i < 36; i++) {
        const currentNode = nodes[i];
        if (currentNode.getEdges().length === 0) {
            const row = Math.floor(i / 6);
            const col = i % 6;
            let connected = false;

            // Try to connect to right neighbor
            if (col < 5) {
                const rightNeighbor = nodes[i + 1];
                // Check if an edge already exists
                if (!currentNode.isConnectedTo(rightNeighbor)) { // Simplified check
                    const edge = currentNode.addEdgeTo(rightNeighbor, currentNode.getDistanceTo(rightNeighbor));
                    edges.push(edge);
                    connected = true;
                }
            }

            // If not connected, try to connect to down neighbor
            if (!connected && row < 5) {
                const downNeighbor = nodes[i + 6];
                // Check if an edge already exists
                if (!currentNode.isConnectedTo(downNeighbor)) { // Simplified check
                    const edge = currentNode.addEdgeTo(downNeighbor, currentNode.getDistanceTo(downNeighbor));
                    edges.push(edge);
                    connected = true;
                }
            }

            // Fallback: if still not connected and it's not the last node, connect to next node (simple linear connection)
            // This is a fallback, ideally the above should connect most nodes.
            // Avoid connecting to itself or if it's the very last node with no options.
            if (!connected && i < 35) {
                 const nextNode = nodes[i+1];
                 // Check if an edge already exists
                 if (!currentNode.isConnectedTo(nextNode)) { // Simplified check
                    const edge = currentNode.addEdgeTo(nextNode, currentNode.getDistanceTo(nextNode));
                    edges.push(edge);
                }
            }
        }
    }
    // TODO: Implement DFS/BFS to ensure a path from a startNode (e.g., nodes[0]) to an endNode (e.g., nodes[35]).
    // If not connected, add edges strategically. For now, the above loop helps reduce isolated nodes.

    return { nodes, edges };
}

const mapData = generateRandomMap();
const nodes = mapData.nodes;
const edges = mapData.edges;

// Old node and edge definitions (commented out)
/*
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
*/

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
        bestRoute: null,
        stepsTaken: 0 // New property
    },
    watch: {
        selectedAlgorithm(newAlgorithm) {
            if (newAlgorithm === 'DFS') {
                this.searcher = new DFSRouteSearcher();
            } else if (newAlgorithm === 'AStar') {
                this.searcher = new AStarRouteSearcher();
            }
            // Ensure start and goal nodes are valid for the current map
            const startNode = this.nodes && this.nodes.length > 0 ? this.nodes[0] : null;
            const goalNode = this.nodes && this.nodes.length > 0 ? this.nodes[this.nodes.length - 1] : null;
            if (startNode && goalNode) {
               this.searcher.init(startNode, goalNode);
            } else {
               console.error("Cannot initialize searcher: no nodes found after algorithm change.");
            }
            this.currentRoute = null;
            this.bestRoute = null;
        }
    },
    created() {
        // Initial searcher setup
        const startNode = this.nodes && this.nodes.length > 0 ? this.nodes[0] : null;
        const goalNode = this.nodes && this.nodes.length > 0 ? this.nodes[this.nodes.length - 1] : null;
        if (startNode && goalNode) {
           this.searcher.init(startNode, goalNode);
        } else {
            console.error("Cannot initialize searcher: no nodes found on created.");
        }
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
            this.stepsTaken++; // Increment step count
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
        },
        regenerateMap() {
            const newMapData = generateRandomMap();
            this.nodes = newMapData.nodes;
            this.edges = newMapData.edges;
            this.currentRoute = null;
            this.bestRoute = null;
            this.stepsTaken = 0; // Reset step count

            // Ensure start and goal nodes are valid for the new map
            const startNode = this.nodes && this.nodes.length > 0 ? this.nodes[0] : null;
            const goalNode = this.nodes && this.nodes.length > 0 ? this.nodes[this.nodes.length - 1] : null;

            if (startNode && goalNode) {
                this.searcher.init(startNode, goalNode);
            } else {
                // This case should ideally not be reached if generateRandomMap works correctly
                console.error("Cannot initialize searcher: no nodes found after regenerating map.");
            }
        },
        resetSearchState() {
            if (this.autoEnabled) { // Stop auto-execution first
                this.stop();
            }

            this.currentRoute = null;
            this.bestRoute = null;
            this.stepsTaken = 0; // Reset step count

            if (this.searcher && this.searcher.start && this.searcher.goal) {
                this.searcher.init(this.searcher.start, this.searcher.goal);
            } else if (this.searcher && this.nodes && this.nodes.length > 0) {
                // Fallback if start/goal somehow lost, re-init with default nodes
                console.warn("Searcher start/goal not found during reset, re-initializing with default nodes.");
                const startNode = this.nodes[0];
                const goalNode = this.nodes[this.nodes.length - 1];
                this.searcher.init(startNode, goalNode);
            } else {
                console.error("Cannot reset search state: searcher or nodes not available.");
            }
        }
    }
});
