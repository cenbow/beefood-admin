import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Radio,
  Upload,
  Cascader,
  Alert,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import {
  exportVoucherMerchant
} from '@/services/statistics';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');




@connect(({ coupon, common, loading }) => ({
  coupon,
  common,
  loading: loading.effects['coupon/fetchVoucherMerchant'],
}))
@Form.create()
class Coupon extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: '商家',
      dataIndex: 'merchant_name',
    },
    {
      title: '发放金额',
      dataIndex: 'money',
    },
    {
      title: '发放数量',
      dataIndex: 'grant_num',
    },
    {
      title: '使用数量',
      dataIndex: 'use_num',
    },
    {
      title: '未使用数量',
      dataIndex: 'not_use_num',
    },
    {
      title: '失效数量',
      dataIndex: 'invalid_num',
    },
    {
      title: '使用总金额',
      dataIndex: 'use_money',
    },
    {
      title: '发放总金额',
      dataIndex: 'grant_money',
    },
    {
      title: '发放时间',
      dataIndex: 'grant_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '截止时间',
      dataIndex: 'end_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
  ];

  componentDidMount () {
    this.getList();
    this.fetchMenu();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'statistics', 'coupon'),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'coupon/fetchVoucherMerchant',
      payload: getParams,
    });
  };

  handleStandardTableChange = pagination => {
    const { formValues } = this.state;
    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
    };
    this.getList(params);
    window.scrollTo(0, 0);
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }

      if (newFieldsValue.grant_time !== undefined) {
        const startTimeArr = newFieldsValue.grant_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.grant_time = `${s_startTime},${s_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
      });
      console.log('values', values)
      this.getList(values);
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleExportForm = (e) => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }

      if (newFieldsValue.grant_time !== undefined) {
        const startTimeArr = newFieldsValue.grant_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.grant_time = `${s_startTime},${s_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
      });
      // console.log('values', values)
      exportVoucherMerchant(values).then(res => {
        if (!utils.successReturn(res)) return;
        console.log('daochu', res)
      })


    });
  };


  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="选择时间">
              {getFieldDecorator('grant_time')(
                <RangePicker allowClear={false} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
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

  render () {
    const { coupon: { data }, loading } = this.props;
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">代金券统计</span>
            <span className="fr">
              {this.state.menu.indexOf('export') != -1 ? (
                <Button style={{ marginLeft: 30 }} type="primary" onClick={this.handleExportForm}>
                  导出
                </Button>
              ) : (
                  ''
                )}
            </span>
          </div>
          <div className={styles.tableList}>
            <div style={{ marginBottom: 12 }}>
              <Alert message="备注：此表显示的是一定时间内代金券信息" showIcon={false} banner />
            </div>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default Coupon;
