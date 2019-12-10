import React, { Component } from 'react';
import { connect } from 'dva';
// import styles from './index.less';

import timg from '@/assets/images/timg.jpg';

@connect(({ common }) => ({ common }))
class ShowImg extends Component {
  render() {
    const {
      common: { commonConfig: { image_domain } },
      src,
      className,
      style,
    } = this.props;
    return (
      <img src={src ? (image_domain + src) : timg} className={className} style={style} alt="" />
    )
  }
}

export default ShowImg;