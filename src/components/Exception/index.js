import React, { createElement } from 'react';
import Link from 'umi/link';
import { formatMessage } from 'umi-plugin-react/locale';
import classNames from 'classnames';
import { Button } from 'antd';
import config from './typeConfig';
import styles from './index.less';

class Exception extends React.PureComponent {
  static defaultProps = {
    backText: 'back to home',
    redirect: localStorage.getItem('REDIRECT'),
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  goToLogin = () => {
    localStorage.removeItem('REDIRECT');
    localStorage.removeItem('access_token');
  };

  render() {
    const {
      className,
      backText,
      linkElement = 'a',
      type,
      title,
      desc,
      img,
      actions,
      redirect,
      ...rest
    } = this.props;
    const pageType = type in config ? type : '404';
    const clsString = classNames(styles.exception, className);
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
            style={{ backgroundImage: `url(${img || config[pageType].img})` }}
          />
        </div>
        <div className={styles.content}>
          <h1>{title || config[pageType].title}</h1>
          <div className={styles.desc}>{desc || config[pageType].desc}</div>
          <div className={styles.actions}>
            {actions ||
              createElement(
                linkElement,
                {
                  to: redirect,
                  href: redirect,
                },
                <Button type="primary">{backText}</Button>
              )}
            <Link className={styles.backLogin} to="/user/login" onClick={this.goToLogin}>
              <Button type="primary">{formatMessage({ id: 'app.exception.backlogin' })}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Exception;
