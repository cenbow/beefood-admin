import {
  getUserRedPacketSetInfo,
  editUserRedPacketSet,
} from '@/services/config';

export default {
  namespace: 'userRedPacketSet',
  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchUserRedPacketSetInfo ({ payload, callback }, { call, put }) {
      const response = yield call(getUserRedPacketSetInfo, payload);
      yield put({
        type: 'userRedPacketInfo',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchEditUserRedPacketSet ({ payload, callback }, { call }) {
      const response = yield call(editUserRedPacketSet, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    userRedPacketInfo (state, { payload }) {
      return {
        ...state,
        data: payload.items,
      };
    },
  },
};
