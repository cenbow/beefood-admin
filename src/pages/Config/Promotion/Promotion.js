import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import { Row, Col, Card, Form, Input, Select, Menu, Icon, Button, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import configVar from '@/utils/configVar';
import utils, { getMenu } from '@/utils/utils';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const statusMap = { 1: 'success', 2: 'default' };
const status = { 1: '生效中', 2: '已失效' };
const type_status = { 1: '按注册发放', 2: '按分享发放', 3: '按用户发放', 4: '按邀请发放' };

@connect(({ config, loading }) => ({
  config,
  loading: loading.models.config,
}))
@Form.create()
class Promotion extends PureComponent {
  state = {
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: '红包名称',
      dataIndex: 'name',
    },
    {
      title: '发放类型',
      dataIndex: 'type',
      render: val => <span>{type_status[val]}</span>,
    },
    {
      title: '面额',
      dataIndex: 'money',
    },
    {
      title: '消费金额',
      dataIndex: 'condition',
    },
    {
      title: '发放开始时间',
      dataIndex: 'send_start_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '发放结束时间',
      dataIndex: 'send_end_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '发放人',
      dataIndex: 'operator',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 110,
      render: (text, record) => (
        <Fragment>
          {utils.isHasMenu(this.state.menu, 'view') ? (
            <span>
              <Link to={'/config/promotion/details/' + record.id}>查看</Link>
              <Divider type="vertical" />
            </span>
          ) : ('')}

          {utils.isHasMenu(this.state.menu, 'delete') ? (
            <a onClick={() => this.handleDelete(record)}>删除</a>
          ) : ('')}
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
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menu: getMenu(res.data.items, 'config', 'promotion'),
          });
        }
      },
    });
  };

  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: configVar.page,
      pagesize: configVar.pagesize,
      ...params
    }
    dispatch({
      type: 'config/fetchPromotionList',
      payload: getParams
    });
  }

  handleStandardTableChange = (pagination) => {
    const { dispatch } = this.props;
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
      const rangeTimeValue = fieldsValue['send_time'];
      const values = {
        ...fieldsValue,
        send_time: utils.getDateTimeMap(rangeTimeValue),
      };
      this.setState({
        formValues: values,
      });
      this.getList(values);
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
          type: 'config/redpacketDelete',
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

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="红包名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="发放类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {
                    Object.keys(type_status).map((i) => (
                      <Option value={i} key={i}>{type_status[i]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="发放时间">
              {getFieldDecorator('send_time')(
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
          <Col md={3} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {
                    Object.keys(status).map((i) => (
                      <Option value={i} key={i}>{status[i]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={3} sm={24}>
            <FormItem label="发放人">
              {getFieldDecorator('operator')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { config, loading } = this.props;
    const { promotionList } = config;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              {utils.isHasMenu(this.state.menu, 'sendRed') ?
                (<Link to="/config/promotion/create"><Button icon="plus" type="primary">新建红包</Button></Link>) : ('')}
            </div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={promotionList}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default Promotion;
