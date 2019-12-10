import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload, } from 'antd';
import StandardTable from '@/components/StandardTable';
import utils from '@/utils/utils';
import { getRegionInfo } from '@/services/business';
import styles from '@/assets/css/TableList.less';

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

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const formBtnLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 13, offset: 7 },
  },
}

// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
    };

  }
  
  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const { uploadLoading, imageUrl } = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title="新增区域"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <Form>
          <FormItem {...formLayout} label="区域名称">
            {form.getFieldDecorator('name_cn', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
            <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
              <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
            </span>
          </FormItem>
          <FormItem {...formLayout} label="英文区域名称">
            {form.getFieldDecorator('name_en', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="柬文区域名称">
            {form.getFieldDecorator('name_kh', {
              rules: [{ required: true, message: '必填' }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="区域参数">
            {form.getFieldDecorator('geojson', {
              rules: [{ required: true, message: '必填' }],
            })(<Input.TextArea rows={6} placeholder="请输入地图geojson" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};


// 编辑
@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
    };
  }

  okHandle = () => {
    const { form, handleUpdate, values } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      fieldsValue.id = values.id;
      handleUpdate(fieldsValue);
    });
  };

  renderContent = (formVals) => {
    const { form, handleUpdateModalVisible, } = this.props;
    const { title, } = this.state;

    return (
      <Form>
        <FormItem {...formLayout} label="区域名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文区域名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文区域名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="区域参数">
          {form.getFieldDecorator('geojson', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.geojson,
          })(<Input.TextArea rows={6} placeholder="请输入地图geojson" />)}
        </FormItem>
      </Form>
    );
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { title, formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="编辑区域"
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
@connect(({ business, loading }) => ({
  business,
  loading: loading.models.business,
}))
@Form.create()
class Region extends PureComponent {
  state = {
    city_id: '',
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { match } = this.props;
    const id = match.params.id;
    this.setState({
      city_id: id,
    }, () => {
      this.getList()
    });
  }

  getList = (newParams) => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      city_id: this.state.city_id,
      ...newParams
    }
    dispatch({
      type: 'business/fetchRegionList',
      payload: getParams
    });
  }

  columns = [
    {
      title: '区域',
      dataIndex: 'name',
    },
    {
      title: '所属城市',
      render: (text, record) => (
        <span>{record.sys_city.name}</span>
      )
    },
    {
      title: '所属国家',
      render: (text, record) => (
        <span>{record.sys_city.sys_country.name}</span>
      )
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => (
        <Fragment>
          <Link to={'/business/' + record.id}>查看商圈</Link>
          <Divider type="vertical" />
          <Link to={'/business/region/details/' + record.id}>详情</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = (pagination) => {
    const { formValues } = this.state;
    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
      ...formValues,
    };

    this.getList(params);
    window.scrollTo(0, 0);
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('city_id', this.state.city_id);
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'business/fetchRegionSave',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
      }
    });
    this.handleModalVisible();
  };

  // 编辑数据
  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    getRegionInfo({
      id: record.id,
    }).then((res) => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    })
  };

  handleUpdate = fields => {
    console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('city_id', this.state.city_id);
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'business/fetchRegionEdit',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
      }
    });
    this.handleUpdateModalVisible();
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleDelete = fields => {
    console.log(fields);
    const { dispatch } = this.props;

    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'business/fetchRegionDelete',
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

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
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
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="区域">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      business: { regionList },
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
            <div className="page_head_title"><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> 区域</div>
            <div className="fr">
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>新增区域</Button>
            </div>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={regionList}
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

export default Region;
