import {
  getUpdateSetInfo,
  editUpdateSet,
} from '@/services/config';

export default {
  namespace: 'updateSet',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchUpdateSetInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getUpdateSetInfo, payload);
      yield put({
        type: 'updateSetInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditUpdateSet ({ payload, callback }, { call }) {
      const response = yield call(editUpdateSet, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    updateSetInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
