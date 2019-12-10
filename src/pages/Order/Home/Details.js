import React, { Component, PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Form, Card, Badge, Table, Divider, Input, Button, Upload, Select, Icon, Modal, message, Radio
} from 'antd';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getBase64, beforeUpload } from '@/utils/utils';
import styles from '@/assets/css/BasicProfile.less';

const FormItem = Form.Item;
const { Option } = Select;
const { Description } = DescriptionList;
const { TextArea } = Input;

const statusMap = ['', 'default', 'warning', 'processing', 'warning', 'success', 'warning', 'warning', 'error'];
const status = ['', '待支付', '待受理', '配送中(待核销)', '待评价', '已完成', '售后订单', '交易关闭(未支付)', '交易关闭(用户取消)'];
const role = ['', '消费者', '配送员', '管理员'];

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      uploadLoading: false,
      imageUrl: '',
    };

  }

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          uploadLoading: false,
        }),
      );
    }
  };

  normFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

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
          <FormItem {...formLayout} label="退款金额" extra="退款金额最多为：0.01">
            {form.getFieldDecorator('returns_amount', {
              rules: [{ required: true, message: '请输入退款金额！' }],
              initialValue: '0.01'
            })(
              <Input placeholder="" />
            )}
          </FormItem>
          <FormItem {...formLayout} label="售后原因">
            {form.getFieldDecorator('reason', {
              rules: [{ required: true, message: '请选择售后原因！' }],
            })(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="1">质量问题</Option>
                <Option value="2">态度不好</Option>
                <Option value="3">不新鲜</Option>
                <Option value="4">少东西</Option>
                <Option value="5">其他原因</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="描述原因">
            {form.getFieldDecorator('remark', {
              rules: [{ required: true, message: '请输入描述原因！' }],
            })(
              <TextArea
                autosize={{ minRows: 3, maxRows: 6 }}
              />
            )}
          </FormItem>
          <FormItem {...formLayout} label="图片">
            {form.getFieldDecorator('picture', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })(
              <Upload
                name="picture"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => { return false; }}
                onChange={this.handleUploadChange}
                accept="image/png, image/jpeg"
              >
                {imageUrl ? <img src={imageUrl} width="86" height="86" alt="" /> : uploadButton}
              </Upload>
            )}
          </FormItem>
          <FormItem {...formLayout} label="操作备注">
            {form.getFieldDecorator('note', {
              rules: [{ required: true, message: '请输入操作备注！' }],
            })(
              <TextArea
                autosize={{ minRows: 3, maxRows: 6 }}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};

@connect(({ orderList, loading }) => ({
  orderList,
  loading: loading.models.orderList,
}))
class Details extends Component {
  state = {
    order_no: '',
    user_id: '',
    modalVisible: false,
  }

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;
    this.setState({
      order_no: params.order_no,
      user_id: params.user_id
    }, () => {
      this.getOrderDetails();
    });
  }

  getOrderDetails = () => {
    const { dispatch } = this.props;
    const { order_no, user_id } = this.state;
    dispatch({
      type: 'orderList/fetchOrderDetails',
      payload: {
        order_no: order_no,
        user_id: user_id,
      },
    });
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
    Object.keys(fields).forEach((key) => {
      formData.append(key, (fields[key] || ''));
    });
    // dispatch({
    //   type: 'member/fetchConsumerAdd',
    //   payload: formData,
    //   callback: (res) => {
    //     message.success('添加成功');
    //     this.handleModalVisible();
    //   }
    // });
  };

  orderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '编号',
      dataIndex: 'mumber',
    },
    {
      title: '商家名称',
      dataIndex: 'merchant_name',
    },
    {
      title: '会员',
      dataIndex: 'username',
    },
    {
      title: '会员手机',
      dataIndex: 'mobile',
    },
    {
      title: '应付',
      dataIndex: 'sale_price',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '支付时间',
      dataIndex: 'pay_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '预计送达时间',
      dataIndex: 'arrival_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'sale_type',
      render: val => {
        let value = '';
        switch (val) {
          case '1':
            value = "wing";
            break;
          case '2':
            value = "pipay";
            break;
        }
        return value;
      }
    },
  ];

  addresssColumns = [
    {
      title: '收货人',
      dataIndex: 'consignee',
    },
    {
      title: '联系方式',
      dataIndex: 'mobile',
    },
    {
      title: '区域',
      dataIndex: 'region',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
    },
    {
      title: '配送方式',
      dataIndex: 'delivery_method',
      render: val => {
        let value = '';
        switch (val) {
          case '1':
            value = "平台";
            break;
          case '2':
            value = "商家";
            break;
          case '3':
            value = "自提";
            break;
        }
        return value;
      }
    },
  ];

  goodsColumns = [
    {
      title: '商品',
      dataIndex: 'name',
    },
    {
      title: '规格',
      dataIndex: 'specification',
    },
    {
      title: '数量',
      dataIndex: 'amount',
    },
    {
      title: '单品价格',
      dataIndex: 'price',
    },
    {
      title: '单品小计',
      dataIndex: 'total_price',
    },
  ];

  traceColumns = [
    {
      title: '操作者',
      render: (text, record) => (
        <span>{role[record.role]}：{record.username}</span>
      )
    },
    {
      title: '操作时间',
      dataIndex: 'create_time',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
  ];

  handleStandardTableChange = (pagination) => {
    const { formValues } = this.state;

    const params = {
      page: pagination.current,
      pagesize: pagination.pageSize,
    };

    this.getOrderList(params);
    window.scrollTo(0, 0);
  };

  render() {
    const { orderList = {}, loading } = this.props;
    const { details = {}, orderTrace = {} } = orderList;
    console.log(details);
    
    const {
      order = {},
      addresss = {},
      goods = [],
    } = details;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderWrapper title="订单详情" loading={loading}>
        <div className="main-24">
          <Card bordered={false} type="inner" title="基本信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={[order]}
              columns={this.orderColumns}
              rowKey="id"
              bordered
            />
          </Card>
          <Card bordered={false} type="inner" title="收货信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={[addresss]}
              columns={this.addresssColumns}
              rowKey="consignee"
              bordered
            />
          </Card>
          <Card bordered={false} type="inner" title="商品信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={goods}
              columns={this.goodsColumns}
              rowKey="id"
              bordered
            />
            <div className="table-tr">
              <div className="table-td">商品合计:<span style={{ color: "#FF9800" }}>￥1.00</span></div>
            </div>
            <div className="table-tr">
              <div className="table-td">备注:<span>备注内容</span></div>
            </div>
          </Card>
          <Card bordered={false} type="inner" title="费用信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <div className="table-wrap" style={{ textAlign: "right" }}>
              <div className="table-tr">
                <div className="table-td">商品总金额：<span>￥1.00</span>+配送费:<span>￥3.01</span></div>
              </div>
              <div className="table-tr">
                <div className="table-td">= 订单总金额：<span style={{ color: "#FF9800" }}>￥4.01</span></div>
              </div>
              <div className="table-tr">
                <div className="table-td">-商家首单减免：￥4.00</div>
              </div>
              <div className="table-tr">
                <div className="table-td">= 应付款金额：<span style={{ color: "#FF9800" }}>￥0.01</span></div>
              </div>
            </div>
          </Card>
          <Card bordered={false} type="inner" title="操作信息" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <div className="table-wrap">
              <div className="table-tr">
                <div className="table-td">
                  <TextArea
                    placeholder="请输入"
                    autosize={{ minRows: 3, maxRows: 6 }}
                  />
                </div>
              </div>
              <div className="table-tr">
                <div className="table-td">
                  <span>当前可执行操作：</span>
                  <span>
                    <Button type="primary">确认收货</Button>
                    <Button style={{ marginLeft: 12 }} onClick={() => this.handleModalVisible(true)}>申请售后</Button>
                    <CreateForm {...parentMethods} modalVisible={this.state.modalVisible} />
                  </span>
                </div>
              </div>
            </div>
          </Card>
          <Card bordered={false} type="inner" title="操作记录" style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={orderTrace}
              columns={this.traceColumns}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Details;
