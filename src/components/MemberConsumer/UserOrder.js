import React, { Component, Fragment } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Icon,
  Menu,
  Dropdown,
  Card,
  AutoComplete,
  Radio,
  Badge,
  Tabs,
  Table,
  Divider,
  DatePicker,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = { 1: 'processing', 2: 'success', 10: 'success', 11: 'default' };
const status = { 1: '待支付', 2: '已支付', 10: '已完成', 11: '已取消' };
const pay_type = { 1: '在线付款', 2: '货到付款' };
const delivery_method = { 1: '平台专送', 2: '商家自配送', 3: '上门自提' };
const is_now_delivery = { 1: '否', 2: '是' };

@Form.create()
class UserOrder extends Component {
  state = {
    formValues: {},
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
      dataIndex: 'merchant_info.name',
    },
    {
      title: '预订单',
      dataIndex: 'is_now_delivery',
      render: val => {
        return is_now_delivery[val];
      }
    },
    {
      title: '订单金额',
      dataIndex: 'total_price',
    },
    {
      title: '实付金额',
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
      title: '订单操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={'/order/home/details/' + record.order_no + '/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

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

    this.props.getList(params);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.props.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue)
      };
      this.setState({
        formValues: values,
      });
      this.props.getList(values);
    });
  };

  //筛选
  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={5} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入" />)}
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
              {getFieldDecorator('order_status')(
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
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
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
    const { loading, dataSource } = this.props;
    return (
      <GridContent>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={dataSource}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </GridContent>
    )
  }
}

export default UserOrder;
