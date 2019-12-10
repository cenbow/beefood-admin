import { getConsumerList,messageConsumerSend,messageConsumerHistory,messageConsumerDetail } from '@/services/message';

const listData = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'messageConsumerList',

  state: {
    data: listData,
    historyData: listData,
    historyDetailsData: listData,
  },

  effects: {
    *fetchConsumerList({ payload }, { call, put }) {
      const response = yield call(getConsumerList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchMessageConsumerSend({ payload, callback }, { call }) {
      const response = yield call(messageConsumerSend, payload);
      if (callback) callback(response);
    },
    *fetchHistoryMessageList({ payload }, { call, put }) {
      const response = yield call(messageConsumerHistory, payload);
      yield put({
        type: 'historyList',
        payload: response.data,
      });
    }, 
    *fetchHistoryDetailsList({ payload }, { call, put }) {
      const response = yield call(messageConsumerDetail, payload);
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
