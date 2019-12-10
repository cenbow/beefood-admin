import React, { PureComponent, Suspense, Fragment } from 'react';
import { connect } from 'dva';
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
  DatePicker,
  Tabs,
  Table,
} from 'antd';
import { Bar } from '@/components/Charts';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { getTimeDistance } from '@/utils/utils';
import PageLoading from '@/components/PageLoading';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import statistics1 from '@/assets/images/statistics1.png';
import statistics2 from '@/assets/images/statistics2.png';
import statistics3 from '@/assets/images/statistics3.png';
import statistics4 from '@/assets/images/statistics4.png';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

@connect(({ statistics, common, loading }) => ({
  statistics,
  common,
  loading: loading.models.statistics,
}))
@Form.create()
class Operate extends PureComponent {
  state = {
    dataSource: [],
    selectedRows: [],
    formValues: {},
    rowSelected: '',
    menu: [],
  };

  componentDidMount() {
    this.getData();
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
            menu: getMenu(res.data.items, 'statistics', 'operate'),
          });
        }
      },
    });
  };
  componentWillUnmount() {
    cancelAnimationFrame(this.reqRef);
  }

  getData = params => {
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
    //获取销售运营数据
    dispatch({
      type: 'statistics/fetchSalesOperation',
      payload: detaParams,
    });
    //获取日期订单统计
    dispatch({
      type: 'statistics/fetchTimeOrderStatistice',
      payload: getParams,
    });
    //获取商家订单统计
    dispatch({
      type: 'statistics/fetchMerchantOrderStatistics',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '日期',
      dataIndex: 'create_time',
      width: 120,
      fixed: 'left',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '订单总额',
      children: [
        {
          title: '商品总额',
          dataIndex: 'order_amount',
          width: 200,
        },
        {
          title: '配送费',
          dataIndex: 'distribution_price',
          width: 200,
        },
      ],
    },
    {
      title: '优惠金额',
      dataIndex: 'discount_price',
    },
    {
      title: '实付金额',
      dataIndex: 'sale_price',
    },
    {
      title: '订单数',
      dataIndex: 'order_num',
    },
    {
      title: '下单用户数',
      dataIndex: 'order_user_num',
      width: 120,
    },
    {
      title: '退差价',
      dataIndex: 'return_price',
      width: 80,
    },
    {
      title: '客户价',
      dataIndex: 'average_price',
      width: 80,
    },
    {
      title: '售后订单量',
      dataIndex: 'after_sale_order_num',
      width: 120,
    },
    {
      title: '售后总额',
      dataIndex: 'after_sale_order_amount',
      width: 80,
    },
    {
      title: '查看',
      width: 80,
      fixed: 'right',
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/config/promotion/details/' + record.id}>详情</Link>
          ) : (
            ''
          )}
        </Fragment>
      ),
    },
  ];

  merchantColumns = [
    {
      title: '商家',
      dataIndex: 'merchant_name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '订单总额',
      children: [
        {
          title: '商品总额',
          dataIndex: 'order_amount',
          width: 200,
        },
        {
          title: '配送费',
          dataIndex: 'distribution_price',
          width: 200,
        },
      ],
    },
    {
      title: '优惠金额',
      dataIndex: 'discount_price',
    },
    {
      title: '实付金额',
      dataIndex: 'sale_price',
    },
    {
      title: '订单数',
      dataIndex: 'order_num',
    },
    {
      title: '下单用户数',
      dataIndex: 'order_user_num',
      width: 120,
    },
    {
      title: '退差价',
      dataIndex: 'return_price',
      width: 80,
    },
    {
      title: '客户价',
      dataIndex: 'average_price',
      width: 80,
    },
    {
      title: '售后订单量',
      dataIndex: 'after_sale_order_num',
      width: 120,
    },
    {
      title: '售后总额',
      dataIndex: 'after_sale_order_amount',
      width: 80,
    },
    {
      title: '查看',
      width: 80,
      fixed: 'right',
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/config/promotion/details/' + record.id}>详情</Link>
          ) : (
            ''
          )}
        </Fragment>
      ),
    },
  ];

  render() {
    const {
      form: { getFieldDecorator },
      statistics,
      loading,
    } = this.props;
    const {
      salesOperation = {
        order_amount: 0,
        order_num: 0,
        discount_amount: 0,
        real_pay_amount: 0,
      },
      timeOrderStatistice,
      merchantOrderStatistics,
    } = statistics;
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 6,
      style: { marginBottom: 24 },
    };

    const salesData = [];
    for (let i = 0; i < 12; i += 1) {
      salesData.push({
        x: `${i + 1}月`,
        y1: Math.floor(Math.random() * 1000) + 200,
        y2: Math.floor(Math.random() * 100) + 100,
      });
    }

    return (
      <GridContent>
        <div className="main-24">
          <Suspense fallback={<PageLoading />}>
            <Row gutter={24}>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_blue">
                  <div className="visual">
                    <img src={statistics1} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">{salesOperation.order_amount}</div>
                    <div className="desc">订单总额</div>
                  </div>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_red">
                  <div className="visual">
                    <img src={statistics2} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">{salesOperation.order_num}</div>
                    <div className="desc">总订单量</div>
                  </div>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_purple">
                  <div className="visual">
                    <img src={statistics3} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">{salesOperation.discount_amount}</div>
                    <div className="desc">优惠金额</div>
                  </div>
                </div>
              </Col>
              <Col {...topColResponsiveProps}>
                <div className="dashboard dashboard_yellow">
                  <div className="visual">
                    <img src={statistics4} alt="" className="icon" />
                  </div>
                  <div className="details">
                    <div className="number">{salesOperation.real_pay_amount}</div>
                    <div className="desc">用户实付</div>
                  </div>
                </div>
              </Col>
            </Row>
            <Card style={{ marginBottom: 24 }}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row type="flex" gutter={24}>
                  <Col xl={24}>
                    <span>选择时间：</span>
                    {getFieldDecorator('order_no')(<RangePicker onChange={this.onChange} />)}
                    <Button type="primary" htmlType="submit" style={{ marginLeft: 12 }}>
                      确定
                    </Button>
                    {this.state.menu.indexOf('export') != -1 ? (
                      <Button style={{ marginLeft: 8 }} type="primary">
                        导出
                      </Button>
                    ) : (
                      ''
                    )}
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card title="销售走势" style={{ marginBottom: 24 }}>
              <Bar
                height={295}
                title="销售额趋势"
                data={salesData}
                titleMap={{ y1: '客流量', y2: '支付笔数' }}
              />
            </Card>
            <div style={{ marginBottom: 24 }}>
              <Tabs type="card">
                <TabPane tab="按日期统计" key="1">
                  <Table
                    columns={this.columns}
                    dataSource={timeOrderStatistice.list}
                    bordered
                    size="middle"
                    rowKey={list => list.id}
                  />
                </TabPane>
                <TabPane tab="按商家统计" key="2">
                  <Table
                    columns={this.merchantColumns}
                    dataSource={merchantOrderStatistics.list}
                    bordered
                    size="middle"
                    rowKey={list => list.id}
                  />
                </TabPane>
              </Tabs>
            </div>
          </Suspense>
        </div>
      </GridContent>
    );
  }
}

export default Operate;
