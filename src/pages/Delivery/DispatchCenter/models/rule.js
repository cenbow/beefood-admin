import { queryMemberConsumer } from '@/services/member';


export default {
  namespace: 'rule',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    // consumer
    *consumerFetch({ payload }, { call, put }) {
      const response = yield call(queryMemberConsumer, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *consumerAdd({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },
    *consumerRemove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },
    *consumerUpdate({ payload, callback }, { call, put }) {
      const response = yield call(updateRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        // data: action.payload,
        data: {
          list: action.payload.data.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
  },
};
