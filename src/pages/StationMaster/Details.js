import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker } from 'antd';
import DescriptionList from '@/components/DescriptionList';
// import DeliverymanMember from '@/pages/Deliveryman/Member/List';

const { Description } = DescriptionList;

@connect(({ stationMaster, loading }) => ({
  stationMaster,
  loading: loading.models.stationMaster,
}))
class RegionDetails extends Component {

  componentDidMount() {
    const { dispatch, match } = this.props;

    // 获取详情信息
    dispatch({
      type: 'stationMaster/fetchDetails',
      payload: {
        id: match.params.id
      },
    });
  }

  render() {
    const { stationMaster, loading } = this.props;
    const { details = {}, } = stationMaster;

    const colLayout = {
      xs: 12,
      sm: 8,
      md: 4
    }

    return (
      <Card bordered={false} loading={loading}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> 站长详情</span>
        </div>
        {
          details.name && (
            <Row className="m-b-30">
              <Col {...colLayout} className="m-b-12"><span>站长名称：</span>{details.name}</Col>
              <Col {...colLayout} className="m-b-12"><span>国家：</span>{details.sys_station.sys_country.name}</Col>
              <Col {...colLayout} className="m-b-12"><span>城市：</span>{details.sys_station.sys_city.name}</Col>
              <Col {...colLayout} className="m-b-12"><span>区域：</span>{details.sys_station.sys_region.name}</Col>
              <Col {...colLayout} className="m-b-12"><span>站点：</span>{details.sys_station.name}</Col>
              {/* <Col {...colLayout} className="m-b-12"><span>骑手数量：</span><Link to={"/deliveryman/member?station_agent_id=" + details.id} title="点击查看"></Link></Col> */}
              <Col {...colLayout} className="m-b-12"><span>骑手数量：</span>{details.total_driver}</Col>
            </Row>
          )
        }
        <div class="page_head"><span class="page_head_title">所管理骑手详情</span></div>
        <div>
          {/* <DeliverymanMember /> */}
        </div>
      </Card>
    )
  }
}

export default RegionDetails;