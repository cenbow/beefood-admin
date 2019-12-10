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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PrefixSelector from '@/components/PrefixSelector/index';
import { beforeUpload, getMenu } from '@/utils/utils';
import configVar from '@/utils/configVar';
import utils from '@/utils/utils';
import {
  uploadImage,
  getBdManagerBusiness,
  getCity,
  getRegion,
  getBusiness,
} from '@/services/common';
// import { deleteBdBusiness } from '@/services/bd';
import styles from '@/assets/css/TableList.less';
import ShowImg from '@/components/showImg';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'success', 'error'];
const status = ['所有', '启用', '禁用'];

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const formLayoutWithOutLabel = {
  wrapperCol: { span: 13, offset: 7 },
};

const uploadButton = (
  <div>
    <Icon type="plus" />
    <div className="ant-upload-text">Upload</div>
  </div>
);

// 新增
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      source_type: props.user.currentUser.source_type,
      source_id: props.user.currentUser.source_id,
      photo: '',
      id_image_facade: '',
      id_image_back: '',
      bdManagerBusiness: [],
    };
  }

  componentDidMount() {
    const { source_type, source_id } = this.state;
    if (source_type == 4){
      this.selectBusiness(source_id);
    }
  }

  selectBusiness = id => {
    const { form } = this.props;
    const { bdManagerBusiness } = this.state;
    // console.log('id:', id, 'getFieldValueid:', form.getFieldValue('pid'))
    const idContent = form.getFieldValue('pid');

    if (!id) {
      form.setFieldsValue({
        business_id: undefined,
      });
      this.setState({ bdManagerBusiness: [] });
      return;
    }

    getBdManagerBusiness({
      bd_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      if (id && id != undefined && id != idContent) {
        form.setFieldsValue({
          business_id: undefined,
        });
        this.setState({ bdManagerBusiness: [] });
      }
      this.setState({
        bdManagerBusiness: res.data.items,
      });
    });
  };

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible, common, user } = this.props;
    const { bdManager = [] } = common;
    const { photo, id_image_facade, id_image_back, bdManagerBusiness, source_type } = this.state;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleAdd(fieldsValue);
      });
    };

    // 上传图片
    const handleUploadChange = (info, type) => {
      const {
        common: { commonConfig },
        form,
      } = this.props;
      if (type == 'photo') {
        this.setState({ uploadLoading: true });
      } else if (type == 'id_image_facade') {
        this.setState({ facadeLoading: true });
      } else if (type == 'id_image_back') {
        this.setState({ backLoading: true });
      }
      const formData = new FormData();
      formData.append('file', info.file);
      if (beforeUpload(info.file)) {
        uploadImage(formData).then(res => {
          if (res && res.code == 200) {
            if (type == 'photo') {
              this.setState(
                {
                  // photo: commonConfig.image_domain + res.data.items.path,
                  photo: res.data.items.path,
                },
                () => {
                  form.setFieldsValue({
                    photo: res.data.items.path,
                  });
                }
              );
            }
            if (type == 'id_image_facade') {
              this.setState(
                {
                  id_image_facade: res.data.items.path,
                },
                () => {
                  form.setFieldsValue({
                    id_image_facade: res.data.items.path,
                  });
                }
              );
            }
            if (type == 'id_image_back') {
              this.setState(
                {
                  id_image_back: res.data.items.path,
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
        if (type == 'photo') {
          this.setState({ uploadLoading: false });
        } else if (type == 'id_image_facade') {
          this.setState({ facadeLoading: false });
        } else if (type == 'id_image_back') {
          this.setState({ backLoading: false });
        }
      }
    };

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '20px 40px' }}
        destroyOnClose
        title="新增BD人员"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem {...formLayout} label="姓名">
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
        <FormItem {...formLayout} label="英文姓名">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文姓名">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入手机号！' }],
          })(<Input id="mobile-add" addonBefore={<PrefixSelector form={form} />} placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="照片">
          {form.getFieldDecorator('photo', {
            rules: [{ required: true, message: '必填' }],
          })(
            <Upload
              name="photo"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {
                return false;
              }}
              onChange={info => {
                handleUploadChange(info, 'photo');
              }}
              accept="image/png, image/jpeg"
            >
              {photo ? <ShowImg src={photo} className="avatar-80" /> : uploadButton}
            </Upload>
          )}
        </FormItem>
        <FormItem {...formLayout} label="身份证号码">
          {form.getFieldDecorator('id_number', {
            rules: [{ required: true, message: '必填' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <Row>
          <Col span={7} style={{ textAlign: 'right' }}>
            <FormItem label="身份证照片(正/背)" required></FormItem>
          </Col>
          <Col span={13}>
            <FormItem style={{ width: 120, display: 'inline-block' }}>
              {form.getFieldDecorator('id_image_facade', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Upload
                  name="id_image_facade"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={info => {
                    handleUploadChange(info, 'id_image_facade');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {id_image_facade ? (
                    <ShowImg src={id_image_facade} className="avatar-80" />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem style={{ width: 120, display: 'inline-block' }}>
              {form.getFieldDecorator('id_image_back', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Upload
                  name="id_image_back"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={info => {
                    handleUploadChange(info, 'id_image_back');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {id_image_back ? (
                    <ShowImg src={id_image_back} className="avatar-80" />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              )}
            </FormItem>
          </Col>
        </Row>
        <FormItem {...formLayout} label="所属上级">
          {form.getFieldDecorator('pid', {
            rules: [{ required: true, message: '必填' }],
            initialValue: source_type == 4 ? user.currentUser.source_id : undefined,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectBusiness(val);
              }}
              disabled={source_type == 4 ? true : false}
            >
              {bdManager.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="管理商圈">
          {form.getFieldDecorator('business_id', {
            initialValue: undefined,
          })(
            <Select placeholder="请选择" style={{ width: '100%' }} mode="multiple" allowClear>
              {source_type == 4 
                ? (common.bdManagerBusiness || []).map((item, i) => (
                    <Option value={item.sys_business.id} key={i}>
                      {item.sys_business.name}
                    </Option>
                  ))
                : bdManagerBusiness.map((item, i) => (
                    <Option value={item.sys_business.id} key={i}>
                      {item.sys_business.name}
                    </Option>
                  ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="状态">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '请选择状态！' }],
            initialValue: '1',
          })(
            <Radio.Group>
              <Radio value="1">启用</Radio>
              <Radio value="2">禁用</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Modal>
    );
  }
}

// 编辑
@connect(({ user, bd }) => ({
  user,
}))
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
    common: [],
  };

  constructor(props) {
    super(props);
    const {
      common: { commonConfig },
      user,
    } = this.props;
    this.state = {
      formVals: props.values,
      photo: props.values.photo,
      id_image_facade: props.values.id_image_facade,
      id_image_back: props.values.id_image_back,
      // photo: commonConfig.image_domain + props.values.photo,
      // id_image_facade: commonConfig.image_domain + props.values.id_image_facade,
      // id_image_back: commonConfig.image_domain + props.values.id_image_back,
      bdManagerBusiness: [],
      bdBusinessVal: props.values.sys_bd_business_data,
    };
  }

  componentDidMount() {
    const { user } = this.props;
    // const userType = user.currentUser.source_type
    // const userID = user.currentUser.source_id
    this.setState({ bdManagerBusiness: [] });
    this.selectBusiness(this.state.formVals.pid);
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'setting', 'user'),
          });
        }
      },
    });
  };
  selectBusiness = id => {
    const { form } = this.props;
    const { bdManagerBusiness } = this.state;
    if (!id) {
      form.setFieldsValue({
        business_id: undefined,
      });
      this.setState({ bdManagerBusiness: [] });
      return;
    }
    getBdManagerBusiness({
      bd_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      if (id && id != undefined && id != this.state.formVals.pid) {
        form.setFieldsValue({
          business_id: undefined,
        });
        this.setState({ bdManagerBusiness: [] });
      }
      this.setState({
        bdManagerBusiness: res.data.items,
      });
    });
  };

  onSelectBdBusiness = (value) => {
    this.setState(prevState => ({
      bdBusinessVal: [...prevState.bdBusinessVal, value],
    }));
  }

  onDeleteBdBusiness = value => {
    const { dispatch } = this.props;
    console.log(value);
    Modal.confirm({
      title: '删除商圈',
      content: '确定删除此商圈？',
      onOk: () => {
        let formData = new FormData();
        formData.append('bd_id', this.state.formVals.id);
        formData.append('business_id', value);
        dispatch({
          type: 'bd/fetchDeleteBdBusiness',
          payload: formData,
          callback: res => {
            if (res) {
              switch (res.code) {
                case 200:
                  message.success('删除成功')
                  this.setState(prevState => ({
                    bdBusinessVal: prevState.bdBusinessVal.filter(item => item !== value),
                  }));
                  break;
                case 60406:
                  Modal.info({
                    title: '删除商圈',
                    content: (
                      <div>
                        <h2>此商圈下有关联的商家，需将关联的商家移交给其他BD人员</h2>
                        <p><Link to="/merchant/cooperation">现在去操作</Link></p>
                      </div>
                    ),
                  })
                  break;
                default:
                  message.error(res.msg);
                  break;
              }
            } else {
              return message.error('网络出错')
            }
          },
        });
      }
    });
  }

  okHandle = () => {
    const { form, handleUpdate } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      fieldsValue.id = this.state.formVals.id;
      fieldsValue.business_id = this.state.bdBusinessVal.join(',');
      handleUpdate(fieldsValue);
    });
  };

  renderContent = formVals => {
    const { form, handleUpdate, common, user } = this.props;
    const { bdManager } = common;
    const { photo, id_image_facade, id_image_back, bdManagerBusiness } = this.state;

    // 上传图片
    const handleUploadChange = (info, type) => {
      const {
        common: { commonConfig },
        form,
      } = this.props;
      if (type == 'photo') {
        this.setState({ uploadLoading: true });
      } else if (type == 'id_image_facade') {
        this.setState({ facadeLoading: true });
      } else if (type == 'id_image_back') {
        this.setState({ backLoading: true });
      }
      const formData = new FormData();
      formData.append('file', info.file);
      if (beforeUpload(info.file)) {
        uploadImage(formData).then(res => {
          if (res && res.code == 200) {
            if (type == 'photo') {
              this.setState(
                {
                  // photo: commonConfig.image_domain + res.data.items.path,
                  photo: res.data.items.path,
                },
                () => {
                  form.setFieldsValue({
                    photo: res.data.items.path,
                  });
                }
              );
            }
            if (type == 'id_image_facade') {
              this.setState(
                {
                  id_image_facade: res.data.items.path,
                },
                () => {
                  form.setFieldsValue({
                    id_image_facade: res.data.items.path,
                  });
                }
              );
            }
            if (type == 'id_image_back') {
              this.setState(
                {
                  id_image_back: res.data.items.path,
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
        if (type == 'photo') {
          this.setState({ uploadLoading: false });
        } else if (type == 'id_image_facade') {
          this.setState({ facadeLoading: false });
        } else if (type == 'id_image_back') {
          this.setState({ backLoading: false });
        }
      }
    };

    return (
      <Fragment>
        <FormItem {...formLayout} label="姓名">
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
        <FormItem {...formLayout} label="英文姓名">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_en,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文姓名">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.name_kh,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...formLayout} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: true, message: '请输入手机号！' }],
            initialValue: formVals.mobile,
          })(
            <Input
              addonBefore={<PrefixSelector form={form} value={formVals.mobile_prefix} />}
              placeholder="请输入"
              id="mobile-edit"
            />
          )}
        </FormItem>
        <FormItem {...formLayout} label="照片">
          {form.getFieldDecorator('photo', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.photo,
          })(
            <Upload
              name="photo"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => {
                return false;
              }}
              onChange={info => {
                handleUploadChange(info, 'photo');
              }}
              accept="image/png, image/jpeg"
            >
              {photo ? <ShowImg src={photo} className="avatar-80" /> : uploadButton}
            </Upload>
          )}
        </FormItem>
        <FormItem {...formLayout} label="身份证号码">
          {form.getFieldDecorator('id_number', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.id_number,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <Row>
          <Col span={7} style={{ textAlign: 'right' }}>
            <FormItem label="身份证照片(正/背)" required></FormItem>
          </Col>
          <Col span={13}>
            <FormItem style={{ width: 120, display: 'inline-block' }}>
              {form.getFieldDecorator('id_image_facade', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.id_image_facade,
              })(
                <Upload
                  name="id_image_facade"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={info => {
                    handleUploadChange(info, 'id_image_facade');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {id_image_facade ? (
                    <ShowImg src={id_image_facade} className="avatar-80" />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem style={{ width: 120, display: 'inline-block' }}>
              {form.getFieldDecorator('id_image_back', {
                rules: [{ required: true, message: '必填' }],
                initialValue: formVals.id_image_back,
              })(
                <Upload
                  name="id_image_back"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => {
                    return false;
                  }}
                  onChange={info => {
                    handleUploadChange(info, 'id_image_back');
                  }}
                  accept="image/png, image/jpeg"
                >
                  {id_image_back ? (
                    <ShowImg src={id_image_back} className="avatar-80" />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              )}
            </FormItem>
          </Col>
        </Row>

        <FormItem {...formLayout} label="所属上级">
          {form.getFieldDecorator('pid', {
            rules: [{ required: true, message: '必填' }],
            initialValue:
              user.currentUser.source_type == 4 ? user.currentUser.source_id : formVals.pid,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectBusiness(val);
              }}
              disabled={user.currentUser.source_type == 4 ? true : false}
            >
              {bdManager.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="管理商圈">
          <Select
            placeholder="请选择"
            style={{ width: '100%' }}
            mode="multiple"
            value={this.state.bdBusinessVal}
            onSelect={this.onSelectBdBusiness}
            onDeselect={this.onDeleteBdBusiness}
          >
            {bdManagerBusiness.map((item, i) => (
              <Option value={item.sys_business.id} key={i}>
                {item.sys_business.name}
              </Option>
            ))}
          </Select>
          {/* {form.getFieldDecorator('business_id', {
            initialValue: formVals.sys_bd_business_data,
          })(
            <Select 
              placeholder="请选择"
              style={{ width: '100%' }}
              mode="multiple"
            >
              {bdManagerBusiness.map((item, i) => (
                <Option value={item.sys_business.id} key={i}>
                  {item.sys_business.name}
                </Option>
              ))}
            </Select>
          )} */}
        </FormItem>
        <Form.Item {...formLayout} label="登录账号">
          <span className="ant-form-text">
            {this.props.values.sys_admin !== null ? this.props.values.sys_admin.username : '无账号'}
          </span>
        </Form.Item>
        <Form.Item {...formLayout} label="新密码">
          {form.getFieldDecorator('password', {
            rules: [
              {
                min: 6,
                max: 18,
                pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/,
                message: '密码由6~18位，由字母，数字两种不同字符组成',
              },
            ],
            initialValue: '',
          })(<Input.Password autoComplete="new-password" />)}
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
        bodyStyle={{ padding: '20px 40px' }}
        destroyOnClose
        title="编辑BD人员"
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

//添加我的商圈
@Form.create()
class CreateMyBusinessForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      citys: [],
      regions: [],
      business: [],
    };
  }
  componentDidMount() {
    const { common } = this.props;
    const { bdManager = [], country = [], city = [], region = [], business = [] } = common;
    this.setState({
      citys: city,
      regions: region,
      business: business,
    });
  }
  selectCountry = id => {
    this.setState({
      citys: [],
      regions: [],
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      city_id: undefined,
      region_id: undefined,
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        citys: undefined,
      });
      this.setState({ citys: [] });
      return;
    }
    getCity({
      country_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        citys: res.data.items,
      });
    });
  };
  selectCity = id => {
    this.setState({
      regions: [],
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      region_id: undefined,
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        regions: undefined,
      });
      this.setState({ regions: [] });
      return;
    }
    getRegion({
      city_id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        regions: res.data.items,
      });
    });
  };
  selectRegions = id => {
    this.setState({
      business: [],
    });
    const { form } = this.props;
    form.setFieldsValue({
      business_id: undefined,
    });
    if (!id) {
      form.setFieldsValue({
        business: undefined,
      });
      this.setState({ business: [] });
      return;
    }
    getBusiness({
      region_id: id,
      is_all : 1,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        business: res.data.items,
      });
    });
  };
  render() {
    const {
      modalMyBusieVisible,
      form,
      handleBusinessAdd,
      handleMyBusinessModalVisible,
      common,
    } = this.props;
    const { country = [] } = common;
    const { citys, regions, business } = this.state;
    // console.log(citys);
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        handleBusinessAdd(fieldsValue);
      });
    };

    return (
      <Modal
        width={450}
        destroyOnClose
        title="选择商圈"
        visible={modalMyBusieVisible}
        onOk={okHandle}
        onCancel={() => handleMyBusinessModalVisible()}
      >
        <FormItem {...formLayout} label="国家">
          {form.getFieldDecorator('country_id', {
            initialValue: country[0] && country[0].id ? country[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectCountry(val);
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
        <FormItem {...formLayout} label="城市">
          {form.getFieldDecorator('city_id', {
            initialValue: citys[0] && citys[0].id ? citys[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectCity(val);
              }}
            >
              {citys.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="区域">
          {form.getFieldDecorator('region_id', {
            initialValue: regions[0] && regions[0].id ? regions[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              allowClear
              onChange={val => {
                this.selectRegions(val);
              }}
            >
              {regions.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="商圈">
          {form.getFieldDecorator('business_id', {
            initialValue: business[0] && business[0].id ? business[0].id : undefined,
            rules: [{ required: true, message: '必填' }],
          })(
            <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
              {business.map((item, i) => (
                <Option value={item.id} key={i}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Modal>
    );
  }
}

// 列表
@connect(({ bd, common, loading, user }) => ({
  bd,
  common,
  user,
  loading: loading.effects['bd/fetchBdList'],
}))
@Form.create()
class ManagerBusiness extends PureComponent {
  state = {
    pid: '',
    modalMyBusinessVisible: false,
    modalVisible: false,
    updateModalVisible: false,
    page: configVar.page,
    pagesize: configVar.pagesize,
    formValues: {},
    editFormValues: {},
    modalMyBusieVisible: false,
    menu: [],
    source_type: '',
    source_id: '',
  };
  isHasMenu(action) {
    return this.state.menu.indexOf(action) ? true : false;
  }
  columns = [
    {
      title: 'BD姓名',
      dataIndex: 'name',
    },
    {
      title: 'BD负责人',
      render: (text, record) => <span>{record.sys_bd != null && record.sys_bd.name}</span>,
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
    },
    {
      title: '管理商圈',
      render: (text, record) => (
        <span>
          {(record.sys_bd_business || []).map((item, i) => {
            if (record.sys_bd_business.length == i + 1) {
              return <span key={i}>{item.sys_business && item.sys_business.name}</span>;
            }
            return <span key={i}>{item.sys_business && item.sys_business.name},</span>;
          })}
        </span>
      ),
    },
    {
      title: '合作商家数量',
      render: (text, record) => (
        <span>{record.total_cooperation_merchant} <Link to={'/merchant/all?bd_id=' + record.id}>查看</Link></span>
      ),
    },
    {
      title: '启用状态',
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
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/bd/details/' + record.id}>详情</Link>
          ) : null}
          {this.state.menu.indexOf('edit') != -1 ? (
            <Fragment>
              <Divider type="vertical" />
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
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
    this.getCommon();
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
          pid: new_source_id,
        },
        () => {
          this.getList();
          /* if (new_source_type == 4) {
            this.setState({
              pid: new_source_id,
            });
            this.getList({ pid: new_source_id });
            this.getBdListForForm(new_source_id);
            this.getBdManagerBusiness({ bd_id: new_source_id });
          } else {
            this.getList();
            this.getBdManagerBusiness();
          } */
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
            menu: getMenu(res.data.items, 'bd', null),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    const { source_type, source_id } = this.state;
    console.log(source_type);
    if (source_type == 4) {
      params = {
        ...params,
        pid: source_id,
      };
      this.getBdListForForm(source_id);
    } else if (source_type == 1) {
      this.getBdListForForm();
    } else {
      return;
    }
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      ...params,
    };
    dispatch({
      type: 'bd/fetchBdList',
      payload: getParams,
    });
  };

  getCommon = () => {
    const { dispatch } = this.props;
    // 获取BD管理人员数据
    dispatch({
      type: 'common/getBdManager',
    });
    //获取全部的国家
    dispatch({
      type: 'common/getCountry',
      callback: res => {
        if (res.code == 200) {
          if (res.data.items.length > 0) {
            //获取全部的城市
            dispatch({
              type: 'common/getCity',
              payload: {
                country_id: res.data.items[0].id,
              },
              callback: res => {
                //获取全部的区域
                if (res.code == 200) {
                  if (res.data.items.length > 0) {
                    dispatch({
                      type: 'common/getRegion',
                      payload: {
                        city_id: res.data.items[0].id,
                      },
                      callback: res => {
                        if (res.code == 200) {
                          //获取全部的商圈
                          if (res.data.items.length > 0) {
                            dispatch({
                              type: 'common/getBusiness',
                              payload: {
                                region_id: res.data.items[0].id,
                                is_all: 1
                              },
                            });
                          }
                        }
                      },
                    });
                  }
                }
              },
            });
          }
        }
      },
    });
  };

  getBdListForForm = id => {
    const { dispatch, form } = this.props;
    if (!id) {
      // pid: ''
      this.setState({  }, () => {
        this.getBdManagerBusiness();
      });
      form.setFieldsValue({
        bd_id: undefined,
      });
      return;
    }
    this.setState({ pid: id },()=>{
      this.getBdManagerBusiness({ bd_id: id});
    });
    // 获取BD人员数据
    dispatch({
      type: 'common/getBdListForForm',
      payload: {
        pid: id,
      },
    });
  };

  getBdManagerBusiness = pid => {
    const { dispatch } = this.props;
    // BD管理人员正常的商圈数据
    dispatch({
      type: 'common/getBdManagerBusiness',
      payload: {
        ...pid,
      },
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
    this.getList(values);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState(
      {
        formValues: {},
        pid: this.state.source_id,
      },
      () => {
        this.getList();
      }
    );
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
            // console.log(`${key}:${val}`)
            newFieldsValue[key] = val;
          }
        }
      }
      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
        pid: values.pid,
      });
      this.getList(values);
    });
  };

  showMyBusiness = flag => {
    // let select = React.createRef();
    //this.state.pid==0 为超级管理员
    console.log(this.state.pid);
    if (this.state.pid == '' || this.state.pid == 0) {
      message.info('请先选择BD负责人');
      return;
    }
    this.setState({
      modalMyBusinessVisible: !!flag,
    });
    if (flag) {
      this.getManagerBusinessList();
    }
  };

  getManagerBusinessList = params => {
    const { dispatch } = this.props;
    // 获取BD负责人商圈数据
    dispatch({
      type: 'bd/getManagerBusiness',
      payload: {
        page: (params && params.page) || 1,
        pagesize: (params && params.pagesize) || 10,
        bd_id: this.state.pid,
      },
    });
  };

  deleteBusiness = fields => {
    const { dispatch } = this.props;
    confirm({
      title: '删除商圈',
      content: '确认删除此商圈？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields);
        formData.append('bd_id', this.state.pid);
        dispatch({
          type: 'bd/deleteManagerBusiness',
          payload: formData,
          callback: res => {
            /* if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getManagerBusinessList(); */
            if (res) {
              switch (res.code) {
                case 200:
                  message.success('删除成功')
                  this.getManagerBusinessList();
                  break;
                case 60406:
                  Modal.info({
                    title: '删除商圈',
                    content: (
                      <div>
                        <h2>此商圈下有关联的商家，需将关联的商家移交给其他BD人员</h2>
                        <p><Link to="/merchant/cooperation">现在去操作</Link></p>
                      </div>
                    ),
                  })
                  break;
                default:
                  message.error(res.msg);
                  break;
              }
            } else {
              return message.error('网络出错')
            }
          },
        });
      },
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleMyBusinessModalVisible = flag => {
    this.setState({
      modalMyBusieVisible: !!flag,
    });
  };
  handleUpdateModalVisible = (flag, record) => {
    const { dispatch, bd } = this.props;
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: {},
    });
    if (!record) return;
    // 获取编辑信息
    dispatch({
      type: 'bd/fetchBdInfo',
      payload: {
        id: record.id,
      },
      callback: res => {
        this.setState({
          editFormValues: res.items,
        });
      },
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'bd/saveBd',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      },
    });
  };

  // 添加商圈
  handleBusinessAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    formData.append('bd_id', this.state.pid);
    dispatch({
      type: 'bd/saveManagerBusiness',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getManagerBusinessList();
        this.handleMyBusinessModalVisible();
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
      type: 'bd/editBd',
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
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'bd/deleteBd',
          payload: formData,
          callback: res => {
            /* if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList(); */
            if (res) {
              switch (res.code) {
                case 200:
                  message.success('删除成功')
                  this.getList();
                  break;
                case 60406:
                  Modal.info({
                    title: '删除BD',
                    content: (
                      <div>
                        <h2>此BD人员有合作商家，需转移给其他BD</h2>
                        <p><Link to="/merchant/cooperation">现在去操作</Link></p>
                      </div>
                    ),
                  })
                  break;
                default:
                  message.error(res.msg);
                  break;
              }
            } else {
              return message.error('网络出错')
            }
          },
        });
      },
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      common,
      user,
    } = this.props;
    const {
      bdManager = [],
      bdListForForm = [],
      bdManagerBusiness = [],
      country = [],
      city = [],
      region = [],
      business = [],
    } = common;
    // const { currentUser } = user;
    const userType = user.currentUser.source_type;
    const userID = user.currentUser.source_id;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="BD负责人">
              {getFieldDecorator('pid', {
                initialValue: userType == 4 ? userID : undefined,
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  disabled={userType == 4 ? true : false}
                  onChange={val => {
                    this.getBdListForForm(val);
                  }}
                >
                  {bdManager.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="BD姓名">
              {getFieldDecorator('bd_id')(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  disabled={this.state.pid != '' ? false : true}
                >
                  {bdListForForm.map((item, i) => (
                    <Option value={item.id} key={i}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="管理商圈">
              {getFieldDecorator('business_id')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {bdManagerBusiness.map(
                    (item, i) =>
                      item.sys_business && (
                        <Option value={item.sys_business.id} key={i}>
                          {item.sys_business.name}
                        </Option>
                      )
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="启用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  {/* <Option value="">所有</Option> */}
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
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
      bd: { managerBusinessList, bdList },
      user,
      loading,
      common,
    } = this.props;
    const {
      bdManager = [],
      bdListForForm = [],
      bdManagerBusiness = [],
      country = [],
      city = [],
      region = [],
      business = [],
    } = common;
    const {
      modalVisible,
      modalMyBusinessVisible,
      updateModalVisible,
      editFormValues,
      modalMyBusieVisible,
      menu,
      pid,
    } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleMyBusinessModalVisible: this.handleMyBusinessModalVisible,
      handleBusinessAdd: this.handleBusinessAdd,
      handleUpdate: this.handleUpdate,
      handleUpdateModalVisible: this.handleUpdateModalVisible,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">BD团队管理</span>
            <span className="fr button_group">
              {menu.indexOf('myBusiness') != -1 ? (
                <Fragment>
                  <Button onClick={() => this.showMyBusiness(true)}>我的商圈</Button>
                </Fragment>
              ) : null}

              <MyBusiness
                deleteBusiness={this.deleteBusiness}
                modalVisible={modalMyBusinessVisible}
                modalMyBusieVisible={modalMyBusieVisible}
                city={city}
                region={region}
                business={business}
                handleMyBusinessModalVisible={() => this.handleMyBusinessModalVisible(true)}
                handleModalMyBusinessVisible={() => this.showMyBusiness(false)}
                getManagerBusinessList={this.getManagerBusinessList}
                data={managerBusinessList}
              />
              {menu.indexOf('add') != -1 ? (
                <Fragment>
                  <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                    新增BD人员
                  </Button>
                </Fragment>
              ) : null}
            </span>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={(list, index) => index}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={bdList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {modalVisible && (
          <CreateForm {...parentMethods} modalVisible={modalVisible} common={common} user={user} />
        )}
        {modalMyBusieVisible && (
          <CreateMyBusinessForm
            {...parentMethods}
            modalMyBusieVisible={modalMyBusieVisible}
            common={common}
          />
        )}
        {editFormValues && Object.keys(editFormValues).length ? (
          <UpdateForm
            {...parentMethods}
            updateModalVisible={updateModalVisible}
            values={editFormValues}
            common={common}
          />
        ) : null}
      </div>
    );
  }
}

// 我的商圈
const MyBusiness = props => {
  const {
    modalVisible,
    deleteBusiness,
    handleModalMyBusinessVisible,
    handleMyBusinessModalVisible,
    data,
    handleBusinessAdd,
    getManagerBusinessList,
    city,
    region,
    business,
  } = props;

  const columns = [
    {
      title: '商圈名称',
      dataIndex: 'sys_business.name',
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a
            onClick={() => {
              deleteBusiness(record.id);
            }}
          >
            删除
          </a>
        </Fragment>
      ),
    },
  ];
  //我的商圈中添加商圈弹窗
  const addMyBusiness = () => {};

  const handleStandardTableChange = pagination => {
    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
    };
    getManagerBusinessList(params);
  };

  return (
    <Modal
      width={640}
      destroyOnClose
      title="我的商圈"
      visible={modalVisible}
      onCancel={() => handleModalMyBusinessVisible()}
      footer={null}
    >
      <div className="page_head">
        <span className="fr">
          <Button type="primary" onClick={() => handleMyBusinessModalVisible()}>
            添加商圈
          </Button>
        </span>
      </div>
      <StandardTable
        // rowKey={(list, index) => index}
        rowKey={list => list.id}
        selectedRows={[]}
        rowSelection={null}
        data={data}
        columns={columns}
        onChange={handleStandardTableChange}
      />
    </Modal>
  );
};

export default ManagerBusiness;
