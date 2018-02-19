import Button from './components/Button';
import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import DrawingCanvas from './containers/DrawingCanvas';


export default class PathFinder extends Component {

  render() {
    const { height, width } = this.props;
    return (
      <div>
        <DrawingCanvas height={500} width={500}/>
      </div>
    );
  }
}

export {
  Button
}