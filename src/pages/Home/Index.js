import React, { PureComponent, Suspense, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import router, { routerRedux } from 'umi/router';
import { Row, Col, Card, Tabs, Icon } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import PageLoading from '@/components/PageLoading';
import configVar from '@/utils/configVar';

import OverThreeDaysOrder from './OverThreeDaysOrder';

import OrderRefundList from './OrderRefundList';
import MerchantAuditList from './MerchantAuditList';
import MerchantFeedback from './MerchantFeedback';
import ConsumerFeedback from './ConsumerFeedback';
import DriverFeedback from './DriverFeedback';

import styles from '@/assets/css/TableList.less';
import stylesIndex from './Index.less';

const { TabPane } = Tabs;

@connect(({ home, loading }) => ({
  home,
  loading: loading.models.home,
}))

class DispatchCenterList extends PureComponent {
  state = {
    tab_key: '1',//默认第1个
  };

  componentDidMount() {
    const { dispatch, match, location } = this.props;

    let tab_key = location.query.tab_key;
    if (!tab_key) tab_key = this.state.tab_key;
    this.setState({
      tab_key: tab_key
    }, () => {
      this.getList();
    })
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.reqRef);
  }

  // 获取统计信息
  getHomeInfo = () => {
    this.props.dispatch({
      type: 'home/fetchHomeInfo',
    })
  }

  getList = params => {
    this.getHomeInfo();
    let listName = '';

    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params,
    };

    const { tab_key } = this.state;
    switch (parseInt(tab_key)) {
      case 1:
        listName = 'home/fetchDlnFeedbackList';
        break;
      case 2:
        listName = 'home/fetchOrderRefundList';//用户取消订单
        getParams.status = 1;
        getParams.type = 2;
        break;
      case 3:
        listName = 'home/fetchOrderRefundList';//用户订单退款
        getParams.status = 1;
        getParams.type = 3;
        break;
      case 4:
        listName = 'home/fetchMerchantAuditList';//商户认证申请
        getParams.verify_status = 1;
        break;
      case 5:
        listName = 'home/fetchFeedbackMerchantList';//商家意见反馈
        getParams.status = 1;
        break;
      case 6:
        listName = 'home/fetchFeedbackUserList';//用户意见反馈
        getParams.status = 1;
        break;
      case 7:
        listName = 'home/fetchFeedbackDriverList';//骑手意见反馈
        getParams.status = 1;
        break;
    }
    const { match,dispatch } = this.props;

    dispatch({
      type: listName,
      payload: getParams
    });

    //标记当前tab
    router.push({
      pathname: `${match.url}`,
      query: {
        tab_key: tab_key,
      },
    });
  };

  tabsCallback = key => {
    this.setState({
      tab_key: key
    }, () => {
      this.getList();
    })
  };

  render() {
    const { home = {}, loading } = this.props;
    const { tab_key } = this.state;
    const {
      homeInfo = {},
      order_abnormal_list = {},
      orderRefundData = {},
      merchantAuditData = {},
      feedbackMerchantData = {},
      feedbackUserData = {},
      feedbackDriverData = {},
    } = home;

    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 8,
      style: { marginBottom: 24 },
    };
    return (
      <GridContent>
        <div className="main-24">
          <Suspense fallback={<PageLoading />}>
            <Row gutter={24}>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_blue">
                  <div className="visual">
                    <Icon type="user" className="icon-font" />
                  </div>
                  <div className="details">
                    <div className="number">{homeInfo.user_add_statistics && homeInfo.user_add_statistics.all_num}</div>
                    <div className="desc">本月新增用户：{homeInfo.user_add_statistics && homeInfo.user_add_statistics.month_num}</div>
                    <div className="desc">今日新增用户：{homeInfo.user_add_statistics && homeInfo.user_add_statistics.today_num}</div>
                  </div>
                  <Link to="/member/consumer" className="dashboard_more">查看<Icon type="arrow-right" /></Link>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_red">
                  <div className="visual">
                    <Icon type="shop" className="icon-font" />
                  </div>
                  <div className="details">
                    <div className="number">{homeInfo.merchant_add_statistics && homeInfo.merchant_add_statistics.all_num}</div>
                    <div className="desc">本月入驻商家：{homeInfo.merchant_add_statistics && homeInfo.merchant_add_statistics.month_num}</div>
                    <div className="desc"> </div>
                  </div>
                  <Link to="/merchant/all" className="dashboard_more">查看<Icon type="arrow-right" /></Link>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_purple">
                  <div className="visual">
                    <Icon type="unordered-list" className="icon-font" />
                  </div>
                  <div className="details">
                    <div className="number">{homeInfo.order_statistics && homeInfo.order_statistics.all_num}</div>
                    <div className="desc">本月销售：{homeInfo.order_statistics && homeInfo.order_statistics.month_num}</div>
                    <div className="desc"> </div>
                  </div>
                  <Link to="/order/home" className="dashboard_more">查看<Icon type="arrow-right" /></Link>
                </div>
              </Col>
            </Row>
          </Suspense>
          <div className={stylesIndex.twoColLayout}>
            <Suspense fallback={null}>
              <Card size="small" title={(<span><Icon type="thunderbolt" /> 平台预警信息</span>)} className="card_red">
                <Tabs onTabClick={this.tabsCallback} type="card" activeKey={tab_key}>
                  <TabPane tab={`订单配送异常（${homeInfo.list_count_data && homeInfo.list_count_data.order_abnormal_num || 0}）`} key="1">
                    <OverThreeDaysOrder
                      dataSource={order_abnormal_list}
                      getList={this.getList}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`用户取消订单（${homeInfo.list_count_data && homeInfo.list_count_data.order_refund_num || 0}）`} key="2">
                    <OrderRefundList
                      dataSource={orderRefundData}
                      getList={this.getList}
                      refundType={2}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`用户订单退款（${homeInfo.list_count_data && homeInfo.list_count_data.order_claim_num || 0}）`} key="3">
                    <OrderRefundList
                      dataSource={orderRefundData}
                      getList={this.getList}
                      refundType={3}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`商户认证申请（${homeInfo.list_count_data && homeInfo.list_count_data.merchant_auth_num || 0}）`} key="4">
                    <MerchantAuditList
                      dataSource={merchantAuditData}
                      getList={this.getList}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`商家意见反馈（${homeInfo.list_count_data && homeInfo.list_count_data.merchant_feedback_num || 0}）`} key="5">
                    <MerchantFeedback
                      dataSource={feedbackMerchantData}
                      getList={this.getList}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`用户意见反馈（${homeInfo.list_count_data && homeInfo.list_count_data.user_feedback_num || 0}）`} key="6">
                    <ConsumerFeedback
                      dataSource={feedbackUserData}
                      getList={this.getList}
                      {...this.props}
                    />
                  </TabPane>
                  <TabPane tab={`骑手意见反馈（${homeInfo.list_count_data && homeInfo.list_count_data.driver_feedback_num || 0}）`} key="7">
                    <DriverFeedback
                      dataSource={feedbackDriverData}
                      getList={this.getList}
                      {...this.props}
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </Suspense>
          </div>
        </div>
      </GridContent>
    );
  }
}

export default DispatchCenterList;
