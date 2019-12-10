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
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

// 红包类型 1-按注册(默认) 2-按分享 3-按用户 4-按邀请好友'',
const status = ['注册发放', '分享发放', '按用户发放', '邀请好友'];

@connect(({ bonus, common, loading }) => ({
  bonus,
  common,
  loading: loading.effects['bonus/fetchRedpacket'],
}))
@Form.create()
class BonusDetails extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: '序号',
      dataIndex: 'order_no',
    },
    {
      title: '红包名称',
      dataIndex: 'order_no',
    },
    {
      title: '红包ID',
      dataIndex: 'order_no',
    },
    {
      title: '红包面额($)',
      dataIndex: 'mumber',
    },
    {
      title: '消费金额($)',
      dataIndex: 'mumber',
    },
    {
      title: '有效期(天)',
      dataIndex: 'mumber',
    },
    {
      title: '用户名',
      dataIndex: 'mumber',
    },
    {
      title: '手机号码',
      dataIndex: 'mumber',
    },
    {
      title: '发放时间',
      dataIndex: 'grant_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render (val) {
        return <span>{status[val]}</span>;
      },
    },
    {
      title: '订单编号',
      dataIndex: 'mumber',
    },
    {
      title: '使用时间',
      dataIndex: 'grant_time',
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
            menu: getMenu(res.data.items, 'statistics', 'bonus'),
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
      type: 'bonus/fetchRedpacket',
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

    this.getList(params);
    window.scrollTo(0, 0);
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      this.getList(values);
    });
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={4} sm={24}>
            <FormItem label="红包名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>
          <Col xl={6} md={7} sm={24}>
            <FormItem label="发放时间">
              {getFieldDecorator('grant_time')(
                <RangePicker allowClear={false} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col xl={3} md={3} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">未使用</Option>
                  <Option value="2">已使用</Option>
                  <Option value="3">已失效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={6} md={7} sm={24}>
            <FormItem label="使用时间">
              {getFieldDecorator('use_time')(
                <RangePicker allowClear={false} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={3} sm={24}>
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
    const { bonus: { data }, loading } = this.props;
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">按分享发放红包</span>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div style={{ marginBottom: 15 }}>
              发放数量：<span className="m-r-30">123</span>
              使用数量：<span className="m-r-30">123</span>
              未使用数量：<span className="m-r-30">123</span>
              失效数量：<span className="m-r-30">123</span>
              使用总金额($)：<span className="m-r-30">123</span>
              发送总金额($)：<span className="m-r-30">123</span>
              <div className="fr">
                {this.state.menu.indexOf('export') != -1 ? (
                  <Button style={{ marginLeft: 30 }} type="primary" onClick={this.handleExportForm}>
                    导出
                </Button>
                ) : (
                    ''
                  )}
              </div>
            </div>

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

export default BonusDetails;
