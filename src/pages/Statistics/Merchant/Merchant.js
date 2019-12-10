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
  exportSaleMerchant
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
  loading: loading.effects['saleMerchant/fetchSaleMerchant'],
}))
@Form.create()
class Merchant extends PureComponent {
  state = {
    formValues: {},
    selectMerchant: [],
    menu: [],
  };

  columns = [
    {
      title: '商家名称',
      dataIndex: 'merchant_name',
    },
    {
      title: '销量种类',
      dataIndex: 'dish_category_num',
    },
    {
      title: '总商品数',
      dataIndex: 'dish_num',
    },
    {
      title: '总销量',
      dataIndex: 'sale_dish_num',
    },
    {
      title: '操作',
      width: 100,
      render: (text, record) => (
        <Fragment>
          {this.state.menu.indexOf('view') != -1 ? (
            <Link to={'/statistics/merchant/saledish/' + record.id}>查看</Link>
          ) : (
              ''
            )}
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
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
            menu: getMenu(res.data.items, 'statistics', 'merchant'),
          });
        }
      },
    });
  };
  getList = params => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params,
    };
    dispatch({
      type: 'saleMerchant/fetchSaleMerchant',
      payload: getParams,
    });

    // let children = [];
    // for (let i = 10; i < 36; i++) {
    //   children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    // }
    // this.setState({
    //   selectMerchant: children,
    // });
  };

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

      const values = {
        ...newFieldsValue,
      };
      this.setState({
        formValues: values,
      });
      // console.log('values', values)
      exportSaleMerchant(values).then(res => {
        if (!utils.successReturn(res)) return;
      })


    });
  };


  selectMerchantChange = value => {
    console.log(`selected ${value}`);
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col xl={4} md={6} sm={24}>
            <FormItem label="商家名称">
              {getFieldDecorator('merchant_name')(<Input placeholder="请输入" allowClear />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
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
    const { saleMerchant: { data }, loading } = this.props;

    return (
      <div>
        <Card bordered={false}>
          <div className="page_head">
            <span className="page_head_title">商家销量统计</span>
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

export default Merchant;
