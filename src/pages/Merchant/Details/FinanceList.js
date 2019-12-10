import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Spin, DatePicker, Popconfirm, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import stylesIndex from './index.less';
import styles from '@/assets/css/TableList.less';
import confingVar from '@/utils/configVar';
import utils from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

const type = { 1: '订单收入', 2: '订单退款', 3: '订单索赔', 4: '平台奖励', 5: '提现' };

@connect(({ mdish, loading }) => ({
  mdish,
  loading: loading.effects['mdish/fetchFinanceList'],
}))
@Form.create()
class FinanceList extends Component {
  state = {
    merchant_id: '',
    page: confingVar.page,
    pagesize: confingVar.pagesize,
    modalVisible: false,
    formValues: {},
    editFormValues: {},
  };

  componentDidMount() {
    const { params } = this.props;

    this.setState({
      merchant_id: params.id,
    }, () => {
      this.getList();
    }
    );
  }

  getList = params => {
    const { dispatch } = this.props;

    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      merchant_id: this.state.merchant_id,
      ...params,
    };

    dispatch({
      type: 'mdish/fetchFinanceList',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '类型',
      width: 300,
      dataIndex: 'type',
      render(val) {
        return <span>{type[val]}</span>;
      },
    },
    {
      title: '订单编号',
      width: 300,
      dataIndex: 'order_no',
    },
    {
      title: '金额($)',
      width: 280,
      dataIndex: 'consume_money',
      render(val, record) {
        return <span>{record.action == 1 ? (val) : (<span style={{ color: 'red' }}>-{val}</span>)}</span>;
      },
    },
    {
      title: '时间',
      width: 300,
      dataIndex: 'finish_time',
      render(val) {
        return <span>{utils.deteFormat(val)}</span>;
      },
    },
    {
      title: '账户余额($)',
      width: 280,
      dataIndex: 'new_balance',
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          {
            record.type == 1 ? (<Link to={`/order/home/details/${record.order_no}/${record.user_id}`}>查看</Link>) :
            record.type == 2 ? (<Link to={`/order/home/details/${record.order_no}/${record.user_id}`}>查看</Link>) :
            record.type == 3 ? (<Link to={`/order/home/details/${record.order_no}/${record.user_id}`}>查看</Link>) :
            ('-')
          }
        </Fragment>
      ),
    },
  ];

  handleStandardTableChange = pagination => {
    const { formValues } = this.state;
    const tablePage = {
      page: pagination.current,
      pagesize: pagination.pageSize,
    };
    const values = {
      ...tablePage,
      ...formValues,
    }
    this.setState({
      ...tablePage
    })
    this.getList(values);
    window.scrollTo(0, 0);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.getList();
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rangeTimeValue = fieldsValue['date_query_time'];
      const values = {
        ...fieldsValue,
        date_query_time: utils.getDateTimeMap(rangeTimeValue),
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
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col xl={4} md={8} sm={24}>
            <FormItem label="类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" allowClear>
                  {Object.keys(type).map((i) => {
                    return (
                      <Option value={i} key={i}>
                        {type[i]}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="时间">
              {getFieldDecorator('date_query_time')(
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
          <Col xl={4} md={8} sm={24}>
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
    const { loading, mdish: { financeList = {}, financeData = {} } } = this.props;

    return (
      <GridContent>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
          <div className={styles.tableListOperator}>
            <span style={{ marginRight: '25px', fontWeight: 'bold' }}>订单收入：{financeData.order_income}</span>
            <span style={{ marginRight: '25px', fontWeight: 'bold' }}>订单退款：{financeData.order_refund}</span>
            <span style={{ marginRight: '25px', fontWeight: 'bold' }}>订单索赔：{financeData.order_claim}</span>
            <span style={{ marginRight: '25px', fontWeight: 'bold' }}>平台奖励：{financeData.platform_reward}</span>
            <span style={{ marginRight: '25px', fontWeight: 'bold' }}>提现：{financeData.order_withdraw}</span>
          </div>
          <StandardTable
            rowKey={list => list.order_no}
            selectedRows={[]}
            rowSelection={null}
            loading={loading}
            data={financeList}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </GridContent>
    );
  }
}

export default FinanceList;
