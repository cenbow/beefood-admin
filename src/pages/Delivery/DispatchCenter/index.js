import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import {
  Card, Breadcrumb, PageHeader, Tabs, Form, Row, Col, Input, Button, Select, DatePicker, Icon, Divider, Tooltip
} from 'antd';
import utils from '@/utils/utils';
import configVar from '@/utils/configVar';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import indexStyles from './index.less';
import DriverStatusList from "./DriverStatusList.js";
import OrderInfo from "./OrderInfo.js";

const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Option } = Select;

const tabBox = {
  '1': '新订单',
  '2': '需人工派单',
  '3': '派单未确认',
  '4': '待确认退单',
  '5': '已接单',
  '6': '已取货',
  '7': '已送达',
  '8': '已取消',
  '9': '全部',
}

const driver_Status = {
  '1': '在岗',
  '2': '忙碌',
  '3': '离岗',
}
const driver_Status_color = {
  '1': 'color-u92',
  '2': 'color-u109',
  '3': 'color-u94',
}

@connect(({ common, loading }) => ({
  common,
  loading: loading.models.common,
}))
@Form.create()
class DispatchCenterIndex extends Component {
  state = {
    tabKey: '3',
    driverStatus: 0,
    page: configVar.page,
    pagesize: configVar.pagesize,
    formValues: {},
    selectedRows: [],
    rowSelected: '',
    orderInfoModalVisible: false,
    orderInfo: {},
  }

  componentDidMount() {
    const { location } = this.props;
    // 切换tab
    let keys = location.query.tab_key;
    if (tabBox[keys] != undefined) {
      this.redirectUrl(keys);
    } else {
      this.redirectUrl('3');
    }

    // 获取筛选条件
    this.getCommon();
  }

  redirectUrl = key => {
    const { match } = this.props;
    this.setState({
      tabKey: key,
    });
    router.push({
      pathname: '/delivery/dispatchCenter',
      query: {
        tab_key: key,
      },
    });
  };

