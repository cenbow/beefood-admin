import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/navlink';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Menu } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from '@/assets/css/Info.less';

const { Item } = Menu;

@connect(({ menu }) => ({
  menuData: menu.menuData,
}))
class Info extends PureComponent {
  constructor(props) {
    super(props);
    const { match, location } = props;
    const menuMap = {
      home: (
        <FormattedMessage id="menu.order.home" defaultMessage="home" />
      ),
      service: (
        <FormattedMessage id="menu.order.service" defaultMessage="service" />
      ),
    };
    const key = location.pathname.replace(`${match.path}/`, '');
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: key,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { match, location } = props;
    let selectKey = location.pathname.replace(`${match.path}/`, '');
    if (selectKey !== state.selectKey) {
      return { selectKey };
    }
    return null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  getmenu = () => {
    const { match } = this.props;
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}><Link to={`${match.path}/` + item} activeClassName={styles.active}>{menuMap[item]}</Link></Item>);
  };

  selectKey = ({ key }) => {
    this.setState({
      selectKey: key,
    });
  };

  resize = () => {
    if (!this.main) {
      return;
    }

    const { mode: currentMode } = this.state;

    let mode = 'inline';
    const { offsetWidth } = this.main;

    if (offsetWidth > 400 && offsetWidth < 641) {
      mode = 'horizontal';
    }

    if (window.innerWidth < 768 && offsetWidth > 400) {
      mode = 'horizontal';
    }

    if (mode !== currentMode) {
      requestAnimationFrame(() => this.setState({ mode }));
    }
  };

  render() {
    const { children, menuData } = this.props;
    const { mode, selectKey } = this.state;

    return (
      <GridContent>
        <div
          className={styles.main}
          ref={ref => {
            this.main = ref;
          }}
        >
          <div className={styles.leftmenu}>
            <Menu mode={mode} selectedKeys={[selectKey]} onClick={this.selectKey}>
              {this.getmenu()}
            </Menu>
          </div>
          <div className={styles.right}>
            {children}
          </div>
        </div>
      </GridContent>
    );
  }
}

export default Info;
