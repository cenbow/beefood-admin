import { getBdList,messageBdSend,messageBdHistory,messageBdDetail } from '@/services/message';

const listData = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'messageBdList',

  state: {
    data: listData,
    historyData: listData,
    historyDetailsData: listData,
  },

  effects: {
    *fetchBdList({ payload }, { call, put }) {
      const response = yield call(getBdList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchMessageBdSend({ payload, callback }, { call }) {
      const response = yield call(messageBdSend, payload);
      if (callback) callback(response);
    },
    *fetchHistoryMessageList({ payload }, { call, put }) {
      const response = yield call(messageBdHistory, payload);
      yield put({
        type: 'historyList',
        payload: response.data,
      });
    }, 
    *fetchHistoryDetailsList({ payload }, { call, put }) {
      const response = yield call(messageBdDetail, payload);
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
