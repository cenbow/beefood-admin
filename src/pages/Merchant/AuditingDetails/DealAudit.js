import React, { Component } from 'react';
import { Form, Input, Modal } from 'antd';

const FormItem = Form.Item;

@Form.create()
class DealAudit extends Component {
  render() {
    const { modalVisible, handleModalVisible, form, handleSubmit } = this.props;

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        handleSubmit(fieldsValue);
      });
    };

    return (
      <Modal
        width={640}
        destroyOnClose
        title="审核不通过"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem>
          {form.getFieldDecorator('verify_fail_message', {
            rules: [{ required: true, message: '必填' }],
          })(<Input.TextArea placeholder="请输入审核不通过原因" rows={6} />)}
        </FormItem>
      </Modal>
    )
  }
}

export default DealAudit;