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
  Upload,
  Cascader,
} from 'antd';
import { uploadImage } from '@/services/common';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import ShowImg from '@/components/showImg';
import utils, { getMenu, whatSex, getBase64, beforeUpload } from '@/utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = { 1: 'processing', 2: 'success', 3: 'error' };
const realname_status = { 1: '认证中', 2: '已认证', 3: '认证失败' };
const online_status = { 1: '已下线', 2: '已上线' };
const online_statusMap = { 1: 'default', 2: 'success' };
const frozen_status = { 2: '启用', 1: '停用' };
const frozen_statusMap = { 2: 'success', 1: 'error' };
const { TextArea } = Input;
// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      uploadLoading: false,
      imageUrl: '',
      imageFacade: '',
      facadeLoading: false,
      imageBack: '',
      backLoading: false,
    };
  }

  componentDidMount () { }
  handleUploadChange = (info, type) => {
    const { form } = this.props;
    if (type == 'avatar') {
      this.setState({ uploadLoading: true });
    } else if (type == 'facade_avatar') {
      this.setState({ facadeLoading: true });
    } else if (type == 'back_avatar') {
      this.setState({ backLoading: true });
    }
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    if (beforeUpload(info.file)) {
      uploadImage(formData).then(res => {
        if (res && res.code == 200) {
          if (type == 'avatar') {
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
          } else if (type == 'facade_avatar') {
            this.setState(
              {
                imageFacade: res.data.items.path,
                facadeLoading: false,
              },
              () => {
                form.setFieldsValue({
                  id_image_facade: res.data.items.path,
                });
              }
            );
          } else if (type == 'back_avatar') {
            this.setState(
              {
                imageBack: res.data.items.path,
                backLoading: false,
              },
              () => {
                form.setFieldsValue({
                  id_image_back: res.data.items.path,
                });
              }
            );
          }
        }
      });
    } else {
      if (type == 'avatar') {
        this.setState({ uploadLoading: false });
      } else if (type == 'facade_avatar') {
        this.setState({ facadeLoading: false });
      } else if (type == 'back_avatar') {
        this.setState({ backLoading: false });
      }
    }
  };
  noHandle = () => {
    this.setState({
      imageUrl: '',
      imageBack: '',
      imageFacade: '',
    });
    this.props.handleModalVisible();
  };
  render () {
    const {
      modalVisible,
      form,
      handleAdd,
      handleModalVisible,
      currentUser,
      stationAgentList,
    } = this.props;
    const {
      uploadLoading,
      imageUrl,
      imageFacade,
      facadeLoading,
      imageBack,
      backLoading,
    } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        handleAdd(fieldsValue);
      });
    };

    const formLayoutWithOutLabel = {
      wrapperCol: { span: 13, offset: 7 },
    };
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const facadeButton = (
      <div>
        <Icon type={facadeLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const backButton = (
      <div>
        <Icon type={backLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <Modal
        width={640}
        destroyOnClose
        title="新增骑手"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={this.noHandle}
      >
        <FormItem key="real_name" {...formLayout} label="姓名">
          {form.getFieldDecorator('real_name', {
            rules: [{ required: true, message: '请输入姓名！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="mobile" {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入手机号！' }],
          })(<Input addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
        </FormItem>
        <FormItem
          key="avatar"
          {...formLayout}
          label="骑手照片"
          extra="照片要求:正面免冠半身照,面部无遮拦"
        >
          {form.getFieldDecorator('avatar', {})(
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {
                return false;
              }}
              onChange={info => {
                this.handleUploadChange(info, 'avatar');
              }}
              accept="image/png, image/jpeg"
            >
              {imageUrl ? <ShowImg src={imageUrl} className="avatar-80" /> : uploadButton}
            </Upload>
          )}
          {/* <div>照片要求:正面免冠半身照,面部无遮拦</div> */}
        </FormItem>
        <FormItem key="id_number" {...formLayout} label="身份证号码">
          {form.getFieldDecorator('id_number', {})(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="id_image" {...formLayout} label="身份证正面/背面照片">
          <span style={{ display: "inline-block"}}>
            {form.getFieldDecorator('id_image_facade', {})(
              <Upload
                name="facade_avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={info => {
                  this.handleUploadChange(info, 'facade_avatar');
                }}
                accept="image/png, image/jpeg"
              >
                {imageFacade ? <ShowImg src={imageFacade} className="avatar-80" /> : facadeButton}
              </Upload>
            )}
          </span>
          <span style={{ display: "inline-block" }}>
            {form.getFieldDecorator('id_image_back', {})(
              <Upload
                name="back_avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={info => {
                  this.handleUploadChange(info, 'back_avatar');
                }}
                accept="image/png, image/jpeg"
              >
                {imageBack ? <ShowImg src={imageBack} className="avatar-80" /> : backButton}
              </Upload>
            )}
          </span>
        </FormItem>
        <FormItem key="station_agent_id" {...formLayout} label="所属站长">
          {form.getFieldDecorator('station_agent_id', {
            rules: [{ required: true, message: '所属站长' }],
          })(
            <Select placeholder="请选择" allowClear style={{ width: '200px' }}>
              {currentUser && currentUser.source_type == 5 && (
                <Option value={currentUser.source_id} key={currentUser.source_id}>
                  {currentUser.realname}
                </Option>
              )}
              {currentUser &&
                currentUser.source_type == 1 &&
                stationAgentList &&
                stationAgentList.length > 0 &&
                stationAgentList.map((item, index) => {
                  return (
                    <Option value={item.id} key={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem key="credit_line" {...formLayout} label="站长助力" help="请输入 0-300 正整数">
          {form.getFieldDecorator('credit_line', {
            rules: [{
              pattern: /^[0-9]+$/,
            }],
          })(
            <InputNumber min={0} max={300} step={1} style={{ width: '200px' }}></InputNumber>
          )}
        </FormItem>
        <FormItem key="frozen" {...formLayout} label="状态">
          {form.getFieldDecorator('frozen', {
            initialValue: 2,
            rules: [{ required: true, message: '请选择状态!' }],
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
    handleUpdate: () => { },
    handleUpdateModalVisible: () => { },
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        key: props.values.d_driver_info.driver_id,
        real_name: props.values.d_driver_info.real_name,
        mobile: props.values.mobile,
        mobile_prefix: props.values.mobile_prefix,
        id_number: props.values.d_driver_info.id_number,
        id_image_back: props.values.d_driver_info.id_image_back,
        id_image_facade: props.values.d_driver_info.id_image_facade,
        avatar: props.values.d_driver_info.avatar,
        frozen: props.values.frozen,
        station_agent_id: props.values.sys_station_agent.id,
        credit_line: props.values.d_driver_info.credit_line,
      },
      uploadLoading: false,
      imageUrl: props.values.d_driver_info.avatar,
      imageFacade: props.values.d_driver_info.id_image_facade,
      facadeLoading: false,
      imageBack: props.values.d_driver_info.id_image_back,
      backLoading: false,
    };
  }
  okHandle = () => {
    const { form, handleUpdate } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleUpdate(fieldsValue);
    });
  };
  handleUploadChange = (info, type) => {
    const { form } = this.props;
    if (type == 'avatar') {
      this.setState({ uploadLoading: true });
    } else if (type == 'facade_avatar') {
      this.setState({ facadeLoading: true });
    } else if (type == 'back_avatar') {
      this.setState({ backLoading: true });
    }
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        if (type == 'avatar') {
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
        } else if (type == 'facade_avatar') {
          this.setState(
            {
              imageFacade: res.data.items.path,
              facadeLoading: false,
            },
            () => {
              form.setFieldsValue({
                id_image_facade: res.data.items.path,
              });
            }
          );
        } else if (type == 'back_avatar') {
          this.setState(
            {
              imageBack: res.data.items.path,
              backLoading: false,
            },
            () => {
              form.setFieldsValue({
                id_image_back: res.data.items.path,
              });
            }
          );
        }
      }
    });
  };
  renderContent = formVals => {
    const { form, currentUser, stationAgentList } = this.props;
    const {
      uploadLoading,
      imageUrl,
      imageFacade,
      facadeLoading,
      imageBack,
      backLoading,
    } = this.state;
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const facadeButton = (
      <div>
        <Icon type={facadeLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const backButton = (
      <div>
        <Icon type={backLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div>
        <FormItem key="real_name" {...formLayout} label="姓名">
          {form.getFieldDecorator('real_name', {
            initialValue: formVals.real_name,
            rules: [{ required: true, message: '请输入姓名！' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="mobile" {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            initialValue: formVals.mobile,
            rules: [{ required: true, message: '请输入手机号！' }],
          })(
            <Input
              addonBefore={<PrefixSelector form={form} value={formVals.mobile_prefix} />}
              placeholder="请输入"
            />
          )}
        </FormItem>
        <FormItem
          key="avatar"
          {...formLayout}
          label="骑手照片"
          extra="照片要求:正面免冠半身照,面部无遮拦"
        >
          {form.getFieldDecorator('avatar', {
            initialValue: formVals.avatar,
          })(
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {
                return false;
              }}
              onChange={info => {
                this.handleUploadChange(info, 'avatar');
              }}
              accept="image/png, image/jpeg"
            >
              {imageUrl ? <ShowImg src={imageUrl} className="avatar-80" /> : uploadButton}
            </Upload>
          )}
        </FormItem>
        <FormItem key="id_number" {...formLayout} label="身份证号码">
          {form.getFieldDecorator('id_number', {
            initialValue: formVals.id_number,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="id_image" {...formLayout} label="身份证正面/背面照片">
          <span style={{ display: "inline-block" }}>
            {form.getFieldDecorator('id_image_facade', {
              initialValue: formVals.id_image_facade,
            })(
              <Upload
                name="facade_avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={info => {
                  this.handleUploadChange(info, 'facade_avatar');
                }}
                accept="image/png, image/jpeg"
              >
                {imageFacade ? <ShowImg src={imageFacade} className="avatar-80" /> : facadeButton}
              </Upload>
            )}
          </span>
          <span style={{ display: "inline-block" }}>
            {form.getFieldDecorator('id_image_back', {
              initialValue: formVals.id_image_back,
            })(
              <Upload
                name="back_avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {
                  return false;
                }}
                onChange={info => {
                  this.handleUploadChange(info, 'back_avatar');
                }}
                accept="image/png, image/jpeg"
              >
                {imageBack ? <ShowImg src={imageBack} className="avatar-80" /> : backButton}
              </Upload>
            )}
          </span>
        </FormItem>

        <FormItem key="station_agent_id" {...formLayout} label="所属站长">
          {form.getFieldDecorator('station_agent_id', {
            initialValue: formVals.station_agent_id,
            rules: [{ required: true, message: '所属站长' }],
          })(
            <Select placeholder="请选择" allowClear style={{ width: '200px' }}>
              {currentUser && currentUser.source_type == 5 && (
                <Option value={currentUser.source_id} key={currentUser.source_id}>
                  {currentUser.realname}
                </Option>
              )}
              {currentUser &&
                currentUser.source_type == 1 &&
                stationAgentList &&
                stationAgentList.length > 0 &&
                stationAgentList.map((item, index) => {
                  return (
                    <Option value={item.id} key={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem key="credit_line" {...formLayout} label="站长助力" help="请输入 0-300 正整数">
          {form.getFieldDecorator('credit_line', {
            rules: [{
              pattern: /^[0-9]+$/,
            }],
            initialValue: formVals.credit_line,
          })(<InputNumber min={0} max={300} step={1} style={{ width: '200px' }}></InputNumber>)}
        </FormItem>
        <FormItem key="frozen" {...formLayout} label="状态">
          {form.getFieldDecorator('frozen', {
            rules: [{ required: true, message: '请选择状态！' }],
            initialValue: formVals.frozen,
          })(
            <Radio.Group>
              <Radio value={2}>启用</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </div>
    );
  };

  render () {
    const {
      updateModalVisible,
      handleUpdateModalVisible,
      values,
      currentUser,
      stationAgentList,
    } = this.props;
    const {
      uploadLoading,
      imageUrl,
      imageFacade,
      facadeLoading,
      imageBack,
      backLoading,
      formVals,
    } = this.state;
    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="编辑骑手"
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

@connect(({ deliverymanMemberList, common, user, loading }) => ({
  deliverymanMemberList,
  common,
  user,
  loading: loading.models.deliverymanMemberList,
}))
@Form.create()
class DeliverymanMemberList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    formValues: {},
    editFormValues: {},
    menu: [],
    identvisible: false,
    confirmLoading: false,
    itemId: '',
  };

  columns = [
    {
      title: '姓名',
      dataIndex: 'd_driver_info.real_name',
    },
    {
      title: '所属站长',
      dataIndex: 'sys_station_agent.name',
    },
    {
      title: '所属站点',
      dataIndex: 'sys_station.name',
    },
    {
      title: '上线状态',
      dataIndex: 'status',
      render (val) {
        return <Badge status={online_statusMap[val]} text={online_status[val]} />;
      },
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
    },
    {
      title: '站长助力',
      dataIndex: 'd_driver_info.credit_line',
    },
    {
      title: '用户满意度',
      dataIndex: 'd_driver_task_statistics_history.user_satisfied_rate',
      render (val) {
        return val ? val + '%' : '-';
      },
    },
    {
      title: '配送准时率',
      dataIndex: 'd_driver_task_statistics_history.deliver_on_time_rate',
      render (val) {
        return val ? val + '%' : '-';
      },
    },
    {
      title: '完成单量',
      dataIndex: 'd_driver_task_statistics_history.finish_deliver',
    },
    {
      title: '接单总数',
      dataIndex: 'd_driver_task_statistics_history.accept_num',
    },
    {
      title: '启用状态',
      dataIndex: 'frozen',
      render (val) {
        return <Badge status={frozen_statusMap[val]} text={frozen_status[val]} />;
      },
    },
    {
      title: '注册时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '认证状态',
      dataIndex: 'realname_status',
      render (val) {
        return <Badge status={statusMap[val]} text={realname_status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <div>
            <Link to={'/deliveryman/member/details/' + record.id}>查看</Link>
            <Divider type="vertical" />
            <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleDelete(record)}>删除</a>
          </div>
          <div>
            {record.realname_status == 1 ? (
              <Fragment>
                <Button type="primary" size="small" onClick={() => this.handleApprove(record)}>
                  通过认证
                </Button>
                <Divider type="vertical" />
                <Button type="danger" size="small" onClick={() => this.handleUnApprove(record)}>
                  不通过认证
                </Button>
              </Fragment>
            ) : null}
          </div>
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
    this.getUserInfo();

    this.getCommon();
    this.fetchMenu();
    this.getStationAgent();
  }

  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        this.setState({
          menu: getMenu(res.data.items, 'deliveryman', 'member'),
        });
      },
    });
  };
  //获取当前登录用户的信息
  getUserInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
      callback: res => {
        if (res.code == 200) {
          this.getList();
        } else {
          this.getList();
        }
      },
    });
  };
  //获取站长数据
  getStationAgent = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchStationAgent',
      payload: null,
    });
  };

  handleApprove = item => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', item.id);
    dispatch({
      type: 'deliverymanMemberList/fetchDriverApprove',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          message.success('认证成功!');
          this.getList();
        } else {
          message.error(res.msg);
        }
      },
    });
  };
  handleUnApprove = item => {
    this.setState({
      identvisible: true,
      itemId: item.id,
    });
  };
  handleOk = () => {
    this.handleSubmit();
  };
  handleCancel = () => {
    this.setState({
      identvisible: false,
      confirmLoading: false,
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
              this.getList();
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
  getList = params => {
    const {
      dispatch,
      user: { currentUser },
    } = this.props;
    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params,
    };
    if (currentUser && currentUser.source_type == 5) {
      getParams.station_agent_id = currentUser.source_id;
    }
    // 获取列表
    dispatch({
      type: 'deliverymanMemberList/fetchDeliverymanMemberList',
      payload: getParams,
    });
  };

  getCommon = () => {
    const { dispatch } = this.props;
    // 站长列表
    dispatch({
      type: 'common/fetchStationAgent',
      payload: {},
    });
    // 站点列表
    dispatch({
      type: 'common/getStation',
      payload: {},
    });
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
          type: 'deliverymanMemberList/fetchDriverDelete',
          payload: formData,
          callback: res => {
            if (res.code == 200) {
              message.success('删除成功');
              this.getList();
            } else {
              message.error(res.msg);
            }
          },
        });
      },
      onCancel () {
      },
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

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  filterCascader = (inputValue, path) => {
    return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
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
      this.getList(values);
    });
  };

  handleModalVisible = flag => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (flag == true) {
      // 获取详情页面
      const { dispatch } = this.props;
      let getParams = {
        id: record.id,
      };
      dispatch({
        type: 'deliverymanMemberList/fetchDriverDetail',
        payload: getParams,
        callback: res => {
          if (res.code == 200) {
            this.setState({
              editFormValues: res.data.items || {},
            });
          }
        },
      });
    }
    this.setState({
      updateModalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'deliverymanMemberList/fetchDriverAdd',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          message.success('添加成功');
          this.getList();
          this.handleModalVisible();
        } else {
          return message.error(res.msg);
        }
      },
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('id', this.state.editFormValues.id);
    dispatch({
      type: 'deliverymanMemberList/fetchDriverEdit',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          // this.setState({
          //   updateModalVisible: false,
          // });
          message.success('编辑成功');
          this.getList();
          this.handleUpdateModalVisible(false);
        } else {
          return message.error(res.msg);
        }
      },
    });
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
      common,
      user: { currentUser },
    } = this.props;
    const { stationAgentList = [], station = [] } = common;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="姓名">
              {getFieldDecorator('real_name')(<Input placeholder="姓名" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="手机号">
              {getFieldDecorator('mobile')(<Input placeholder="手机号" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="注册时间">
              {getFieldDecorator('create_time')(
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
          <Col md={4} sm={24}>
            <FormItem label="认证状态">
              {getFieldDecorator('realname_status')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(realname_status).map(i => (
                    <Option value={i} key={i}>
                      {realname_status[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="上线状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(online_status).map(i => (
                    <Option value={i} key={i}>
                      {online_status[i]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          {currentUser && currentUser.source_type == 5 && (
            <Col md={4} sm={24}>
              <FormItem label="所属站长">
                {getFieldDecorator('station_agent_id', {
                  initialValue: currentUser.source_id,
                })(
                  <Select placeholder="请选择" style={{ width: '100%' }} allowClear disabled>
                    <Option value={currentUser.source_id} key={currentUser.source_id}>
                      {currentUser.realname}
                    </Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          )}
          {currentUser && currentUser.source_type == 1 && (
            <Col md={4} sm={24}>
              <FormItem label="所属站长">
                {getFieldDecorator('station_agent_id')(
                  <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                    {stationAgentList &&
                      stationAgentList.length > 0 &&
                      stationAgentList.map((item, index) => {
                        return (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                )}
              </FormItem>
            </Col>
          )}
          {currentUser && currentUser.source_type == 1 && (
            <Col md={4} sm={24}>
              <FormItem label="所属站点">
                {getFieldDecorator('station_id')(
                  <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                    {station.map((item, i) => (
                      <Option value={item.id} key={i}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          )}
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

  render () {
    const {
      deliverymanMemberList: { data },
      user: { currentUser },
      common: { stationAgentList },
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      modalVisible,
      updateModalVisible,
      editFormValues,
      identvisible,
      confirmLoading,
    } = this.state;
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
            <span className="page_head_title">骑手列表</span>
            <div className="fr button_group">
              {this.state.menu.indexOf('add') != -1 ? (
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新增骑手
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
        {
          modalVisible && (
            <CreateForm
              {...parentMethods}
              modalVisible={modalVisible}
              currentUser={currentUser}
              stationAgentList={stationAgentList}
            />
          )
        }
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
            currentUser={currentUser}
            stationAgentList={stationAgentList}
          />
        ) : null}
      </div>
    );
  }
}

export default DeliverymanMemberList;
