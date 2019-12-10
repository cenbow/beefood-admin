import React, {Component, Fragment} from 'react';
import {formatMessage, FormattedMessage} from 'umi-plugin-react/locale';
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
const {Option} = Select;
const {RangePicker} = DatePicker;
const RadioGroup = Radio.Group;

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const statusMap = {2: 'processing', 3: 'error', 4: 'success', 5: 'error', 6: 'success'};
const status = {2: '审核中', 3: '拒绝', 4: '审核通过', 5: '退款失败', 6: '退款成功'};
const reason = {
  1: '我不想要了/下错订单',
  2: '商家通知我卖完了',
  3: '商家沟通态度差',
  4: '骑手沟通态度差',
  5: '送太慢了，等太久了',
  6: '包装破损',
  7: '少送商品',
  8: '送错商品',
  9: '口味不佳/个人感受不好',
  10: '餐内有异物',
  11: '食用后引起身体不适',
  12: '商品变质',
  13: '用户其他',
  14: '商品已售完',
  15: '店铺太忙',
  16: '店铺已打烊',
  17: '地址无法配送',
  18: '重复订单',
  19: '商家其它',
  20: '接单超时'
};

@Form.create()
class ServiceOrder
  extends Component {
  state = {
    formValues: {},
  };

  columns = [
    {
      title: '售后单号',
      dataIndex: 'return_no',
    },
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '商家名称',
      dataIndex: 'm_user_info.name',
    },
    {
      title: '退款商品',
      render: (text, record) => (
        <div>
          {Object.keys(record.u_order_dish).length > 0 && (
            <div>
              {(record.u_order_dish || []).map((item, i) => {
                return (
                  <div>{item.name}</div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '退款原因',
      dataIndex: 'reason',
      render: val => reason[val],
    },
    {
      title: '退款金额',
      dataIndex: 'refund_amount',
    },
    {
      title: '申请时间',
      dataIndex: 'create_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      render: val => {
        return <Badge status={statusMap[val]} text={status[val]}/>;
      }
    },
    {
      title: '审核人',
      dataIndex: 'operator',
    },
    {
      title: '审核时间',
      dataIndex: 'audit_time',
      render: val => <span>{utils.deteFormat(val)}</span>,
    },
    {
      title: '订单操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={'/order/home/details/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {formValues} = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
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
    const {form} = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.props.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const {form} = this.props;
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
      form: {getFieldDecorator},
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{md: 6, lg: 24, xl: 48}}>
          <Col md={5} sm={24}>
            <FormItem label="售后单号">
              {getFieldDecorator('return_no')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="退款商品">
              {getFieldDecorator('dish_name')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={3} sm={24}>
            <FormItem label="审核状态">
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
          <Col md={6} sm={24}>
            <FormItem label="申请时间">
              {getFieldDecorator('create_time')(
                <RangePicker
                  style={{width: '100%'}}
                  placeholder={[
                    formatMessage({id: 'form.date.placeholder.start'}),
                    formatMessage({id: 'form.date.placeholder.end'}),
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
              <Button style={{marginLeft: 8}} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {loading, dataSource} = this.props;
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

export default ServiceOrder;
