import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Button, DatePicker } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import ShowImg from '@/components/showImg';

const { Description } = DescriptionList;
const status = ['所有', '启用', '禁用'];

@connect(({ bd, loading }) => ({
  bd,
  loading: loading.models.bd,
}))
class RegionDetails extends Component {

  componentDidMount () {
    const { dispatch, match } = this.props;

    // 获取详情信息
    dispatch({
      type: 'bd/fetchBdDetails',
      payload: {
        id: match.params.id
      },
    });
  }

  render () {
    const { bd, loading } = this.props;
    const { bdDetails = {}, } = bd;

    const colLayout = {
      xs: 12,
      sm: 8,
      md: 4
    }

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> BD人员详情</span>
        </div>
        {
          bdDetails.name != undefined && (
            <div>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>照片：</span><ShowImg src={bdDetails.photo} className="avatar-124" /></Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>登录账号：</span>{bdDetails.sys_admin ? bdDetails.sys_admin.username : undefined}</Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>BD姓名：</span>{bdDetails.name}</Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>所属上级：</span>{bdDetails.sys_bd.name}</Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>手机号码：</span>{bdDetails.mobile}</Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>管理商圈：</span><span>
                  {
                    bdDetails.sys_bd_business.map((item, i) => {
                      if (bdDetails.sys_bd_business.length == (i + 1)) {
                        return (
                          <span key={i}>{item.sys_business.name}</span>
                        )
                      }
                      return (
                        <span key={i}>{item.sys_business.name},</span>
                      )
                    })
                  }
                </span></Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>合作商家数：</span>{bdDetails.total_cooperation_merchant} <Link to={'/merchant/cooperation?bd_id=' + bdDetails.id}>查看</Link></Col>
              </Row>
              <Row>
                <Col {...colLayout} className="m-b-12"><span>状态：</span>{status[bdDetails.status]}</Col>
              </Row>
            </div>
          )
        }
      </Card>
    )
  }
}

export default RegionDetails;