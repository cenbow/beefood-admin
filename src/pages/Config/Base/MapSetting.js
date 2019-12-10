import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Form, Input, Button, Select, Row, Col, Icon, Menu, Dropdown, Card, DatePicker, Radio, Upload, Alert, message } from 'antd';
import styles from '../Config.less';
import utils from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 3 },
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
    sm: { span: 6, offset: 3 },
  },
};

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formVals: props.mapSettingData,
    };
    // console.log('mapSettingData', props.mapSettingData);
  }

  renderContent = (formVals) => {
    const { form } = this.props;
    return (
      <div>
        <FormItem {...formLayout} label="地图类型">
          {form.getFieldDecorator('value', {
            rules: [{ required: true, message: '必填' }],
            initialValue: formVals.value,
          })(
            <Radio.Group>
              <Radio value="1">百度地图</Radio>
              <Radio value="3">高德地图</Radio>
              <Radio value="4">直线距离</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </div>
    )
  }

  render () {
    const { form, handleAdd } = this.props;
    const { formVals } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        const newFieldsVal = {
          id: formVals[0].id,
          value: Number(fieldsValue.value)
        }
        // console.log('newFieldsVal', newFieldsVal);
        handleAdd(newFieldsVal);
      });
    };
    return (<div>
      {this.renderContent(formVals[0])}
      <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
        <Button type="primary" onClick={okHandle}>
          <FormattedMessage id="form.save" />
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => { router.goBack() }}>
          <FormattedMessage id="form.cancel" />
        </Button>
      </FormItem></div>);
  }
};



@connect(({ mapSetting, loading }) => ({
  mapSetting,
  loading: loading.effects['mapSetting/fetchMapSetInfo'],
}))
@Form.create()
class MapSetting extends PureComponent {
  state = {
    infoData: []
  };

  componentDidMount () {
    this.getInfo()
  }

  getInfo = () => {
    const { dispatch, form } = this.props
    dispatch({
      type: 'mapSetting/fetchMapSetInfo',
      payload: null,
      callback: res => {
        if (!utils.successReturn(res)) return;
        let data = res.data.items;
        this.setState({
          infoData: data || []
        })
      }
    });
  }

  saveForm = (fields) => {
    const { dispatch } = this.props;
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key] || '');
    });
    dispatch({
      type: 'mapSetting/fetchEditMapSet',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        message.success('保存成功');
      },
    });

  }

  render () {
    const { infoData } = this.state
    return (
      <Fragment>
        <h3 className={styles.editTitle}>地图设置</h3>
        {infoData && Object.keys(infoData).length ? (<CreateForm handleAdd={this.saveForm} mapSettingData={infoData} />) : null}
      </Fragment>
    );
  }
}

export default MapSetting;