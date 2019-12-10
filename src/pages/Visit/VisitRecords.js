import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import Zmage from 'react-zmage';
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
import styles from '@/assets/css/TableList.less';
import { uploadImage } from '@/services/common';
import { getBase64, beforeUpload, goBack } from '@/utils/utils';
import { getMenu } from '../../utils/utils';
import utils from '@/utils/utils';
import { getVisitDetail } from '@/services/visit';
import configVar from '@/utils/configVar';
import ShowImg from '@/components/showImg';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ visit, loading, common }) => ({
  visit,
  common,
  loading: loading.models.visit,
}))
// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
    menu: [],
    m_user: {},
    m_user_info: {},
  };
  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
    };
  }

  okHandle = () => {
    const { form, handleUpdate } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      if (err) return;
      // form.resetFields();
      handleUpdate(fieldsValue, this.state.formVals);
    });
  };

  // handleUploadChange = (info, type) => {
  //   const {
  //     common: { commonConfig },
  //   } = this.props;
  //   this.setState({ uploadLoading: true });
  //   const formData = new FormData();
  //   formData.append('file', info.file);
  //   // 上传图片
  //   uploadImage(formData).then(res => {
  //     if (res && res.code == 200) {
  //       console.log(res);
  //       if (type == 'image') {
  //         this.setState({
  //           logoUrl: commonConfig.image_domain + res.data.items.path,
  //         });
  //       }
  //       this.setState({
  //         uploadLoading: false,
  //       });
  //     }
  //   });
  // };
  renderContent = formVals => {
    const {
      form,
      handleUpdateModalVisible,
      handleUploadChange,
      uploadLoading,
      logoUrl,
      menu,
      title,
      imageUrl,
      m_user,
      m_user_info,
      common: { commonConfig: { image_domain } },
    } = this.props;
    // console.log('formVals', formVals)
    // console.log('m_user', m_user)
    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const formBtnLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 13, offset: 7 },
      },
    };
    const uploadButton = (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <div>
        {title == '查看' ? (
          <Form>
            <FormItem {...formLayout} label="商家ID">
              <span className="ant-form-text">{formVals.id}</span>
            </FormItem>
            {formVals.m_user_info ? (
              <FormItem {...formLayout} label="商家名称">
                <span className="ant-form-text">{formVals.m_user_info.name}</span>
              </FormItem>
            ) : (
              undefined
            )}
            <FormItem {...formLayout} label="拜访时间">
              <span className="ant-form-text">
                {moment(formVals.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </FormItem>
            <FormItem {...formLayout} label="所属BD">
              <span className="ant-form-text">{formVals.sys_bd.name}</span>
            </FormItem>
            <FormItem {...formLayout} label="拜访类型">
              <span className="ant-form-text">
                {formVals.type == 1 ? '上门拜访' : ''}
                {formVals.type == 2 ? '物料拜访' : ''}
                {formVals.type == 3 ? '电话拜访' : ''}
              </span>
            </FormItem>
            <FormItem {...formLayout} label="拜访事项">
              <span className="ant-form-text">
                {formVals.item == 1 ? '商家运营' : ''}
                {formVals.item == 2 ? '客情维护' : ''}
                {formVals.item == 3 ? '异常处理' : ''}
              </span>
            </FormItem>
            <FormItem {...formLayout} label="拜访图片">
              <span className="ant-form-text">
              <Zmage src={image_domain + formVals.image}  className="avatar-80" />
              </span>
            </FormItem>
            <FormItem {...formLayout} label="拜访备注">
              <span className="ant-form-text">{formVals.remark}</span>
            </FormItem>
            <FormItem {...formBtnLayout}>
              <Button style={{ marginLeft: 8 }} onClick={() => handleUpdateModalVisible(false)}>
                关闭
              </Button>
            </FormItem>
          </Form>
        ) : (
          <Form>
            <FormItem {...formLayout} label="商家ID">
              {form.getFieldDecorator('id', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.id,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>

            {/* 采集后的数据无 m_user_info和m_user 会报错*/}
            {formVals.m_user_info ? (
              <div>
                <FormItem {...formLayout} label="商家名称">
                  {form.getFieldDecorator('m_user_info.name', {
                    rules: [{ required: true, message: '必填' }],
                    initialValue: formVals.m_user_info.name,
                  })(<Input placeholder="请输入" disabled />)}
                </FormItem>{' '}
                <FormItem {...formLayout} label="商家联系人">
                  {form.getFieldDecorator('name_cn', {
                    rules: [{ required: true, message: '必填' }],
                    initialValue: m_user_info.contact_name ? m_user_info.contact_name : null,
                  })(<Input placeholder="请输入" />)}
                </FormItem>
              </div>
            ) : (
              undefined
            )}
            {m_user ? (
              <FormItem {...formLayout} label="商家联系电话">
                {form.getFieldDecorator('mobile', {
                  rules: [{ required: true, message: '必填' }],
                  initialValue: m_user !== null && m_user.mobile ? m_user.mobile : null,
                })(<Input placeholder="请输入" />)}
              </FormItem>
            ) : (
              undefined
            )}
            {/* 采集后的数据无 m_user_info和m_user 会报错*/}
            <FormItem {...formLayout} label="拜访时间">
              {form.getFieldDecorator('create_time', {
                rules: [{ required: true, message: '必填' }],
                initialValue: moment(formVals.create_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem {...formLayout} label="所属BD">
              {form.getFieldDecorator('bd', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.sys_bd.name,
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
            <FormItem {...formLayout} label="拜访类型">
              {form.getFieldDecorator('type', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.type,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {/* <Option value={0}>所有</Option> */}
                  <Option value={1}>上门拜访</Option>
                  <Option value={2}>物料拜访</Option>
                  <Option value={3}>电话拜访</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout} label="拜访事项">
              {form.getFieldDecorator('item', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.item,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {/* <Option value={0}>所有</Option> */}
                  <Option value={1}>商家运营</Option>
                  <Option value={2}>客情维护</Option>
                  <Option value={3}>异常处理</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formLayout} label="拜访图片">
              {form.getFieldDecorator('image', {
                initialValue: imageUrl,
              })(
                <Upload
                  name="logo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={info => {
                    handleUploadChange(info, 'image');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {imageUrl || formVals.image ? (
                    <ShowImg src={imageUrl || formVals.image} className="avatar-80" />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem {...formLayout} label="拜访备注">
              {form.getFieldDecorator('remark', {
                initialValue: formVals.remark,
              })(<Input.TextArea placeholder="请输入备注内容" />)}
            </FormItem>
            <FormItem {...formBtnLayout}>
              <Button type="primary" onClick={this.okHandle}>
                确定
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => handleUpdateModalVisible(false)}>
                取消
              </Button>
            </FormItem>
          </Form>
        )}
      </div>
    );
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values, title } = this.props;
    const { formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={`${title}拜访详情`}
        visible={updateModalVisible}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
        footer={null}
      >
        {this.renderContent(formVals)}
      </Modal>
    );
  }
}

// 列表
@connect(({ visit, common, user, loading }) => ({
  visit,
  common,
  user,
  loading: loading.models.visit,
}))
@Form.create()
class VisitRecords extends PureComponent {
  state = {
    page: configVar.page,
    pagesize: configVar.pagesize,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
    uploadLoading: false,
    logoUrl: '',
    imageUrl: '',
    menu: [],
    title: '',
    source_type: '',
    source_id: '',
    isBd: false,
    m_user: {},
    m_user_info: {},
  };

  columns = [
    {
      title: '商家ID',
      dataIndex: 'id',
    },
    {
      title: '商家名称',
      dataIndex: 'm_user_info.name',
    },
    {
      title: '拜访时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '所属BD',
      dataIndex: 'sys_bd.name',
    },
    {
      title: '拜访类型',
      dataIndex: 'type',
      width: 140,
      key: 'Option1',
      render: type => (
        <span>
          {type == 1 ? '上门拜访' : ''}
          {type == 2 ? '物料拜访' : ''}
          {type == 3 ? '电话拜访' : ''}
        </span>
      ),
    },
    {
      title: '拜访事项',
      dataIndex: 'item',
      width: 140,
      key: 'Option2',
      render: item => (
        <span>
          {item == 1 ? '商家运营' : ''}
          {item == 2 ? '客情维护' : ''}
          {item == 3 ? '异常处理' : ''}
        </span>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Fragment>
              <a onClick={() => this.handleUpdateModalVisible(true, record, '查看')}>查看</a>
            </Fragment>
          ) : null}
          {this.state.menu.indexOf('edit') != -1 ? (
            <Fragment>
              <Divider type="vertical" />
              <a onClick={() => this.handleUpdateModalVisible(true, record, '编辑')}>编辑</a>
            </Fragment>
          ) : null}
          {this.state.menu.indexOf('delete') != -1 ? (
            <Fragment>
              <Divider type="vertical" />
              <a onClick={() => this.handleDelete(record)}>删除</a>
            </Fragment>
          ) : null}
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    // this.getAdminVisit();
    this.fetchMenu();
  }

  componentWillReceiveProps(nextProps) {
    // 判断登录用户权限
    const { source_type, source_id } = this.state;
    const new_source_type = nextProps.user.currentUser.source_type.toString();
    const new_source_id = nextProps.user.currentUser.source_id.toString();
    if (new_source_type != source_type && new_source_id != source_id) {
      this.setState(
        {
          source_type: new_source_type,
          source_id: new_source_id,
        },
        () => {
          this.getAdminVisit();
        }
      );
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
            menu: getMenu(res.data.items, 'visit', 'records'),
          });
        }
      },
    });
  };
  getAdminVisit = params => {
    const {
      dispatch,
      form,
      user: {
        currentUser: { realname },
      },
    } = this.props;
    const { source_type, source_id } = this.state;
    console.log(source_type, source_id);
    // 判断是否bd人员
    if (source_type == '4' || source_type == '3') {
      params = {
        ...params,
        bd_id: source_id,
      };
      if (source_type == '3') {
        this.setState({
          isBd: true,
        });
        form.setFieldsValue({
          bd_name: realname,
        });
      }
    }
    // var page, pagesize;
    // localStorage.getItem('current') == undefined
    //   ? (page = 1)
    //   : (page = localStorage.getItem('current'));
    // localStorage.getItem('pagesize') == undefined
    //   ? (pagesize = 25)
    //   : (page = localStorage.getItem('pagesize'));
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params,
    };
    if (source_type == '3') {
      delete getParams.bd_name;
    }
    // console.log(getParams);
    dispatch({
      type: 'visit/fetchAdminVisit',
      payload: getParams,
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
    };
    this.setState({
      ...tablePage,
    });
    this.getAdminVisit(values);
    window.scrollTo(0, 0);
  };

  // 更新model数据
  handleUpdateModalVisible = (flag, record, titleVal) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });

    if (record) {
      this.getVisitDetailFn(record.id);
    }
    if (titleVal == '查看') {
      this.setState({
        title: '查看',
      });
    } else if (titleVal == '编辑') {
      this.setState({
        title: '编辑',
      });
    }
  };

  // 获取拜访详情
  getVisitDetailFn = param => {
    const {
      common: { commonConfig },
    } = this.props;
    const { m_user, m_user_info } = this.state;
    getVisitDetail({
      id: param,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      console.log('获取拜访详情', res);
      console.log('m_user_info6', res.data.items.m_user_info, res.data.items.m_user);
      this.setState(
        {
          editFormValues: res.data.items,
          imageUrl: res.data.items.image,
          m_user_info: res.data.items.m_user_info,
          m_user: res.data.items.m_user,
        },
        () => {
          console.log('m_user_info7', this.state.m_user, this.state.m_user_info);
        }
      );
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getAdminVisit();
  };
  //编辑
  handleUpdate = (fieldsValue, formVals) => {
    const {
      common: { commonConfig },
    } = this.props;
    var formsurfaceData = new FormData();
    formsurfaceData.append('id', fieldsValue.id);
    formsurfaceData.append('type', fieldsValue.type);
    formsurfaceData.append('item', fieldsValue.item);
    formsurfaceData.append('image', this.state.imageUrl);
    formsurfaceData.append('remark', fieldsValue.remark);
    formsurfaceData.append('contact_name', fieldsValue.name_cn);
    formsurfaceData.append('mobile', fieldsValue.mobile);
    this.props.dispatch({
      type: 'visit/adminVisitSave',
      payload: formsurfaceData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('修改成功!');
        this.getAdminVisit();
        this.handleUpdateModalVisible(false);
      },
    });
  };
  handleUploadChange = (info, type) => {
    const {
      common: { commonConfig },
    } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        if (type == 'image') {
          this.setState({
            // logoUrl: commonConfig.image_domain + res.data.items.path,
            imageUrl: res.data.items.path,
          });
        }
        this.setState({
          uploadLoading: false,
        });
      }
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
          type: 'visit/fetchVisitDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getAdminVisit();
          },
        });
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val;
          }
        }
      }

      if (newFieldsValue.create_time !== undefined) {
        // const startTime = moment(newFieldsValue.create_time[0].startOf('day')).unix();
        // const endTime = moment(newFieldsValue.create_time[1].startOf('day')).unix();
        // newFieldsValue.create_time = `${startTime},${endTime}`;
        newFieldsValue.create_time = utils.getDateTimeMap(newFieldsValue.create_time);
      }
      const values = {
        ...newFieldsValue,
      };

      this.setState({
        formValues: values,
      });
      // console.log('查询参数', values)
      this.getAdminVisit(values);
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="商家">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="拜访时间">
              {getFieldDecorator('create_time')(<RangePicker allowClear={false} />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="所属BD">
              {getFieldDecorator('bd_name')(
                <Input placeholder="请输入" disabled={this.state.isBd} />
              )}
            </FormItem>
          </Col>
          <Col xl={3} md={8} sm={24}>
            <FormItem label="拜访类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">所有</Option>
                  <Option value="1">上门拜访</Option>
                  <Option value="2">物料拜访</Option>
                  <Option value="3">电话拜访</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={3} md={8} sm={24}>
            <FormItem label="拜访事项">
              {getFieldDecorator('item')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">所有</Option>
                  <Option value="1">商家运营</Option>
                  <Option value="2">客情维护</Option>
                  <Option value="3">异常处理</Option>
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
      visit: { data },
      user: {
        currentUser: { source_type, source_id },
      },
      loading,
      common: { commonConfig: { image_domain } },
    } = this.props;
    const {
      updateModalVisible,
      editFormValues,
      uploadLoading,
      logoUrl,
      title,
      imageUrl,
    } = this.state;
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      handleUploadChange: this.handleUploadChange,
      uploadLoading: uploadLoading,
      logoUrl: logoUrl,
      imageUrl: imageUrl,
      title: title,
    };

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={(list, index) => index}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
            menu={this.state.menu}
            m_user_info={this.state.m_user_info}
            m_user={this.state.m_user}
          />
        ) : null}
      </div>
    );
  }
}

export default VisitRecords;
