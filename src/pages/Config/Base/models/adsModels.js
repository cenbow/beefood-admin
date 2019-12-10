import {
  getBannerList,
  addBanner,
  editBanner,
  getBannerInfo,
  deleteBanner,
  enableBanner,
  disableBanner
} from '@/services/config';

export default {
  namespace: 'ads',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchBannerList ({ payload }, { call, put }) {
      const response = yield call(getBannerList, payload);
      yield put({
        type: 'bannerList',
        payload: response.data,
      });
    },
    *fetchBannerInfo ({ payload }, { call }) {
      const response = yield call(getBannerInfo, payload);
      if (callback) callback(response);
    },
    *fetchAddBanner ({ payload, callback }, { call }) {
      const response = yield call(addBanner, payload);
      if (callback) callback(response);
    },
    *fetchEditBanner ({ payload, callback }, { call }) {
      const response = yield call(editBanner, payload);
      if (callback) callback(response);
    },
    *fetchDeleteBanner ({ payload, callback }, { call }) {
      const response = yield call(deleteBanner, payload);
      if (callback) callback(response);
    },
    *fetchEnableBanner ({ payload, callback }, { call }) {
      const response = yield call(enableBanner, payload);
      if (callback) callback(response);
    },
    *fetchDisableBanner ({ payload, callback }, { call }) {
      const response = yield call(disableBanner, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    bannerList (state, action) {
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
