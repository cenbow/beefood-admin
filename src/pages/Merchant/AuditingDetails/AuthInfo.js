import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Alert, Button, Modal, message } from 'antd';
import utils from '@/utils/utils';
import Zmage from 'react-zmage';
import styles from './index.less';
import DealAudit from './DealAudit';

const account_type = {"1":"存储卡"}

@connect(({ merchant, common, loading }) => ({
  merchant,
  image_domain: common.commonConfig.image_domain,
  loading: loading.effects['merchant/fetchMerchantAuthInfo'],
}))
class AuthInfo extends Component {
  state = {
    merchant_id: '',
    info_verify_type: '4',
    modalVisible: false,
    infoData: {},
    newInfoData: {},
    new_id_image: [],
    new_license_image: [],
    new_contract_image: [],
  }

  componentDidMount() {
    const { match } = this.props;

    this.setState({
      merchant_id: match.params.id,
    }, () => {
      this.getInfo()
    });
  }

  getInfo = () => {
    const { dispatch } = this.props;
    // 获取认证状态信息
    dispatch({
      type: 'merchant/fetchMerchantAuthInfo',
      payload: {
        merchant_id: this.state.merchant_id,
      },
      callback: (res) => {
        if (!utils.successReturn(res)) return;
        const data = res.data.items;
        this.setState({
          infoData: data,
        });
        if (data.verify_data) {
          this.setState({
            newInfoData: data.verify_data,
            new_id_image: JSON.parse(data.verify_data.id_image) || [],
            new_license_image: JSON.parse(data.verify_data.license_image) || [],
            new_contract_image: JSON.parse(data.verify_data.contract_image) || [],
          });
        }
      }
    });
  }

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  // 审核不通过
  handleSubmit = fields => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('merchant_id', this.state.merchant_id);
    formData.append('verify_type', this.state.info_verify_type);
    formData.append('verify_status', '3');
    formData.append('verify_fail_message', fields.verify_fail_message);
    dispatch({
      type: 'merchant/fetchDealAudit',
      payload: formData,
      callback: res => {
        if (!utils.successReturn(res)) return;
        this.handleModalVisible(false);
        message.success('操作成功', 0.5, () => {
          // window.scrollTo(0, 0);
          // this.getInfo();
          location.reload();
        });
      },
    });
  };

  // 审核通过
  onDealAudit = () => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: '审核通过',
      content: '确定基本信息资料审核通过？',
      onOk: () => {
        let formData = new FormData();
        formData.append('merchant_id', this.state.merchant_id);
        formData.append('verify_type', this.state.info_verify_type);
        formData.append('verify_status', '2');
        dispatch({
          type: 'merchant/fetchDealAudit',
          payload: formData,
          callback: res => {
            if (!utils.successReturn(res)) return;
            message.success('通过审核', 0.5, () => {
              // window.scrollTo(0, 0);
              // this.getInfo();
              location.reload();
            });
          },
        });
      },
    });
  }

  render() {
    const { modalVisible, infoData, newInfoData } = this.state;
    const { image_domain, loading } = this.props;

    const parentMethods = {
      handleSubmit: this.handleSubmit,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <Card bordered={false} bodyStyle={{ padding: 0, }} loading={loading}>
        {
          Object.keys((infoData || {})).length > 0 && (
            <div>
              <div className={styles.left}>
                {
                  infoData.verify_status == 2 && (
                    <Alert message="审核已通过" type="success" showIcon />
                  )
                }
                {
                  infoData.verify_status == 3 && (
                    <Alert message="审核不通过" type="error" showIcon />
                  )
                }
                {
                  infoData.verify_data && (
                    <Alert message="更改前" type="warning" showIcon />
                  )
                }
                <div className="m-t-16">
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_name, newInfoData.id_name)}`}>
                    <dt className="common_dl_dt_140"><span>身份证姓名</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.id_name}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_card, newInfoData.id_card)}`}>
                    <dt className="common_dl_dt_140"><span>身份证号码</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.id_card}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_image, this.state.new_id_image)}`}>
                    <dt className="common_dl_dt_140"><span>身份证照片</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        {
                          infoData.id_image.map((item, i) => (
                            <li key={i}>
                              <Zmage
                                src={image_domain + item}
                                style={{ width: '82px', height: '82px', }}
                              />
                            </li>
                          ))
                        }
                      </ul>
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.license_image, this.state.new_license_image)}`}>
                    <dt className="common_dl_dt_140"><span>营业执照</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        {
                          infoData.license_image.map((item, i) => (
                            <li key={i}>
                              <Zmage
                                src={image_domain + item}
                                style={{ width: '82px', height: '82px', }}
                              />
                            </li>
                          ))
                        }
                      </ul>
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_image, this.state.new_contract_image)}`}>
                    <dt className="common_dl_dt_140"><span>合同</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        {
                          infoData.contract_image.map((item, i) => (
                            <li key={i}>
                              <Zmage
                                src={image_domain + item}
                                style={{ width: '82px', height: '82px', }}
                              />
                            </li>
                          ))
                        }
                      </ul>
                    </dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_name, newInfoData.contract_name)}`}>
                    <dt className="common_dl_dt_140"><span>合同签约人</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.contract_name}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_mobile, newInfoData.contract_mobile)}`}>
                    <dt className="common_dl_dt_140"><span>签约人手机号</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.contract_mobile}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.account_type, newInfoData.account_type)}`}>
                    <dt className="common_dl_dt_140"><span>账户类型</span>：</dt>
                    <dd className="common_dl_dd_140">{account_type[infoData.account_type]}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_deposit, newInfoData.bank_of_deposit)}`}>
                    <dt className="common_dl_dt_140"><span>开户行</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.bank_of_deposit}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_name, newInfoData.bank_of_name)}`}>
                    <dt className="common_dl_dt_140"><span>开户名</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.bank_of_name}</dd>
                  </dl>
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_account, newInfoData.bank_of_account)}`}>
                    <dt className="common_dl_dt_140"><span>账号</span>：</dt>
                    <dd className="common_dl_dd_140">{infoData.bank_of_account}</dd>
                  </dl>
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140"></dt>
                    <dd className="common_dl_dd_140">
                      {
                        (infoData.verify_status == 1 || infoData.verify_data) && (
                          <div>
                            <Button type="primary" onClick={this.onDealAudit}>审核通过</Button>
                            <Button style={{ marginLeft: 8 }} onClick={() => { this.handleModalVisible(true) }}>审核不通过</Button>
                          </div>
                        )
                      }
                    </dd>
                  </dl>
                </div>
              </div>
              <div className={styles.right}>
                {
                  infoData.verify_status == 3 && (
                    <div className="verify_status_box">
                      <div className="verify_status_title">审核不通过原因</div>
                      <div className="verify_status_cont">
                        <p>{infoData.verify_fail_message}</p>
                      </div>
                    </div>
                  )
                }
                {
                  infoData.verify_data && (
                    <div>
                      <Alert message="更改后" type="warning" showIcon />
                      <div className="m-t-16">
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_name, newInfoData.id_name)}`}>
                          <dt className="common_dl_dt_140"><span>身份证姓名</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.id_name}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_card, newInfoData.id_card)}`}>
                          <dt className="common_dl_dt_140"><span>身份证号码</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.id_card}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.id_image, this.state.new_id_image)}`}>
                          <dt className="common_dl_dt_140"><span>身份证照片</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              {
                                this.state.new_id_image.map((item, i) => (
                                  <li key={i}>
                                    <Zmage
                                      src={image_domain + item}
                                      style={{ width: '82px', height: '82px', }}
                                    />
                                  </li>
                                ))
                              }
                            </ul>
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.license_image, this.state.new_license_image)}`}>
                          <dt className="common_dl_dt_140"><span>营业执照</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              {
                                this.state.new_license_image.map((item, i) => (
                                  <li key={i}>
                                    <Zmage
                                      src={image_domain + item}
                                      style={{ width: '82px', height: '82px', }}
                                    />
                                  </li>
                                ))
                              }
                            </ul>
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_image, this.state.new_contract_image)}`}>
                          <dt className="common_dl_dt_140"><span>合同</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              {
                                this.state.new_contract_image.map((item, i) => (
                                  <li key={i}>
                                    <Zmage
                                      src={image_domain + item}
                                      style={{ width: '82px', height: '82px', }}
                                    />
                                  </li>
                                ))
                              }
                            </ul>
                          </dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_name, newInfoData.contract_name)}`}>
                          <dt className="common_dl_dt_140"><span>合同签约人</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.contract_name}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.contract_mobile, newInfoData.contract_mobile)}`}>
                          <dt className="common_dl_dt_140"><span>签约人手机号</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.contract_mobile}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.account_type, newInfoData.account_type)}`}>
                          <dt className="common_dl_dt_140"><span>账户类型</span>：</dt>
                          <dd className="common_dl_dd_140">{account_type[newInfoData.account_type]}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_deposit, newInfoData.bank_of_deposit)}`}>
                          <dt className="common_dl_dt_140"><span>开户行</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.bank_of_deposit}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_name, newInfoData.bank_of_name)}`}>
                          <dt className="common_dl_dt_140"><span>开户名</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.bank_of_name}</dd>
                        </dl>
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.bank_of_account, newInfoData.bank_of_account)}`}>
                          <dt className="common_dl_dt_140"><span>账号</span>：</dt>
                          <dd className="common_dl_dd_140">{newInfoData.bank_of_account}</dd>
                        </dl>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )
        }
        <DealAudit {...parentMethods} modalVisible={modalVisible} />
      </Card>
    )
  }
}

export default AuthInfo;