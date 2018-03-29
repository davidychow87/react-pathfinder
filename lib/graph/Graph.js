import Node from './Node';
import Edge from './Edge';
import * as d3 from 'd3';
import * as LineGeometry from '../utils/line-geometry';
import * as conf from '../config/conf';
const LENGTH_PER_SEGMENT = 20;

export default class Graph {
    constructor(canvas) {
        this.nodes = [];
        this.edges = [];
        this.nodeCount = 0;
        this.edgeCount = 0;
        this.canvas = canvas;
        this.svg = d3.select(canvas).select('g');
        this.currentStartNode = null;
        this.currentEndNode = null;
        this.currentPath = null;
        this.canvasHeight = d3.select(canvas).node().getBBox().height;
        this.canvasWidth = d3.select(canvas).node().getBBox().width;
        this.xTick = this.canvasWidth / conf.GRID_DIVISIONS;
        this.yTick = this.canvasHeight / conf.GRID_DIVISIONS;
        this.grid = {}; //2d objects, where the grid[i][j] is an an object of { nodes, edges }
        this.drawGrid();
    }

    drawGrid() {
        let xTick = this.canvasWidth / conf.GRID_DIVISIONS;
        let yTick = this.canvasHeight / conf.GRID_DIVISIONS;

        for (let i = 0; i < conf.GRID_DIVISIONS; i++) {
            this.grid[i] = {};
            for (let j = 0; j < conf.GRID_DIVISIONS; j++) {
                this.grid[i][j] = { nodes: [], edges: [] };
            }
        }

        console.log('HIS GRID', this.grid);

        for (let i = xTick; i < this.canvasWidth; i += xTick) {
            this.svg.append('line')
                .attr('x1', i)
                .attr('y1', 0)
                .attr('x2', i)
                .attr('y2', this.canvasHeight - 1)
                .style("stroke-width", 0.2)
                .style("stroke", "blue")
        }

        for (let i = yTick; i < this.canvasHeight; i += yTick) {
            this.svg.append('line')
                .attr('x1', 0)
                .attr('y1', i)
                .attr('x2', this.canvasWidth - 1)
                .attr('y2', i)
                .style("stroke-width", 0.2)
                .style("stroke", "red")
        }
    }

    //pass in array of x y coordinates
    getGrid() {
        let point = d3.mouse(this.canvas);
        let x = point[0], y = point[1];
        let xGrid = Math.floor(x/this.xTick);
        let yGrid = Math.floor(y/this.yTick);
        return { xGrid, yGrid };
    }

    //Add edge to grid
    addToGrid({xGrid, yGrid}) {
        let currPathId = this.currentPath.get('id');
        let index = this.grid[xGrid][yGrid].edges.indexOf(currPathId);

        if (index < 0) {
            this.grid[xGrid][yGrid].edges.push(currPathId);
        }
    }

    findIntersection({xGrid, yGrid}) {

    }

    line = d3.line()
        .curve(d3.curveBasis) //Delete this if not wanted
        .x((d, i) => d.x )
        .y((d, i) => d.y );

    //Creates a node and Edge
    createPath(dataPoints) {
        console.log('Creating ', dataPoints);
        this.currentStartNode = this.addNode('intersection', { ...dataPoints[0] });

        this.currentPath = this.addEdge('path', { points: dataPoints });

        this.path = this.svg
            .append('path')
            .data([dataPoints])
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('stroke', 'black')
            .attr('d', this.line)
            .attr('id', `path${this.currentPath.get('id')}`);
    }

    calculateSegments () {
        let selectedPath = this.svg.select(`#path${this.currentPath.get('id')}`).node();
        let pathLength = selectedPath.getTotalLength();
        let n_segments = Math.ceil(pathLength / LENGTH_PER_SEGMENT);
        
        console.log('Pathlength is, nseg!', pathLength, n_segments);

        let newPath = [];

        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        this.segments = this.svg
            .append('g')
            
            // console.log('this.svg', this.svg.node());
            // console.log('Segs', this.segments.node());
            // var color = d3.scale.category10();
        for (let i = 0; i < n_segments; i++) {
            var pos1 = selectedPath.getPointAtLength(pathLength * i / n_segments);
            var pos2 = selectedPath.getPointAtLength(pathLength * (i+1) / n_segments);
            var lineSegment = {x1: pos1.x, x2: pos2.x, y1: pos1.y, y2: pos2.y};
            newPath.push(lineSegment);
                // console.log('Appending line segment', lineSegment);
                // console.log('SEGMENT', this.segments);
            // this.segments.append('line')
            //     .attr("class", "segment")
            //     .attr("x1", pos1.x)
            //     .attr("y1", pos1.y)
            //     .attr("x2", pos2.x)
            //     .attr("y2", pos2.y)
            //     .attr('stroke-width', 4)
            //     .attr('stroke', getRandomColor())

        }
        console.log('NEWPATH!', newPath);
    }

