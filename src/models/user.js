import { routerRedux } from 'dva/router';
import { notification } from 'antd';
import { query as queryUsers, queryCurrent } from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      source_type: '',
      source_id: '',
    },
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent({ _, callback }, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        // payload: {
        //   name: localStorage.getItem("user_info"),
        // },
        payload: response.data.items,
      });
      if (callback) callback(response);
      if (response.code == 800 || response.code == 801) {
        localStorage.removeItem('REDIRECT');
        localStorage.removeItem('access_token');
        notification.error({
          message: '未登录或登录已过期，请重新登录。',
        });
        // 跳转路由
        yield put(routerRedux.replace('/user/login'));
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...payload,
          name: payload && payload.username,
        },
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
