import { getMerchantList,messageMerchantSend,messageMerchantHistory,messageMerchantDetail } from '@/services/message';

const listData = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'messageMerchantList',

  state: {
    data: listData,
    historyData: listData,
    historyDetailsData: listData,
  },

  effects: {
    *fetchMerchantList({ payload }, { call, put }) {
      const response = yield call(getMerchantList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchMessageMerchantSend({ payload, callback }, { call }) {
      const response = yield call(messageMerchantSend, payload);
      if (callback) callback(response);
    },
    *fetchHistoryMessageList({ payload }, { call, put }) {
      const response = yield call(messageMerchantHistory, payload);
      yield put({
        type: 'historyList',
        payload: response.data,
      });
    }, 
    *fetchHistoryDetailsList({ payload }, { call, put }) {
      const response = yield call(messageMerchantDetail, payload);
      yield put({
        type: 'historyDetailsList',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    historyList(state, action) {
      return {
        ...state,
        historyData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    historyDetailsList(state, action) {
      return {
        ...state,
        historyDetailsData: {
          list: action.payload.items,
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
