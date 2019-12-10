import {
  getUser
} from '@/services/statistics';

export default {
  namespace: 'region',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchStatisticsUser ({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveList (state, action) {
      return {
        ...state,
        data: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
  },
};
