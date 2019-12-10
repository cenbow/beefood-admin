import React, { PureComponent, Fragment, useState } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Tabs, Table, Modal, message, Upload, Radio, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import moment from 'moment';
import styles from '@/assets/css/TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const numReg = /^[0-9]*[1-9][0-9]*$/; //正整数,除0
// 新增
@Form.create()
class CreateForm extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // 关闭弹窗时，解决图片残留问题
  closeModal = () => {
    this.props.handleModalVisible();
  };

  maxAndMin = (arr) => {
    let _arr = arr.sort();
    return _arr.pop()
  }

  okHandle = () => {
    const { form, handleAdd } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.level_1 || fieldsValue.level_2 || fieldsValue.level_3) {
        const newFieldsValue = new Object();
        const keyArr = []
        for (const key in fieldsValue) {
          if (fieldsValue.hasOwnProperty(key)) {
            const val = fieldsValue[key];
            if (val !== undefined && val !== '') {
              if (key.indexOf('level_') != -1) {
                keyArr.push(Number(key.substr(-1, 2)))
              }
              newFieldsValue[key] = val;
            }
          }
        }
        let categoryId = null
        let MaxId = this.maxAndMin(keyArr)
        const values = {
          ...newFieldsValue,
        };

        switch (MaxId) {
          case 3:
            categoryId = newFieldsValue.level_3
            break;
          case 2:
            categoryId = newFieldsValue.level_2
            break;
          case 1:
            categoryId = newFieldsValue.level_1
            break;
          default:
            break;
        }
        const lastVal = {
          category_id: categoryId,
          sort: Number(newFieldsValue.sort),
        }
        // console.log('传参', values, lastVal);
        handleAdd(lastVal);
      } else {
        return message.error('至少选三个级别中的一个分类')
      }

    });
  };

  render () {
    const { modalVisible, form, handleModalVisible, common } = this.props;
    const { levelMCategory = [] } = common
    return (
      <Modal
        width={640}
        destroyOnClose
        title="设置分类"
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={() => handleModalVisible(false)}
      >
        <Form>
          <FormItem {...formLayout} label="一级分类">
            {form.getFieldDecorator('level_1', {
            })(
              <Select
                placeholder="请选择"
                style={{ width: '100%' }}
                allowClear
              >
                {(levelMCategory.level_1 || []).map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="二级分类">
            {form.getFieldDecorator('level_2', {
            })(
              <Select
                placeholder="请选择"
                style={{ width: '100%' }}
                allowClear
              >
                {(levelMCategory.level_2 || []).map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="三级分类">
            {form.getFieldDecorator('level_3', {
            })(
              <Select
                placeholder="请选择"
                style={{ width: '100%' }}
                allowClear
              >
                {(levelMCategory.level_3 || []).map((item, i) => (
                  <Option value={item.id} key={i}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label="序号">
            {form.getFieldDecorator('sort', {
              rules: [{ required: true, message: '请输入1以上的正整数', pattern: numReg }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}




// 列表
@connect(({ common, indexMCategory, loading }) => ({
  common,
  indexMCategory,
  loading: loading.effects['indexMCategory/fetchIndexMCategoryList'],
}))
@Form.create()
class Activity extends PureComponent {
  state = {
    modalVisible: false,
  };

  columns = [
    {
      title: '序号',
      dataIndex: 'sort',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '图标',
      dataIndex: 'm_category.icon',
      render: url => <ShowImg className="avatar-48" src={url} />,
    },
    {
      title: '分类名称',
      dataIndex: 'm_category.name',
    },
    {
      title: '级别',
      dataIndex: 'm_category.level',
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      width: 80,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount () {
    this.getList();
    this.getLevelMCategory()
  }

  getList = (params) => {
    const { dispatch } = this.props;
    let getParams = {
      page: 1,
      pagesize: 25,
      ...params
    }
    dispatch({
      type: 'indexMCategory/fetchIndexMCategoryList',
      payload: getParams
    });
  }
  // 商家分类分级数据
  getLevelMCategory = () => {
    const { dispatch } = this.props;
    // 选择分类
    dispatch({
      type: 'common/getLevelMCategory',
      payload: null,
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

      if (newFieldsValue.create_time !== undefined) {
        const startTimeArr = newFieldsValue.create_time
        const s_startTime = moment(startTimeArr[0].startOf('day')).unix()
        const s_endTime = moment(startTimeArr[1].startOf('day')).unix()
        newFieldsValue.create_time = `${s_startTime},${s_endTime}`
      }

      const values = {
        ...newFieldsValue,
      };

      this.setState({
        formValues: values,
      });

      // console.log('搜索', values);

      this.getList(values);
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'indexMCategory/fetchAddIndexMCategory',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('添加成功');
        this.getList();
        this.handleModalVisible();
      },
    });
  };

  handleDelete = fields => {
    console.log(fields);
    const { dispatch } = this.props
    confirm({
      title: '温馨提示',
      content: '确定删除此分类设置吗？',
      onOk: () => {
        let formData = new FormData();
        formData.append('id', fields.id);
        dispatch({
          type: 'indexMCategory/fetchDeleteIndexMCategory',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('删除成功');
            this.getList();
          },
        });
      }
    });
  }


  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="分类名称">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
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

  render () {
    const {
      indexMCategory: { data },
      loading,
      common
    } = this.props;
    const { modalVisible, updateModalVisible, editFormValues } = this.state;
    const {
      levelMCategory = []
    } = common;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <Fragment>
        <div className={styles.tableList} style={{ paddingTop: 24 }}>
          <div className="page_head">
            <span className="page_head_title">首页分类设置</span>
            <span className="fr">
              <Button icon="setting" type="primary" onClick={() => this.handleModalVisible(true)}>设置分类</Button>
            </span>
          </div>
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
        {modalVisible && (
          <CreateForm {...parentMethods} modalVisible={modalVisible} common={common} />
        )}
      </Fragment>
    );
  }
}

export default Activity;