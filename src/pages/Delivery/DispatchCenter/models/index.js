import { queryMemberConsumer } from '@/services/member';


export default {
  namespace: 'dispatchCenter',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *consumerFetch({ payload }, { call, put }) {
      const response = yield call(queryMemberConsumer, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
    *consumerAdd({ payload, callback }, { call, put }) {
      const response = yield call(queryMemberConsumer, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        data: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
  },
};
