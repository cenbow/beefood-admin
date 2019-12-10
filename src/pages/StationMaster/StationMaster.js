import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Cascader } from 'antd';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import utils from '@/utils/utils';
import configVar from '@/utils/configVar';
import { getStationAgentInfo } from '@/services/stationMaster';

import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['', 'success', 'error'];
const status = ['', '启用', '禁用'];


// 新增
const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, common, } = props;
  const { station = [] } = common;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleAdd(fieldsValue);
    });
  };

  const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };
  const formLayoutWithOutLabel = {
    wrapperCol: { span: 13, offset: 7 },
  };

  return (
    <Modal
      width={640}
      destroyOnClose
      title="新增站长"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem {...formLayout} label="选择站点">
        {form.getFieldDecorator('station_id', {
          rules: [{ required: true, message: '必填' }],
        })(
          <Select placeholder="请选择" style={{ width: '100%' }}>
            {
              station.map((item, i) => (
                <Option value={item.id} key={i}>{item.name}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>
      <FormItem {...formLayout} label="站长名称">
        {form.getFieldDecorator('name_cn', {
          rules: [{ required: true, message: '必填' }],
        })(<Input placeholder="请输入" />)}
        <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
          <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
        </span>
      </FormItem>
      <FormItem {...formLayout} label="英文站长名称">
        {form.getFieldDecorator('name_en', {
          rules: [{ required: true, message: '必填' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="柬文站长名称">
        {form.getFieldDecorator('name_kh', {
          rules: [{ required: true, message: '必填' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="手机号">
        {form.getFieldDecorator('mobile', {
          rules: [{ required: true, message: '请输入手机号！' }],
        })(<Input addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="状态">
        {form.getFieldDecorator('status', {
          rules: [{ required: true, message: '请选择状态！' }],
          initialValue: '1'
        })(
          <Radio.Group>
            <Radio value="1">启用</Radio>
            <Radio value="2">禁用</Radio>
          </Radio.Group>
        )}
      </FormItem>
    </Modal>
  );
});


// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => { },
    handleUpdateModalVisible: () => { },
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
      accountName: props.values.sys_admin && props.values.sys_admin.username,// 用户名(登录账号)
    };
  }

  okHandle = () => {
    const { form, handleUpdate, values } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      fieldsValue.id = values.id;
      if (fieldsValue.password == '' || fieldsValue.password == undefined) {
        fieldsValue.password = 'abc123';
      }

      handleUpdate(fieldsValue);
    });
  };

  renderContent = (formVals) => {
    const { form, common } = this.props;
    const { accountName } = this.state
    const { station = [] } = common;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const formLayoutWithOutLabel = {
      wrapperCol: { span: 13, offset: 7 },
    };

    return (
      <Fragment>
        <FormItem {...formLayout} label="选择站点">
          {form.getFieldDecorator('station_id', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.station_id,
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              {
                station.map((item, i) => (
                  <Option value={item.id} key={i}>{item.name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="站长名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文站长名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文站长名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入手机号！' }],
            initialValue: formVals.mobile,
          })(<Input addonBefore={<PrefixSelector form={form} value={formVals.mobile_prefix} />} placeholder="请输入" />)}
        </FormItem>
        <Form.Item {...formLayout} label="登录账号">
          <span className="ant-form-text">{accountName}</span>
        </Form.Item>
        <Form.Item {...formLayout} label="新密码">
          {form.getFieldDecorator('password', {
            rules: [{ min: 6, max: 18, pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/, message: '密码由6~18位，由字母，数字两种不同字符组成' }
            ],
          })(<Input.Password />)}
        </Form.Item>
        <FormItem {...formLayout} label="状态">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '请选择状态！' }],
            initialValue: `${formVals.status}`,
          })(
            <Radio.Group>
              <Radio value="1">启用</Radio>
              <Radio value="2">禁用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Fragment>
    );
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="编辑站长"
        visible={updateModalVisible}
        onOk={this.okHandle}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

@connect(({ stationMaster, common, loading }) => ({
  stationMaster,
  common,
  loading: loading.models.stationMaster,
}))
@Form.create()
class StationMaster extends PureComponent {
  state = {
    page: configVar.page,
    pagesize: configVar.pagesize,
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '站长名称',
      dataIndex: 'name',
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
    },
    {
      title: '站点',
      render: (val, record) => (
        <Link to={"/station/details/" + record.sys_station.id}><span>{record.sys_station.name}</span></Link>
      )
    },
    {
      title: '骑手数量',
      dataIndex: 'total_driver',
      render: (val, record) => (
        // <span><Link to={"/deliveryman/member?county_id=" + record.id} title="点击查看">{val}</Link></span>
        <span>{val}</span>
      )
    },
    {
      title: '商圈',
      render: (val, record) => (
        <span>{record.sys_station.business_data.name}</span>
      )
    },
    {
      title: '启用状态',
      width: 140,
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <Link to={'/stationmaster/details/' + record.id}>详情</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.getList();
    this.getCommon();
  }

  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params
    }
    dispatch({
      type: 'stationMaster/fetchList',
      payload: getParams
    });
  }

  getCommon = () => {
    const { dispatch } = this.props;
    // 选择商圈
    dispatch({
      type: 'common/getBusiness',
      payload: {}
    });
    // 选择站点
    dispatch({
      type: 'common/getStation',
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
      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });
      this.getList(values);
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    getStationAgentInfo({
      id: record.id,
    }).then((res) => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    })
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'stationMaster/fetchSave',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
      }
    });
    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'stationMaster/fetchEdit',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
      }
    });
    this.handleUpdateModalVisible();
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'stationMaster/fetchDelete',
          payload: formData,
          callback: (res) => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          }
        });
      },
    });
  }

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      common,
    } = this.props;
    const { business = [], station = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="站长名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="站点">
              {getFieldDecorator('station_id')(
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {
                    station.map((item, i) => (
                      <Option value={item.id} key={i} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="商圈">
              {getFieldDecorator('business_id')(
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {
                    business.map((item, i) => (
                      <Option value={item.id} key={i} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="启用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      stationMaster: { data },
      common,
      loading,
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;
    // const menu = (
    //     <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
    //         <Menu.Item key="remove">删除</Menu.Item>
    //         <Menu.Item key="approval">批量审批</Menu.Item>
    //     </Menu>
    // );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      common: common,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      common: common,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">站长管理</span>
            <span className="fr">
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>新增站长</Button>
            </span>
          </div>
          <div className={styles.tableList}>
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
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
          />
        ) : null}
      </div>
    );
  }
}

export default StationMaster;
