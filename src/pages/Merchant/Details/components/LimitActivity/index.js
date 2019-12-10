import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, InputNumber, Button, Modal, message, Radio, Icon, Divider, Checkbox, TimePicker } from 'antd';
import utils from '@/utils/utils';
import styles from '../../index.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const format = 'HH:mm';

// 添加商品
class CreateDishes extends Component {
  state = {
    checkedList: [], // checkbox已选择的选项
    indeterminate: [], // 全选框-已有选择非全选
    checkAll: {}, // checkbox group 的全部title状态true/false
    tempList: [], // 临时存储checkbox已选择的选项
    checkTitle: {} // checkbox group中已选择的title（全选）
  }

  componentDidMount(){

  }

  onChange = (allCheckArr, checkedList) => {
    // let checkAll = this.state.checkAll;
    // let indeterminate = [];
    // let checkTitle = {};
    // Object.keys(allCheckArr).forEach((name) => {
    //   checkTitle[name] = 0;
    //   for (let checkedItem of checkedList || []) {
    //     if (allCheckArr[name].includes(checkedItem)) {
    //       checkTitle[name]++;
    //       checkAll[name] = checkTitle[name] === allCheckArr[name].length;
    //       indeterminate[name] = !!checkTitle[name] && (checkTitle[name] < allCheckArr[name].length);
    //     }
    //   }
    //   if (checkTitle[name] === 0) { // 选项组下仅有一个选项时取消选中
    //     checkAll[name] = false;
    //   }
    // });
    // this.setState({
    //   checkedList,
    //   tempList: checkedList,
    //   indeterminate: indeterminate,
    //   checkAll: checkAll,
    //   checkTitle: checkTitle
    // });
  };

  onCheckAllChange = (allCheckArr, name, e) => {
    // this.state.checkAll[name] = e.target.checked;
    // let checkedListT = [];
    // checkedListT.push(...this.state.checkedList);
    // let indeterminate = this.state.indeterminate || [];
    // let checkTitle = this.state.checkTitle || {};
    // if (e.target.checked === true) { // 全选
    //   checkedListT.push(...allCheckArr[name]);
    //   checkedListT = Array.from(new Set(checkedListT)); // 去重（原先indeterminate为true的情况）
    //   checkTitle[name] = allCheckArr[name].length;
    // } else { // 取消全选
    //   let common = checkedListT.filter(v => allCheckArr[name].includes(v));
    //   checkedListT = checkedListT.concat(common).filter(v => checkedListT.includes(v) && !common.includes(v));
    //   checkTitle[name] = 0;
    // }
    // indeterminate[name] = false;
    // this.setState({
    //   tempList: checkedListT,
    //   checkedList: checkedListT,
    //   indeterminate: indeterminate,
    //   checkTitle: checkTitle
    // });
  };

  saveActivityDishes = () => {
    console.log('saveActivityDishes');

  }

