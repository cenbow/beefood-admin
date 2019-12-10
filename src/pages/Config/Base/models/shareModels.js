import {
  getShareSetInfo,
  editShareSet,
} from '@/services/config';

export default {
  namespace: 'shareSet',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchShareSetInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getShareSetInfo, payload);
      yield put({
        type: 'shareSetInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditShareSet ({ payload, callback }, { call }) {
      const response = yield call(editShareSet, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    shareSetInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
