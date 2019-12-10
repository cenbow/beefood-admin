import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Card } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';

import styles from '../Config.less';

@connect(({ config, loading }) => ({
  config,
  loading: loading.models.config,
}))
class Base extends Component {
  state = {
    operationkey: 'tab1',
  };

  componentDidMount () {
    // const { dispatch } = this.props;
    // dispatch({
    //     type: 'profile/fetchAdvanced',
    // });
  }

  getSelectedMenuKeys = pathname => {
    const url = location.pathname.replace(pathname, '');
    const urllist = url.split('/').filter(i => i);
    const arr = urllist.map((urlItem, index) => `${urllist.slice(0, index + 1).join('/')}`);
    return arr[0];
  };

  onOperationTabChange = key => {
    const { match } = this.props;
    if (key) {
      router.push(`${match.url}/` + key);
    }
  };

  render () {
    const { operationkey } = this.state;
    const { config, loading, match, location, children } = this.props;
    const { data } = config;

    const activeTabKey = this.getSelectedMenuKeys(match.path)

    const operationTabList = [
      {
        key: 'classify',
        tab: '分类管理',
      },
      {
        key: 'ads',
        tab: '广告设置',
      },
      {
        key: 'activity',
        tab: '专题设置',
      },
      {
        key: 'delivery',
        tab: '配送设置',
      },
      {
        key: 'share',
        tab: '分享设置',
      },
      {
        key: 'updateSetInfo',
        tab: '更新设置',
      },
      {
        key: 'hotSearch',
        tab: '热门搜索',
      },
      // {
      //   key: 'returnGoods',
      //   tab: '售后设置',
      // },
      {
        key: 'mapSetting',
        tab: '地图设置',
      },
      {
        key: 'indexMCategory',
        tab: '首页分类设置',
      },
      {
        key: 'userGetRedPacketBg',
        tab: '新用户领取红包背景设置',
      },
      {
        key: 'riskParamSet',
        tab: '风控参数设置',
      },
    ];

    return (
      <GridContent>
        <div className="main-24">
          <Card
            className={styles.tabsCard}
            bordered={false}
            tabList={operationTabList}
            activeTabKey={activeTabKey}
            onTabChange={this.onOperationTabChange}
            loading={loading}
            bodyStyle={{ padding: 0 }}
          >
            {children}
          </Card>
        </div>
      </GridContent>
    )
  }
}

export default Base;