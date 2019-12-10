import {
  getCountry,
  saveCountry,
  editCountry,
  deleteCountry,
  getCity,
  saveCity,
  editCity,
  deleteCity,
  getRegion,
  getRegionDetail,
  saveRegion,
  editRegion,
  deleteRegion,
  getBusiness,
  saveBusiness,
  editBusiness,
  deleteBusiness,
  getBusinessDetail,
} from '@/services/business';

const listData = {
  list: [],
  pagination: {},
};

export default {
  namespace: 'business',

  state: {
    countryList: listData,
    cityList: listData,
    regionList: listData,
    regionDetails: {},
    businessList: listData,
    businessDetails: {},
  },

  effects: {
    // 国家
    *fetchCountryList({ payload }, { call, put }) {
      const response = yield call(getCountry, payload);
      yield put({
        type: 'countryList',
        payload: response.data,
      });
    },
    *fetchCountrySave({ payload, callback }, { call }) {
      const response = yield call(saveCountry, payload);
      if (callback) callback(response);
    },
    *fetchCountryEdit({ payload, callback }, { call }) {
      const response = yield call(editCountry, payload);
      if (callback) callback(response);
    },
    *fetchCountryDelete({ payload, callback }, { call }) {
      const response = yield call(deleteCountry, payload);
      if (callback) callback(response);
    },

    // 城市
    *fetchCityList({ payload }, { call, put }) {
      const response = yield call(getCity, payload);
      yield put({
        type: 'cityList',
        payload: response.data,
      });
    },
    *fetchCitySave({ payload, callback }, { call }) {
      const response = yield call(saveCity, payload);
      if (callback) callback(response);
    },
    *fetchCityEdit({ payload, callback }, { call }) {
      const response = yield call(editCity, payload);
      if (callback) callback(response);
    },
    *fetchCityDelete({ payload, callback }, { call }) {
      const response = yield call(deleteCity, payload);
      if (callback) callback(response);
    },

    // 区域
    *fetchRegionList({ payload }, { call, put }) {
      const response = yield call(getRegion, payload);
      yield put({
        type: 'regionList',
        payload: response.data,
      });
    },
    *fetchRegionSave({ payload, callback }, { call }) {
      const response = yield call(saveRegion, payload);
      if (callback) callback(response);
    },
    *fetchRegionEdit({ payload, callback }, { call }) {
      const response = yield call(editRegion, payload);
      if (callback) callback(response);
    },
    *fetchRegionDelete({ payload, callback }, { call }) {
      const response = yield call(deleteRegion, payload);
      if (callback) callback(response);
    },
    *fetchRegionDetails({ payload, callback }, { call, put }) {
      const response = yield call(getRegionDetail, payload);
      yield put({
        type: 'regionDetails',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    // 商圈
    *fetchBusinessList({ payload }, { call, put }) {
      const response = yield call(getBusiness, payload);
      yield put({
        type: 'businessList',
        payload: response.data,
      });
    },
    *fetchBusinessSave({ payload, callback }, { call }) {
      const response = yield call(saveBusiness, payload);
      if (callback) callback(response);
    },
    *fetchBusinessEdit({ payload, callback }, { call }) {
      const response = yield call(editBusiness, payload);
      if (callback) callback(response);
    },
    *fetchBusinessDelete({ payload, callback }, { call }) {
      const response = yield call(deleteBusiness, payload);
      if (callback) callback(response);
    },
    *fetchBusinessDetails({ payload, callback }, { call, put }) {
      const response = yield call(getBusinessDetail, payload);
      yield put({
        type: 'businessDetails',
        payload: response.data,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    countryList(state, { payload }) {
      return {
        ...state,
        countryList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    cityList(state, { payload }) {
      return {
        ...state,
        cityList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    regionList(state, { payload }) {
      return {
        ...state,
        regionList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    regionList(state, { payload }) {
      return {
        ...state,
        regionList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    regionDetails(state, { payload }) {
      return {
        ...state,
        regionDetails: payload.items,
      };
    },
    businessList(state, { payload }) {
      return {
        ...state,
        businessList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    businessDetails(state, { payload }) {
      return {
        ...state,
        businessDetails: payload.items,
      };
    },
  },
};
