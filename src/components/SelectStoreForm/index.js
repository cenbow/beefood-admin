import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Row, Col, Modal, Transfer, message, Table, Tag } from 'antd';
import utils from '@/utils/utils';
import difference from 'lodash/difference';

const FormItem = Form.Item;
// Customize Table Transfer
const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;

      const rowSelection = {
        getCheckboxProps: item => ({ disabled: listDisabled || item.disabled }),
        onSelectAll (selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect ({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{ pointerEvents: listDisabled ? 'none' : null }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);


const leftTableColumns = [
  {
    dataIndex: 'key',
    title: 'ID',
    render: key => <span>{key}</span>,
  },
  {
    title: '商家名称',
    dataIndex: 'title',
    render: title => <span>{title}</span>,

  },
];
const rightTableColumns = [
  {
    dataIndex: 'key',
    title: 'ID',
    render: key => <span>{key}</span>,
  },
  {
    dataIndex: 'title',
    title: '商家名称',
    render: title => <span>{title}</span>,
  },
];
@connect(({ common }) => ({
  common,
}))
@Form.create()
export default class SelectStoreForm extends Component {
  static defaultProps = {
    handleSelectStore: () => { },
    handleSelectStoreModalVisible: () => { },
    values: {},
    hasMerchantInfo: false
  };

  constructor(props) {
    super(props);
    this.state = {
      formVals: {
        key: props.values.key,
      },
      mockData: [],
      targetKeys: [],
      merchant: [],
      hasMerchantInfo: props.hasMerchantInfo,
      selectableNum: props.selectableNum,
      disabled: false,
      merchant_id: props.merchant_id
    };
    console.log(' this.props 选择商家', this.props);

  }

  componentDidMount () {
    const { merchant_id } = this.props;
    const { targetKeys } = this.state
    // console.log(' this.props', this.props);

    // const { merchant = [] } = common;
    const merchant_idArr = []
    if (merchant_id) {
      console.log('componentDidMount 选择商家', merchant_id);
      const merchantIdArr = merchant_id.split(",")
      const merchantIdNumArr = merchantIdArr.map((item) => {
        return Number(item)
      })
      this.setState({
        targetKeys: merchantIdNumArr
      }, () => {
        console.log('merchant_idArr', this.state.targetKeys);
      })
    }

    this.getMerchantList()
  }

  // 商家列表
  getMerchantList = (e) => {
    const { dispatch } = this.props
    dispatch({
      type: 'common/getMerchant',
      callback: res => {
        if (!utils.successReturn(res)) return;
        // console.log('商家列表', res)
        this.setState({
          merchant: res.data.items
        }, () => {
          this.getMock();
        })
      }
    })

  }

  getMock = () => {
    const { merchant } = this.state;
    const targetKeys = [];
    const mockData = [];
    const merchantData = merchant

    for (let i = 0; i < merchantData.length; i++) {
      const element = merchantData[i];
      const data = {
        key: merchantData[i].merchant_id,
        title: `${merchantData[i].name}`,
        description: `${merchantData[i].name}-${merchantData[i].merchant_id}`,
        // chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }

    // for (let i = 0; i < 20; i++) {
    //   const data = {
    //     key: i.toString(),
    //     title: `content${i + 1}`,
    //     description: `description of content${i + 1}`,
    //     chosen: Math.random() * 2 > 1,
    //   };
    //   if (data.chosen) {
    //     targetKeys.push(data.key);
    //   }
    //   mockData.push(data);
    // }
    this.setState({ mockData, targetKeys });
  };

  filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;

  handleChange = (targetKeys) => {
    const { selectableNum } = this.state
    this.setState({ targetKeys });
    console.log('targetKeys:', targetKeys);
    console.log('selectableNum:', selectableNum);

  };

  onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    const { selectableNum } = this.state
    console.log('onSelectChange:', sourceSelectedKeys, targetSelectedKeys);
    // if (selectableNum && sourceSelectedKeys.length > selectableNum) {
    //   return message.error(`只能选择${selectableNum}个商家`)
    // }
  }

  handleSearch = (dir, value) => {
    console.log('search:', dir, value);
  };

  handleOk = () => {
    const { handleSelectStore } = this.props
    const { targetKeys, merchant, selectableNum } = this.state
    if (targetKeys.length == 0) return message.error('请选择商家')
    // 商家选择个数限制设置
    if (selectableNum && targetKeys.length > selectableNum) {
      return message.error(`只能选择${selectableNum}个商家`)
    }
    const selectResult = merchant.filter(item => targetKeys.indexOf(item.merchant_id) != -1)
    console.log('search:', selectResult);
    handleSelectStore(false, selectResult)
  }
  handleCancel = () => {
    const { values, handleSelectStoreModalVisible, hasMerchantInfo } = this.props
    const { targetKeys } = this.state
    if (hasMerchantInfo) {
      if (targetKeys.length == 0) return message.error('请选择商家')
    }
    handleSelectStoreModalVisible(false, values)
  }

  render () {
    const { selectStoreModalVisible, form: { getFieldDecorator },
      common } = this.props;
    const { formVals, mockData, targetKeys, disabled } = this.state;
    const { merchant = [] } = common;



    return (
      <Modal
        width={860}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="选择商家"
        visible={selectStoreModalVisible}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
      >
        <TableTransfer
          dataSource={mockData}
          targetKeys={targetKeys}
          disabled={disabled}
          listStyle={{
            width: 366,
          }}
          showSearch
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          filterOption={this.filterOption}
          onSelectChange={this.onSelectChange}
          leftColumns={leftTableColumns}
          rightColumns={rightTableColumns}
          operations={['添加', '移除']}
          ref={(transfer) => { this.transfer = transfer; }}
        />
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
          onSelectChange={this.onSelectChange}
          render={item => item.title}
        /> */}
      </Modal>
    );
  }
}
