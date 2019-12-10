import React, { Component } from 'react';
import reactCSS from 'reactcss';
import { ChromePicker } from 'react-color';

export default class index extends Component {
  state = {
    displayColorPicker: false,
    // color: {
    //   r: '255',
    //   g: '255',
    //   b: '255',
    //   a: '1',
    // },
    color: '#fff',
  };

  componentDidMount () {
    this.setState({
      color: this.props.color,
    })
  }

  // 选择颜色
  handleColorClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };
  handleColorClose = () => {
    this.setState({ displayColorPicker: false });
    this.props.selectColor(this.state.color);
  };
  handleColorChange = (color) => {
    // this.setState({ color: color.rgb });
    this.setState({ color: color.hex });
  };

  render () {
    const colorStyles = reactCSS({
      'default': {
        box: {
          height: '40px',
          float: 'left',
          padding: '4px 0',
          position: 'relative',
        },
        color: {
          width: '92px',
          height: '22px',
          borderRadius: '2px',
          background: `${this.state.color}`
          // background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '2px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          top: '40px',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <span style={colorStyles.box}>
        <div style={colorStyles.swatch} onClick={this.handleColorClick}>
          <div style={colorStyles.color} />
        </div>
        {this.state.displayColorPicker ? <div style={colorStyles.popover}>
          <div style={colorStyles.cover} onClick={this.handleColorClose} />
          <ChromePicker color={this.state.color} onChange={this.handleColorChange} />
        </div> : null}
      </span>
    )
  }
}
