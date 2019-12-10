import React, { Suspense } from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { ContainerQuery } from 'react-container-query';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import classNames from 'classnames';
import Media from 'react-media';
import logo from '../assets/logo.svg';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import SiderMenu from '@/components/SiderMenu';
import ContentSubMenu from '@/components/SiderMenu/ContentSubMenu';
import getPageTitle from '@/utils/getPageTitle';
import styles from './BasicLayout.less';
import { getRedirect } from '@/utils/utils';
// lazy load SettingDrawer
const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;
// Conversion router to menu.
function formatter(data, parentPath = '', parentAuthority, parentName) {
  // console.log(data);
  return data
    .map(item => {
      let locale = 'menu';
      if (parentName && item.name) {
        locale = `${parentName}.${item.name}`;
        // console.log(locale);
      } else if (item.name) {
        // console.log(item.name);
        locale = `menu.${item.name}`;
        // console.log(locale);
      } else if (parentName) {
        locale = parentName;
        // console.log(locale);
      }
      if (item.path) {
        const result = {
          ...item,
          locale,
          authority: item.authority || parentAuthority,
        };
        if (item.routes) {
          const children = formatter(
            item.routes,
            `${parentPath}${item.path}/`,
            item.authority,
            locale
          );
          // console.log(children);
          // Reduce memory usage
          result.children = children;
        }
        // console.log(item.routes);
        delete result.routes;
        return result;
      }

      return null;
    })
    .filter(item => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

class BasicLayout extends React.Component {
  constructor(props) {
    super(props);

    this.getPageTitle = memoizeOne(this.getPageTitle);
    // this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    // this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }
  state = {
    rendering: true,
    isMobile: false,
    menuData: this.getMenuData(),
    menuNewData: [],
  };
  componentDidMount() {
    const {
      dispatch,
      route: { routes, path, authority },
    } = this.props;
    dispatch({
      type: 'common/fetchPermissionList',
      callback: res => {
        if (res.code == 200) {
          this.setState({
            menuNewData: res.data.items,
          });
          if (res.data.items.length > 0) {
            localStorage.setItem('REDIRECT', getRedirect(res.data.items));
          }
        }
      },
    });
    //获取管理员信息
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'common/fetchCommonConfig',
    });
    dispatch({
      type: 'common/fetchPermissionList',
    });
    dispatch({
      type: 'setting/getSetting',
    });
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, path, authority },
    });
    // console.log(2222);
    // 请求动态显示
  }

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }
  getMenuData() {
    const {
      route: { routes },
    } = this.props;
    // console.log(memoizeOneFormatter(routes));
    return memoizeOneFormatter(routes);
  }

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '180px',
      };
    }
    return null;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      isMobile,
      // menuData,
      breadcrumbNameMap,
      fixedHeader,
    } = this.props;
    const menuTree = memoizeOneFormatter(this.state.menuNewData);
    const isTop = PropsLayout === 'topmenu';
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuTree}
            isMobile={isMobile}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
          }}
        >
          <Header
            menuData={menuTree}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          <Content className={styles.content} style={contentStyle}>
            {/* <div className={styles.pagesSubMenuMain}>
              <ContentSubMenu {...this.props} />
              <div className={styles.contentMain}>
                {children}
              </div>
            </div> */}
            {children}
          </Content>
          {/* <Footer /> */}
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

export default connect(({ global, setting, menu: menuModel }) => ({
  collapsed: global.collapsed,
  layout: setting.layout,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
  ...setting,
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
  </Media>
));
