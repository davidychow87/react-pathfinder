import Unit from './Unit';

export default class Node extends Unit {
    constructor(entity, properties) {
        super(entity, properties);
        //if bidirection will have edge, inputEdge and outPut edge, but if uni have edge + either inputEdge or ouputEdge (link to other node)
        this.edges = []; //specifies all edges
        this.inputEdges = []; //other nodes link to this node (uni directional)
        this.outputEdges = []; //this node links to other nodes (uni directional)
    }

    unlink() {
        let edges = this.edges;

        for (let i = 0; i < edges.length; i++) {
            edges[i].unlink();
        }
        return true;
    }
}