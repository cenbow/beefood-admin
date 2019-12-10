import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Card, Form, Button, message, Row, Col, Modal, Icon } from 'antd';
import utils from '@/utils/utils';
import configVar from '@/utils/configVar';

import BasicInfo from './BasicInfo';
import ShopInfo from './ShopInfo';
import AmbientInfo from './AmbientInfo';
import AuthInfo from './AuthInfo';

const tabItem = [
  'basicInfo',
  'shopInfo',
  'ambientInfo',
  'authInfo',
];

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.effects['merchant/fetchMerchantAuditStatus'],
}))
class AuditingDetails extends Component {
  state = {
    key: '',
    showAuditInfo: true,
  };

  componentDidMount() {
    const { dispatch, match, location } = this.props;

    // 获取认证状态信息
    dispatch({
      type: 'merchant/fetchMerchantAuditStatus',
      payload: {
        merchant_id: match.params.id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        if (res.data.items) {
          this.setState({
            showAuditInfo: false,
          })
        } else {
          Modal.warning({
            title: '提示',
            content: '此商家暂未提交认证！',
            onOk: () => {
              this.goBack();
            },
          });
        }
      }
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
    this.setState({ [type]: key });
    this.redirectUrl(key);
  };

  redirectUrl = key => {
    const { match } = this.props;
    this.setState({
      key: key,
    });
    router.push({
      pathname: '/merchant/auditing/' + match.params.id,
      query: {
        tab_key: key,
      },
    });
  };

  goBack = (url) => {
    router.push(url || '/merchant/auditing');
  }

  render() {
    const { merchant, loading } = this.props;
    const { merchantAuditStatus = {} } = merchant;

    const tabList = [
      {
        key: tabItem[0],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.basic_verify_status == 1 && (
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
              merchantAuditStatus && merchantAuditStatus.shop_verify_status == 1 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 店铺配置
          </span>
        ),
      },
      {
        key: tabItem[2],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.ambient_verify_status == 1 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 店铺环境
          </span>
        ),
      },
      {
        key: tabItem[3],
        tab: (
          <span>
            {
              merchantAuditStatus && merchantAuditStatus.auth_verify_status == 1 && (
                <Icon type="warning" theme="filled" style={{ color: '#FF9800' }} />
              )
            } 认证信息
          </span>
        ),
      },
    ];

    const contentList = {
      basicInfo: <BasicInfo {...this.props} />,
      shopInfo: <ShopInfo {...this.props} />,
      ambientInfo: <AmbientInfo {...this.props} />,
      authInfo: <AuthInfo {...this.props} />,
    };

    return (
      <Card bordered={false} loading={this.state.showAuditInfo}>
        <div className="page_head" style={{marginBottom: 0,}}>
          <span className="page_head_title">
            <Button
              type="default"
              shape="circle"
              icon="left"
              className="fixed_to_head"
              onClick={() => this.goBack()}
            />
            <span>商家审核详情</span>
            {
              merchantAuditStatus && (
                <span className="page_head_info">
                  <span>提交时间：{merchantAuditStatus.create_time && (moment(merchantAuditStatus.create_time * 1000).format('YYYY-MM-DD'))}</span>
                  <span>提交人：{merchantAuditStatus.admin_info && merchantAuditStatus.admin_info.realname}</span>
                </span>
              )
            }
          </span>
        </div>
        <Card
          style={{ width: '100%' }}
          tabList={tabList}
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
    )
  }
}

export default AuditingDetails;