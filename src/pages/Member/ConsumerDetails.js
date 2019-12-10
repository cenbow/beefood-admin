import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Badge, Tabs, Table, Divider, Modal, message, Button } from 'antd';
import router, { routerRedux } from 'umi/router';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import utils, { whatSex } from '@/utils/utils';

import UserOrder from '@/components/MemberConsumer/UserOrder';
import ServiceOrder from '@/components/MemberConsumer/ServiceOrder';
import FoundLog from '@/components/MemberConsumer/FoundLog';
import BonusValue from '@/components/MemberConsumer/BonusValue';
import AddressList from '@/components/MemberConsumer/AddressList';

import styles from '@/assets/css/BasicProfile.less';

const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { confirm } = Modal;
const statusMap = ['default', 'success', 'error'];
const status = ['所有', '启用', '禁用'];

@connect(({ member, loading }) => ({
  member,
  loading: loading.models.member,
}))
class ConsumerDetails extends Component {
  state = {
    tab_key: '1',//默认第1个
    id: '',
  };

  componentDidMount() {
    const { match, location } = this.props;
    let tab_key = location.query.tab_key;
    if (!tab_key) tab_key = this.state.tab_key;

    const { params } = match;
    const id = params.id;
    this.setState(
      {
        id: params.id,
        tab_key: tab_key
      }, () => {
        this.getDetails();
        this.getList();
      }
    );
  }

  getList = params => {
    let listName = '';
    const { match, dispatch } = this.props;

    let getParams = {
      user_id: this.state.id,
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params,
    };

    const { tab_key } = this.state;
    switch (parseInt(tab_key)) {
      case 1:
        listName = 'member/fetchUserOrderList';//用户订单
        break;
      case 2:
        listName = 'member/fetchServiceOrderList';//售后订单
        break;
      case 3:
        //listName = 'home/fetchOrderRefundList';//资金明细
        break;
      case 4:
        listName = 'member/fetchBonusValueList';//红包明细
        break;
      case 5:
        listName = 'member/fetchAddressList';//收货地址
        break;
    }

    dispatch({
      type: listName,
      payload: getParams,
    });

    //标记当前tab
    router.push({
      pathname: `${match.url}`,
      query: {
        tab_key: tab_key,
      },
    });
  }

  getDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'member/fetchMemberConsumerInfo',
      payload: {
        id: this.state.id,
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
    const { member, loading } = this.props;
    const { tab_key } = this.state;
    const {
      details = {},
      userOrderList = [],
      serviceOrderList = [],
      foundLogList = [],
      bonusValueList = [],
      addressList = [],
    } = member;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" onClick={() => router.push('/member/consumer')} /> 用户详情</span>
        </div>
        <Card style={{ marginBottom: 32 }}>
          {
            details && details.u_user_info && (
              <DescriptionList size="large">
                <Description term="头像"><ShowImg className="avatar-124" src={details.u_user_info.avatar}
                  alt="" /></Description>
                <Description term="用户ID">{details.id}</Description>
                <Description term="状态"><Badge status={statusMap[details.status]}
                  text={status[details.status]} /></Description>
                <Description term="用户名">{details.u_user_info.nickname}</Description>
                <Description term="联系电话">{details.mobile_prefix}-{details.mobile}</Description>
                <Description term="真实姓名">{details.u_user_info.realname}</Description>
                <Description term="注册时间">{utils.deteFormat(details.create_time)}</Description>
                <Description term="性别">{whatSex(details.u_user_info.sex)}</Description>
                <Description term="最后登录">{utils.deteFormat(details.last_login_time)}</Description>
              </DescriptionList>
            )
          }
        </Card>
        {/* <Divider style={{ marginBottom: 32 }} /> */}
        <Tabs onTabClick={this.tabsCallback} type="card" activeKey={tab_key}>
          <TabPane tab="用户订单" key="1">
            <UserOrder
              dataSource={userOrderList}
              getList={this.getList}
              {...this.props}
            />
          </TabPane>
          <TabPane tab="售后订单" key="2">
            <ServiceOrder
              dataSource={serviceOrderList}
              getList={this.getList}
              {...this.props}
            />
          </TabPane>
          {/*<TabPane tab="资金明细" key="3">*/}
          {/*<FoundLog dataSource={foundLogList} getList={this.getFoundLogList} {...this.props} />*/}
          {/*</TabPane>*/}
          <TabPane tab="红包明细" key="4">
            <BonusValue
              dataSource={bonusValueList}
              getList={this.getList}
              {...this.props}
            />
          </TabPane>
          <TabPane tab="收货地址" key="5">
            <AddressList
              dataSource={addressList}
              getList={this.getList}
              user_id={this.state.id}
              {...this.props}
            />
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default ConsumerDetails;
