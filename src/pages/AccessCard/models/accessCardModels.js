import {
  getAccessCardList,
  addAccessCard,
  deleteAccessCard,
  getAccessCardInfo,
  editAccessCard,
} from '@/services/accesscardServices';

export default {
  namespace: 'accessCard',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    accessCardInfo: {},
  },

  effects: {
    *fetchAccessCardList({ payload }, { call, put }) {
      const response = yield call(getAccessCardList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchAccessCardAdd({ payload, callback }, { call }) {
      const response = yield call(addAccessCard, payload);
      if (callback) callback(response);
    },
    *fetchAccessCardEdit({ payload, callback }, { call }) {
      const response = yield call(editAccessCard, payload);
      if (callback) callback(response);
    },
    *fetchAccessCardDelete({ payload, callback }, { call }) {
      const response = yield call(deleteAccessCard, payload);
      if (callback) callback(response);
    },
    *fetchAccessCardInfo({ payload }, { call, put }) {
      const response = yield call(getAccessCardInfo, payload);
      yield put({
        type: 'accessCardInfo',
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
        },
      };
    },
    accessCardInfo(state, { payload }) {
      return {
        ...state,
        accessCardInfo: payload.items,
      };
    },
  },
};
