import {
  getRiskParamSetInfo,
  editRiskParamSet,
} from '@/services/config';

export default {
  namespace: 'riskParamSet',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchRiskParamSetInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getRiskParamSetInfo, payload);
      yield put({
        type: 'riskParamSetInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditRiskParamSet ({ payload, callback }, { call }) {
      const response = yield call(editRiskParamSet, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    riskParamSetInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
