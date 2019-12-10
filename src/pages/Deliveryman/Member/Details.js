import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import {
  Form,
  Card,
  Badge,
  Tabs,
  Table,
  Divider,
  Tag,
  Row,
  Col,
  List,
  Button,
  Input,
  Modal,
  DatePicker,
  Select,
} from 'antd';
import DescriptionList from '@/components/DescriptionList';
import StandardTable from '@/components/StandardTable';
import utils, { whatSex } from '@/utils/utils';
import styles from '@/assets/css/BasicProfile.less';
import Zmage from 'react-zmage';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import mapboxgl from 'mapbox-gl';
import configs from '../../../../env';
import '@/utils/mqttws31.min.js';
const { RangePicker } = DatePicker;
const { Option } = Select;
const FormItem = Form.Item;
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { TextArea } = Input;

const progressColumns = [
  {
    title: '下单日期',
    dataIndex: 'create_time',
    render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
  },
  {
    title: '订单编号',
    dataIndex: 'order_no',
  },
  {
    title: '运单编号',
    dataIndex: 'deliver_no',
  },
  {
    title: '商家名称',
    dataIndex: 'merchant_name',
  },
  {
    title: '取货地址',
    dataIndex: 'merchant_address',
  },
  {
    title: '用户名称',
    dataIndex: 'user_name',
  },
  {
    title: '用户手机号码',
    dataIndex: 'user_mobile',
  },
  {
    title: '收货地址',
    dataIndex: 'user_address',
  },
  {
    title: '配送距离(m)',
    dataIndex: 'user_to_merchant_distance',
  },
  {
    title: '配送费($)',
    dataIndex: 'order_data.distribution_fee',
  },
  {
    title: '订单类型',
    dataIndex: 'process',
    render: type => (
      <span>
        {type == 1 ? '完成单' : ''}
        {type == 2 ? '送达违规' : ''}
        {type == 3 ? '取消订单' : ''}
        {type == 4 ? '派单拒绝成' : ''}
        {type == 5 ? '虚假配送' : ''}
        {type == 6 ? '负荷派单' : ''}
        {type == 7 ? '餐损违规' : ''}
      </span>
    ),
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    render: type => (
      <span>
        {type == 21 ? '已接单' : ''}
        {type == 22 ? '到店取货中' : ''}
        {type == 23 ? '配送中' : ''}
        {type == 24 ? '配送完成' : ''}
        {type == 25 ? '骑手取消订单配送' : ''}
        {type == 26 ? '非骑手取消订单, 配送终止' : ''}
      </span>
    ),
  },

  {
    title: '异常原因',
    dataIndex: 'abnormal_reason',
  },
  {
    title: '付款方式',
    dataIndex: 'pay_type',
    render: type => (
      <span>
        {type == 1 ? '线上支付' : ''}
        {type == 2 ? '货到付款' : ''}
      </span>
    ),
  },
  {
    title: '订单金额($)',
    dataIndex: 'order_data.pay_price',
  },
];

@Form.create()
@connect(({ list, deliverymanMemberList, common, loading }) => ({
  list,
  deliverymanMemberList,
  common,
  loading: loading.models.list,
}))
class DeliverymanMemberDetails extends Component {
  state = {
    identvisible: false,
    itemId: '',
    formValues: {},
  };

  componentDidMount() {
    this.getDetile();
    this.getDriverWaybillList();
    window.scroll(0, 0)
  }

