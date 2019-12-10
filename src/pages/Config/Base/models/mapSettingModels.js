import {
  getMapSetInfo,
  editMapSet,
} from '@/services/config';

export default {
  namespace: 'mapSetting',
  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchMapSetInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getMapSetInfo, payload);
      yield put({
        type: 'mapSettingInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditMapSet ({ payload, callback }, { call }) {
      const response = yield call(editMapSet, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    mapSettingInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
