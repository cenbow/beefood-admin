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
  Tabs,
  DatePicker,
  message,
  Divider,
  Badge,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const statusMap = ['', 'default', 'processing', 'success', 'warning', 'error', 'error'];
const status = [
  '',
  '配送中(待核销)',
  '待评价',
  '已完成',
  '售后订单',
  '交易关闭(未支付)',
  '交易关闭(用户取消)',
];

@connect(({ statistics, common, loading }) => ({
  statistics,
  common,
  loading: loading.models.statistics,
}))
@Form.create()
class Consumer extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '会员手机',
      dataIndex: 'phone',
    },
    {
      title: '商品总价',
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '物流价格',
      dataIndex: 'distribution_price',
      sorter: true,
    },
    {
      title: '实付金额',
      dataIndex: 'sale_price',
      sorter: true,
    },
    {
      title: '订单优惠',
      dataIndex: 'discount_price',
    },
    {
      title: '下单时间',
      dataIndex: 'order_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'order_status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Link to={'/order/home/details/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

  newUserColumns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      render: url => <img className="avatar-48" src={url} alt={url} />,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '电话',
      dataIndex: 'phone',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      sorter: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
    },
    {
      title: '注册时间',
      dataIndex: 'register_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Link to={'/member/consumer/details/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

  firstBuyUserColumns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      render: url => <img className="avatar-48" src={url} alt={url} />,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '电话',
      dataIndex: 'phone',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      sorter: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
    },
    {
      title: '注册时间',
      dataIndex: 'register_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '下单时间',
      dataIndex: 'order_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Link to={'/member/consumer/details/' + record.id}>查看</Link>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
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
            menu: getMenu(res.data.items, 'statistics', 'consumer'),
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
    let detaParams = {
      start_statistics_time: '1559026363',
      end_statistics_time: '1559026363',
      ...params,
    };
    //获取统计数据
    dispatch({
      type: 'statistics/fetchSalesOperation',
      payload: detaParams,
    });
    // 获取订单列表
    dispatch({
      type: 'statistics/fetchPayOrderList',
      payload: getParams,
    });
    // 获取新用户列表
    dispatch({
      type: 'statistics/fetchNewUserList',
      payload: getParams,
    });
    // 获取首次下单用户列表
    dispatch({
      type: 'statistics/fetchFirstBuyUserList',
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
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  selectMerchantChange = value => {
    console.log(`selected ${value}`);
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="选择时间">
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
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="请选择"
                  onChange={this.selectMerchantChange}
                >
                  {status.map((item, i) => {
                    if (i > 0) {
                      return <Option key={i}>{item}</Option>;
                    }
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              {this.state.menu.indexOf('export') != -1 ? (
                <Button style={{ marginLeft: 8 }} type="primary">
                  导出
                </Button>
              ) : (
                ''
              )}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { statistics, loading } = this.props;
    const {
      salesOperation = {
        register_user_num: 0,
        buy_new_user_num: 0,
        new_user_order_num: 0,
        new_user_close_order_num: 0,
        new_user_ageunit_price: 0,
        new_user_order_amount: 0,
        new_user_order_real_pay_amount: 0,
      },
      payOrderList,
      newUserList,
      firstBuyUserList,
    } = statistics;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <Card
              size="small"
              className="card_blue"
              title={
                <span>
                  <Icon type="bar-chart" /> 新用户下单信息
                </span>
              }
            >
              <Row gutter={{ md: 6, lg: 12, xl: 24 }}>
                <Col md={12} sm={24}>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新增注册用户数："
                      style={{ backgroundColor: '#52c41a', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.register_user_num}</h3>
                  </Col>
                  <Col md={6} sm={24}>
                    <Badge
                      count="首次下单用户数："
                      style={{ backgroundColor: '#52c41a', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.buy_new_user_num}</h3>
                  </Col>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新用户订单总量："
                      style={{ backgroundColor: '#57b5e3', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.new_user_order_num}</h3>
                  </Col>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新用户关闭订单数："
                      style={{ backgroundColor: '#57b5e3', borderRadius: 0 }}
                    />
                    <span></span>
                    <h3>{salesOperation.new_user_close_order_num}</h3>
                  </Col>
                </Col>
                <Col md={12} sm={24}>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新用户客单价："
                      style={{ backgroundColor: '#57b5e3', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.new_user_ageunit_price}</h3>
                  </Col>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新用户订单总额："
                      style={{ backgroundColor: '#57b5e3', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.new_user_order_amount}</h3>
                  </Col>
                  <Col md={6} sm={24}>
                    <Badge
                      count="新用户订单实付总额："
                      style={{ backgroundColor: '#fcb322', borderRadius: 0 }}
                    />
                    <h3>{salesOperation.new_user_order_real_pay_amount}</h3>
                  </Col>
                </Col>
              </Row>
            </Card>
            <div style={{ marginTop: 24 }}>
              <Tabs
                type="card"
                onChange={() => {
                  console.log('callback');
                }}
              >
                <TabPane
                  tab={
                    <span>
                      <Icon type="unordered-list" />
                      订单列表
                    </span>
                  }
                  key="1"
                >
                  <StandardTable
                    rowKey={list => list.id}
                    selectedRows={[]}
                    rowSelection={null}
                    loading={loading}
                    data={payOrderList}
                    columns={this.columns}
                    onChange={this.handleStandardTableChange}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <Icon type="unordered-list" />
                      新用户列表
                    </span>
                  }
                  key="2"
                >
                  <StandardTable
                    rowKey={list => list.id}
                    selectedRows={[]}
                    rowSelection={null}
                    loading={loading}
                    data={newUserList}
                    columns={this.newUserColumns}
                    onChange={this.handleStandardTableChange}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <Icon type="unordered-list" />
                      首次下单用户
                    </span>
                  }
                  key="3"
                >
                  <StandardTable
                    rowKey={list => list.id}
                    selectedRows={[]}
                    rowSelection={null}
                    loading={loading}
                    data={firstBuyUserList}
                    columns={this.firstBuyUserColumns}
                    onChange={this.handleStandardTableChange}
                  />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default Consumer;
