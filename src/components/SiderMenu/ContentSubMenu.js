import React, { PureComponent, Suspense } from 'react';
import classNames from 'classnames';
import Link from 'umi/navlink';
import styles from './index.less';
import PageLoading from '../PageLoading';

export default class SiderMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showMenu: true,
        };
    }

    componentDidMount() {
    }

    render() {
        const { showMenu } = this.state;
        const { match, location, menuData } = this.props;

        return (
            <Suspense fallback={<PageLoading />}>
                {
                    showMenu && (
                        <div className={styles.contentSubMenu}>
                            <ul>
                                <li>
                                    <Link exact={true} to="/home/index" activeClassName={styles.active}>基本设置</Link>
                                </li>
                                <li>
                                    <Link exact={true} to="/member/consumer" activeClassName={styles.active}>用户管理</Link>
                                </li>
                            </ul>
                        </div>
                    )
                }
            </Suspense>
        );
    }
}
