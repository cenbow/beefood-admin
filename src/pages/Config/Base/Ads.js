import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Tabs, Table } from 'antd';

import styles from '../Config.less';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ list }) => ({
  list,
}))
@Form.create()
class Ads extends PureComponent {

  handleChangeRegion = (value) => {
    console.log(`selected ${value}`);
  }

  render () {
    const {
      list: { list },
    } = this.props;

    const imgStyle = {
      sm: 12,
      md: 8,
      lg: 4,
    }

    return (
      <Fragment>
        {/* <div className={styles.tableListOperator}>
          <div className={styles.left}>
            <span>投放区域：</span>
            <Select defaultValue="0" style={{ width: 120 }} onChange={this.handleChangeRegion}>
              <Option value="0">全部</Option>
              <Option value="1">广州</Option>
            </Select>
          </div>
          <div className={styles.right}><Link to="/config/base/ads/create"><Button type="primary" icon="plus">新增广告</Button></Link></div>
        </div> */}
        <div className="page_head" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <span className="page_head_title">广告设置</span>
        </div>
        <div className={styles.formView}>
          <Row gutter={24}>
            <Col {...imgStyle}>
              <div className={styles.positionTitle}><FormattedMessage id="config.base.startPage" /></div>
              <div className={styles.positionBox}>
                <Link to="/config/base/ads/list/1">
                  <img src="http://dummyimage.com/200x200" alt="" />
                  <div className={styles.desc}><FormattedMessage id="config.base.previewPictures" /></div>
                </Link>
              </div>
            </Col>
            <Col {...imgStyle}>
              <div className={styles.positionTitle}><FormattedMessage id="config.base.homePageModal" /></div>
              <div className={styles.positionBox}>
                <Link to="/config/base/ads/list/2">
                  <img src="http://dummyimage.com/200x200" alt="" />
                  <div className={styles.desc}><FormattedMessage id="config.base.previewPictures" /></div>
                </Link>
              </div>
            </Col>
            <Col {...imgStyle}>
              <div className={styles.positionTitle}><FormattedMessage id="config.base.homeTop" /></div>
              <div className={styles.positionBox}>
                <Link to="/config/base/ads/list/3">
                  <img src="http://dummyimage.com/200x200" alt="" />
                  <div className={styles.desc}><FormattedMessage id="config.base.previewPictures" /></div>
                </Link>
              </div>
            </Col>
            <Col {...imgStyle}>
              <div className={styles.positionTitle}><FormattedMessage id="config.base.recommend" /></div>
              <div className={styles.positionBoxBorder}>
                <p>暂无广告</p>
                <Link to="/config/base/ads/list/4">点击设置</Link>
              </div>
            </Col>
            <Col {...imgStyle}>
              <div className={styles.positionTitle}><FormattedMessage id="config.base.orderDetails" /></div>
              <div className={styles.positionBox}>
                <Link to="/config/base/ads/list/5">
                  <img src="http://dummyimage.com/200x200" alt="" />
                  <div className={styles.desc}><FormattedMessage id="config.base.previewPictures" /></div>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </Fragment>
    );
  }
}

export default Ads;