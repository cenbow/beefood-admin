import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Alert, Button, Modal, message } from 'antd';
import utils from '@/utils/utils';
import Zmage from 'react-zmage';
import styles from './index.less';
import DealAudit from './DealAudit';

@connect(({ merchant, common, loading }) => ({
  ambientInfo: merchant.ambientInfo,
  image_domain: common.commonConfig.image_domain,
  loading: loading.effects['merchant/fetchMbientInfo'],
}))
class AmbientInfo extends Component {
  state = {
    merchant_id: '',
    info_verify_type: '3',
    modalVisible: false,
    infoData: {},
    newInfoData: {},
    new_environment: [],
    new_facade: [],
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
      type: 'merchant/fetchMbientInfo',
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
          });
          if (data.verify_data.environment) {
            this.setState({
              new_environment: JSON.parse(data.verify_data.environment),
            });
          }
          if (data.verify_data.facade) {
            this.setState({
              new_facade: JSON.parse(data.verify_data.facade),
            });
          }
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
          infoData.verify_status >= 0 && (
            <div>
              <div className={styles.left}>
                {
                  infoData.verify_status == 2 && (
                    <div>
                      <Alert message="审核已通过" type="success" showIcon />
                    </div>
                  )
                }
                {
                  infoData.verify_status == 3 && (
                    <div>
                      <Alert message="审核不通过" type="error" showIcon />
                    </div>
                  )
                }
                {
                  infoData.verify_data && (
                    <div>
                      <Alert message="更改前" type="warning" showIcon />
                    </div>
                  )
                }
                <div className="m-t-16">
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.facade, this.state.new_facade)}`}>
                    <dt className="common_dl_dt_140"><span>商家门脸图</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        {
                          infoData.facade.map((item,i)=>(
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
                  <dl className="common_dl">
                    <dt className="common_dl_dt_140"><span>店内环境图</span>：</dt>
                    <dd className="common_dl_dd_140">
                      <ul className="picture_card_list">
                        {
                          infoData.environment.map((item, i) => (
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
                  <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.environment, this.state.new_environment)}`}>
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
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.facade, this.state.new_facade)}`}>
                          <dt className="common_dl_dt_140"><span>商家门脸图</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              {
                                this.state.new_facade.map((item, i) => (
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
                        <dl className={`common_dl ${utils.objectContrast(newInfoData, infoData.environment, this.state.new_environment)}`}>
                          <dt className="common_dl_dt_140"><span>店内环境图</span>：</dt>
                          <dd className="common_dl_dd_140">
                            <ul className="picture_card_list">
                              {
                                this.state.new_environment.map((item, i) => (
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

export default AmbientInfo;