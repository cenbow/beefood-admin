import {
  getVoucherMerchant
} from '@/services/statistics';

export default {
  namespace: 'coupon',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchVoucherMerchant ({ payload }, { call, put }) {
      const response = yield call(getVoucherMerchant, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveList (state, action) {
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
  },
};