  render() {
    const { modalVisible, handledishesModal } = this.props;
    const { plainOptions, indeterminate, checkAll, checkedList } = this.state;

    const data = [
      {
        "name": "分类名字",
        "mdish": [
          {
            "name": "线集门",
            "dish_id": 1,
            "price": 18
          },
          {
            "name": "线集门2",
            "dish_id": 2,
            "price": 18
          }
        ]
      },
      {
        "name": "分类名字2",
        "mdish": [
          {
            "name": "线集门",
            "dish_id": 3,
            "price": 18
          },
          {
            "name": "线集门2",
            "dish_id": 4,
            "price": 18
          }
        ]
      }
    ];
    let data1 = [];
    for (let i = 0; i < data.length; i++) {
      let mdish = [];
      data[i].mdish.forEach(el => {
        mdish.push({
          'label': el.name,
          'value': el.dish_id
        });
      })
      data1.push({
        'name': data[i].name,
        'mdish': mdish
      })
    }

    console.log(data1);
    

    return (
      <Modal
        width={460}
        bodyStyle={{padding: 0}}
        destroyOnClose
        title="选择商品"
        visible={modalVisible}
        onOk={this.saveActivityDishes}
        onCancel={() => handledishesModal()}
      >
        <div className={styles.activity_dishes_box}>
          <div className={styles.activity_dishes_item}>
            {
              data1.map(({ name, mdish}, k)=>(
                <div key={k}>
                  <div className={styles.title}>
                    <Checkbox
                      indeterminate={indeterminate}
                      onChange={this.onCheckAllChange.bind(this, data1, name)}
                      checked={checkAll[name]}
                      className="activity_dishes_title"
                    >{name}</Checkbox>
                  </div>
                  <div className={styles.checkbox_list}>
                    <CheckboxGroup
                      options={mdish}
                      value={checkedList}
                      onChange={this.onChange.bind(this, data1)}
                      className="checkbox_list_item"
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </Modal>
    )
  }
}

let key_num = 1;
let limit_activity_data = [];
let time_key_num = 1;

@connect(({ merchant, loading }) => ({
  merchant,
  loading: loading.models.merchant,
}))
@Form.create()
class index extends Component {
  state = {
    merchant_id: '',
    modalVisible: false,
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    const { params } = this.props;

    this.setState({
      merchant_id: params.id
    }, () => {
      // this.getInfo()
    });
  }

  getInfo = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'merchant/fetchBasicInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        // console.log(res);
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        // this.setState({
        // });
        // form.setFieldsValue({
        // })
      }
    });
  }

  // 商品标签弹窗
  handledishesModal = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  renderTimePeriod = (key) => {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('timeKeys');
      if (keys.length === 1) {
        // addCategory();
        message.info("请再新增一个，才可以删除哦")
        return;
      }
      form.setFieldsValue({
        timeKeys: keys.filter(key => key !== k),
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('timeKeys');
      const nextKeys = keys.concat(time_key_num++);
      form.setFieldsValue({
        timeKeys: nextKeys,
      });
    };
    getFieldDecorator('timeKeys', { initialValue: [0] });
    const keys = getFieldValue('timeKeys');
    const formItems = keys.map((k, index) => (
      <div key={k} style={{ position: 'relative', width: 282 }}>
        <div>
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`limit_activity[${key}][time_period][${k}][start_time]`, {
              rules: [{ required: true, message: '必填' }],
            })(<TimePicker format={format} />)}
          </FormItem>
          <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>至</span>
          <FormItem style={{ display: 'inline-block' }}>
            {form.getFieldDecorator(`limit_activity[${key}][time_period][${k}][end_time]`, {
              rules: [{ required: true, message: '必填' }],
            })(<TimePicker format={format} />)}
          </FormItem>
        </div>
        <span>
          {
            keys.length == index + 1 && (
              <Icon
                className="dynamic-button"
                type="plus-circle"
                title="新增"
                onClick={addCategory}
              />
            )
          }
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => removeCategory(k)}
          />
        </span>
      </div>
    ));

    return formItems;
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue);
      if (!err) {

      }
    });
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { modalVisible, } = this.state;

    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    };
    const formLayout_two = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const formLayoutWithOutLabel = {
      wrapperCol: { span: 12, offset: 3 },
    };

    // 添加多项分类事件
    const removeCategory = k => {
      const keys = getFieldValue('keys');
      if (keys.length === 1) {
        // addCategory();
        message.info("请再新增一个，才可以删除哦")
        return;
      }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    };
    const addCategory = () => {
      const keys = getFieldValue('keys');
      const nextKeys = keys.concat(key_num++);
      form.setFieldsValue({
        keys: nextKeys,
      });
    };
    getFieldDecorator('keys', { initialValue: [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <div className="form-col-box coupon-list-box" key={k} style={{ width: 762 }}>
        <Divider><span>规则{index + 1}</span></Divider>
        <div>
          <FormItem {...formLayout_two} label="优惠券类型">
            {getFieldDecorator(`limit_activity[${k}][promotion_day]`, {
              rules: [{ required: true, message: '必填' }],
            })(
              <Checkbox.Group style={{ width: 486 }}>
                <Checkbox value="0">周一</Checkbox>
                <Checkbox value="1">周二</Checkbox>
                <Checkbox value="2">周三</Checkbox>
                <Checkbox value="3">周四</Checkbox>
                <Checkbox value="4">周五</Checkbox>
                <Checkbox value="5">周六</Checkbox>
                <Checkbox value="6">周日</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
          <FormItem {...formLayout_two} label="指定时段" required>
            {this.renderTimePeriod(k)}
          </FormItem>
          <FormItem {...formLayout_two} label="状态">
            {getFieldDecorator(`limit_activity[${k}][status]`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout_two} label="活动商品" required>
            <div>
              <Button type="primary" onClick={() => { this.handledishesModal(true, k) }}>添加</Button>
              <Button style={{ marginLeft: 8 }}>清空已选</Button>
            </div>
            {
              modalVisible && (
                <CreateDishes
                  modalVisible={modalVisible}
                  handledishesModal={this.handledishesModal}
                />
              )
            }
          </FormItem>
          <FormItem {...formLayout_two} label="已选择">
            <div className={styles.limit_dishes_box}>
              <h4><span>北京烤鸭</span></h4>
              <div>
                <span>活动库存</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][quantity]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>每人限购数量</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][each_person_amount]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>活动折扣</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][discount]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>折</span>
              </div>
            </div>
            <div className={styles.limit_dishes_box}>
              <h4><span>北京烤鸭</span></h4>
              <div>
                <span>活动库存</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][quantity]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>每人限购数量</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][each_person_amount]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>活动折扣</span>
                <FormItem style={{ display: 'inline-block', padding: '0 6px' }}>
                  {getFieldDecorator(`limit_activity[${k}][limit_activity_dishes][i][discount]`, {
                    rules: [{ required: true, message: '必填' }, { message: '请输入数字！', pattern: utils.isRealNum() }],
                  })(<Input placeholder="请输入" style={{ width: 70 }} />)}
                </FormItem>
                <span>折</span>
              </div>
            </div>
          </FormItem>
        </div>
        <span>
          <Icon
            className="dynamic-button"
            type="plus-circle"
            title="新增"
            onClick={addCategory}
          />
          <Icon
            className="dynamic-button"
            type="minus-circle-o"
            title="删除"
            onClick={() => removeCategory(k)}
          />
        </span>
      </div>
    ));

    return (
      <Card bordered={false}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formLayout} label="商家操作权限">
            {getFieldDecorator('limit_activity_permission', {
              initialValue: 2,
            })(
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem {...formLayout} label="限时促销">
            {formItems}
          </FormItem>
          <FormItem {...formLayoutWithOutLabel} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">保存</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { this.getInfo() }}>取消</Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

export default index;