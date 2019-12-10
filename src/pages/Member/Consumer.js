import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {formatMessage, FormattedMessage} from 'umi-plugin-react/locale';
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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import styles from '@/assets/css/TableList.less';
import ShowImg from '@/components/showImg';
import configVar from '@/utils/configVar';
import utils, {getMenu, whatSex, getBase64, beforeUpload} from '@/utils/utils';
import {
  uploadImage
} from '@/services/common';

const FormItem = Form.Item;
const {Option} = Select;
const {RangePicker} = DatePicker;
const RadioGroup = Radio.Group;
const {confirm} = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = {1: 'success', 2: 'error'};
const status = {1: '启用', 2: '禁用'};

// 新增
@Form.create()
class CreateForm extends PureComponent {
  state = {
    uploadLoading: false,
    imageUrl: '',
  };

  handleUploadChange = info => {
    const {form} = this.props;
    const formData = new FormData();
    formData.append('file', info.file);

    this.setState({uploadLoading: true});
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        this.setState(
          {
            imageUrl: res.data.items.path,
            uploadLoading: false,
          },
          () => {
            form.setFieldsValue({
              avatar: res.data.items.path,
            });
          }
        );
      }
    });
  };

  render() {
    const {modalVisible, form, handleAdd, handleModalVisible} = this.props;
    const {uploadLoading, imageUrl} = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    const formLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 13},
    };

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Modal
        width={640}
        destroyOnClose
        title="新建"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <Form>
          <FormItem label="Upload" {...formLayout} label="头像">
            {form.getFieldDecorator('avatar', {})(
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {return false;}}
                onChange={this.handleUploadChange}
                accept="image/png, image/jpeg"
              >
                {imageUrl ? <ShowImg src={imageUrl} className="avatar-80"/> : uploadButton}
              </Upload>
            )}
          </FormItem>
          <FormItem key="nickname" {...formLayout} label="昵称">
            {form.getFieldDecorator('nickname', {
              rules: [{required: true, message: '请输入昵称！'}],
            })(<Input placeholder="请输入"/>)}
          </FormItem>
          <FormItem key="realname" {...formLayout} label="真实姓名">
            {form.getFieldDecorator('realname', {})(<Input placeholder="请输入"/>)}
          </FormItem>
          <FormItem key="mobile" {...formLayout} label="手机号">
            {form.getFieldDecorator('mobile', {
              rules: [{required: true, message: '请输入手机号！'}],
            })(<Input addonBefore={<PrefixSelector form={form}/>} placeholder="请输入"/>)}
          </FormItem>
          <FormItem key="sex" {...formLayout} label="性别">
            {form.getFieldDecorator('sex', {
              rules: [{required: true, message: '请选择性别！'}],
              initialValue: '3',
            })(
              <Radio.Group>
                <Radio value="3">保密</Radio>
                <Radio value="1">男</Radio>
                <Radio value="2">女</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem key="status" {...formLayout} label="状态">
            {form.getFieldDecorator('status', {
              rules: [{required: true, message: '请选择状态！'}],
              initialValue: '1',
            })(
              <Radio.Group>
                <Radio value="1">启用</Radio>
                <Radio value="2">禁用</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {
    },
    handleUpdateModalVisible: () => {
    },
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      uploadLoading: false,
      imageUrl: props.values.u_user_info.avatar,
      formVals: props.values,
    };
  }

  okHandle = () => {
    const {form, handleUpdate} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleUpdate(fieldsValue);
    });
  };

  handleUploadChange = info => {
    const {form} = this.props;
    const formData = new FormData();
    formData.append('file', info.file);

    this.setState({uploadLoading: true});
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        this.setState(
          {
            imageUrl: res.data.items.path,
            uploadLoading: false,
          },
          () => {
            form.setFieldsValue({
              avatar: res.data.items.path,
            });
          }
        );
      }
    });
  };

  renderContent = formVals => {
    const {form} = this.props;
    const {uploadLoading, imageUrl} = this.state;

    const formLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 13},
    };

    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Form>
        <FormItem label="Upload" {...formLayout} label="头像">
          {form.getFieldDecorator('avatar', {
            initialValue: formVals.u_user_info.avatar,
          })(
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {return false;}}
              onChange={this.handleUploadChange}
              accept="image/png, image/jpeg"
            >
              {imageUrl ? <ShowImg src={imageUrl} className="avatar-80"/> : uploadButton}
            </Upload>
          )}
        </FormItem>
        <FormItem key="nickname" {...formLayout} label="昵称">
          {form.getFieldDecorator('nickname', {
            rules: [{required: true, message: '请输入昵称！'}],
            initialValue: formVals.u_user_info.nickname,
          })(<Input placeholder="请输入"/>)}
        </FormItem>
        <FormItem key="realname" {...formLayout} label="真实姓名">
          {form.getFieldDecorator('realname', {
            initialValue: formVals.u_user_info.realname,
          })(<Input placeholder="请输入"/>)}
        </FormItem>
        <FormItem key="mobile" {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{required: true, message: '请输入手机号！'}],
            initialValue: formVals.mobile,
          })(<Input addonBefore={<PrefixSelector form={form} value={formVals.mobile_prefix}/>} placeholder="请输入"/>)}
        </FormItem>
        <FormItem key="sex" {...formLayout} label="性别">
          {form.getFieldDecorator('sex', {
            initialValue: `${formVals.u_user_info.sex}`,
          })(
            <Radio.Group>
              <Radio value="3">保密</Radio>
              <Radio value="1">男</Radio>
              <Radio value="2">女</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem key="password" {...formLayout} label="登录密码">
          {form.getFieldDecorator('password', {
            initialValue: ''
          })(<Input.Password placeholder="不设置为原密码，设置为重置密码"/>)}
        </FormItem>
        <FormItem key="status" {...formLayout} label="状态">
          {form.getFieldDecorator('status', {
            rules: [{required: true, message: '请选择状态！'}],
            initialValue: `${formVals.status}`,
          })(
            <Radio.Group>
              <Radio value="1">启用</Radio>
              <Radio value="2">禁用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
    );
  };

  render() {
    const {updateModalVisible, handleUpdateModalVisible, values} = this.props;
    const {formVals} = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{padding: '32px 40px 48px'}}
        destroyOnClose
        title="编辑"
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

@connect(({member, loading, common}) => ({
  member,
  common,
  loading: loading.effects['member/fetchConsumerList'],
}))
@Form.create()
class MemberConsumer extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  columns = [
    {
      title: '用户id',
      dataIndex: 'id',
    },
    {
      title: '头像',
      dataIndex: 'u_user_info',
      render: val => (<ShowImg src={val && val.avatar} className="avatar-48"/>),
    },
    {
      title: '用户名',
      dataIndex: 'u_user_info.nickname',
    },
    {
      title: '电话',
      render: (text, record) => (
        <span>
          {record.mobile_prefix}
          {record.mobile}
        </span>
      ),
    },
    {
      title: '真实姓名',
      dataIndex: 'u_user_info.realname',
    },
    {
      title: '性别',
      dataIndex: 'u_user_info.sex',
      render: val => whatSex(val),
    },
    {
      title: '注册时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login_time',
      render: val => <span>{val > 0 ? (moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')) : ('-')}</span>,
    },
    {
      title: '启用状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]}/>;
      },
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          {utils.isHasMenu(this.state.menu, 'view') ? (
            <Link to={'/member/consumer/details/' + record.id}>详情</Link>
          ) : (
            ''
          )}
          {utils.isHasMenu(this.state.menu, 'edit') ? (
            <span>
              <Divider type="vertical"/>
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
            </span>
          ) : (
            ''
          )}
          {utils.isHasMenu(this.state.menu, 'delete') ? (
            <span>
              <Divider type="vertical"/>
              <a onClick={() => this.handleDelete(record)}>删除</a>
            </span>
          ) : (
            ''
          )}
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
    const {dispatch} = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'member', null),
          });
        }
      },
    });
  };

  getList = params => {
    const {dispatch} = this.props;
    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params,
    };
    dispatch({
      type: 'member/fetchConsumerList',
      payload: getParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {formValues} = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
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

  handleFormReset = () => {
    const {form, dispatch} = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const {dispatch, form} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['create_time'];
      const lastTimeValue = fieldsValue['last_login_time'];
      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(rangeTimeValue),
        last_login_time: utils.getDateTimeMap(lastTimeValue)
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
    const {dispatch} = this.props;
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    dispatch({
      type: 'member/fetchMemberConsumerInfo',
      payload: {
        id: record.id,
      },
      callback: res => {
        this.setState({
          editFormValues: res.data.items
        });

      },
    });
  };

  handleAdd = fields => {
    const {dispatch} = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'member/fetchConsumerAdd',
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
    console.log(fields);
    const {dispatch} = this.props;
    const {editFormValues} = this.state;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('id', editFormValues.id);

    dispatch({
      type: 'member/fetchConsumerUpdate',
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
    console.log(fields);
    const {dispatch} = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    confirm({
      title: '温馨提示',
      content: '确认是否删除用户：' + fields.u_user_info.nickname + '？',
      onOk: () => {
        dispatch({
          type: 'member/fetchConsumerDelete',
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

  //筛选
  renderSimpleForm() {
    const {
      form: {getFieldDecorator},
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{md: 6, lg: 24, xl: 48}}>
          <Col md={4} sm={24}>
            <FormItem label="用户ID">
              {getFieldDecorator('id')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('nickname')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="电话">
              {getFieldDecorator('mobile')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="真实姓名">
              {getFieldDecorator('realname')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="性别">
              {getFieldDecorator('sex')(
                <Select placeholder="请选择" allowClear>
                  <Option value="1">男</Option>
                  <Option value="2">女</Option>
                  <Option value="3">保密</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="启用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" allowClear>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{md: 6, lg: 24, xl: 48}}>
          <Col md={5} sm={24}>
            <FormItem label="注册时间">
              {getFieldDecorator('create_time')(
                <RangePicker
                  style={{width: '100%'}}
                  placeholder={[
                    formatMessage({id: 'form.date.placeholder.start'}),
                    formatMessage({id: 'form.date.placeholder.end'}),
                  ]}
                />
              )}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="最后登录">
              {getFieldDecorator('last_login_time')(
                <RangePicker
                  style={{width: '100%'}}
                  placeholder={[
                    formatMessage({id: 'form.date.placeholder.start'}),
                    formatMessage({id: 'form.date.placeholder.end'}),
                  ]}
                />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{marginLeft: 8}} onClick={this.handleFormReset}>
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
      member: {data},
      loading,
    } = this.props;
    const {modalVisible, updateModalVisible, editFormValues} = this.state;
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
            <span className="page_head_title">用户管理</span>
            <div className="fr button_group">
              {utils.isHasMenu(this.state.menu, 'add') ? (
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新增用户
                </Button>
              ) : null}
              {utils.isHasMenu(this.state.menu, 'export') ? (
                <Button icon="file-excel" type="primary">
                  导出
                </Button>
              ) : null}
            </div>
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
        {
          modalVisible && (<CreateForm {...parentMethods} modalVisible={modalVisible}/>)
        }
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

export default MemberConsumer;