  //获取详情页面
  getDetile = () => {
    const { dispatch, match } = this.props;
    const { params } = match;
    dispatch({
      type: 'list/fetchDeliverymanMemberDetails',
      payload: {
        id: params.id,
      },
    });
  };
  //获取骑手订单列表
  getDriverWaybillList = value => {
    const { dispatch, match } = this.props;
    const { params } = match;
    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...value,
      driver_id: params.id
    };
    // 获取列表
    dispatch({
      type: 'list/fetchDriverWaybillList',
      payload: getParams,
    });
  };

  callback = key => {
    console.log(key);
  };
  handleApprove = item => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', item);
    dispatch({
      type: 'deliverymanMemberList/fetchDriverApprove',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          message.success('认证成功!');
          this.getDetile();
        } else {
          message.error(res.msg);
        }
      },
    });
  };
  handleUnApprove = item => {
    this.setState({
      identvisible: true,
      itemId: item,
    });
  };
  handleOk = () => {
    this.handleSubmit();
  };
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue),
      };
      this.getDriverWaybillList(values);
    });
  };
  //审核提交
  handleSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ confirmLoading: true });
        const { dispatch } = this.props;
        let formData = new FormData();
        formData.append('id', this.state.itemId);
        formData.append('content', values.content);
        dispatch({
          type: 'deliverymanMemberList/fetchDriverUnapproved',
          payload: formData,
          callback: res => {
            if (res.code == 200) {
              message.success('认证失败!');
              this.setState({
                identvisible: false,
                confirmLoading: false,
              });
              this.getDetile();
            } else {
              message.error(res.msg);
              this.setState({
                confirmLoading: false,
              });
            }
          },
        });
      }
    });
  };
  handleCancel = () => {
    this.setState({
      identvisible: false,
      confirmLoading: false,
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

    this.getDriverWaybillList(params);
    window.scrollTo(0, 0);
  };
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getDriverWaybillList();
  };
  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="下单时间">
              {getFieldDecorator('create_time')(<RangePicker style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="运单编号">
              {getFieldDecorator('deliver_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="订单编号">
              {getFieldDecorator('order_no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="收货地址">
              {getFieldDecorator('user_address')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="用户姓名">
              {getFieldDecorator('user_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="用户手机号">
              {getFieldDecorator('user_mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="取货地址">
              {getFieldDecorator('merchant_address')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="订单类型">
              {getFieldDecorator('process')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  <Option value={1}>完成单</Option>
                  <Option value={2}>送达违规</Option>
                  <Option value={3}>取消订单</Option>
                  <Option value={4}>派单拒绝</Option>
                  <Option value={5}>虚假配送</Option>
                  <Option value={6}>负荷派单</Option>
                  <Option value={7}>餐损违规</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="订单状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  <Option value={21}>已接单</Option>
                  <Option value={22}>到店取货中</Option>
                  <Option value={23}>配送中</Option>
                  <Option value={24}>配送完成</Option>
                  <Option value={25}>骑手取消订单配送</Option>
                  <Option value={26}>非骑手取消订单,配送终止</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="付款方式">
              {getFieldDecorator('pay_type')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  <Option value={1}>线上支付</Option>
                  <Option value={2}>货到付款</Option>
                </Select>
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
    const {
      list = {},
      loading,
      common: { commonConfig: { image_domain } },
      form: { getFieldDecorator },
    } = this.props;

    const { basicGoods = [], basicProgress = [], details = {}, data = {} } = list;
    const { confirmLoading, identvisible } = this.state;
    const getType = ['', '普通配送员', '平台配送员'];
    const statusMap = ['', '#ddd', '#2db7f5', '#87d068', '#f60'];
    const realname_status = ['', '认证中', '已认证', '认证失败'];
    let goodsData = [];
    if (basicGoods.length) {
      let num = 0;
      let amount = 0;
      basicGoods.forEach(item => {
        num += Number(item.num);
        amount += Number(item.amount);
      });
      goodsData = basicGoods.concat({
        id: '总计',
        num,
        amount,
      });
    }
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">
              <Button
                type="default"
                shape="circle"
                icon="left"
                className="fixed_to_head"
                onClick={() => router.goBack()}
              />{'骑手详情'}
            </span>
          </div>
          <Divider style={{ marginBottom: 32 }} />
          <Row gutter={16}>
            <Col md={18} sm={24}>
              <DescriptionList size="large" title="骑手信息" style={{ marginBottom: 32 }}>
                <Description term="头像" style={{ height: 86, }}>
                  <Zmage
                    src={details.d_driver_info && image_domain + details.d_driver_info.avatar}
                    style={{ width: 86, height: 86, }}
                  />
                </Description>
                <Description term="姓名">
                  {details.d_driver_info && details.d_driver_info.real_name}
                </Description>
                <Description term="类型">{getType[details.type]}</Description>
                <Description term="身份证号码">
                  {details.d_driver_info && details.d_driver_info.id_number}
                </Description>
                <Description term="电话"> {details.mobile}</Description>
                <Description term="注册时间">
                  {moment(details.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')}
                </Description>
                <Description term="状态">
                  {details.realname_status == 1 ? (
                    <Fragment>
                      <Button type="primary" onClick={() => this.handleApprove(details.id)}>
                        通过认证
                      </Button>
                      <Divider type="vertical" />
                      <Button type="danger" onClick={() => this.handleUnApprove(details.id)}>
                        不通过认证
                      </Button>
                    </Fragment>
                  ) : null}
                  {details.realname_status == 2 ? (
                    <Fragment>
                      <Tag color="blue">通过认证</Tag>
                    </Fragment>
                  ) : null}
                  {details.realname_status == 3 ? (
                    <Fragment>
                      <Tag color="magenta">认证失败</Tag>
                      <span>
                        原因:{details.d_driver_apply_data && details.d_driver_apply_data.content}
                      </span>
                    </Fragment>
                  ) : null}
                </Description>
                <Description></Description>
                <Description term="区域">
                  {details.d_driver_area && details.d_driver_area.province}
                  {details.d_driver_area && details.d_driver_area.city}
                  {details.d_driver_area && details.d_driver_area.region}
                </Description>
                {details.invite_by_driver_mobile != null ? (
                  <Description term="邀请人">
                    {details && details.invite_by_driver_name}
                    ({details && details.invite_by_driver_mobile})
                  </Description>
                ) : null}
              </DescriptionList>
            </Col>
            <Col md={6} sm={24}>
              <div className="portlet-body m-t-16">
                <ul className="list-unstyled">
                  <li>
                    <span className="sale-info">接单数</span>
                    <span className="sale-num">{details.accept_num}</span>
                  </li>
                  <li>
                    <span className="sale-info">完成数量</span>
                    <span className="sale-num">{details.finish_num}</span>
                  </li>
                  <li>
                    <span className="sale-info">完成超时</span>
                    <span className="sale-num">{details.late_num}</span>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Tabs onChange={this.callback} type="card">
            {/* <TabPane tab="位置" key="1">
              <div className="map" style={{ width: '100%', height: 460, backgroundColor: '#ccc' }}>
                <div id="map" style={{ height: '460px' }}></div>
              </div>
            </TabPane> */}
            <TabPane tab="运单" key="1">
              <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
              <StandardTable
                rowKey={list => list.id}
                selectedRows={[]}
                rowSelection={null}
                loading={loading}
                data={data}
                columns={progressColumns}
                onChange={this.handleStandardTableChange}
              />
            </TabPane>
            <TabPane tab="身份证照片" key="2">
              <div>
                <ul className="picture_card_list">
                  {
                    details.d_driver_info && (
                      <li>
                        <Zmage
                          src={image_domain + details.d_driver_info.id_image_facade}
                          style={{ width: 128, height: 128, }}
                        />
                      </li>
                    )
                  }
                  {
                    details.d_driver_info && (
                      <li>
                        <Zmage
                          src={image_domain + details.d_driver_info.id_image_back}
                          style={{ width: 128, height: 128, }}
                        />
                      </li>
                    )
                  }
                </ul>
              </div>
            </TabPane>
          </Tabs>
        </Card>
        <Modal
          title="认证失败原因"
          visible={identvisible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleSubmit} className={styles.form}>
            <Form.Item className={styles.item} label={'原因'}>
              {getFieldDecorator('content', {
                // rules: [{ required: true, message: '请填写原因' }],
              })(<TextArea />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default DeliverymanMemberDetails;
