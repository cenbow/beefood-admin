import {
  getRedpacket
} from '@/services/statistics';

export default {
  namespace: 'bonus',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchRedpacket ({ payload }, { call, put }) {
      const response = yield call(getRedpacket, payload);
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
