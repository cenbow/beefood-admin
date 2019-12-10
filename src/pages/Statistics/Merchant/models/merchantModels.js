import {
  getSaleMerchant,
  getSaleDishMerchant,
  getSaleDishDetailMerchant
} from '@/services/statistics';

export default {
  namespace: 'saleMerchant',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    saleDishData: {
      list: [],
      pagination: {},
    },
    saleDishDetailData: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchSaleMerchant ({ payload }, { call, put }) {
      const response = yield call(getSaleMerchant, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchSaleDishMerchant ({ payload }, { call, put }) {
      const response = yield call(getSaleDishMerchant, payload);
      yield put({
        type: 'saveSaleDishList',
        payload: response.data,
      });
    },
    *fetchSaleDishDetailMerchant ({ payload }, { call, put }) {
      const response = yield call(getSaleDishDetailMerchant, payload);
      yield put({
        type: 'saveSaleDishDetail',
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
    saveSaleDishList (state, action) {
      return {
        ...state,
        saleDishData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    saveSaleDishDetail (state, action) {
      return {
        ...state,
        saleDishDetailData: {
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
