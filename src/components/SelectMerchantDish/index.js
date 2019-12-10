import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Row, Col, Modal, Transfer, Tree, Radio } from 'antd';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { TreeNode } = Tree;




@connect(({ common }) => ({
  common,
}))
@Form.create()
export default class SelectMerchantDish extends Component {
  static defaultProps = {
    handleSelectMerchantDish: () => { },
    handleSelectMerchantDishModalVisible: () => { },
    values: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      formVals: {
        key: props.values.key,
      },
      mockData: [],
      targetKeys: [],
      merchantDish: []
    };
  }

  componentDidMount () {
    const { common } = this.props;
    // const { merchant = [] } = common;

    // this.getMerchantList()
    this.getMock();


  }

  // 商家商品数据列表
  getMerchantList = (e) => {
    const { dispatch } = this.props
    dispatch({
      type: 'common/getMerchantDish',
      callback: res => {
        if (!utils.successReturn(res)) return;
        // console.log('菜品列表', res)
        this.setState({
          merchantDish: res.data.items
        }, () => {
          // this.getMock();
        })
      }
    })

  }


  handleChange = (targetKeys, direction, moveKeys) => {
    console.log(targetKeys, direction, moveKeys);
    this.setState({ targetKeys });
  };

  renderItem = item => {
    const customLabel = (
      // <span className="custom-item">
      //   {item.title} - {item.description}
      // </span>
      // <Radio.Group onChange={this.onChange} value={this.state.value}>
      <Radio value={item.key}>{item.title}</Radio>
    );

    return {
      label: customLabel, // for displayed item
      value: item.title, // for title and filter matching
    };
  };

  getMock = () => {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 10; i++) {
      const data = {
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        // chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  };


  filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;

  handleChange = targetKeys => {
    this.setState({ targetKeys });
    console.log('targetKeys:', targetKeys);
  };

  handleSearch = (dir, value) => {
    console.log('search:', dir, value);
  };

  render () {
    const { selectMerchantDishModalVisible, handleSelectMerchantDishModalVisible, values, form: { getFieldDecorator },
      common } = this.props;
    const { formVals, mockData, targetKeys } = this.state;
    const { merchant = [] } = common;

    return (
      <Modal
        width={860}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="选择菜品"
        visible={selectMerchantDishModalVisible}
        onOk={() => handleSelectMerchantDishModalVisible(false, values)}
        onCancel={() => handleSelectMerchantDishModalVisible(false, values)}
      >

        <Transfer
          dataSource={mockData}
          listStyle={{
            width: 366,
            height: 460,
          }}
          targetKeys={targetKeys}
          onChange={this.handleChange}
          render={this.renderItem}
        />
        {/* <TreeTransfer
         dataSource={treeData} 
           showSearch
          listStyle={{
            width: 366,
            height: 460,
          }}
           targetKeys={targetKeys}
            onChange={this.onChange} /> */}
        {/* <Transfer
          dataSource={mockData}
          showSearch
          listStyle={{
            width: 366,
            height: 460,
          }}
          filterOption={this.filterOption}
          targetKeys={targetKeys}
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          render={item => item.title}
        /> */}
      </Modal>
    );
  }
}
