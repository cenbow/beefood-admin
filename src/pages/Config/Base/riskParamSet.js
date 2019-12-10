import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, message } from 'antd';
import utils, { getBase64, beforeUpload } from '@/utils/utils';
import ShowImg from '@/components/showImg';
import { uploadImage } from '@/services/common'; // 上传图片

import styles from '../Config.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
const extraArr = ['货到付款订单额不能超过15美分', '每人每天只有几次转单操作', '骑手1天最多只能接几个货到付款COD订单', '', '商家1天最多只能接几个货到付款COD订单', '骑手身上COD货款达到或者等于上缴金额后必须上交']

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 6 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 6, offset: 6 },
  },
};

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      infoData: props.infoData,
      formVals: {},
    };
    console.log(this.props);
  }

  getData = (obj1, obj2) => {
    const arr = []
    for (const key in obj1) {
      if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
        const element = obj1[key];
        arr.push(key)
      }
    }
    return arr

  }

  okHandle = () => {
    const { form: { getFieldDecorator, validateFields }, handleAdd } = this.props;
    const { infoData } = this.state
    validateFields((err, fieldsValue) => {
      if (err) return;
      console.log('fieldsValue', fieldsValue, infoData);
      const key = []
      const value = []
      for (let i in fieldsValue) {
        key.push(i)
        value.push(fieldsValue[i])
      }
      const newKey = key.map((item) => ({ "id": item }))
      const newVal = value.map((item) => ({ "value": item }))
      const lastFieldsValue = newKey.map((o, i) => { return { ...o, ...newVal[i] } })
      const newFieldsValue = {
        value: JSON.stringify(lastFieldsValue)
      }
      // console.log('newFieldsValue', newFieldsValue)
      handleAdd(newFieldsValue);

    });
  };

  renderContain () {
    const { form: { getFieldDecorator, validateFields } } = this.props
    const { formVals, infoData } = this.state;
    return (
      <div>
        {infoData && infoData.length > 0 ? (infoData.map((item, i) => {
          return (<FormItem {...formLayout} label={item.title} key={i} extra={extraArr[i]}>
            {getFieldDecorator(`${item.id}`, {
              rules: [{ required: true, message: '必填' }],
              initialValue: `${item.value}`
            })(<Input placeholder="请输入" />)}
          </FormItem>)

        })) : null
        }
      </div>
    )
  }

  render () {
    const { form: { getFieldDecorator, validateFields } } = this.props
    const { formVals, infoData } = this.state;
    return (
      <div>
        {this.renderContain()}
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" onClick={this.okHandle}>
            <FormattedMessage id="form.save" />
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
            <FormattedMessage id="form.cancel" />
          </Button>
        </FormItem>
      </div>
    )

  }
};


@connect(({ riskParamSet, loading }) => ({
  riskParamSet,
  loading: loading.effects['riskParamSet/fetchRiskParamSetInfo'],
}))
@Form.create()
class Share extends PureComponent {
  state = {
    infoData: [],
  };

  componentDidMount () {
    this.getInfo()
  }

  getInfo = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'riskParamSet/fetchRiskParamSetInfo',
      payload: null,
      callback: res => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items
        console.log('详情', data);
        this.setState({
          infoData: data
        }, () => {
          console.log('123', this.state.infoData);
        })
      },
    });
  }


  saveForm = (fields) => {
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'riskParamSet/fetchEditRiskParamSet',
      payload: formData,
      callback: res => {
        this.setState({ submitLoading: false });
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
      },
    });

  }

  render () {
    const { infoData } = this.state;
    const {
      riskParamSet: { data },
    } = this.props;

    return (
      <Fragment>
        <h3 className={styles.editTitle}>风控参数设置</h3>
        {infoData && Object.keys(infoData).length ? (
          <CreateForm handleAdd={this.saveForm}
            infoData={infoData}
          />
        ) : null}
      </Fragment>
    );
  }
}

export default Share;