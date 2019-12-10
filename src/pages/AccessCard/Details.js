import React, { Component } from 'react';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker } from 'antd';
import DescriptionList from '@/components/DescriptionList';

const { Description } = DescriptionList;

class RegionDetails extends Component {

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { params } = match;
    const id = params.id;
  }

  render() {
    const colLayout = {
      xs: 12,
      sm: 8,
      md: 4
    }
    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" className="fixed_to_head" className="fixed_to_head" onClick={() => router.goBack()} /> 站点详情</span>
        </div>
        <Row>
          <Col {...colLayout} className="m-b-12"><span>站点名称：</span>金边1站</Col>
          <Col {...colLayout} className="m-b-12"><span>国家：</span>柬埔寨</Col>
          <Col {...colLayout} className="m-b-12"><span>城市：</span>金边</Col>
          <Col {...colLayout} className="m-b-12"><span>区域：</span>金边1区</Col>
          <Col {...colLayout} className="m-b-12"><span>站长：</span>小陈</Col>
          <Col {...colLayout} className="m-b-12"><span>骑手数量：</span><Link to={"/deliveryman/member"} title="点击查看">103</Link></Col>
          <Col {...colLayout} className="m-b-12"><span>商圈数量：</span>3</Col>
        </Row>
        <div style={{ marginTop: 24 }}>地图显示</div>
      </Card>
    )
  }
}

export default RegionDetails;