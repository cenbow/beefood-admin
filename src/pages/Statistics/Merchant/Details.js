import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Input, Button, Select, Row, Col, Card, Badge, Table, Divider, DatePicker } from 'antd';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { whatSex } from '@/utils/utils';
import styles from '@/assets/css/BasicProfile.less';

const { Description } = DescriptionList;
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusMap = ['', 'default', 'warning', 'processing', 'warning', 'success', 'warning', 'warning', 'error'];
const status = ['', '待支付', '待受理', '配送中(待核销)', '待评价', '已完成', '售后订单', '交易关闭(未支付)', '交易关闭(用户取消)'];
const role = ['', '消费者', '配送员', '管理员'];

@connect(({ orderList, loading }) => ({
  orderList,
  loading: loading.models.orderList,
}))
@Form.create()
class Details extends Component {
  state = {
    id: '',
  }

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;

    this.setState({
      id: params.id
    }, () => {
      this.getOrderDetails();
      this.getOrderTrace();
    });
  }

  getOrderDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderList/fetchOrderDetails',
      payload: {
        id: this.state.id
      },
    });
  };

  getOrderTrace = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      id: this.state.id,
      page: 1,
      pagesize: 25,
      ...params
    }
    dispatch({
      type: 'orderList/fetchOrderTrace',
      payload: getParams
    });
  }

  columns = [
    {
      title: '产品名称',
      dataIndex: 'mumber',
    },
    {
      title: '所属分类',
      dataIndex: 'merchant_name',
    },
    {
      title: '销量',
      dataIndex: 'username',
    },
    {
      title: '总金额',
      dataIndex: 'mobile',
    },
    {
      title: '操作',
      render: (text, record) => (
        <Link to={'/order/home/details/' + record.id}>详情</Link>
      ),
    },
  ];

  handleStandardTableChange = (pagination) => {
    const { formValues } = this.state;

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
    };

    this.getOrderList(params);
    window.scrollTo(0, 0);
  };

  render() {
    const { orderList = {}, loading, form: { getFieldDecorator } } = this.props;
    const { details = {}, orderTrace = {} } = orderList;
    const { order = {} } = details;

    return (
      <PageHeaderWrapper title="商品销量 - 【 商家：m店铺 】" loading={loading}>
        <div className="main-24">
          <Card style={{ marginBottom: 24 }}>
            <Form onSubmit={this.handleSearch} layout="inline">
              <FormItem label="选择时间">
                {getFieldDecorator('order_no')(
                  <RangePicker onChange={this.onChange} />
                )}
              </FormItem>
              <FormItem label="分类">
                {getFieldDecorator('order_no')(
                  <Select placeholder="请选择" style={{ width: '200px' }}>
                    <Option value="0">全部</Option>
                    <Option value="1">平台</Option>
                    <Option value="2">AAAA</Option>
                    <Option value="3">BBBBB</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="支付方式">
                {getFieldDecorator('order_no')(
                  <Select placeholder="请选择" style={{ width: '200px' }}>
                    <Option value="0">全部</Option>
                    <Option value="1">wing</Option>
                    <Option value="2">pipay</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="配送方式">
                {getFieldDecorator('order_no')(
                  <Select placeholder="请选择" style={{ width: '200px' }}>
                    <Option value="0">全部</Option>
                    <Option value="1">平台</Option>
                    <Option value="2">商家</Option>
                    <Option value="3">自提</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" style={{ marginLeft: 12 }}>确定</Button>
                <Button style={{ marginLeft: 8 }} type="primary">导出</Button>
              </FormItem>
            </Form>
          </Card>
          <Card bordered={false} type="inner" title="商品销量" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={orderTrace}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Details;