    tick(dataPoints, endPath, cb) {
        let line = this.line;
        this.path.attr('d', (d) => {
            return this.line(dataPoints);
        });
        this.currentPath.set('points', dataPoints);

        this.calculateSegments();

        //remove
        this.svg.selectAll(`#circle${this.currentPath.get('id')}`).remove();

        dataPoints.forEach(point => {
            this.svg.append('circle')
                .attr('cx', point.x)
                .attr('cy', point.y)
                .attr("r", 2)
                .attr('id', `circle${this.currentPath.get('id')}`)
                .style("fill",'red');

        });
       
        let gridPoint = this.getGrid();
        this.addToGrid(gridPoint);
        cb();

        // console.log('Line Geom', LineGeometry.lineIntersection({x1: 389.51806640625, x2: 389.51806640625, y1: 352.77484130859375, y2: 343.27166748046875}, {x1: "300", x2: "660", y1: "350", y2: "300"}))
        //bool = true when mouseOut
        //This is the final path
        if (endPath) {
            let length = dataPoints.length;

            //if only one point, delete the currentStartingNode
            if (length === 1) {
                // console.log('Deleting currnet start node', this.currentStartNode.get('id'));
                this.deleteNode(this.currentStartNode);
                this.currentStartNode = null;
                return;
            }

            let lastPt = dataPoints[length - 1];

            this.currentEndNode = this.addNode('intersection', { ...lastPt });
       
            // dataPoints.forEach(point => {
            //     this.svg.append('circle')
            //         .attr('cx', point.x)
            //         .attr('cy', point.y)
            //         .attr("r", 2)
            //         .style("fill",'red');
    
            // });

        
        }
    }

    addNode(entity = 'intersection', properties = {}) {
        properties.id = this.nodeCount;
        this.nodeCount++;
        let newNode = new Node(entity, properties);
        this.nodes.push(newNode);
        return newNode;        
    }

    deleteNode(node) {
        let nodeId = node.get('id'); console.log('DELETE NODE ID', nodeId);
        let index = this.nodes.findIndex(node => {
            return node.id === nodeId;
        });

        if (index > -1) {
            let deletedNode = this.nodes.splice(index, 1);
            return deletedNode[0];
        }

        return false;
    }

    addEdge(entity = 'path', properties = {}, inputNode, outputNode, duplex) {
        properties.id = this.edgeCount;
        this.edgeCount++;
        let newEdge = new Edge(entity, properties);
        newEdge.link(inputNode, outputNode, duplex);
        this.edges.push(newEdge);
        return newEdge;
    }

    getNodeById(id) {
        let node = this.nodes.filter((node) => {
            return node.get('id') === id;
        })[0];

        return node ? node : null;
    }

    bfs(nodeId, callback) {
        let initialize = () => {
            let list = {};
            for (let i = 0; i < this.nodes.length; i++) {
                list[this.nodes[i].get('id')] = 'unvisited';
            }
            return list;
        };

        let initDist = () => {
            let dist = [], pred = [];
            let nodes = this.nodes;

            for (let i = 0; i < nodes.length; i++) {
                dist[nodes[i].get('name')] = 0;
                pred[nodes[i].get('name')] = null;
            }

            return { dist, pred }
        }

        let list = initialize();
        let node = this.getNodeById(nodeId), queue = [];
        let { dist, pred } = initDist();

        queue.push(node);

        while(queue.length > 0) {
            let current = queue.shift();
            let id = current.get('id');
            list[id] = 'visited';
            let adjList = current.edges;

            for (let i = 0; i < adjList.length; i++) {
                let nextNode = adjList[i].oppositeNode(current);
                let nextNodeId = nextNode.get('id');
                let nextNodeName = nextNode.get('name');
                // console.log('NextNode', nextNode, nextNodeId);
                if (list[nextNodeId] === 'unvisited') {
                    list[nextNodeId] === 'visited';
                    console.log('Going to visit', nextNode.properties.name);
                    dist[nextNodeName] = dist[current.get('name')] + 1;
                    pred[nextNodeName] = current.get('name');
                    queue.push(nextNode);
                } else {
                    console.log(nextNode.properties.name, 'already vistited');
                }
            }
            list[id] = 'completed';
            if (callback) {
                callback(current);
            }
        }
        console.log('Distances', dist);
        console.log('Predecessors', pred);
    }
}