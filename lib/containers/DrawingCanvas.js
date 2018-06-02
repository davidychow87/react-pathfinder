//This method will use d3 to render
//pass in ref to a node
import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import reduce from '../utils/reduce';
import Graph from '../graph/Graph';
const REDUCTION = 0.8; //Smaller is more accurate

export default class DrawingCanvas extends Component {
  static propTypes = {
    // data: PropTypes.array.isRequired,
  }

  state = {
    drawing: false,
    currData: [],
    session: [],
  };

  componentWillMount() {
    this.createCanvas = this.createCanvas.bind(this);
  }

  componentDidMount() {
    this.createCanvas();
    // d3.select(this.node).on('mousemove', this.listen.bind(this));

    //need to use bind b/c d3.select().on binds an object to listen
    d3.select(this.node).on('mousedown', this.listen.bind(this));
    d3.select(this.node).on('touchstart', this.listen.bind(this));
    d3.select(this.node).on('mouseup', this.ignore.bind(this));
    d3.select(this.node).on('touchend', this.ignore.bind(this));
    d3.select(this.node).on('touchleave', this.ignore.bind(this));
    d3.select(this.node).on('mouseleave', this.ignore.bind(this));
    // d3.select(this.node).on('mousemove', this.showPoints.bind(this));
    // d3.select(this.node).on('mouseenter', this.showPoints.bind(this));
    this.Graph = new Graph(this.node);
  }

  showPoints() {
    console.log('Event type', d3.event.type);
    let firstPt = { x: d3.mouse(this.node)[0], y: d3.mouse(this.node)[1]};
    console.log('Point is', firstPt);
  }

  listen() {
    if (d3.event.which === 2) {
      console.log('POINT IS', d3.mouse(this.node))
      return;
    }

    let firstPt = { x: d3.mouse(this.node)[0], y: d3.mouse(this.node)[1]};

    this.setState({drawing: true, currData: [firstPt]}, () => {
      this.Graph.createPath(this.state.currData);
        if (d3.event.type === 'mousedown') {
          d3.select(this.node).on("mousemove", this.onMove.bind(this));
        } else {
          d3.select(this.node).on("touchmove", this.onMove.bind(this));
        }
    });
  }

  ignore(e) {
    d3.select(this.node).on("mousemove", null);
    d3.select(this.node).on("touchmove", null);
    // console.log('E is', d3.event.type)

    if (!this.state.drawing) return;
    this.setState({drawing: false});

    let reducedData = reduce(this.state.currData, REDUCTION);
    // let reducedData = this.state.currData;
    this.setState({currData: reducedData}, () => {
      this.tick(true);
    });
    

  }

  onMove() {
    let point, type = d3.event.type;
// console.log('MOVE');
    if (type === 'mousemove') {
      point = d3.mouse(this.node);
      // console.log('POINT IS', point)
    } else { //only single touch input
      point = d3.touches(this.node)[0];
      // console.log('Point is touch', point);
    }

    let obj = { x: point[0], y: point[1] };
    let reducedData = reduce(this.state.currData.concat([obj]), REDUCTION)

    this.setState({currData: reducedData }, () => {
      this.tick();
    });
  }

  tick(endPath) {
    // console.log('TICK', this.state.currData);
    this.Graph.tick(this.state.currData, endPath, () => {
      // console.log('CALLBACK');
    });
  }

  line = d3.line()
    .curve(d3.curveBasis) //Delete this if not wanted
    .x((d, i) => d.x )
    .y((d, i) => d.y );

  

  createCanvas() {
    const node = this.node;
    const data = this.props.data;
    let yMax, yMin, xMax, xMin;

    var width = this.props.width, height = this.props.height;

    this.svg = d3.select(node)
      .append('g');

    var bordercolor = 'black';
    var border = 1;
    var borderPath = this.svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", width)
      .style("stroke", bordercolor)
      .style("fill", "none")
      .style("stroke-width", border);
  }

  render() {
    const { height, width } = this.props;

    return (<svg 
              ref={node => this.node = node} 
              width={width} height={height}
              style={{margin: '10px'}}
            >
            </svg>);
  }

}