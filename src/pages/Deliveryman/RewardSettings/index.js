import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Form, Input, Button, Divider, Table, message, InputNumber } from 'antd';
import StandardTable from '@/components/StandardTable';
import utils,{ getMenu } from '@/utils/utils';
import styles from './index.less';

@connect(({ list, deliverymanMemberList, common, loading }) => ({
  list,
  common,
  deliverymanMemberList,
  loading: loading.models.list,
}))
@Form.create()
class RewardSettings extends PureComponent {
  state = {
    menu: [],
  };
  componentDidMount() {
    this.fetchMenu();
    this.getList();
  }
  //获取动态的功能菜单
  fetchMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        this.setState({
          menu: getMenu(res.data.items, 'deliveryman', 'rewardSettings'),
        });
      },
    });
  };
  //获取列表的数据
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverymanMemberList/fetchDriverList',
      payload: null,
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.setState({
          list: res.data.items,
        });
      },
    });
  };
  handleChange = (value, record, index, name) => {
    /* for (var i in value) {
      record[i] = value[i]; //这一句是必须的，不然状态无法更改
      this.setState({
        list: this.state.list.map((item, key) =>
          item.key == record.id ? { ...item, [i]: name == 'basic_price' ? utils.handleMoney(value[i], 1) : value[i] } : item
        ),
      });
    } */
    let arr = this.state.list;
    arr.forEach((item, key) => {
      if (key == index) {
        if (name == 'basic_price') {
          item.basic_price = utils.handleMoney(value, 1);
        }
        if (name == 'once_receive_deliver') {
          item.once_receive_deliver = value;
        }
      }
    });
    this.setState({
      list: [...arr],
    });
  };
  handleChange1 = (value, record, index, name) => {
    var arr = [];
    arr = this.state.list;
    arr.forEach((item, key) => {
      if (key == index) {
        item.d_driver_grade_award.bring_price.forEach((item1, index) => {
          if (name == 'gt') {
            if (index == 0) {
              item1.gt = value;
            }
          }
          if (name == 'price') {
            if (index == 0) {
              item1.price = utils.handleMoney(value, 1);
            }
          }
          if (name == 'lt') {
            if (index == 1) {
              item1.lt = value;
            }
          }
          if (name == 'price1') {
            if (index == 1) {
              item1.price = utils.handleMoney(value, 1);
            }
          }
        });
        if (name == 'deliver_on_time_rate') {
          item.d_driver_grade_award.award_price.deliver_on_time_rate = value;
        }
        if (name == 'deliver_price') {
          item.d_driver_grade_award.award_price.price = utils.handleMoney(value, 1);
        }
        if (name == 'append_price') {
          item.d_driver_grade_award.append_price = utils.handleMoney(value, 1);
        }
      }
    });
    this.setState({
      list: [...arr],
    });
  };
  //保存
  handleSave = () => {
    const { dispatch } = this.props;
    let formData = new FormData();
    let data = this.state.list;
    let submitData = [];
    data.forEach(item => {
      (item.bring_price = item.d_driver_grade_award.bring_price),
        (item.award_price = item.d_driver_grade_award.award_price),
        (item.append_price = item.d_driver_grade_award.append_price);
    });
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      submitData.push({
        "id": data[i].id,
        "basic_price": data[i].basic_price,
        "once_receive_deliver": data[i].once_receive_deliver,
        "bring_price": [
          { "gt": data[i].d_driver_grade_award.bring_price[0].gt, "price": data[i].d_driver_grade_award.bring_price[0].price },
          { "lt": data[i].d_driver_grade_award.bring_price[1].lt, "price": data[i].d_driver_grade_award.bring_price[1].price }
        ],
        "award_price": { "deliver_on_time_rate": data[i].d_driver_grade_award.award_price.deliver_on_time_rate, "price": data[i].d_driver_grade_award.award_price.price },
        "append_price": data[i].d_driver_grade_award.append_price,
      })
    }
    // console.log(data);
    // console.log(submitData);
    formData.append('value', JSON.stringify(submitData));
    dispatch({
      type: 'deliverymanMemberList/fetchDriverDradeEdit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
        this.getList();
      },
    });
  };
  columns = [
    {
      title: '骑手级别',
      dataIndex: 'name',
    },
    {
      title: '底薪（按美元）',
      dataIndex: 'basic_price',
      // render: val => <span>${val}</span>,
      render: (text, record, index) => (
        <InputNumber
          min={0}
          max={9999}
          value={utils.handleMoney(text,0)}
          className={styles.inputText}
          onChange={e => this.handleChange(e, record, index, 'basic_price')}
        />
      ),
    },
    {
      title: '在途接单上限',
      dataIndex: 'once_receive_deliver',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          max={9999}
          value={text}
          className={styles.inputText}
          onChange={e => this.handleChange(e, record, index, 'once_receive_deliver')}
        />
      ),
    },
    {
      title: '提成（按美元）',
      dataIndex: 'd_driver_grade_award',
      render: (text, record, index) => (
        <div>
          {record.d_driver_grade_award && record.d_driver_grade_award.bring_price ? (
            <div>
              <div>
                大于
                <InputNumber
                  min={0}
                  max={9999}
                  defaultValue={record.d_driver_grade_award.bring_price[0].gt}
                  className={styles.inputText}
                  onChange={e => this.handleChange1(e, record, index, 'gt')}
                />
                单，按
                <InputNumber
                  min={0.1}
                  max={9999}
                  defaultValue={utils.handleMoney(record.d_driver_grade_award.bring_price[0].price, 0)}
                  className={styles.inputText}
                  onChange={e => this.handleChange1(e, record, index, 'price')}
                />
                /单计算
              </div>
              <div style={{ marginTop: 6 }}>
                小于
                <InputNumber
                  min={0}
                  max={9999}
                  defaultValue={record.d_driver_grade_award.bring_price[1].lt}
                  className={styles.inputText}
                  onChange={e => this.handleChange1(e, record, index, 'lt')}
                />
                单，按
                <InputNumber
                  min={0.1}
                  max={9999}
                  defaultValue={utils.handleMoney(record.d_driver_grade_award.bring_price[1].price, 0)}
                  className={styles.inputText}
                  onChange={e => this.handleChange1(e, record, index, 'price1')}
                />
                /单计算
              </div>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: '奖励（按美元）',
      render: (val, record, index) => (
        <div>
          {record.d_driver_grade_award ? (
            <div>
              准时率达
              <InputNumber
                min={0}
                max={100}
                value={record.d_driver_grade_award.award_price.deliver_on_time_rate}
                className={styles.inputText}
                onChange={e => this.handleChange1(e, record, index, 'deliver_on_time_rate')}
              />
              %，奖励
              <InputNumber
                min={0}
                max={100}
                value={utils.handleMoney(record.d_driver_grade_award.award_price.price, 0)}
                className={styles.inputText}
                onChange={e => this.handleChange1(e, record, index, 'deliver_price')}
              />
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: (
        <>
          晚班时间段（按美元）<div>(21:00-24:00)</div>
        </>
      ),
      render: (val, record, index) => (
        <div>
          {record.d_driver_grade_award && record.d_driver_grade_award.append_price ? (
            <div>
              每单加
              <InputNumber
                min={0.1}
                max={9999}
                value={utils.handleMoney(record.d_driver_grade_award.append_price, 0)}
                className={styles.inputText}
                onChange={e => this.handleChange1(e, record, index, 'append_price')}
              />
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  render() {
    const {
      loading,
      deliverymanMemberList: { data1 },
    } = this.props;
    return (
      <Card bordered={false}>
        <div className="page_head">
          <span className="page_head_title">奖励设置</span>
        </div>
        <div>
          <Table
            rowKey={list => list.id}
            loading={loading}
            bordered
            dataSource={this.state.list}
            columns={this.columns}
            pagination={false}
          />
          <div className="text-center main-24">
            {this.state.menu.indexOf('save') != -1 ? (
              <Fragment>
                <Button type="primary" onClick={this.handleSave}>
                  保存
                </Button>
                <Link to="/deliveryman/rewardSettings">
                  <Button style={{ marginLeft: 8 }}>取消</Button>
                </Link>
              </Fragment>
            ) : (
              ''
            )}
          </div>
        </div>
      </Card>
    );
  }
}

export default RewardSettings;
