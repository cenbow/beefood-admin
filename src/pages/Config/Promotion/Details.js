import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Row, Col, Form, Card, Select, DatePicker, Input, message, Icon, Button, Badge, Tabs, Table, Divider } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import stylesList from '@/assets/css/TableList.less';
import styles from '@/assets/css/BasicProfile.less';
import router, { routerRedux } from 'umi/router';
import utils from '@/utils/utils';
const { Description } = DescriptionList;
const { TabPane } = Tabs;

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const statusMap = { 1: 'success', 2: 'processing', 3: 'default' };
const status = { 1: '未使用', 2: '已使用', 3: '已失效' };
const detailsStatus = { 1: '生效中', 2: '已失效' };

@connect(({ config, loading }) => ({
  config,
  loading: loading.effects['config/fetchRedpacketUserList'],
}))
@Form.create()
class ConsumerDetails extends Component {
  columns = [
    {
      title: '用户名',
      dataIndex: 'u_user_info',
      render: val => (<span>{val.nickname}</span>)
    },
    {
      title: '用户手机号',
      dataIndex: 'u_user',
      render: val => (<span>{val.mobile}</span>)
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '领取时间',
      dataIndex: 'create_time',
      render: val => (<span>{utils.deteFormat(val)}</span>)
    },
  ];

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { params } = match;

    dispatch({
      type: 'config/fetchPromotionDetails',
      payload: {
        id: params.id
      },
    });

    this.getUserList();
  }

  getUserList = (val) => {
    const { dispatch, match } = this.props;
    const { params } = match;
    let getParams = {
      redpacket_id: params.id,
      page: 1,
      pagesize: 25,
      ...val
    }
    dispatch({
      type: 'config/fetchRedpacketUserList',
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

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        create_time: utils.getDateTimeMap(fieldsValue['create_time']),
      };

      this.setState({
        formValues: values,
      });
      
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
          <Col md={4} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('nickname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="用户手机号">
              {getFieldDecorator('mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('use_status')(
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
          <Col md={6} sm={24}>
            <FormItem label="领取时间">
              {getFieldDecorator('create_time')(
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

  callback = (key) => {
    console.log(key);
  }

  render() {
    const { config = {}, loading } = this.props;
    const { promotionDetails = {}, redpacketUserList } = config;

    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title"><Button type="default" shape="circle" icon="left" onClick={() => router.goBack()} /> 红包详情</span>
        </div>
        <DescriptionList size="large" style={{ marginBottom: 32 }}>
          <Description term="红包名称">{promotionDetails.name}</Description>
          <Description term="面额">{promotionDetails.money}</Description>
          <Description term="消费金额">{promotionDetails.condition}</Description>
          <Description term="领取时间">{promotionDetails.send_start_time}</Description>
          <Description term="失效时间">{promotionDetails.send_end_time}</Description>
          <Description term="状态">{detailsStatus[promotionDetails.status]}</Description>
        </DescriptionList>
        <Divider style={{ marginBottom: 32 }} />
        <div className="page_head">
          <span className="page_head_title">用户领取详情</span>
        </div>
        <div className={stylesList.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <StandardTable
            rowKey={list => list.id}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={redpacketUserList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>

      </Card>
    );
  }
}

export default ConsumerDetails;
