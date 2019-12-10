import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router, { routerRedux } from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker, Icon } from 'antd';

import Info from './Info';
import ShopConfiguration from './ShopConfiguration';
import Commodity from './Commodity';
import FinanceList from './FinanceList';
import CommentList from './CommentList';
import OrderList from './OrderList';

import Coupon from './components/Coupon/index';
import FirstOrderReduce from './components/FirstOrderReduce/index';
import Rebate from './components/Rebate/index';
import FullReduction from './components/FullReduction/index';
import LimitActivity from './components/LimitActivity/index';
import AmbientInfo from './AmbientInfo';
import AuthInfo from './AuthInfo';
import ChangePass from './components/ChangePass/index';

const tabItem = [
  'info',
  'shopConfiguration',
  'commodity',
  'orderList',
  'tab5',
  'commentList',
  'financeList',
  'coupon',
  'firstOrderReduce',
  'rebate',
  'fullReduction',
  'limitActivity',
  'ambientInfo',
  'authInfo',
  'changePass'
];

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.models.merchant,
}))
class MerchantDetails extends Component {
  state = {
    key: '',
  };

  componentDidMount () {
    const { dispatch, match, location } = this.props;

    // 获取认证状态信息
    dispatch({
      type: 'merchant/fetchMerchantAuditStatus',
      payload: {
        merchant_id: match.params.id,
      },
    });

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
      pathname: '/merchant/details/' + match.params.id,
      query: {
        tab_key: key,
      },
    });
  };

  render () {
    const { merchant, loading } = this.props;
    const { merchantAuditStatus = {} } = merchant;

    const tabTitle = [
      {
        key: tabItem[0],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.basic_verify_status == 3 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 基本信息
          </span>
        ),
      },
      {
        key: tabItem[1],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.shop_verify_status == 3 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 店铺配置
          </span>
        ),
      },
      {
        key: tabItem[2],
        tab: '商品管理',
      },
      {
        key: tabItem[3],
        tab: '订单列表',
      },
      {
        key: tabItem[4],
        tab: '售后列表',
      },
      {
        key: tabItem[5],
        tab: '评价列表',
      },
      {
        key: tabItem[6],
        tab: '资金明细',
      },
      {
        key: tabItem[7],
        tab: '优惠券',
      },
      {
        key: tabItem[8],
        tab: '首单减免',
      },
      {
        key: tabItem[9],
        tab: '返券',
      },
      {
        key: tabItem[10],
        tab: '满减',
      },
      {
        key: tabItem[11],
        tab: '限时促销',
      },
      {
        key: tabItem[12],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.ambient_verify_status == 3 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 店铺环境
          </span>
        ),
      },
      {
        key: tabItem[13],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.auth_verify_status == 3 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 认证信息
          </span>
        ),
      },
      {
        key: tabItem[14],
        tab: '修改密码',
      },
    ];

    const contentList = {
      info: <Info {...this.props.match} />,
      shopConfiguration: <ShopConfiguration {...this.props.match} />,
      commodity: <Commodity {...this.props.match} />,
      orderList: <OrderList {...this.props.match} />,
      tab5: <p>content5</p>,
      commentList: <CommentList {...this.props.match} />,
      financeList: <FinanceList {...this.props.match} />,
      coupon: <Coupon {...this.props.match} />,
      firstOrderReduce: <FirstOrderReduce {...this.props.match} />,
      rebate: <Rebate {...this.props.match} />,
      fullReduction: <FullReduction {...this.props.match} />,
      limitActivity: <LimitActivity {...this.props.match} />,
      ambientInfo: <AmbientInfo {...this.props.match} />,
      authInfo: <AuthInfo {...this.props.match} />,
      changePass: <ChangePass {...this.props.match} />,
    };

    return (
      <Card bordered={false}>
        <div className="page_head" style={{ marginBottom: 0 }}>
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => router.push('/merchant/cooperation')}
            />
            商家详情
          </span>
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

export default MerchantDetails;
