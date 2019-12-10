import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import router from 'umi/router';
import { Card, Badge, Table, Divider, Input, Button, Form, Tag, Radio, message } from 'antd';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { whatSex } from '@/utils/utils';
import styles from '@/assets/css/BasicProfile.less';

const FormItem = Form.Item;
const { Description } = DescriptionList;
const { TextArea } = Input;

const statusMap = ['', 'default', 'warning', 'processing', 'warning', 'success', 'warning', 'warning', 'error'];
const status = ['', '待支付', '待受理', '配送中(待核销)', '待评价', '已完成', '售后订单', '交易关闭(未支付)', '交易关闭(用户取消)'];
const role = ['', '消费者', '配送员', '管理员'];
const serviceStatusMap = ['', 'orange', 'red', 'green'];
const serviceStatus = ['', '审核中', '拒绝', '审核通过'];

@connect(({ orderServiceList, loading }) => ({
  orderServiceList,
  loading: loading.models.orderServiceList,
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
      this.getOrderServiceDetails();
    });
  }

  getOrderDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderServiceList/fetchOrderDetails',
      payload: {
        id: this.state.id
      },
    });
  };

  getOrderServiceDetails = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderServiceList/fetchOrderServiceDetails',
      payload: {
        id: this.state.id
      },
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    const { page } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue);
      let formData = new FormData();
      Object.keys(fieldsValue).forEach((key) => {
        formData.append(key, fieldsValue[key]);
      });
      formData.append('id', this.state.id);
      dispatch({
        type: 'orderServiceList/fetchDealOrderReturnApply',
        payload: formData,
        callback: (res) => {
          message.success("保存成功")
        }
      });
    });
  }

  orderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '商家',
      dataIndex: 'merchant_name',
    },
    {
      title: '会员',
      dataIndex: 'username',
    },
    {
      title: '会员手机',
      dataIndex: 'mobile',
    },
    {
      title: '应付',
      dataIndex: 'sale_price',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '支付时间',
      dataIndex: 'pay_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'sale_type',
      render: val => {
        let value = '';
        switch (val) {
          case '1':
            value = "wing";
            break;
          case '2':
            value = "pipay";
            break;
        }
        return value;
      }
    },
  ];

  addresssColumns = [
    {
      title: '收货人',
      dataIndex: 'consignee',
    },
    {
      title: '联系方式',
      dataIndex: 'mobile',
    },
    {
      title: '区域',
      dataIndex: 'region',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
    },
    {
      title: '配送方式',
      dataIndex: 'delivery_method',
      render: val => {
        let value = '';
        switch (val) {
          case '1':
            value = "平台";
            break;
          case '2':
            value = "商家";
            break;
          case '3':
            value = "自提";
            break;
        }
        return value;
      }
    },
  ];

  goodsColumns = [
    {
      title: '商品',
      dataIndex: 'name',
    },
    {
      title: '规格',
      dataIndex: 'specification',
    },
    {
      title: '数量',
      dataIndex: 'amount',
    },
    {
      title: '单品价格',
      dataIndex: 'price',
    },
    {
      title: '单品小计',
      dataIndex: 'total_price',
    },
  ];

  render() {
    const { orderServiceList = {}, loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { details = {}, serviceInfo = {} } = orderServiceList;
    const {
      order = {},
      addresss = {},
      goods = [],
    } = details;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <PageHeaderWrapper title="售后详情" loading={loading}>
        <div className="main-24">
          <Card bordered={false} type="inner" title="基本信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={[order]}
              columns={this.orderColumns}
              rowKey="id"
              bordered
            />
          </Card>
          <Card bordered={false} type="inner" title="收货信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={[addresss]}
              columns={this.addresssColumns}
              rowKey="id"
              bordered
            />
          </Card>
          <Card bordered={false} type="inner" title="商品信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={goods}
              columns={this.goodsColumns}
              rowKey="id"
              bordered
            />
            <div className="table-tr">
              <div className="table-td">商品合计:<span style={{ color: "#FF9800" }}>￥1.00</span></div>
            </div>
            <div className="table-tr">
              <div className="table-td">备注:<span>备注内容</span></div>
            </div>
          </Card>
          <Card bordered={false} type="inner" title="费用信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <div className="table-wrap" style={{ textAlign: "right" }}>
              <div className="table-tr">
                <div className="table-td">商品总金额：<span>￥1.00</span>+配送费:<span>￥3.01</span></div>
              </div>
              <div className="table-tr">
                <div className="table-td">= 订单总金额：<span style={{ color: "#FF9800" }}>￥4.01</span></div>
              </div>
              <div className="table-tr">
                <div className="table-td">-商家首单减免：￥4.00</div>
              </div>
              <div className="table-tr">
                <div className="table-td">= 应付款金额：<span style={{ color: "#FF9800" }}>￥0.01</span></div>
              </div>
            </div>
          </Card>
          <Card bordered={false} type="inner" title="售后信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 40 }}>
              <FormItem {...formItemLayout} label="订单号">
                <span>{serviceInfo.order_no}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="申请时间">
                <span>{moment(serviceInfo.return_submit_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
              </FormItem>
              {
                serviceInfo.status == 1 ? (
                  <FormItem {...formItemLayout} label="退款金额" extra="退款金额最多为：0.01">
                    {getFieldDecorator('returns_amount', {})(
                      <Input placeholder="" />
                    )}
                  </FormItem>
                ) : (
                    <FormItem {...formItemLayout} label="退款金额">
                      <span>{serviceInfo.returns_amount}</span>
                    </FormItem>
                  )
              }
              <FormItem {...formItemLayout} label="退货状态">
                <Tag color={serviceStatusMap[serviceInfo.status]}>{serviceStatus[serviceInfo.status]}</Tag>
                <span></span>
              </FormItem>
              <FormItem {...formItemLayout} label="退货原因">
                <TextArea
                  autosize={{ minRows: 3, maxRows: 6 }}
                  value={serviceInfo.remark}
                  disabled
                  style={{ color: "#333" }}
                />
              </FormItem>
              {
                serviceInfo.status == 1 ? (
                  <div>
                    <FormItem {...formItemLayout} label="平台备注">
                      {getFieldDecorator('admin_note', {})(
                        <TextArea
                          autosize={{ minRows: 3, maxRows: 6 }}
                          style={{ color: "#333" }}
                        />
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="审核">
                      {getFieldDecorator('status', {
                        rules: [{ required: true, message: '请选择审核结果！' }],
                        initialValue: ''
                      })(
                        <Radio.Group>
                          <Radio value="2">拒绝</Radio>
                          <Radio value="3">审核通过</Radio>
                        </Radio.Group>
                      )}
                    </FormItem>
                  </div>
                ) : (
                    <FormItem {...formItemLayout} label="平台备注">
                      <TextArea
                        autosize={{ minRows: 3, maxRows: 6 }}
                        value={serviceInfo.admin_note}
                        disabled
                        style={{ color: "#333" }}
                      />
                    </FormItem>
                  )
              }
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                {
                  serviceInfo.status == 1 && (
                    <Button type="primary" htmlType="submit" loading={loading}>
                      <FormattedMessage id="form.submit" />
                    </Button>
                  )
                }
                <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }} icon="left">
                  <FormattedMessage id="form.back" />
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Details;
