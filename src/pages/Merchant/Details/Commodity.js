import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card, Form, Input, Button, Divider, Modal, Radio, message, Row, Col, Icon, Select, Spin, DatePicker, Popconfirm, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import ShowImg from '@/components/showImg';
import stylesIndex from './index.less';
import styles from '@/assets/css/TableList.less';
import { getMcategoryInfo } from '@/services/mdish';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const statusMap = ['default', 'processing', 'success', 'error'];
const quantity_status = ['', '无限库存', '有限库存'];
const status = ['', '售卖中', '已售完', '已下架'];

// 新增/编辑分类
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: props.values,
    };
  }

  render() {
    const { modalVisible, form, handleAdd, handleModalVisible, values } = this.props;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        if (values.id) {
          fieldsValue.id = values.id;
        }
        handleAdd(fieldsValue);
      });
    };

    const formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title={(values && values.name_cn ? '编辑' : '新增') + '分类'}
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem {...formLayout} label="分类名称">
          {form.getFieldDecorator('name_cn', {
            rules: [{ required: true, message: '必填' }],
            initialValue: values && values.name_cn,
          })(<Input placeholder="请输入中文分类名称（10字以内）" maxLength={10} />)}
          <span className="ant-form-text" style={{ position: 'absolute', right: '-44px' }}>
            <a onClick={() => { utils.translator(form, 'name') }}>翻译</a>
          </span>
        </FormItem>
        <FormItem {...formLayout} label="英文名称">
          {form.getFieldDecorator('name_en', {
            rules: [{ required: true, message: '必填' }],
            initialValue: values && values.name_en,
          })(<Input placeholder="请输入英文分类名称" />)}
        </FormItem>
        <FormItem {...formLayout} label="柬文名称">
          {form.getFieldDecorator('name_kh', {
            rules: [{ required: true, message: '必填' }],
            initialValue: values && values.name_kh,
          })(<Input placeholder="请输入柬文分类名称" />)}
        </FormItem>
        <FormItem {...formLayout} label="分类描述">
          {form.getFieldDecorator('desc', {
            initialValue: values && values.desc,
          })(<Input.TextArea placeholder="请输入" rows={4} maxLength={50} />)}
        </FormItem>
        <FormItem {...formLayout} label="必选商品分类" help="订单里有此分类商品才可以下单">
          {form.getFieldDecorator('is_required', {
            initialValue: values && values.is_required ? `${values.is_required}` : '1',
          })(
            <Radio.Group>
              <Radio value="1">非必选</Radio>
              <Radio value="2">必选</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Modal>
    );
  }
}

@connect(({ merchant, common, mdish, loading }) => ({
  merchant,
  mdish,
  common,
  loading: loading.effects['mdish/fetchMdishList'],
}))
@Form.create()
class Commodity extends Component {
  state = {
    merchant_id: '',
    page: 1,
    pagesize: 25,
    modalVisible: false,
    formValues: {},
    selectedRows: [],
    editFormValues: {},
  };

  componentDidMount() {
    const { params, common } = this.props;

    this.setState({
      merchant_id: params.id,
    }, () => {
      this.getList();
    }
    );
  }

