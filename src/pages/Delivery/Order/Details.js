import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Badge, Tabs, Table, Divider, Tag, Row, Col, List, Icon } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import PageLoading from '@/components/PageLoading';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '@/assets/css/BasicProfile.less';

const { Description } = DescriptionList;

@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
class DeliverymanOrderDetails extends Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { params } = match;

    dispatch({
      type: 'list/fetchDeliverymanOrderDetails',
      payload: {
        deliver_no: params.id
      },
    });
  }

  callback = (key) => {
    console.log(key);
  }

  render() {
    const { list = {}, loading } = this.props;
    const { details = {} } = list;
    const statusMap = ['', '#d3adf7', '#2db7f5', '#108ee9', '#87d068', '#f60'];
    const status = ['', '已接单 未到店', '已到店 未取货', '已取货配送中', '已完成', '订单取消'];
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 8,
      style: { marginBottom: 24 },
    };
    return (
      <PageHeaderWrapper title="运单详情" loading={loading}>
        <div className="main-24">
          <GridContent>
            <Suspense fallback={<PageLoading />}>
              <Row gutter={24}>
                <Col {...topColResponsiveProps}>
                  <div className="dashboard dashboard_blue">
                    <div className="visual">
                      <Icon type="clock-circle" className="icon icon-font" />
                    </div>
                    <div className="details">
                      <div className="number">11</div>
                      <div className="desc">超时状态</div>
                    </div>
                  </div>
                </Col>
                <Col {...topColResponsiveProps}>
                  <div className="dashboard dashboard_red">
                    <div className="visual">
                      <Icon type="dollar" className="icon icon-font" />
                    </div>
                    <div className="details">
                      <div className="number">{details.delivery_income}</div>
                      <div className="desc">配送费</div>
                    </div>
                  </div>
                </Col>
                <Col {...topColResponsiveProps}>
                  <div className="dashboard dashboard_purple">
                    <div className="visual">
                      <Icon type="tag" className="icon icon-font" />
                    </div>
                    <div className="details">
                      <div className="number">{status[details.status]}</div>
                      <div className="desc">状态</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Suspense>
            <Suspense fallback={<PageLoading />}>
              <Row gutter={24}>
                <Col md={16} sm={24}>
                  <Card title="订单详情" bordered={false}>
                    <DescriptionList style={{ marginBottom: 32 }} col="2">
                      <Description term="编号">{details.deliver_no}</Description>
                      <Description term="配送距离">{details.delivery_distance}</Description>
                      <Description term="下单时间">{moment(details.order_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Description>
                      <Description term="预计送达时间">{moment(details.required_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Description>
                      <Description term="区域">{details.user_province}{details.user_city}{details.user_region}</Description>
                      <Description term="配送商品">
                        {
                          details.dish_list != undefined && details.dish_list.length > 0 && details.dish_list.map((item, key) => (
                            <p key={key}>{item.dish_name}（{item.amount}）</p>
                          ))
                        }
                      </Description>
                      <Description term="备注">{details.order_remark}</Description>
                    </DescriptionList>
                    <Divider style={{ margin: '16px 0' }} />
                    <DescriptionList style={{ marginBottom: 32 }} title="店铺信息" col="2">
                      <Description term="店铺">{details.store_name}</Description>
                      <Description term="联系电话">{details.store_tel}</Description>
                      <Description term="地址">{details.store_address}</Description>
                    </DescriptionList>
                    <Divider style={{ margin: '16px 0' }} />
                    <DescriptionList style={{ marginBottom: 32 }} title="下单人信息" col="2">
                      <Description term="姓名">{details.order_user}</Description>
                      <Description term="联系电话">{details.user_tel}</Description>
                      <Description term="配送地址">{details.user_address}</Description>
                    </DescriptionList>
                  </Card>
                </Col>
                <Col md={8} sm={24}>
                  <Card title="位置" bordered={false}>
                    地图
                                    </Card>
                </Col>
              </Row>
            </Suspense>
          </GridContent>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default DeliverymanOrderDetails;
