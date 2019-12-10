import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, DatePicker, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';

import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, {getMenu} from '@/utils/utils';
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const statusMap = { '1': 'processing', '2': 'success', "3": 'error' };
const verify_status = { '1':'审批中','2':'已通过',"3":'未通过' };
const auth_verify_status = { '1': '审核中', '2': '已通过', "3":'不通过' };

@connect(({ merchant, common,loading }) => ({
  merchant,
  common,
  loading: loading.models.merchant,
}))
@Form.create()
class Auditing extends PureComponent {
  state = {
    page: configVar.page,
    pagesize: configVar.pagesize,
    menu: [],
  };

  componentDidMount() {
    this.fetchMenu();
    this.getList();
    this.getCommon();
  }

  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'merchant', 'auditing'),
          });
        }
      },
    });
  };

  // 商家认证审核
  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      list_type: 3,
      ...params
    }
    dispatch({
      type: 'merchant/fetchMerchantAuditList',
      payload: getParams
    });
  }
  columns = [
    {
      title: '商家ID',
      dataIndex: 'merchant_id',
    },
    {
      title: '商家名称',
      dataIndex: 'm_user_info.name',
    },
    {
      title: '商家品类',
      width: 260,
      render: (text, record) => (
        (record.category||[]).map((item, i) => {
          if (i != 0) {
            return (
              <span key={i}>，{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
            );
          }
          return (
            <span key={i}>{item.category_one_name}>{item.category_two_name}>{item.category_three_name}</span>
          );
        })
      ),
    },
    {
      title: '所属区域',
      dataIndex: 'm_user_info.region',
    },
    {
      title: '所属商圈',
      dataIndex: 'm_user_info.business',
    },
    {
      title: '提交人',
      dataIndex: 'admin_info.realname',
    },
    {
      title: '提交时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '审核结果',
      render: (text, record) => (
        <div>
          <div><Badge status={statusMap[record.verify_status]} text={verify_status[record.verify_status]} /></div>
          <div className="verify_status_show">
            <div><span>基本信息：</span>{auth_verify_status[record.basic_verify_status]}</div>
            <div><span>营业信息：</span>{auth_verify_status[record.shop_verify_status]}</div>
            <div><span>店铺环境：</span>{auth_verify_status[record.ambient_verify_status]}</div>
            <div><span>认证信息：</span>{auth_verify_status[record.auth_verify_status]}</div>
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <Link to={'/merchant/auditing/' + record.merchant_id}><Button>查看</Button></Link>
        </Fragment>
      ),
    },
  ];

  getCommon = () => {
    const { dispatch } = this.props;
    // 商家分类
    dispatch({
      type: 'common/getMCategory',
      payload: {
        level: 3,
      }
    });
    // 选择国家
    dispatch({
      type: 'common/getCountry',
      payload: {}
    });
    // 选择城市
    dispatch({
      type: 'common/getCity',
      payload: {}
    });
    // 选择区域
    dispatch({
      type: 'common/getRegion',
      payload: {}
    });
    // 选择商圈
    dispatch({
      type: 'common/getBusiness',
      payload: {}
    });
  }

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
        create_time: utils.getDateTimeMap(rangeTimeValue)
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
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入" />)}
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
                  {
                    country.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="城市">
              {getFieldDecorator('city_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {
                    city.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="区域">
              {getFieldDecorator('region_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {
                    region.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
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
                  {
                    business.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="提交人">
              {getFieldDecorator('realname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="审核结果">
              {getFieldDecorator('verify_status')(
                <Select placeholder="请选择">
                  {
                    Object.keys(verify_status).map(key => (
                      <Option value={key} key={key}>{verify_status[key]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
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
      merchant: { merchantAuditList },
      loading,
    } = this.props;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">商家审核</span>
        </div>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.merchant_id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={merchantAuditList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Card>
    );
  }
}

export default Auditing;
