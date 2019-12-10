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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import utils from '@/utils/utils';
import configVar from '@/utils/configVar';
import { getStationInfo } from '@/services/station';
import { getCountry, getCity, getRegion, getBusiness } from '@/services/common';
import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;

const statusMap = ['default', 'success', 'error'];
const status = ['所有', '启用', '禁用'];
const online_status = { 1: '禁用', 2: '启用' };
const online_statusMap = { 1: 'error', 2: 'success' };
// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      country: [],
      city: [],
      region: [],
      business: [],
    };
  }

  componentDidMount() {
    getCountry().then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        country: res.data.items,
      });
    });
  }

  getCity = id => {
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        city: res.data.items,
      });
    });
  };

  getRegion = id => {
    getRegion({
      city_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        region: res.data.items,
      });
    });
  };

  getBusiness = id => {
    getBusiness({
      region_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        business: res.data.items,
      });
    });
  };

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const { country = [], city = [], region = [], business = [] } = this.state;

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
        title="新增站点"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem {...formLayout} label="选择国家">
          {form.getFieldDecorator('country_id', {
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getCity(val);
              }}
            >
              {country.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择城市">
          {form.getFieldDecorator('city_id', {
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getRegion(val);
              }}
            >
              {city.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择区域">
          {form.getFieldDecorator('region_id', {
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getBusiness(val);
              }}
            >
              {region.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择商圈">
          {form.getFieldDecorator('business_id', {
            rules: [{ required: true, message: '必填' }],
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              {business.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="站点名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a
              onClick={() => {
                utils.translator(form, 'name');
              }}
            >
              翻译
            </a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文站点名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文站点名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="站点状态">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '请选择状态！' }],
            initialValue: 1,
          })(
            <Radio.Group>
              <Radio value={2}>启用</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Modal>
    );
  }
}

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
      country: [],
      city: [],
      region: [],
      business: [],
    };
  }

  componentDidMount() {
    getCountry().then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        country: res.data.items,
      });
    });
    this.getCity(this.state.formVals.country_id);
    this.getRegion(this.state.formVals.city_id);
    this.getBusiness(this.state.formVals.region_id);
  }

  getCity = id => {
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        city: res.data.items,
      });
    });
  };

  getRegion = id => {
    getRegion({
      city_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        region: res.data.items,
      });
    });
  };

  getBusiness = id => {
    getBusiness({
      region_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        business: res.data.items,
      });
    });
  };

  okHandle = () => {
    const { form, handleUpdate, values } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.id = values.id;
      handleUpdate(fieldsValue);
    });
  };

  renderContent = formVals => {
    const { form } = this.props;
    const { country = [], city = [], region = [], business = [] } = this.state;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const formLayoutWithOutLabel = {
      wrapperCol: { span: 13, offset: 7 },
    };

    return (
      <Form>
        <FormItem {...formLayout} label="选择国家">
          {form.getFieldDecorator('country_id', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.country_id,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getCity(val);
              }}
            >
              {country.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择城市">
          {form.getFieldDecorator('city_id', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.city_id,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getRegion(val);
              }}
            >
              {city.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择区域">
          {form.getFieldDecorator('region_id', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.region_id,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              onChange={val => {
                this.getBusiness(val);
              }}
            >
              {region.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="选择商圈">
          {form.getFieldDecorator('business_id', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.sys_station_business.business_id,
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              {business.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="站点名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a
              onClick={() => {
                utils.translator(form, 'name');
              }}
            >
              翻译
            </a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文站点名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文站点名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="站点状态">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '请选择状态！' }],
            initialValue: formVals.status,
          })(
            <Radio.Group>
              <Radio value={2}>启用</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
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
        title="编辑站点"
        visible={updateModalVisible}
        onOk={this.okHandle}
        onCancel={() => handleUpdateModalVisible(false)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

@connect(({ station, common, loading }) => ({
  station,
  common,
  loading: loading.models.station,
}))
@Form.create()
class Station extends PureComponent {
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
      title: '站点名称',
      dataIndex: 'name',
    },
    {
      title: '国家',
      dataIndex: 'sys_country.name',
    },
    {
      title: '城市',
      dataIndex: 'sys_city.name',
    },
    {
      title: '区域',
      dataIndex: 'sys_region.name',
    },
    {
      title: '商圈',
      dataIndex: 'sys_station_business.sys_business.name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={online_statusMap[val]} text={online_status[val]} />;
      },
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          <Link to={'/station/details/' + record.id}>详情</Link>
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

  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params,
    };
    dispatch({
      type: 'station/fetchStationList',
      payload: getParams,
    });
  };

  getCommon = () => {
    const { dispatch } = this.props;
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
    getStationInfo({
      id: record.id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    });
  };

  handleAdd = fields => {
    // console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    console.log(fields);

    dispatch({
      type: 'station/fetchStationSave',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      },
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'station/fetchStationEdit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
        this.handleUpdateModalVisible();
      },
    });
  };

  handleDelete = fields => {
    // console.log(fields);
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'station/fetchStationDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      common,
    } = this.props;
    const { country = [], city = [], region = [], business = [], station = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="站点名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="国家">
              {getFieldDecorator('country_id')(
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {country.map((item, i) => (
                    <Option value={item.id} key={i} title={item.name}>
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
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {city.map((item, i) => (
                    <Option value={item.id} key={i} title={item.name}>
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
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {region.map((item, i) => (
                    <Option value={item.id} key={i} title={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="商圈">
              {getFieldDecorator('business_id')(
                <Select placeholder="请选择" style={{ maxWidth: 167 }} allowClear>
                  {business.map((item, i) => (
                    <Option value={item.id} key={i} title={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
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
      station: { data },
      loading,
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">站点管理</span>
            <span className="fr">
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增站点
              </Button>
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

export default Station;
