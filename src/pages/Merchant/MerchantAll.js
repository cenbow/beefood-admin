import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import {
  Card,
  Form,
  Input,
  Button,
  Divider,
  Modal,
  Radio,
  message,
  Row,
  Col,
  Icon,
  Select,
  Spin,
  DatePicker,
  Popconfirm,
  Badge,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { saveBdRelation } from '@/services/merchant';

import styles from '@/assets/css/TableList.less';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import utils, { getMenu } from '@/utils/utils';
import { router } from 'umi';
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const statusMap = ['default', 'processing', 'success', 'error'];
const business_type = { '1': '营业中', '2': '暂停营业', '3': '筹建中', '4': '已关闭' };
const verify_status = ['未认证', '认证中', '已通过', '未通过'];

@connect(({ merchant, common, user, loading }) => ({
  merchant,
  common,
  user,
  loading: loading.models.merchant,
}))
@Form.create()
class MerchantAll extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      formValues: {},
      modalVisible: false,
      responsibleData: [],
      fetching: false,
      selectedRows: [],
      pid: props.user.currentUser.source_id,
      menu: [],
      source_type: '',
      source_id: '',
      select_bd_id: '',
    };
  }

  componentDidMount() {
    // this.getList();
    this.getCommon();
    this.fetchMenu();
  }

  componentWillReceiveProps(nextProps) {
    // 判断登录用户权限
    const { location, form } = this.props;
    const { source_type, source_id } = this.state;
    const new_source_type = nextProps.user.currentUser.source_type.toString();
    const new_source_id = nextProps.user.currentUser.source_id.toString();
    if (new_source_type != source_type && new_source_id != source_id) {
      this.setState({
        source_type: new_source_type,
        source_id: new_source_id,
        pid: new_source_id,
      }, () => {
        if (location.query.bd_id) {
          form.setFieldsValue({
            'verify_status': 2,
            'bd_id': location.query.bd_id,
          },()=>{
              this.handleSearch();
          })
        } else {
          this.getList();
        }
      });
    }
  }

  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'merchant', 'all'),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
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

  handleModalVisible = () => {
    this.setState({
      modalVisible: false,
    });
  };

  responsible = () => {
    const { dispatch } = this.props;
    if (this.state.selectedRows.length == 0) {
      message.info('请先选择商家哦！');
      return;
    }
    this.setState({
      modalVisible: true,
    });
    // 获取bd负责人下的bd人员数据
    if (this.state.pid) {
      dispatch({
        type: 'common/getBdListForForm',
        payload: {
          pid: this.state.pid,
        },
      });
    }
  };

  // 选择BD人员
  handleChangeBdUser = (val) => {
    this.setState({
      select_bd_id: val,
    })
  }

  changeBdUser = () => {
    const { dispatch } = this.props;
    let rows_id = [];
    this.state.selectedRows.forEach(el => {
      rows_id.push(el.id);
    });
    let formData = new FormData();
    formData.append('merchant_ids', rows_id.join(','));
    formData.append('bd_id', this.state.select_bd_id);
    // 批量分配责任人
    dispatch({
      type: 'merchant/fetchChangeBdUser',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('分配成功');
        this.setState({
          selectedRows: [],
        })
        this.handleModalVisible();
        this.getList();
      },
    });
  }

  columns = [
    {
      title: '商家LOGO',
      dataIndex: 'm_user_info',
      render: val => (<ShowImg src={val && val.logo} className="avatar-48" />),
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
          <div>商家联系人：{record.m_user_info && record.m_user_info.contact_name}</div>
          {Object.keys(record.sys_bd).length > 0 && <div>BD联系人：{record.sys_bd.name}</div>}
        </div>
      ),
    },
    {
      title: '商家动态',
      render: (text, record) => (
        <div>
          <div>营业状态：{business_type[record.m_user_info && record.m_user_info.business_type]}</div>
          <div>
            认证状态：
            <Badge
              status={
                statusMap[
                Object.keys(record.user_audit).length > 0 ? record.user_audit.verify_status : 0
                ]
              }
              text={
                verify_status[
                Object.keys(record.user_audit).length > 0 ? record.user_audit.verify_status : 0
                ]
              }
            />
          </div>
          <div>注册来源：{record.source_name}</div>
        </div>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <div className="m-b-12">
            {this.state.menu.indexOf('attention') != -1 ? (
              <Fragment>
                {record.is_follow == 1 ? (
                  <Popconfirm
                    placement="left"
                    title="确定取消关注此商家吗？"
                    onConfirm={() => {
                      this.merahantFollow(record.id, 2);
                    }}
                  >
                    <Button>取消关注</Button>
                  </Popconfirm>
                ) : (
                    <Popconfirm
                      placement="left"
                      title="确定关注此商家吗？"
                      onConfirm={() => {
                        this.merahantFollow(record.id, 1);
                      }}
                    >
                      <Button>关注</Button>
                    </Popconfirm>
                  )}
              </Fragment>
            ) : (
                ''
              )}
          </div>
          <div className="m-b-12">
            {
              this.state.menu.indexOf('claim') != -1 && (
                Object.keys(record.sys_bd).length == 0 ? (
                  <Popconfirm
                    placement="left"
                    title="确定认领此商家吗？"
                    onConfirm={() => {
                      this.merahantClaim(record.id, 3);
                    }}
                  >
                    <Button>认领</Button>
                  </Popconfirm>
                ) : (
                    record.is_release == 1 && (
                      <Popconfirm placement="left" title="确定释放此商家吗？" onConfirm={() => { this.merahantClaim(record.id, 4) }}>
                        <Button>商家释放</Button>
                      </Popconfirm>
                    )
                  )
              )
            }
          </div>
        </Fragment>
      ),
    },
  ];

  // 关注商家
  merahantFollow = (merchant_id, status) => {
    // console.log(merchant_id, status);
    let formData = new FormData();
    formData.append('merchant_id', merchant_id);
    formData.append('status', status);
    saveBdRelation(formData).then(res => {
      if (!utils.successReturn(res)) return;
      message.success('关注成功');
      this.getList();
    });
  };

  //认领商家
  merahantClaim = (merchant_id, status) => {
    // console.log(merchant_id, status);
    let formData = new FormData();
    formData.append('merchant_id', merchant_id);
    formData.append('status', status);
    saveBdRelation(formData).then(res => {
      if (!utils.successReturn(res)) return;
      message.success(status == 3 ? '认领成功' : '商家释放成功');
      this.getList();
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.getList();
    router.push('/merchant/all')
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
      common,
    } = this.props;
    const { getMCategory = [], country = [], city = [], region = [], business = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
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
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商家ID">
              {getFieldDecorator('merchant_id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="营业状态">
              {getFieldDecorator('business_type')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(business_type).map((i) => (
                    <Option value={i} key={i}>{business_type[i]}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="认证状态">
              {getFieldDecorator('verify_status')(
                <Select placeholder="请选择" allowClear>
                  {verify_status.map((item, i) => (
                    <Option value={i} key={i}>
                      {item}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商家品类">
              {getFieldDecorator('category_three_id')(
                <Select placeholder="请选择" allowClear>
                  {getMCategory.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="BD联系人">
              {getFieldDecorator('bd_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商家联系人">
              {getFieldDecorator('contact_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={6} sm={24}>
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
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={5} md={6} sm={24}>
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
          <Col xl={5} md={6} sm={24}>
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
          <Col xl={5} md={8} sm={24}>
            <FormItem label="BD员ID">
              {getFieldDecorator('bd_id')(<Input placeholder="请输入" />)}
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
      merchant: { merchantAllList },
      common,
      loading,
    } = this.props;
    const { bdListForForm = [] } = common;
    const { modalVisible, responsibleData, fetching, selectedRows } = this.state;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">全部商家</span>
          <div className="fr button_group">
            {this.state.menu.indexOf('responsibility') != -1 ? (
              <Button onClick={this.responsible}>批量分配责任人</Button>
            ) : null}
            <Modal
              width={640}
              destroyOnClose
              title="批量分配责任人"
              visible={modalVisible}
              onOk={this.changeBdUser}
              onCancel={this.handleModalVisible}
            >
              <div style={{ padding: '40px 40px 40px 80px' }}>
                <span>责任人：</span>
                <Select
                  showSearch
                  placeholder="请输入姓名"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleChangeBdUser}
                  style={{ width: '360px' }}
                >
                  {
                    bdListForForm.map((item, i) => (
                      <Option value={item.id} key={i}>{item.name}</Option>
                    ))
                  }
                </Select>
              </div>
            </Modal>
            <Link to="/merchant/create" style={{ marginLeft: 8 }}>
              {this.state.menu.indexOf('add') != -1 ? (
                <Button type="primary" icon="plus">
                  新增商家
                </Button>
              ) : (
                  ''
                )}
            </Link>
          </div>
        </div>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={selectedRows}
            loading={loading}
            data={merchantAllList}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Card>
    );
  }
}

export default MerchantAll;
