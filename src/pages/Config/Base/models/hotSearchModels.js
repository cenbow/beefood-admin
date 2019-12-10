import {
  getHotSearchInfo,
  editHotSearch,
} from '@/services/config';

export default {
  namespace: 'hotSearch',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchHotSearchInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getHotSearchInfo, payload);
      yield put({
        type: 'hotSearchInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditHotSearch ({ payload, callback }, { call }) {
      const response = yield call(editHotSearch, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    hotSearchInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
