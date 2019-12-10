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
  DatePicker,
  message,
  Divider,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/css/TableList.less';
import { getMenu } from '../../../utils/utils';
import {
  exportSaleDishMerchant
} from '@/services/statistics';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ saleMerchant, common, loading }) => ({
  saleMerchant,
  common,
  loading: loading.effects['saleMerchant/fetchSaleDishMerchant'],
}))
@Form.create()
class Merchant extends PureComponent {
  state = {
    merchant_id:'',
    formValues: {},
    menu: [],
  };

  columns = [
    {
      title: '商品名称',
      dataIndex: 'dish_name',
    },
    {
      title: '所属分类',
      dataIndex: 'dish_category_name',
    },
    {
      title: '销量',
      dataIndex: 'sale_num',
    },
    {
      title: '总金额',
      dataIndex: 'sale_money',
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/statistics/merchant/saledish/details/' + record.id}>查看</Link>
          ) : (
              ''
            )}
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
    const {dispatch,match:{params}}=this.props
    const merchantId = params.id
    this.setState({
      merchant_id:merchantId
    },()=>{
      this.getList();
    })
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
            menu: getMenu(res.data.items, 'statistics', 'merchant'),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    const { merchant_id } = this.state;
    let getParams = {
      merchant_id:merchant_id,
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'saleMerchant/fetchSaleDishMerchant',
      payload: getParams,
    });


  };

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

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.getList();
  };

  handleExportForm = (e) => {
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

      if (newFieldsValue.grant_time !== undefined) {
        const startTimeArr = newFieldsValue.grant_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.grant_time = `${s_startTime},${s_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
      });
      // console.log('values', values)
      exportSaleDishMerchant(values).then(res => {
        if (!utils.successReturn(res)) return;
      })


    });
  };



  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="所属分类">
              {getFieldDecorator('dish_category_id')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">AA</Option>
                  <Option value="1">BBB</Option>
                  <Option value="2">AAAA</Option>
                  <Option value="3">BBBBB</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              {this.state.menu.indexOf('export') != -1 ? (
                <Button style={{ marginLeft: 30 }} type="primary" onClick={this.handleExportForm}>
                  导出
                </Button>
              ) : (
                  ''
                )}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render () {
    const { saleMerchant: { saleDishData }, loading } = this.props;

    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">商品销量</span>
            <span className="page_head_info">商家名称：XXXX</span>
          </div>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <StandardTable
              rowKey={list => list.id}
              selectedRows={[]}
              rowSelection={null}
              loading={loading}
              data={saleDishData}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default Merchant;
