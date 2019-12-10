import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload, Cascader } from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, { getMenu } from '@/utils/utils';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = { 1: 'default', 2: 'success', 3: 'processing', 4: 'error' };
const status = { 1: '待支付', 2: '已支付', 3: '已完成', 4: '已取消' };
const pay_type = { 1: '在线付款', 2: '货到付款' };
const delivery_method = { 1: '平台专送', 2: '商家自配送', 3: '上门自提' };
const is_now_delivery = { 1: '否', 2: '是' };
const reason = { 1: '商品已售完', 2: '店铺太忙', 3: '店铺已打烊', 4: '联系不上顾客', 5: '重复订单', 6: '没有骑手接单', 7: '恶意欺骗订单', 8: '其他' }

// 取消订单
@Form.create()
class CancelForm extends PureComponent {
  static defaultProps = {
    handleCancel: () => {
    },
    handleCancelModalVisible: () => {
    },
    values: {},
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleNext = () => {
    const { form, handleCancel } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleCancel(fieldsValue);
    });
  };

  renderContent = formVals => {
    const { form } = this.props;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    return (
      <div>
        <FormItem key="reason" {...formLayout} label="取消类型">
          {form.getFieldDecorator('reason', {
            rules: [{ required: true, message: '请选择取消类型！' }],
            initialValue: '1',
          })(
            <Radio.Group>
              {Object.keys(reason).map((i) => (
                <div key={i}><Radio value={i}>{reason[i]}</Radio><br /></div>
              ))}
            </Radio.Group>
          )}
        </FormItem>
        <FormItem key="remark" {...formLayout} label="取消原因">
          {form.getFieldDecorator('remark', {
            rules: [{ required: true, message: '请输入取消原因！' }],
          })(<Input.TextArea rows={4} placeholder="请输入取消原因" />)}
        </FormItem>
      </div>
    );
  };

  render() {
    const { cancelModalVisible, handleCancelModalVisible, values } = this.props;
    const { formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="取消订单"
        visible={cancelModalVisible}
        onOk={this.handleNext}
        onCancel={() => handleCancelModalVisible(false, values)}
        afterClose={() => handleCancelModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

@connect(({ orderList, common, loading }) => ({
  orderList,
  common,
  loading: loading.models.orderList,
}))
@Form.create()
class OrderList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    cancelModalVisible: false,
    expandForm: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '商家流水号',
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
      title: '订单状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
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
      title: '支付成功时间',
      dataIndex: 'pay_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '期望送达时间',
      dataIndex: 'plan_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '订单动态',
      render: (text, record) => (
        <div>
          {record.status == 4 && record.operator != null ? (
            <div>
              <div>订单取消</div> <div>操作人：{record.operator}</div>
            </div>
          ) : ('-')}
        </div>
      ),
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          {utils.isHasMenu(this.state.menu, 'view') ? (
            <Link to={`/order/home/details/${record.order_no}/${record.user_id}`}>查看</Link>
          ) : ('')}
          {utils.isHasMenu(this.state.menu, 'cancel') && record.status != 4 ? (
            <Fragment>
              <Divider type="vertical" />
              <a onClick={() => this.handleCancelModalVisible(true, record)}>取消</a>
            </Fragment>
          ) : ('')}
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.getOrderList();
    this.fetchMenu();
  }

  // 获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'order', 'home'),
          });
        }
      },
    });
  };

  getOrderList = params => {
    const { dispatch } = this.props;
    const getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'orderList/fetchOrderList',
      payload: getParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    this.getOrderList(params);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getOrderList();
  };

  handleCancelModalVisible = (flag, record) => {
    this.setState({
      cancelModalVisible: !!flag,
      editFormValues: record || {},
    });
  };

  handleCancel = fields => {
    const { dispatch } = this.props;
    const { editFormValues } = this.state;
    //console.log(fields, editFormValues);
    let formData = new FormData();
    formData.append('order_no', editFormValues.order_no);
    formData.append('user_id', editFormValues.user_id);
    formData.append('reason', fields.reason);
    formData.append('remark', fields.remark);
    dispatch({
      type: 'orderList/fetchOrderCancel',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('取消成功');
        this.handleCancelModalVisible();
        this.getOrderList();
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const create_time = fieldsValue['create_time'];
      const pay_time = fieldsValue['pay_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(create_time),
        pay_time: utils.getDateTimeMap(pay_time)
      };
      this.setState({
        formValues: values,
      });
      this.getOrderList(values);
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="商家">
              {getFieldDecorator('merchant_search')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="用户">
              {getFieldDecorator('user_search')(<Input placeholder="请输入" />)}
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
          <Col md={3} sm={24}>
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
          <Col md={3} sm={24}>
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
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
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
          <Col md={6} sm={24}>
            <FormItem label="支付时间">
              {getFieldDecorator('pay_time')(
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
          <Col md={6} sm={24}>
            <div>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      orderList: { data },
      common: { city },
      loading,
    } = this.props;

    const { cancelModalVisible, editFormValues } = this.state;
    const updateMethods = {
      handleCancelModalVisible: this.handleCancelModalVisible,
      handleCancel: this.handleCancel,
    };

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.order_no}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {editFormValues && Object.keys(editFormValues).length ? (
          <CancelForm
            {...updateMethods}
            cancelModalVisible={cancelModalVisible}
            values={editFormValues}
          />
        ) : null}
      </div>
    );
  }
}

export default OrderList;
