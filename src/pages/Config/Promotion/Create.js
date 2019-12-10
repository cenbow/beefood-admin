import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { Row, Col, Card, Form, Input, Select, Icon, Button, DatePicker, Modal, message, Badge, Divider, Radio, Checkbox, } from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, { getMenu } from '@/utils/utils';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = { 1: 'success', 2: 'error' };
const status = { 1: '生效中', 2: '已失效' };
const type_status = { 1: '按注册发放', 2: '按分享发放', 3: '按用户发放', 4: '按邀请发放' };

// 推送新消息
const CreateForm = Form.create()(props => {
  const { form, handleCreateSubmit, handleType } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.type == '0') {
        message.error("请选择发放类型！");
        return;
      };
      form.resetFields();
      handleCreateSubmit(fieldsValue);
    });
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
      md: { span: 10 },
    },
  };

  const submitFormLayout = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 10, offset: 7 },
    },
  };

  return (
    <Card type="inner" title={(<span><Icon type="dollar" /> 新建红包</span>)}>
      <div style={{ marginTop: 40 }}>
        <FormItem {...formItemLayout} label="发放类型">
          {form.getFieldDecorator('type', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.select' }),
              },
            ],
            initialValue: '1'
          })(
            <Select style={{ width: '100%' }} onChange={key => { handleType(key) }}>
              {
                Object.keys(type_status).map((i) => (i > 0) && (
                  <Option value={i} key={i}>{type_status[i]}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="红包名称">
          {form.getFieldDecorator('name_cn', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="英文名称">
          {form.getFieldDecorator('name_en', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem {...formItemLayout} label="柬文名称">
          {form.getFieldDecorator('name_kh', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="红包说明">
          {form.getFieldDecorator('desc_cn', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="英文红包说明">
          {form.getFieldDecorator('desc_en', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem {...formItemLayout} label="柬文红包说明">
          {form.getFieldDecorator('desc_kh', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        {
          form.getFieldValue('type') == '2' ? (
            <Fragment>
        <FormItem {...formItemLayout} label="发放红包个数">
          {form.getFieldDecorator('send_num', {
            rules: [
              {
                // required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input  style={{width:'30%',}}/>)} <span>&nbsp;(0-99正整数)</span>
        </FormItem>

        <FormItem {...formItemLayout} label="每人每天领取最大红包数">
          {form.getFieldDecorator('take_max_num', {
            rules: [
              {
                // required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input  style={{width:'30%',}}/>)} <span>&nbsp;(0-99正整数)</span>
        </FormItem>
        </Fragment>
          ) : null }
        <FormItem {...formItemLayout} label="面额">
          {form.getFieldDecorator('balance', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="消费金额">
          {form.getFieldDecorator('consume', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input />)}
        </FormItem>
        {/* {
          form.getFieldValue('type') != '2' ? ( */}
            <Fragment>
              {/* <FormItem {...formItemLayout} label="发放总数量">
                {form.getFieldDecorator('total_num', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'form.weight.placeholder' }),
                    },
                  ],
                })(<Input />)}
              </FormItem> */}
              <FormItem {...formItemLayout} label="发放日期">
                {form.getFieldDecorator('send_time', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'form.weight.placeholder' }),
                    },
                  ],
                })(
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={[
                      formatMessage({ id: 'form.date.placeholder.start' }),
                      formatMessage({ id: 'form.date.placeholder.end' }),
                    ]}
                  />
                )}
              </FormItem>
            </Fragment>
          ) 
          {/* : null
        } */}
        <FormItem {...formItemLayout} label="领取">
          {form.getFieldDecorator('valid_day', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'form.weight.placeholder' }),
              },
            ],
          })(<Input  style={{width:'30%',}}/>)} <span>&nbsp;后失效</span>
        </FormItem>
 
        <FormItem {...formItemLayout} label="状态">
          {form.getFieldDecorator('status', {
            rules: [
              { required: true, },
            ],
            initialValue: '1'
          })(
            <Radio.Group>
              <Radio value="1">发布</Radio>
              <Radio value="2">未发布</Radio>
            </Radio.Group>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="可支持配送方式">
          {form.getFieldDecorator('user_target', {
            rules: [
              { required: true, },
            ],
            initialValue: ['1'],
          })(
            <Checkbox.Group>
              <Checkbox value="1">平台配送</Checkbox>
              <Checkbox value="2">商家自配送</Checkbox>
              <Checkbox value="3">上门自提</Checkbox>
            </Checkbox.Group>
          )}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }} extra="温馨提示：列表仅用于“按用户发放”类型，选中状态仅作用于当前列表">
          <Button type="primary" onClick={okHandle} icon="save">
            <FormattedMessage id="form.promotion.submit" />
          </Button>
          <Button icon="left" style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}><FormattedMessage id="form.back" /></Button>
        </FormItem>
      </div>
    </Card>
  )
})

@connect(({ config, loading }) => ({
  config,
  loading: loading.effects['config/fetchUserList'],
}))
@Form.create()
class PromotionCreate extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {},
    type: '0',
  };

  columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      render: url => <img className="avatar-48" src={url} alt={url} />,
    },
    {
      title: '真实姓名',
      dataIndex: 'realname',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '手机号码',
      render: (text, record) => (
        <span>{record.mobile_prefix}{record.mobile}</span>
      )
    },
    {
      title: '最近登录',
      dataIndex: 'login_time',
      sorter: true,
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
  ];

  componentDidMount() {
  }

  getUserList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params
    }
    dispatch({
      type: 'config/fetchUserList',
      payload: getParams
    });
  }

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

    this.getUserList(params);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getUserList();
  };


  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

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

      console.log(values);

      this.getUserList(values);
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="手机号">
              {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="昵称">
              {getFieldDecorator('nickname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">所有</Option>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  handleType = key => {
    this.setState({
      type: key,
    },()=>{
        this.getUserList()
    })
  }

  handleCreateSubmit = fields => {
    const { dispatch } = this.props;
    console.log(fields);
    let formData = new FormData();
    formData.append("type", fields.type);
    formData.append("name_en", fields.name_en);
    formData.append("name_cn", fields.name_cn);
    formData.append("name_kh", fields.name_kh);
    formData.append("money", fields.balance);
    formData.append("condition", fields.consume);
    formData.append("start_time", fields.time[0].format('YYYY-MM-DD'));
    formData.append("end_time", fields.time[1].format('YYYY-MM-DD'));
    formData.append("status", fields.status);
    
    formData.append('valid_day', fields.valid_day);
    formData.append('user_target', fields.user_target.join(','));
    
    if (fields.type == '2') {
      // 当type=2时 传递用户ID
      formData.append("user_ids", fields.user_ids);
    } else {
      // 当type=2时 不需要填写
      formData.append("total_num", fields.total_num);
      formData.append("send_start_time", fields.send_time[0].format('YYYY-MM-DD'));
      formData.append("send_end_time", fields.send_time[1].format('YYYY-MM-DD'));
    }

    dispatch({
      type: 'config/redpacketSend',
      payload: formData,
      callback: res => {
        if (res.code == 200) {
          message.success('发放红包成功', 0.5, () => {
            router.goBack();
          });
        }
      },
    });
  }

  render() {
    const {
      config: { data },
      loading,
      form: { getFieldDecorator, getFieldValue }
    } = this.props;
    const { selectedRows, type } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <div>
        <Card bordered={false}>
          <CreateForm handleCreateSubmit={this.handleCreateSubmit} handleType={this.handleType} />
        </Card>
        {
          type == '2' ? (
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
                <StandardTable
                  rowKey={list => list.id}
                  selectedRows={selectedRows}
                  loading={loading}
                  data={data}
                  columns={this.columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          ) : null
        }
      </div>
    );
  }
}

export default PromotionCreate;