  getMcategoryList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mdish/getMcategoryList',
      payload: {
        merchant_id: this.state.merchant_id,
      },
    });
  };

  getList = params => {
    const { dispatch } = this.props;
    // 获取商品分类
    this.getMcategoryList();
    let getParams = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      merchant_id: this.state.merchant_id,
      ...params,
    };
    dispatch({
      type: 'mdish/fetchMdishList',
      payload: getParams,
    });
  };

  columns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      render: value => <ShowImg src={value[0] && value[0].image} className="avatar-48" />,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '规格',
      key: 'Option',
      render: item => (
        <Fragment>
          {item.specification_type == 1 ? (
            '无'
          ) : (
              <div className={styles.gui_ge}>
                {item.specification.length > 0 &&
                  item.specification.map((item1, k) => {
                    return <div key={k}>{item1.name}</div>;
                  })}
              </div>
            )}
        </Fragment>
      ),
    },
    {
      title: '价格($)',
      key: 'Option1',
      width: 120,
      render: item => (
        <Fragment>
          {item.specification_type == 1 ? (
            utils.handleMoney(item.price, 0)
          ) : (
              <div className={styles.gui_ge}>
                {item.specification.length > 0 &&
                  item.specification.map((item1, k) => {
                    return <div key={k}>{utils.handleMoney(item1.price, 0)}</div>;
                  })}
              </div>
            )}
        </Fragment>
      ),
    },
    {
      title: '打包费($)',
      key: 'Option2',
      width: 120,
      render: item => (
        <Fragment>
          {item.specification_type == 1 ? (
            utils.handleMoney(item.lunch_box_fee, 0)
          ) : (
              <div className={styles.gui_ge}>
                {item.specification.length > 0 &&
                  item.specification.map((item1, k) => {
                    return <div key={k}>{utils.handleMoney(item1.lunch_box_fee, 0)}</div>;
                  })}
              </div>
            )}
        </Fragment>
      ),
    },
    {
      title: '库存',
      key: 'Option3',
      width: 120,
      render: item => (
        <Fragment>
          {item.specification_type == 1 ? (
            item.quantity_status == 1 ? ('-') : item.quantity
          ) : (
              <div className={styles.gui_ge}>
                {item.specification.length > 0 &&
                  item.specification.map((item1, k) => {
                    return <div key={k}>{item1.quantity}</div>;
                  })}
              </div>
            )}
        </Fragment>
      ),
    },
    {
      title: '销量',
      key: 'Option4',
      width: 120,
      render: item => (
        <Fragment>
          {item.specification_type == 1 ? (
            item.sale_num
          ) : (
              <div className={styles.gui_ge}>
                {item.specification.length > 0 &&
                  item.specification.map((item1, k) => {
                    return <div key={k}>{item1.sale_num}</div>;
                  })}
              </div>
            )}
        </Fragment>
      ),
    },
    {
      title: '属性',
      render: (text, record) =>
        (record.attribute || []).map((item, i) => (
          <dl key={i} className="common_dl">
            <dt>{item.name}：</dt>
            <dd style={{ maxWidth: 220 }}>
              {(item.tag_list || []).map((tag, k) => (
                <span key={k}>{item.tag_list.length == k + 1 ? tag.name : tag.name + '、'}</span>
              ))}
            </dd>
          </dl>
        )),
    },
    {
      title: '库存类型',
      dataIndex: 'quantity_status',
      render(val) {
        return <span>{quantity_status[val]}</span>;
      },
    },
    {
      title: '商品状态',
      dataIndex: 'sell_type',
      render(val) {
        return <span>{status[val]}</span>;
      },
    },
    {
      title: '操作',
      width: 140,
      render: (text, record) => (
        <Fragment>
          {record.status == '1' ? (
            <Popconfirm
              placement="left"
              title="确定要下架该商品？"
              onConfirm={() => {
                this.changeStatus(record.id, 2, '下架成功');
              }}
            >
              <a>下架</a>
            </Popconfirm>
          ) : (
              <Popconfirm
                placement="left"
                title="确定要上架该商品？"
                onConfirm={() => {
                  this.changeStatus(record.id, 1, '上架成功');
                }}
              >
                <a>上架</a>
              </Popconfirm>
            )}
          <Divider type="vertical" />
          <Link
            to={
              '/merchant/commodity/edit?merchant_id=' + this.state.merchant_id + '&id=' + record.id
            }
          >
            编辑
          </Link>
          <Divider type="vertical" />
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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

      const values = {
        ...fieldsValue,
        price: fieldsValue['price'].join(',') == ',' ? undefined : fieldsValue['price'].join(','),
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
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商品名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="库存类型">
              {getFieldDecorator('quantity_status')(
                <Select placeholder="请选择" allowClear>
                  <Option value="2">有限库存</Option>
                  <Option value="1">无限库存</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="价格">
              <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                {getFieldDecorator('price[0]')(<Input placeholder="最低价" />)}
              </FormItem>
              <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>
                至
              </span>
              <FormItem style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                {getFieldDecorator('price[1]')(<Input placeholder="最高价" />)}
              </FormItem>
            </FormItem>
          </Col>
          <Col xl={5} md={8} sm={24}>
            <FormItem label="商品状态">
              {getFieldDecorator('sell_type')(
                <Select placeholder="请选择" allowClear>
                  {status.map((item, i) => {
                    if (i > 0) {
                      return (
                        <Option value={i} key={i}>
                          {item}
                        </Option>
                      );
                    }
                  })}
                </Select>
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

  handleModalVisible = (flag, id) => {
    this.setState({
      modalVisible: !!flag,
      editFormValues: {},
    });
    if (!id) return;
    // 获取编辑信息
    getMcategoryInfo({
      id: id,
    }).then(res => {
      if (!utils.successReturn(res)) return;
      this.setState({
        editFormValues: res.data.items,
      });
    });
  };

  removeClassfy = id => {
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', id);
        dispatch({
          type: 'mdish/fetchMcategoryDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getMcategoryList();
          },
        });
      },
    });
  };

  handleAdd = fields => {
    // console.log(fields);
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('merchant_id', this.state.merchant_id);
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    if (fields.id) {
      dispatch({
        type: 'mdish/fetchEditMcategory',
        payload: formData,
        callback: res => {
          if (!utils.successReturn(res)) return;
          message.success('保存成功');
          this.getMcategoryList();
          this.handleModalVisible();
        },
      });
    } else {
      dispatch({
        type: 'mdish/fetchSaveMcategory',
        payload: formData,
        callback: res => {
          if (!utils.successReturn(res)) return;
          message.success('添加成功');
          this.getMcategoryList();
          this.handleModalVisible();
        },
      });
    }
  };

  // 快捷上下架
  changeStatus = (id, status, msg) => {
    const { selectedRows } = this.state;
    if (id == '-1') {
      if (selectedRows.length == 0) return message.info('请先选择商品');
      confirm({
        title: msg,
        content: '确定' + msg + '？',
        onOk: () => {
          let arr = [];
          for (let i = 0; i < selectedRows.length; i++) {
            arr.push(selectedRows[i].id);
          }
          id = arr.join(',');
          this.postStatus(id, status, msg);
        },
      });
    } else {
      this.postStatus(id, status, msg);
    }
  };
  postStatus = (id, status, msg) => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('ids', id);
    formData.append('status', status);
    dispatch({
      type: 'mdish/fetchChangeStatus',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success(msg);
        this.getList();
      },
    });
  };

  handleDelete = fields => {
    // console.log(fields);
    const { dispatch } = this.props;
    confirm({
      title: '温馨提示',
      content: '确认是否删除？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'mdish/fetchMdishDelete',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      },
    });
  };

  render() {
    const {
      mdish: { mdishList, mcategoryList },
      loading,
    } = this.props;
    const { merchant_id, modalVisible, selectedRows, editFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <div className={stylesIndex.body_row}>
        <div className={`${stylesIndex.screen_wrap} clearfix`}>
          <div className={stylesIndex.left}>
            <span className={stylesIndex.showData}>
              全部 {(mcategoryList && mcategoryList.all_dish) || 0}
            </span>
            <span className={stylesIndex.showData}>
              售卖中 {(mcategoryList && mcategoryList.sell_dish) || 0}
            </span>
            <span className={stylesIndex.showData}>
              已下架 {(mcategoryList && mcategoryList.down_dish) || 0}
            </span>
            <span className={stylesIndex.showData}>
              已售完 {(mcategoryList && mcategoryList.over_dish) || 0}
            </span>
            {/* <Radio.Group defaultValue="1">
              <Radio.Button value="1">全部 {mcategoryList.all_dish}</Radio.Button>
              <Radio.Button value="2">售卖中 {mcategoryList.sell_dish}</Radio.Button>
              <Radio.Button value="3">已下架 {mcategoryList.down_dish}</Radio.Button>
              <Radio.Button value="4">已售完 {mcategoryList.over_dish}</Radio.Button>
            </Radio.Group> */}
          </div>
          <div className={stylesIndex.right}>
            <Link to={'/merchant/commodity/create?merchant_id=' + merchant_id}>
              <Button type="primary" className={stylesIndex.right_btn} icon="plus">
                新增商品
              </Button>
            </Link>
            <Button
              className={stylesIndex.right_btn}
              onClick={() => this.changeStatus('-1', 1, '批量上架成功')}
            >
              批量上架
            </Button>
            <Button
              className={stylesIndex.right_btn}
              onClick={() => this.changeStatus('-1', 2, '批量下架成功')}
            >
              批量下架
            </Button>
          </div>
        </div>
        <div className={stylesIndex.content_wrap}>
          <div className={stylesIndex.content_left}>
            <div className={`${stylesIndex.classify_btn} clearfix`}>
              <div className={stylesIndex.left}>
                <a onClick={() => this.handleModalVisible(true)}>新增分类</a>
              </div>
              <CreateForm {...parentMethods} modalVisible={modalVisible} values={editFormValues} />
              {/* <div className={stylesIndex.right}><a onClick={this.addClassify}>编辑</a></div> */}
            </div>
            <ul className={stylesIndex.classify_list}>
              <li>
                <a
                  onClick={() => {
                    this.getList();
                  }}
                >
                  全部（{(mcategoryList && mcategoryList.all_dish) || 0}）
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    this.getList({ category_id: 0 });
                  }}
                >
                  未分类（{(mcategoryList && mcategoryList.not_dish) || 0}）
                </a>
              </li>
              {((mcategoryList && mcategoryList.list) || []).map((item, i) => (
                <li key={i}>
                  <a
                    onClick={() => {
                      this.getList({ category_id: item.id });
                    }}
                  >
                    {item.name}（{item.mdish_count}）
                  </a>
                  <span className={stylesIndex.icon_btn}>
                    <Icon
                      type="edit"
                      title="编辑"
                      className={`${stylesIndex.anticon} ${stylesIndex.anticon_edit}`}
                      onClick={() => this.handleModalVisible(true, item.id)}
                    />
                    <Icon
                      type="close"
                      title="删除"
                      className={`${stylesIndex.anticon} ${stylesIndex.anticon_close}`}
                      onClick={() => this.removeClassfy(item.id)}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={stylesIndex.content_right}>
            <div className={styles.tableList}>
              <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
              <StandardTable
                rowKey={list => list.id}
                selectedRows={selectedRows}
                loading={loading}
                data={mdishList}
                columns={this.columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Commodity;
