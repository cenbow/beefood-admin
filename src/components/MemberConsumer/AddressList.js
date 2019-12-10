import React, { Component, PureComponent, Fragment } from 'react';
import moment from 'moment';
import Link from 'umi/link';
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
  AutoComplete,
  Radio,
  Badge,
  Tabs,
  Table,
  Divider,
  Modal, message
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import GoogleGeocoding from '@/components/GoogleGeocoding/index';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const tag = { 1: '没有选择', 2: '家', 3: '公司', 4: '学校' };

// 新增
@Form.create()
class CreateForm extends PureComponent {
  static defaultProps = {
    handleModalVisible: () => { },
    handleAddressAdd: () => { },
  };

  constructor(props) {
    super(props);

    this.state = {
      gps: '',
    };
  }

  // 获取地图组件方法实例
  onRef = (ref) => {
    this.child = ref;
  }

  // 搜索地址
  searchGeocoding = () => {
    const { form } = this.props;
    let content = form.getFieldValue('address');
    this.child.searchGeocoding(content)
  }

  // 返回地址坐标
  onChangeMap = (gps) => {
    console.log(gps);
    this.setState({
      gps: gps.join(','),
    })
  }

  render() {
    const { modalVisible, form, handleModalVisible, handleAddressAdd } = this.props;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        //form.resetFields();
        fieldsValue.gps = this.state.gps;
        handleAddressAdd(fieldsValue);
      });
    };

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title="新增收货地址"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <Form>
          <FormItem {...formLayout} label="收货人">
            {form.getFieldDecorator('consignee', {
              rules: [{ required: true, message: '请输入收货人！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="性别">
            {form.getFieldDecorator('sex', {
              initialValue: '1',
              rules: [{ required: true, message: '请选择性别！' }],
            })(
              <Radio.Group>
                <Radio value="1">男</Radio>
                <Radio value="2">女</Radio>
                <Radio value="3">保密</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="电话">
            {form.getFieldDecorator('mobile', {
              rules: [{ required: true, message: '请输入电话！' }],
            })(<Input addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="收货地址">
            {form.getFieldDecorator('address', {
              rules: [{ required: true, message: '请输入收货地址！' }],
            })(<Input placeholder="请输入" />)}
            <div className="dynamic-button" style={{ right: '-80px', top: '-15px' }}>
              <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
            </div>
          </FormItem>
          <FormItem {...formLayout} label="地图">
            <GoogleGeocoding
              onRef={this.onRef}
              onChange={this.onChangeMap}
              style={{ height: 250 }}
            // center={[113.36120000000005, 23.12468]}
            />
          </FormItem>
          {/* <FormItem {...formLayout} label="地址简称">
            {form.getFieldDecorator('short_name', {
              rules: [{ required: true, message: '请输入地址简称！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="gps">
            {form.getFieldDecorator('gps', {
              rules: [{ required: true, message: '请输入gps！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem> */}
          <FormItem {...formLayout} label="门牌号">
            {form.getFieldDecorator('house_number', {
              rules: [{ required: true, message: '请输入门牌号！' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="微信号">
            {form.getFieldDecorator('wechat_number', {
              initialValue: '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="标签">
            {form.getFieldDecorator('tag', {
              initialValue: '1',
            })(
              <Radio.Group>
                <Radio value="1">没有</Radio>
                <Radio value="2">家</Radio>
                <Radio value="3">公司</Radio>
                <Radio value="4">学校</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};


// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdateModalVisible: () => { },
    handleAddressUpdate: () => { },
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
      gps: '',
    };
  }

  // 获取地图组件方法实例
  onRef = (ref) => {
    this.child = ref;
  }

  // 搜索地址
  searchGeocoding = () => {
    const { form } = this.props;
    let content = form.getFieldValue('address');
    this.child.searchGeocoding(content)
  }

  // 返回地址坐标
  onChangeMap = (gps) => {
    console.log(gps);
    this.setState({
      gps: gps.join(','),
    })
  }

  okHandle = () => {
    const { form, values, handleUpdateModalVisible, handleAddressUpdate } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      fieldsValue.id = this.state.formVals.id;
      fieldsValue.gps = this.state.gps;
      handleAddressUpdate(fieldsValue);
      handleUpdateModalVisible(false, values);
    });
  };

  renderContent = (formVals) => {
    const { form } = this.props;
    const { uploadLoading, imageUrl } = this.state;

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    let gps = formVals.gps.split(',');

    return (
      <Form>
        <FormItem {...formLayout} label="收货人">
          {form.getFieldDecorator('consignee', {
            rules: [{ required: true, message: '请输入收货人！' }],
            initialValue: formVals.consignee,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="性别">
          {form.getFieldDecorator('sex', {
            initialValue: `${formVals.sex}`,
          })(
            <Radio.Group>
              <Radio value="1">男</Radio>
              <Radio value="2">女</Radio>
              <Radio value="3">保密</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem {...formLayout} label="电话">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入电话！' }],
            initialValue: formVals.mobile,
          })(<Input addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="收货地址">
          {form.getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入收货地址！' }],
            initialValue: formVals.address,
          })(<Input placeholder="请输入" />)}
          <div className="dynamic-button" style={{ right: '-80px', top: '-15px' }}>
            <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
          </div>
        </FormItem>
        <FormItem {...formLayout} label="地图">
          <GoogleGeocoding
            onRef={this.onRef}
            onChange={this.onChangeMap}
            style={{ height: 250 }}
            center={{ lng: gps[0], lat: gps[1] }}
          />
        </FormItem>
        {/* <FormItem {...formLayout} label="地址简称">
          {form.getFieldDecorator('short_name', {
            rules: [{ required: true, message: '请输入地址简称！' }],
            initialValue: formVals.short_name
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="gps">
          {form.getFieldDecorator('gps', {
            rules: [{ required: true, message: '请输入gps！' }],
            initialValue: formVals.gps
          })(<Input placeholder="请输入" />)}
        </FormItem> */}
        <FormItem {...formLayout} label="门牌号">
          {form.getFieldDecorator('house_number', {
            rules: [{ required: true, message: '请输入门牌号！' }],
            initialValue: formVals.house_number
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="微信号">
          {form.getFieldDecorator('wechat_number', {
            initialValue: formVals.wechat_number
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="标签">
          {form.getFieldDecorator('tag', {
            initialValue: `${formVals.tag}`,
          })(
            <Radio.Group>
              <Radio value="1">没有</Radio>
              <Radio value="2">家</Radio>
              <Radio value="3">公司</Radio>
              <Radio value="4">学校</Radio>
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

class AddressList extends Component {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    formValues: {},
    editFormValues: {},
  };

  columns = [
    {
      title: '收货人',
      dataIndex: 'consignee',
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
      title: '收货地址',
      dataIndex: 'address',
    },
    {
      title: '门牌号',
      dataIndex: 'house_number',
    },
    {
      title: '微信号',
      dataIndex: 'wechat_number',
    },
    {
      title: '标签',
      dataIndex: 'tag',
      render: (val) => tag[val],
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleAddressDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  //新增地址
  handleAddressAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('user_id', this.props.user_id);
    formData.append('short_name', fields['address']);
    dispatch({
      type: 'member/fetchAddressAdd',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.props.getList();
        this.handleModalVisible(false);
      },
    });
  };
  //修改地址
  handleAddressUpdate = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('user_id', this.props.user_id);
    formData.append('short_name', fields['address']);
    dispatch({
      type: 'member/fetchAddressUpdate',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.props.getList();
        this.handleUpdateModalVisible(false);
      },
    });
  };
  //删除地址
  handleAddressDelete = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('id', fields.id);
    confirm({
      title: '温馨提示',
      content: '确认是否删除此收货地址？',
      onOk: () => {
        dispatch({
          type: 'member/fetchAddressDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.props.getList();
          },
        });
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

    this.props.getList(params);
    window.scrollTo(0, 0);
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
    dispatch({
      type: 'member/fetchAddressInfo',
      payload: {
        id: record.id,
      },
      callback: res => {
        if (res.code == 200) {
          this.setState({
            editFormValues: res.data.items
          });
        }
      },
    });
  };

  render() {
    const { loading, dataSource } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;

    const parentMethods = {
      handleAddressAdd: this.handleAddressAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleAddressUpdate: this.handleAddressUpdate,
      handleUpdateModalVisible: this.handleUpdateModalVisible,
    };

    return (
      <GridContent>
        <div className={styles.tableList}>
          <div className={styles.tableListOperator}>
            <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>新增收货地址</Button>
          </div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={dataSource}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
          <CreateForm {...parentMethods} modalVisible={modalVisible} />
          {editFormValues && Object.keys(editFormValues).length ? (
            <UpdateForm
              {...updateMethods}
              updateModalVisible={updateModalVisible}
              values={editFormValues}
            />
          ) : null}
        </div>
      </GridContent>
    )
  }
}

export default AddressList;
