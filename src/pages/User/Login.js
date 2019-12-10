import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import Link from 'umi/link';
import { Checkbox, Alert, Modal, Icon, message } from 'antd';
import utils from '@/utils/utils';
import Login from '@/components/Login';
import styles from './Login.less';
import { routerRedux } from 'dva/router';
import Redirect from 'umi/redirect';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, user, common, loading }) => ({
  login,
  user,
  common,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    autoLogin: true,
  };

  // onTabChange = type => {
  //   this.setState({ type });
  // };

  // onGetCaptcha = () =>
  //   new Promise((resolve, reject) => {
  //     this.loginForm.validateFields(['mobile'], {}, (err, values) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         const { dispatch } = this.props;
  //         dispatch({
  //           type: 'login/getCaptcha',
  //           payload: values.mobile,
  //         })
  //           .then(resolve)
  //           .catch(reject);

  //         Modal.info({
  //           title: formatMessage({ id: 'app.login.verification-code-warning' }),
  //         });
  //       }
  //     });
  //   });

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      let formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: formData,
        callback: res => {
          if (!utils.successReturn(res)) return;
          if (res.code == 200) {
            this.getPerssionList();
          }
        },
      });
    }
  };
  getPerssionList = () => {
    this.props.dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          message.success('用户登录成功');
        }
      },
    });
  };
  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return localStorage.getItem('access_token') != undefined &&
      (localStorage.getItem('REDIRECT') != null ||
        (localStorage.getItem('access_token') != null &&
          localStorage.getItem('REDIRECT') != undefined)) ? (
      <Redirect to={localStorage.getItem('REDIRECT')} />
    ) : (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <div>
            <UserName
              name="username"
              placeholder={`${formatMessage({ id: 'app.login.userName' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.userName.required' }),
                },
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'app.login.password' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.password.required' }),
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();
                this.loginForm.validateFields(this.handleSubmit);
              }}
            />
          </div>
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="app.login.remember-me" />
            </Checkbox>
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