  componentWillUnmount() {

  }

  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params,
    };
    // dispatch({
    //   type: 'merchant/fetchMerchantList',
    //   payload: getParams,
    // });
  }

  columns = [
    {
      title: '状态',
      dataIndex: 'status',
    },
    {
      title: '期望时间',
      dataIndex: 'required_time',
    },
    {
      title: '商家名称',
      dataIndex: 'merchant_name',
    },
    {
      title: '送货地址',
      dataIndex: 'user_address',
    },
    {
      title: '骑手',
      dataIndex: 'driver_name',
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <Tooltip placement="top" title={'订单详情'}>
            <a onClick={() => this.handleOrderInfoModal(true, record)}><Icon type="exclamation-circle" theme="twoTone" /></a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip placement="top" title={'地图派单'}>
            <Link to={'/station/details/' + record.id}><Icon type="environment" theme="twoTone" /></Link>
          </Tooltip>
        </Fragment>
      ),
    },
  ]

  // 国家联级使用
  getCommon = () => {
    const { dispatch } = this.props;
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {},
    });
  };
  selectCountry = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      city_id: undefined,
    });
    this.selectCity();
    dispatch({
      type: 'common/getCity',
      payload: id ? { country_id: id } : 'clear',
    });
  };
  selectCity = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      region_id: undefined,
    });
    this.selectRegions();
    dispatch({
      type: 'common/getRegion',
      payload: id ? { city_id: id } : 'clear',
    });
  };
  selectRegions = id => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      station_id: undefined,
    });
    dispatch({
      type: 'common/getStation',
      payload: id ? { region_id: id } : 'clear',
    });
  };

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

  // 选择列表行数据
  onSelectedRows = record => {
    return {
      onClick: () => {
        this.setState({
          rowSelected: record.id != this.state.rowSelected ? record.id : '',
        });
      },
    };
  };

  // 列表数据多选择
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  // 切换骑手的状态显示
  onChangeDriverStatus = (key) => {
    // console.log(key);
    this.setState({
      driverStatus: key,
    });
  }

  // 查看订单详情
  handleOrderInfoModal = (flag, record) => {
    debugger
    this.setState({
      orderInfoModalVisible: !!flag,
      // orderInfo: {},
    });
    if (!record) return;
    // 获取信息
    /* getStationInfo({
      id: record.id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    }); */
  };

  handleSearch = e => {
    if (e) {
      e.preventDefault();
    }
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // console.log(fieldsValue);

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

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      common
    } = this.props;
    const { country = [], city = [], region = [], station = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="国家">
          {getFieldDecorator('country_id')(
            <Select placeholder="请选择" style={{ width: 106 }} onChange={val => { this.selectCountry(val) }} allowClear>
              {country.map((item, i) => (
                <Option value={item.id} key={i} title={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="城市">
          {getFieldDecorator('city_id')(
            <Select placeholder="请选择" style={{ width: 106 }} onChange={val => { this.selectCity(val) }} allowClear>
              {city.map((item, i) => (
                <Option value={item.id} key={i} title={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="区域">
          {getFieldDecorator('region_id')(
            <Select placeholder="请选择" style={{ width: 106 }} onChange={val => { this.selectRegions(val) }} allowClear>
              {region.map((item, i) => (
                <Option value={item.id} key={i} title={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="站点">
          {getFieldDecorator('station_id')(
            <Select placeholder="请选择" style={{ width: 106 }} allowClear>
              {station.map((item, i) => (
                <Option value={item.id} key={i} title={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="日期">
          {getFieldDecorator('create_time')(
            <DatePicker style={{ width: 130 }} />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_merchant')(
            <Input placeholder="商家名称/商家名称 空格 订单序号" style={{ width: 250 }} />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('order_no')(
            <Input placeholder="订单号" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_driver')(
            <Input placeholder="骑手姓名/手机号" />
          )}
        </FormItem>
        <FormItem className={styles.submitButtons}>
          <Button type="primary" htmlType="submit">查询</Button>
          <Button style={{ marginLeft: 8 }}>骑手地图</Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const { loading, } = this.props;
    const { tabKey, orderInfoModalVisible, orderInfo } = this.state;
    
    // table数据
    const data = {
      list: [
        {
          'id': '1',
          'status': '待接单',
          'required_time': '2019-09-11',
          'merchant_name': '潮汕鱼丸',
          'user_address': '广州',
          'driver_name': '亚瑟',
        },
        {
          'id': '2',
          'status': '待接单',
          'required_time': '2019-09-11',
          'merchant_name': '潮汕鱼丸',
          'user_address': '广州',
          'driver_name': '亚瑟',
        },
      ]
    }

    // 骑手列表数据
    const driver_list = {
      'online': [
        {
          'status': '休息中',
          'is_lost': '是',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
      ],
      'busy': [
        {
          'status': '休息中',
          'is_lost': '是',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
      ],
      'leave': [
        {
          'status': '休息中',
          'is_lost': '是',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
        {
          'status': '开工',
          'is_lost': '否',
          'real_name': '亚瑟',
          'bond': '1',
          'send_order_num': '1',
          'finish_order_num': '10',
        },
      ],
    }

    return (
      <Card bordered={false}>
        <div className="m-b-16">
          <Breadcrumb separator=">">
            <Breadcrumb.Item>调度中心</Breadcrumb.Item>
            <Breadcrumb.Item>调度控制台</Breadcrumb.Item>
            <Breadcrumb.Item>{tabBox[tabKey]}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="m-b-12">
          {this.renderSimpleForm()}
        </div>
        <div className={indexStyles.dispatch_center_box}>
          <div className={indexStyles.left_driver}>
            <div className={indexStyles.left_search}>
              <Select value={this.state.driverStatus} onChange={this.onChangeDriverStatus} style={{ width: 128 }}>
                <Option value={0}>全部（{driver_list['online'].length + driver_list['busy'].length + driver_list['leave'].length}）</Option>
                {
                  Object.keys(driver_Status).map(i => (
                    <Option value={i} key={i}>{driver_Status[i]}（{driver_list[i == 1 && 'online' || i == 2 && 'busy' || i == 3 && 'leave'].length}）</Option>
                  ))
                }
              </Select>
              <Input placeholder="请输入骑手姓名进行搜索" style={{ width: 186,marginLeft: 12 }} />
            </div>
            <div className={indexStyles.driver_list}>
              <div className={indexStyles.driver_list_header}>
                <div><span>骑手</span></div>
                <div><span>送/总</span></div>
                <div><span>距离</span></div>
                <div><span>贷款</span></div>
              </div>
              <div className={indexStyles.driver_list_content}>
                {
                  Object.keys(driver_Status).map(i => (
                    <div key={i}>
                      {
                        this.state.driverStatus != 0 ? this.state.driverStatus == i && (
                          <DriverStatusList 
                            styles={indexStyles} 
                            keys={i} 
                            driver_Status_color={driver_Status_color}
                            driver_Status={driver_Status}
                            driver_info={driver_list[i == 1 && 'online' || i == 2 && 'busy' || i == 3 && 'leave']}
                          />
                        ) : (
                            <DriverStatusList
                              styles={indexStyles}
                              keys={i}
                              driver_Status_color={driver_Status_color}
                              driver_Status={driver_Status}
                              driver_info={driver_list[i == 1 && 'online' || i == 2 && 'busy' || i == 3 && 'leave']}
                            />
                        )
                      }
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          <div className={indexStyles.right_list}>
            <Tabs activeKey={tabKey} onChange={this.redirectUrl} className="">
              {
                Object.keys(tabBox).map((i) => (
                  <TabPane tab={(
                    <span className={indexStyles.tab_box_title}>
                      <h3>{tabBox[i]}</h3>
                      <p>超时</p>
                    </span>
                  )} key={i} />
                ))
              }
            </Tabs>
            <div className={styles.tableList}>
              <StandardTable
                rowKey={list => list.id}
                onSelectRow={this.handleSelectRows}
                selectedRows={this.state.selectedRows}
                loading={loading}
                data={data}
                columns={this.columns}
                onChange={this.handleStandardTableChange}
                onRow={this.onSelectedRows}
                rowClassName={(record) => (record.id == this.state.rowSelected ? styles.selected_row : '')}
              />
            </div>
          </div>
        </div>
        {/* 查看订单详情 */}
        {orderInfo && Object.keys(orderInfo).length ? (
          <OrderInfo
            handleOrderInfoModal={this.handleOrderInfoModal}
            modalVisible={orderInfoModalVisible}
            values={orderInfo}
          />
        ) : null}
      </Card>
    )
  }
}

export default DispatchCenterIndex;