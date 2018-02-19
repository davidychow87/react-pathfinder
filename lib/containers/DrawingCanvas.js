//This method will use d3 to render
//pass in ref to a node
import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import reduce from '../utils/reduce';
import Graph from '../graph/Graph';

export default class DrawingCanvas extends Component {
  static propTypes = {
    // data: PropTypes.array.isRequired,
  }

  state = {
    drawing: false,
    currData: [],
    session: [],
  };

  dataPoints = [1,2,3];

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
    this.Graph = new Graph(this.node);
  }

  // bindSetState(obj) {
  //   this.setState({...obj});
  // }

  listen() {
      console.log('EVENT TYPE', d3.event.type)
    this.setState({drawing: true, currData: []}, () => {
      this.Graph.createPath(this.state.currData);

      // this.path = this.svg
      //   .append('path')
      //   .data([this.state.currData])
      //   .attr('class', 'line')
      //   .attr('fill', 'none')
      //   .attr('stroke-width', 2)
      //   .attr('stroke', 'black')
      //   .attr('d', this.line);
    //   console.log('listen state', this.state.currData);
        // console.log('d3.mouse is', d3.mouse(this.node));
        if (d3.event.type === 'mousedown') {
          d3.select(this.node).on("mousemove", this.onMove.bind(this));
        } else {
          d3.select(this.node).on("touchmove", this.onMove.bind(this));
        }
    });
  }

  ignore() {
    d3.select(this.node).on("mousemove", null);
    d3.select(this.node).on("touchmove", null);


    if (!this.state.drawing) return;
    this.setState({drawing: false});
    console.log('Old currData', this.state.currData);
    let reducedData = reduce(this.state.currData);
    this.setState({currData: reducedData, session: reducedData.length ? this.state.session.concat([reducedData]): this.state.session}, () => {
      console.log('New Curr Data', this.state.currData);
      console.log('node is!', this.node)
      this.tick(true);
    });
    

  }

  onMove() {
    let point, type = d3.event.type;

    if (type === 'mousemove') {
      point = d3.mouse(this.node);
      // console.log('POINT IS', point)
    } else { //only single touch input
      point = d3.touches(this.node)[0];
      // console.log('Point is touch', point);
    }

    let obj = { x: point[0], y: point[1] };
    this.setState({currData: this.state.currData.concat([obj]) });
    // console.log('on Move ts', this.state.currData);
    this.tick();
  }

  tick(bool) {
    this.Graph.tick(this.state.currData, bool);
    // let line = this.line;

    // this.path.attr('d', (d) => {

    //   return this.line(this.state.currData);
    // });
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