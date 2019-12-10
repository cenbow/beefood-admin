import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Spin, DatePicker, Popconfirm, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import stylesIndex from './index.less';
import styles from '@/assets/css/TableList.less';
import confingVar from '@/utils/configVar';
import utils from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;

const statusMap = { 1: 'default', 2: 'success', 3: 'processing', 4: 'error' };
const status = { 1: '待支付', 2: '已支付', 3: '已完成', 4: '已取消' };
const pay_type = { 1: '在线付款', 2: '货到付款' };
const delivery_method = { 1: '平台专送', 2: '商家自配送', 3: '上门自提' };
const is_now_delivery = { 1: '否', 2: '是' };

@connect(({ mdish, loading }) => ({
  mdish,
  loading: loading.effects['mdish/fetchOrderList'],
}))
@Form.create()
class OrderList extends Component {
  state = {
    merchant_id: '',
    page: confingVar.page,
    pagesize: confingVar.pagesize,
    modalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { params } = this.props;

    this.setState({
      merchant_id: params.id,
    }, () => {
      this.getList();
    }
    );
  }

  getList = params => {
    const { dispatch } = this.props;

    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      merchant_id: this.state.merchant_id,
      ...params,
    };

    dispatch({
      type: 'mdish/fetchOrderList',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '订单流水号',
      dataIndex: 'day_number',
    },
    {
      title: '商家名称',
      dataIndex: 'name',
    },
    {
      title: '预订单',
      dataIndex: 'is_now_delivery',
      render: val => {
        return is_now_delivery[val];
      }
    },
    {
      title: '订单金额($)',
      dataIndex: 'total_price',
    },
    {
      title: '实付金额($)',
      dataIndex: 'pay_price',
    },
    {
      title: '支付方式',
      dataIndex: 'pay_type',
      render: val => {
        return pay_type[val];
      }
    },
    {
      title: '配送方式',
      dataIndex: 'delivery_method',
      render: val => {
        return delivery_method[val];
      }
    },
    {
      title: '用户',
      dataIndex: 'nickname',
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={'/order/home/details/' + record.order_no + '/' + record.user_id}>查看</Link>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = pagination => {
    const { formValues } = this.state;
    const tablePage = {
      page: pagination.current,
      pagesize: pagination.pageSize,
    };
    const values = {
      ...tablePage,
      ...formValues,
    }
    this.setState({
      ...tablePage
    })
    this.getList(values);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue),
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    formData.append('merchant_id', this.state.merchant_id);

    confirm({
      title: '温馨提示',
      content: '确认是否删除该评论？',
      onOk: () => {
        dispatch({
          type: 'mdish/fetchMerchantCommentDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={3} sm={24}>
            <FormItem label="预订单">
              {getFieldDecorator('is_now_delivery')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(is_now_delivery).map((i) => (
                    <Option value={i} key={i}>
                      {is_now_delivery[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="订单状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(status).map((i) => (
                    <Option value={i} key={i}>
                      {status[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="支付方式">
              {getFieldDecorator('pay_type')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(pay_type).map((i) => (
                    <Option value={i} key={i}>
                      {pay_type[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="配送方式">
              {getFieldDecorator('delivery_method')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(delivery_method).map((i) => (
                    <Option value={i} key={i}>
                      {delivery_method[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="用户">
              {getFieldDecorator('user_search')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="下单时间">
              {getFieldDecorator('create_time')(
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={[
                    formatMessage({ id: 'form.date.placeholder.start' }),
                    formatMessage({ id: 'form.date.placeholder.end' }),
                  ]}
                />
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { loading, mdish: { orderList = {} } } = this.props;

    return (
      <GridContent>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={(list, index) => index}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={orderList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </GridContent>
    );
  }
}

export default OrderList;
