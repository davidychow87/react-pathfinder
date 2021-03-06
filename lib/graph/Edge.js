import Unit from './Unit';

export default class Edge extends Unit {
    constructor(entity, properties) {
        super(entity, properties);

        this.inputNode = null;

        this.outputNode = null;
        //duplex - is it bidirectional
        this.duplex = false;

        this.distance = 1;
    }

    //link a specific node in a certain direction
    //inputEdge is the edge where it inputs to
    _linkTo(node, direction) {
        if (direction <= 0) {
            node.inputEdges.push(this);
        }

        if (direction >= 0) {
            node.outputEdges.push(this);
        }

        node.edges.push(this);
    }

    //link two nodes, optionally make edges bidirecional
    //inputNode ---> outputNode (---> is link direction)
    link(inputNode, outputNode, duplex) {
          //creating an edge w.o input node
        if (!inputNode || !outputNode) {
        
            return this;
        }

        this.unlink();

        this.inputNode = inputNode;

        this.outputNode = outputNode;

        this.duplex = !!duplex;

        if (duplex) {
            this._linkTo(inputNode, 0);
            this._linkTo(outputNode, 0);
            return this;
        }

        this._linkTo(inputNode, 1);
        this._linkTo(outputNode, -1);
        return this;
    }

    //distance for traversal
    setDistance(v) {
        this.distance = Math.abs(parseFloat(v) || 0);
        return this;
    }

    //weight is 1 / distance
    setWeight(v) {
        this.distance = 1 / Math.abs(parseFloat(v) || 0);
    }

    //find the oppositeNode given a starting node
    oppositeNode(node) {
        if (this.inputNode === node) {
            return this.outputNode;
        } else if (this.outputNode === node) {
            return this.inputNode;
        } 

        return;
    }

    unlink() {
        let pos;
        let inode = this.inputNode;
        let onode = this.outputNode;

        //either mising inode or onode
        if (!(inode && onode)) {
            return;
        }

        //inode links to an output node
        (pos = inode.edges.indexOf(this)) > -1 && inode.edges.splice(pos, 1);
        (pos = onode.edges.indexOf(this)) > -1 && onode.edges.splice(pos, 1);
        (pos = inode.outputEdges.indexOf(this)) > -1 && inode.outputEdges.splice(pos, 1);
        (pos = onode.inputEdges.indexOf(this)) > -1 && onode.inputEdges.splice(pos, 1);

        if (this.duplex) {
            (pos = inode.inputEdges.indexOf(this)) > -1 && inode.inputEdges.splice(pos, 1);
            (pos = onode.outputEdges.indexOf(this)) > -1 && onode.outputEdges.splice(pos, 1);  
        }

        this.inputNode = null;
        this.outputNode = null;

        this.duplex = false;
        return true;
    }
}