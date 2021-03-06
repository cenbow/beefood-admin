import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, DatePicker, Badge, Popconfirm } from 'antd';
import StandardTable from '@/components/StandardTable';
import ShowImg from '@/components/showImg';
import { saveBdRelation, submitMerahantAuth } from '@/services/merchant';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, {getMenu} from '@/utils/utils';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const statusMap = ['default', 'processing', 'success', 'error'];
const verify_status = ['未认证', '认证中', '已通过', '未通过'];
const delivery_type = ['','平台专送', '全城送', '商家自配送', '到店自取'];
const auth_verify_status = ['', '审核中', '已通过', '不通过'];

@connect(({ merchant, common, loading }) => ({
  merchant,
  common,
  loading: loading.models.merchant,
}))
@Form.create()
class Claim extends PureComponent {
  state = {
    page: configVar.page,
    pagesize: configVar.pagesize,
    menu: [],
  };

  componentDidMount() {
    this.getList();
    this.getCommon();
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
            menu: getMenu(res.data.items, 'merchant', 'claim'),
          });
        }
      },
    });
  };
  // 我已认领
  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      list_type: 2,
      ...params,
    };
    dispatch({
      type: 'merchant/fetchMerchantList',
      payload: getParams,
    });
  };

  getCommon = () => {
    const { dispatch } = this.props;
    // 商家分类
    dispatch({
      type: 'common/getMCategory',
      payload: {
        level: 3,
      },
    });
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {},
    });
    // 选择城市
    dispatch({
      type: 'common/getCity',
      payload: {},
    });
    // 选择区域
    dispatch({
      type: 'common/getRegion',
      payload: {},
    });
    // 选择商圈
    dispatch({
      type: 'common/getBusiness',
      payload: {},
    });
  };

  columns = [
    {
      title: '头像',
      dataIndex: 'm_user_info.logo',
      render: val => (<ShowImg src={val} className="avatar-48" />),
    },
    {
      title: '商家信息',
      render: (text, record) => (
        <div>
          <div>商家名称：{record.m_user_info && record.m_user_info.name}</div>
          <div>ID：{record.id}</div>
          <div>电话：{record.m_user_info && record.m_user_info.store_mobile}</div>
          <div>地址：{record.m_user_info && record.m_user_info.address}</div>
          {Object.keys(record.category).length > 0 && (
            <div>
              品类：
              {(record.category || []).map((item, i) => {
                if (i != 0) {
                  return (
                    <span key={i}>，{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
                  );
                }
                return (
                  <span key={i}>{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
                );
              })}
            </div>
          )}
          <div>所属商圈：{record.m_user_info && record.m_user_info.business}</div>
          <div>
            佣金比例：<span>平台配送:{record.m_user_info && record.m_user_info.percent_platform}%</span>；
            <span>商家自配送:{record.m_user_info && record.m_user_info.percent_self}%</span>；
            <span>到店自取:{record.m_user_info && record.m_user_info.percent_take}%</span>
          </div>
          <div>提交时间：{moment(record.create_time * 1000).format('YYYY-MM-DD')}</div>
          <div>配送方式：{record.m_user_info && delivery_type[record.m_user_info.delivery_type]}</div>
          <div>商家联系人：{record.m_user_info && record.m_user_info.contact_name}</div>
          {Object.keys(record.sys_bd).length > 0 && <div>BD联系人：{record.sys_bd.name}</div>}
        </div>
      ),
    },
    {
      title: '认证状态',
      render: (text, record) => (
        <div>
          {
            Object.keys(record.user_audit).length > 0 ? (
              <div>
                <p style={{ color: 'red' }}>认证中</p>
                <div>
                  <div><span>基本信息：</span>{auth_verify_status[record.user_audit.basic_verify_status]}</div>
                  <div><span>营业信息：</span>{auth_verify_status[record.user_audit.shop_verify_status]}</div>
                  <div><span>店铺环境：</span>{auth_verify_status[record.user_audit.ambient_verify_status]}</div>
                  <div><span>认证信息：</span>{auth_verify_status[record.user_audit.auth_verify_status]}</div>
                </div>
              </div>
            ) : (
                <span>未认证</span>
            )
          }
        </div>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <p><Link to={'/merchant/details/' + record.id}><Button>管理</Button></Link></p>
          <p>
            <Popconfirm placement="left" title="确定释放此商家吗？" onConfirm={() => { this.merahantClaim(record.id, 4) }}>
              <Button>商家释放</Button>
            </Popconfirm>
          </p>
          <p>
            <Popconfirm placement="left" title="确定提交认证吗？" onConfirm={() => { this.merahantAuth(record.id) }}>
              <Button>提交认证</Button>
            </Popconfirm>
          </p>
        </Fragment>
      ),
    },
  ];

  // 商家释放
  merahantClaim = (merchant_id, status) => {
    let formData = new FormData();
    formData.append('merchant_id', merchant_id);
    formData.append('status', status);
    saveBdRelation(formData).then((res) => {
      if (!utils.successReturn(res)) return;
      message.success('商家释放成功');
      this.getList();
    })
  };

  // 提交认证
  merahantAuth = (merchant_id) => {
    let formData = new FormData();
    formData.append('merchant_id', merchant_id);
    submitMerahantAuth(formData).then((res) => {
      if (!utils.successReturn(res)) return;
      message.success('提交成功');
      this.getList();
    })
  };

  handleStandardTableChange = (pagination) => {
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
    this.setState({
      formValues: {},
    });
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

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      common,
    } = this.props;
    const { getMCategory = [], country = [], city = [], region = [], business = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商家ID">
              {getFieldDecorator('merchant_id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商家品类">
              {getFieldDecorator('category_three_id')(
                <Select placeholder="请选择" allowClear>
                  {
                    getMCategory.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="国家">
              {getFieldDecorator('country_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {country.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="城市">
              {getFieldDecorator('city_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {city.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="区域">
              {getFieldDecorator('region_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {region.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="商圈">
              {getFieldDecorator('business_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {business.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="BD联系人">
              {getFieldDecorator('bd_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="配送方式">
              {getFieldDecorator('delivery_type')(
                <Select placeholder="请选择" allowClear>
                  {
                    delivery_type.map((item, i) => {
                      if (i > 0){
                        return <Option value={i} key={i}>{item}</Option>
                      }
                    })
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商家联系人">
              {getFieldDecorator('contact_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="提交时间">
              {getFieldDecorator('create_time')(
                <DatePicker.RangePicker
                  placeholder={[
                    formatMessage({ id: 'form.date.placeholder.start' }),
                    formatMessage({ id: 'form.date.placeholder.end' }),
                  ]}
                />
              )}
            </FormItem>
          </Col>
          <Col xl={2} md={8} sm={24}>
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
      merchant: { merchantAllList },
      loading,
    } = this.props;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">已认领商家</span>
        </div>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={merchantAllList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Card>
    );
  }
}

export default Claim;
