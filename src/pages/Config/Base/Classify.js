import React, { PureComponent, Fragment, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Icon,
  Menu,
  Dropdown,
  Card,
  DatePicker,
  Tabs,
  Table,
  Modal,
  message,
  Upload,
  Radio,
  Badge,
  Divider,
} from 'antd';
import { uploadImage } from '@/services/common';
import StandardTable from '@/components/StandardTable';
import ShowImg from '@/components/showImg';
import { getBase64, beforeUpload } from '@/utils/utils';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '@/utils/utils';
import utils from '@/utils/utils';
import { getClassifyInfo } from '@/services/config';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const statusMap = ['default', 'success', 'error'];
const status = ['所有', '启用', '禁用'];

// 新增
@Form.create()
class CreateForm extends PureComponent {
  state = {
    uploadLoading: false,
    icon: '',
  };

  handleUploadChange = info => {
    const { form } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        this.setState(
          {
            icon: res.data.items.path,
            uploadLoading: false,
          },
          () => {
            form.setFieldsValue({
              icon: res.data.items.path,
            });
          }
        );
      }
    });
  };

  // 关闭弹窗时，解决图片残留问题
  closeModal = () => {
    this.setState({
      icon: '',
    });
    this.props.handleModalVisible();
  };

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 13, offset: 7 },
    };

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        handleAdd(fieldsValue);
      });
    };

    const uploadButton = (
      <div>
        <Icon type={this.state.uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Modal
        width={640}
        destroyOnClose
        title="新增分类"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible(false)}
      >
        <Form>
          <FormItem {...formLayout} label="分类名称">
            {form.getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文分类名称">
            {form.getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文分类名称">
            {form.getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="图标" extra="图片比例1:1，仅支持JPG、PNG格式图片，大小限制1M以内">
            {form.getFieldDecorator('icon', {
              rules: [{ required: true, message: '必填' }],
            })(
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => {return false;}}
                onChange={info => {
                  this.handleUploadChange(info);
                }}
                accept="image/png,image/jpeg"
              >
                {this.state.icon ? (
                  <ShowImg src={this.state.icon} className="avatar-80" />
                ) : (
                  uploadButton
                )}
              </Upload>
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
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      uploadLoading: false,
      formVals: props.values,
      icon: props.values && props.values.icon,
    };
  }

  componentDidMount = () => {
    this.props.form.resetFields();
  };

  handleUploadChange = info => {
    const { form } = this.props;
    this.setState({ uploadLoading: true });
    const formData = new FormData();
    formData.append('file', info.file);
    // 上传图片
    uploadImage(formData).then(res => {
      if (res && res.code == 200) {
        this.setState(
          {
            icon: res.data.items.path,
            uploadLoading: false,
          },
          () => {
            form.setFieldsValue({
              icon: res.data.items.path,
            });
          }
        );
      }
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

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    const formLayoutWithOutLabel = {
      wrapperCol: { span: 13, offset: 7 },
    };

    const uploadButton = (
      <div>
        <Icon type={this.state.uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Form>
        <FormItem {...formLayout} label="分类名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals && formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文分类名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals && formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文分类名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals && formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="图标" extra="图片比例1:1，仅支持JPG、PNG格式图片，大小限制1M以内">
          {form.getFieldDecorator('icon', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals && formVals.icon,
          })(
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {return false;}}
              onChange={info => {
                this.handleUploadChange(info);
              }}
              accept="image/png,image/jpeg"
            >
              {this.state.icon ? (
                <ShowImg src={this.state.icon} className="avatar-80" />
              ) : (
                uploadButton
              )}
            </Upload>
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
        title="编辑分类"
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

// 列表
@connect(({ configBase, common, loading }) => ({
  configBase,
  common,
  loading: loading.models.configBase,
}))
@Form.create()
class Classify extends PureComponent {
  state = {
    pid: '',
    level_nmae: '',
    level: '1',
    page: 1,
    pagesize: 25,
    modalVisible: false,
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
    menu: [],
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // 获取上级pid
    const { match, location } = this.props;
    let query = location.query;
    this.setState(
      {
        pid: match.params.id,
        level_nmae: query.level_nmae,
        level: query.level || 1,
      },
      () => {
        this.getList();
        this.fetchMenu();
      }
    );
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'config', 'base'),
          });
        }
      },
    });
  };

  getList = params => {
    const { dispatch } = this.props;
    const { pid } = this.state;
    let getPid = {};
    if (pid) {
      getPid = {
        pid: pid,
      };
    }
    let getParams = {
      ...getPid,
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params,
    };
    dispatch({
      type: 'configBase/fetchClassifyList',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      render: val => <ShowImg src={val} className="avatar-48" />,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '该分类下商家数',
      dataIndex: 'total_merchant',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('edit') != -1 ? (
            <Fragment>
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
            </Fragment>
          ) : null}
          {this.state.menu.indexOf('view') != -1 ? (
            <Fragment>
              <Divider type="vertical" />
              <Link
                to={
                  '/config/base/classify/level_two/' +
                  record.id +
                  '?level_nmae=' +
                  record.name +
                  '&level=2'
                }
              >
                查看下级分类
              </Link>
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

  columnsLevel = [
    {
      title: '图标',
      dataIndex: 'icon',
      render: val => <ShowImg src={val} className="avatar-48" />,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '上级分类',
      dataIndex: 'm_category',
      render: val => <span>{val && val.name}</span>,
    },
    {
      title: '该分类下商家数',
      dataIndex: 'total_merchant',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('edit') != -1 ? (
            <Fragment>
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
            </Fragment>
          ) : null}
          {this.state.menu.indexOf('view') != -1
            ? this.state.level != '3' && (
                <Fragment>
                  <Divider type="vertical" />
                  <Link
                    to={
                      '/config/base/classify/level_three/' +
                      record.id +
                      '?level_nmae=' +
                      record.m_category.name +
                      ' - ' +
                      record.name +
                      '&level=3'
                    }
                  >
                    查看下级分类
                  </Link>
                </Fragment>
              )
            : null}
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

  handleStandardTableChange = pagination => {
    const { formValues } = this.state;
    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
    };
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
    const { dispatch } = this.props;
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    getClassifyInfo({
      id: record.id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    if (this.state.pid) {
      formData.append('pid', this.state.pid);
    }
    dispatch({
      type: 'configBase/addClassify',
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
    if (this.state.pid) {
      formData.append('pid', this.state.pid);
    }
    dispatch({
      type: 'configBase/editClassify',
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
          type: 'configBase/deleteClassify',
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
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="分类名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          {/* <Col md={4} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('realname_status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
          <Col md={4} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              {this.state.menu.indexOf('add') != -1 ? (
                <Button
                  icon="plus"
                  style={{ marginLeft: 8 }}
                  onClick={() => this.handleModalVisible(true)}
                >
                  新增分类
                </Button>
              ) : null}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      configBase: { classifyList },
      loading,
    } = this.props;
    const { pid, level_nmae, modalVisible, updateModalVisible, editFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };

    return (
      <Fragment>
        <div className={styles.tableList} style={{ paddingTop: 24 }}>
          <div className="page_head">
            {pid == undefined ? (
              <span className="page_head_title">商品分类</span>
            ) : (
              <span className="page_head_title">
                <Button
                  type="default"
                  shape="circle"
                  icon="left"
                  className="fixed_to_head"
                  onClick={() => router.goBack()}
                />
                <span>{level_nmae + '的下级分类列表'}</span>
              </span>
            )}
          </div>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={classifyList}
            columns={pid == undefined ? this.columns : this.columnsLevel}
            onChange={this.handleStandardTableChange}
          />
        </div>
        {modalVisible && (
          <CreateForm {...parentMethods} modalVisible={modalVisible} menu={this.state.menu} />
        )}
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
            menu={this.state.menu}
          />
        ) : null}
      </Fragment>
    );
  }
}

export default Classify;
