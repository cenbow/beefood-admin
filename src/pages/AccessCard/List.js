import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import utils from '@/utils/utils';
import styles from '@/assets/css/TableList.less';

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

@connect(({ accessCard, loading }) => ({
  accessCard,
  loading: loading.effects['accessCard/fetchAccessCardList'],
}))
@Form.create()
class AccessCard extends PureComponent {
  state = {
    delVisible: false,
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '赌场名称',
      dataIndex: 'name',
    },
    {
      title: '赌场地址',
      dataIndex: 'address',
    },
    {
      title: '骑手名称',
      width: 120,
      dataIndex: 'driver_info.nickname',
    },
    {
      title: '生效时间',
      width: 100,
      dataIndex: 'start_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '失效时间',
      width: 100,
      dataIndex: 'end_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
    },
    {
      title: '状态',
      width: 80,
      dataIndex: 'status',
      render (val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <Link to={`/accesscard/edit/${record.id}`}>编辑</Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
    this.getList();
  }

  getList = params => {
    const { dispatch } = this.props;
    const getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'accessCard/fetchAccessCardList',
      payload: getParams,
    });
  };

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
      //  获取key的值，判断值是否为空，或者没有值
      const newFieldsValue = new Object();
      for (const key in fieldsValue) {
        if (fieldsValue.hasOwnProperty(key)) {
          const val = fieldsValue[key];
          if (val !== undefined && val !== '') {
            newFieldsValue[key] = val
          }
        }
      }

      if (newFieldsValue.start_time !== undefined) {
        const startTimeArr = newFieldsValue.start_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.start_time = `${s_startTime},${s_endTime}`
      }

      if (newFieldsValue.end_time !== undefined) {
        const endTimeArr = newFieldsValue.end_time
        const e_startTime = moment(endTimeArr[0].startOf('day')).unix()
        const e_endTime = moment(endTimeArr[1].startOf('day')).unix()
        newFieldsValue.end_time = `${e_startTime},${e_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };

      this.setState({
        formValues: values,
      });

      // console.log('搜索参数', values);

      this.getList(values);
    });
  };

  handleDelete = fields => {
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData()
        formData.append('id', fields.id);
        dispatch({
          type: 'accessCard/fetchAccessCardDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          }
        })
      }
    });
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="赌场名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>
          <Col xl={6} md={8} sm={24}>
            <FormItem label="生效时间">
              {getFieldDecorator('start_time')(
                <RangePicker allowClear={false} />
              )}
            </FormItem>
          </Col>
          <Col xl={6} md={8} sm={24}>
            <FormItem label="失效时间">
              {getFieldDecorator('end_time')(
                <RangePicker allowClear={false} />
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">所有</Option>
                  <Option value="1">启用</Option>
                  <Option value="2">禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="骑手名称">
              {getFieldDecorator('driver_name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>

        </Row>
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
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

  render () {
    const {
      accessCard: { data },
      loading,
    } = this.props;

    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">出入证管理</span>
            <span className="fr">
              <Link to="/accesscard/create">
                <Button icon="plus" type="primary">
                  新增出入证
                </Button>
              </Link>
            </span>
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
      </div>
    );
  }
}

export default AccessCard;
