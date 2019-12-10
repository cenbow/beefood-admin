import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Radio, Upload, } from 'antd';
import StandardTable from '@/components/StandardTable';
import utils from '@/utils/utils';
import { getCityInfo } from '@/services/business';
import GoogleGeocoding from '@/components/GoogleGeocoding/index';
import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 13 },
};

const formBtnLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 13, offset: 6 },
  },
}

// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gps: [],
    };
  }

  // 获取地图组件方法实例
  onRef = (ref) => {
    this.child = ref;
  }

  searchGeocoding = () => {
    const { form } = this.props;
    let content = '';
    const content_cn = form.getFieldValue('name_cn') || '';
    const content_en = form.getFieldValue('name_en') || '';
    const content_kh = form.getFieldValue('name_kh') || '';
    if (content_cn == '' && content_en == '' && content_kh == '') {
      return message.error('请输入内容！');
    } else if (content_cn != '') {
      content = content_cn;
    } else if (content_en != '') {
      content = content_en;
    } else if (content_kh != '') {
      content = content_kh;
    };
    this.child.searchGeocoding(content);
  };

  // 返回地址坐标
  onChangeMap = (gps) => {
    console.log(gps);
    this.setState({
      gps: [...gps],
    })
  }

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible } = this.props;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        fieldsValue.gps = this.state.gps.join(',');
        handleAdd(fieldsValue);
      });
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title="新增城市"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem {...formLayout} label="城市名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
          <div className="dynamic-button" style={{ top: '-16px',right: '-110px' }}>
            <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
          </div>
        </FormItem>
        <FormItem {...formLayout} label="英文城市名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文城市名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="城市中心点">
          <GoogleGeocoding
            onRef={this.onRef}
            onChange={this.onChangeMap}
            style={{ height: 240 }}
          />
        </FormItem>
        <FormItem {...formLayout} label="城市区域参数">
          {form.getFieldDecorator('geojson', {
            rules: [{ required: true, message: '必填' }],
          })(<Input.TextArea rows={6} placeholder="请输入地图geojson" />)}
        </FormItem>
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
      gps: [...props.values.gps ? props.values.gps.split(',') : [104.91667, 11.55]],
    };
  }

  // 获取地图组件方法实例
  onRef = (ref) => {
    this.child = ref;
  }

  searchGeocoding = () => {
    const { form } = this.props;
    let content = '';
    const content_cn = form.getFieldValue('name_cn') || '';
    const content_en = form.getFieldValue('name_en') || '';
    const content_kh = form.getFieldValue('name_kh') || '';
    if (content_cn == '' && content_en == '' && content_kh == '') {
      return message.error('请输入内容！');
    } else if (content_cn != '') {
      content = content_cn;
    } else if (content_en != '') {
      content = content_en;
    } else if (content_kh != '') {
      content = content_kh;
    };
    this.child.searchGeocoding(content);
  };

  // 返回地址坐标
  onChangeMap = (gps) => {
    console.log(gps);
    this.setState({
      gps: [...gps],
    })
  }

  okHandle = () => {
    const { form, handleUpdate, values } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      fieldsValue.id = values.id;
      fieldsValue.gps = this.state.gps.join(',');
      handleUpdate(fieldsValue);
    });
  };

  renderContent = (formVals) => {
    const { form, handleUpdateModalVisible, } = this.props;
    const { title, gps } = this.state;

    return (
      <Form>
        <FormItem {...formLayout} label="城市名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_cn,
          })(<Input placeholder="请输入" />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
          <div className="dynamic-button" style={{ top: '-16px', right: '-110px' }}>
            <Button type="primary" onClick={this.searchGeocoding}>查询</Button>
          </div>
        </FormItem>
        <FormItem {...formLayout} label="英文城市名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文城市名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="城市中心点">
          <GoogleGeocoding
            onRef={this.onRef}
            onChange={this.onChangeMap}
            style={{ height: 240 }}
            center={{
              lng: gps[0],
              lat: gps[1]
            }}
          />
        </FormItem>
        <FormItem {...formLayout} label="城市区域参数">
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
        title="编辑城市"
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
class City extends PureComponent {
  state = {
    country_id: '',
    updateModalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { match } = this.props;
    const id = match.params.id;
    this.setState({
      country_id: id,
    }, () => {
      this.getList()
    });
  }

  getList = (newParams) => {
    const { dispatch } = this.props;

    let getParams = {
      page: 1,
      pagesize: 25,
      country_id: this.state.country_id,
      ...newParams
    }
    dispatch({
      type: 'business/fetchCityList',
      payload: getParams
    });
  }

  columns = [
    {
      title: '城市',
      dataIndex: 'name',
    },
    {
      title: '所属国家',
      render: (text, record) => (
        <span>{record.sys_country.name}</span>
      )
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => (
        <Fragment>
          <Link to={'/business/region/' + record.id}>查看区域</Link>
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
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('country_id', this.state.country_id);
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'business/fetchCitySave',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      }
    });
  };

  // 编辑数据
  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    getCityInfo({
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
    formData.append('country_id', this.state.country_id);
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    dispatch({
      type: 'business/fetchCityEdit',
      payload: formData,
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
        this.handleUpdateModalVisible();
      }
    });
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
          type: 'business/fetchCityDelete',
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
            <FormItem label="城市">
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
      business: { cityList },
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
            <div className="page_head_title"><Button type="default" shape="circle" icon="left" className="fixed_to_head" onClick={() => router.goBack()} /> 城市</div>
            <div className="fr">
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>新增城市</Button>
            </div>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={cityList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {
          modalVisible && (
            <CreateForm {...parentMethods} modalVisible={modalVisible} />
          )
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

export default City;
