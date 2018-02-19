import Node from './Node';
import Edge from './Edge';
import * as d3 from 'd3';

export default class Graph {
    constructor(canvas) {
        this.nodes = [];
        this.edges = [];
        this.nodeCount = 0;
        this.edgeCount = 0;
        this.canvas = canvas;
        this.svg = d3.select(canvas).select('g');
    }

    line = d3.line()
        .curve(d3.curveBasis) //Delete this if not wanted
        .x((d, i) => d.x )
        .y((d, i) => d.y );

    createPath(dataPoints) {
        console.log('Creating Graph D', dataPoints);
        this.path = this.svg
            .append('path')
            .data([dataPoints])
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('stroke', 'black')
            .attr('d', this.line)
            .attr('id', 'lolz')

        // this.circle = this.svg.selectAll('circle')
        //     .data(dataPoints)
        //     .enter()
        //     .append('circle')
        //     .attr("cx", function (d) { return d.x; })
        //     .attr("cy", function (d) { return d.y; })
        //     .attr("r", function (d) { return 2; })
        //     .style("fill", function(d) { return 'red'; });
    }

    tick(dataPoints, bool) {
        console.log('GRAPH TICK!!', dataPoints);
        let line = this.line;
        this.path.attr('d', (d) => {
            return this.line(dataPoints);
        });

        let n_segments =5;
// console.log('THIS PATH', this.svg.select('path').node());
// console.log('Get by id', this.svg.select('#lolz').node());
        let path = this.svg.select('#lolz');
        let selectedPath = this.svg.select('#lolz').node();
        let pathLength = selectedPath.getTotalLength();
console.log('SelectedPath Length', path);
for (let i = 0; i < n_segments; i++) {
    var pos1 = selectedPath.getPointAtLength(pathLength * i / n_segments);
    var pos2 = selectedPath.getPointAtLength(pathLength * (i+1) / n_segments);
    // var line1 = {x1: pos1.x, x2: pos2.x, y1: pos1.y, y2: pos2.y};
    console.log('Poses', pos1, pos2)
}
        if (bool) {
            dataPoints.forEach(point => {
                this.svg.append('circle')
                    .attr('cx', point.x)
                    .attr('cy', point.y)
                    .attr("r", 2)
                    .style("fill",'red');
    
            })
        }
        
       
        // let circles = this.svg.selectAll('circle')
        //                     .data(dataPoints);
        //                     // .enter()
        //                     // .append('circle')
        //                     // .attr("cx", function (d) { return d.x; })
        //                     //     .attr("cy", function (d) { return d.y; })
        //                     //     .attr("r", function (d) { return 2; })
        //                     //     .style("fill", function(d) { return 'red'; });

        // circles.exit().remove();
    
        // let newCircles = circles.enter()
        //                         .append('circle')
        //                         .attr("cx", function (d) { return d.x; })
        //                         .attr("cy", function (d) { return d.y; })
        //                         .attr("r", function (d) { return 2; })
        //                         .style("fill", function(d) { return 'red'; });

        // circles.merge(newCircles)
        // .attr("r", function (d) { return 2; });
    }

    addNode(entity = 'node', properties = {}) {
        properties.id = this.nodeCount;
        this.nodeCount++;
        let newNode = new Node(entity, properties);
        this.nodes.push(newNode);
        return newNode;        
    }

    addEdge(entity = 'edge', properties = {}, inputNode, outputNode, duplex) {
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