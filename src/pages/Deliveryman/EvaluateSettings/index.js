import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router, { routerRedux } from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker, Icon } from 'antd';

import DriverPlatformComment from './DriverPlatformComment';
import DriverCityComment from './DriverCityComment';
import MerchantComment from './MerchantComment';

const tabItem = [
  'driverPlatformComment',
  'driverCityComment',
  'merchantComment',
];

class EvaluateSettings extends Component {
  state = {
    key: '',
  };

  componentDidMount() {
    const { location } = this.props;

    // 切换tab
    let keys = location.query.tab_key;
    if (tabItem.indexOf(keys) != -1) {
      this.redirectUrl(keys);
    } else {
      this.redirectUrl(tabItem[0]);
    }
  }

  onTabChange = (key, type) => {
    // console.log(key, type);
    this.setState({ [type]: key });
    this.redirectUrl(key);
  };

  redirectUrl = key => {
    const { match } = this.props;
    this.setState({
      key: key,
    });
    router.push({
      pathname: '/deliveryman/evaluateSettings',
      query: {
        tab_key: key,
      },
    });
  };

  render() {
    const { merchant, loading } = this.props;

    const tabTitle = [
      {
        key: tabItem[0],
        tab: '平台专送',
      },
      {
        key: tabItem[1],
        tab: '全城送',
      },
      {
        key: tabItem[2],
        tab: '商家自配送',
      },
    ];

    const contentList = {
      driverPlatformComment: <DriverPlatformComment {...this.props.match} />,
      driverCityComment: <DriverCityComment {...this.props.match} />,
      merchantComment: <MerchantComment {...this.props.match} />,
    };

    return (
      <Card bordered={false}>
        <div className="page_head" style={{ marginBottom: 0 }}>
          <span className="page_head_title">
            {/* <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.goBack()}
            /> */}
            评价管理
          </span>
          <Link to="/deliveryman/evaluateSettings/evaluateLabel">
            <span style={{ marginLeft: '50px', fontSize: '16px', color: '#000' }}><Icon type="setting" /> 标签设置</span>
          </Link>
        </div>
        <Card
          style={{ width: '100%' }}
          tabList={tabTitle}
          activeTabKey={this.state.key}
          onTabChange={key => {
            this.onTabChange(key, 'key');
          }}
          bordered={false}
          className="merchant_tab_nav"
        >
          {contentList[this.state.key]}
        </Card>
      </Card>
    );
  }
}

export default EvaluateSettings;
