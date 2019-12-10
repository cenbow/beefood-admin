import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Badge, Table, Divider, message, Button } from 'antd';
import router from 'umi/router';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import utils, { whatSex } from '@/utils/utils';
import styles from '@/assets/css/BasicProfile.less';

const { Description } = DescriptionList;
const status = { 1: '未使用', 2: '已使用', 3: '已失效' }

@connect(({ member, loading }) => ({
  member,
  loading: loading.models.member,
}))
class BonusDetails extends Component {
  state = {
    id: '',
  };

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;
    const id = params.id;
    this.setState(
      {
        id: params.id,
      },
      () => {
        this.getDetails();
      }
    );
  }

  getDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'member/fetchBonusValueInfo',
      payload: {
        id: this.state.id,
      },
    });
  };

  render() {
    const { member, loading } = this.props;
    const {
      details = {}
    } = member;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" onClick={() => router.goBack()} /> 红包详情</span>
        </div>
        <Card style={{ marginBottom: 32 }}>
          {
            details && (
              <DescriptionList size="large">
                <Description term="红包名称">{details.name}</Description>
                <Description term="面额">{details.money}</Description>
                <Description term="使用金额">{details.condition}</Description>
                <Description term="使用状态">{status[details.status]}</Description>
                <Description term="领取时间">{utils.deteFormat(details.create_time)}</Description>
                <Description term="失效时间">{utils.deteFormat(details.end_time)}</Description>
              </DescriptionList>
            )
          }
        </Card>
      </Card>
    );
  }
}

export default BonusDetails;
