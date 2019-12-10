import {
  getCountry,
  getCity,
  getRegion,
  getBusiness,
  getStation,
  getBdManagerBusiness,
  getUser,
  getBdManager,
  getBdListForForm,
  getMerchant,
  getMerchantDish,
  getSubject,
  getMCategory,
  getLevelMCategory,
  getCommonConfig,
  getPermissionList,
  getStationAgent,
  getTranslate,
  getDriverEvaluateLabel,
} from '@/services/common';
import { getMenuMapArrData, getRedirect } from '@/utils/utils';
import { routerRedux } from 'dva/router';

export default {
  namespace: 'common',

  state: {
    country: [],
    city: [],
    region: [],
    business: [],
    station: [],
    bdManagerBusiness: [],
    bdManager: [],
    bdListForForm: [],
    merchant: [],
    merchantDish: [],
    getMCategory: [],
    getMCategoryLevel2: [],
    getMCategoryLevel3: [],
    levelMCategory: {},
    commonConfig: {
      image_domain: '',
    },
    permissionList: [],
    stationAgentList: [],
    driverEvaluateLabel: [],
  },

  effects: {
    *getCountry({ payload, callback }, { call, put }) {
      const response = yield call(getCountry, payload);
      yield put({
        type: 'country',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getCity({ payload, callback }, { call, put }) {
      if (payload == 'clear') {
        yield put({
          type: 'cityClear',
          payload: [],
        });
        return;
      }
      const response = yield call(getCity, payload);
      yield put({
        type: 'city',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getRegion({ payload, callback }, { call, put }) {
      if (payload == 'clear') {
        yield put({
          type: 'regionClear',
          payload: [],
        });
        return;
      }
      const response = yield call(getRegion, payload);
      yield put({
        type: 'region',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getBusiness({ payload, callback }, { call, put }) {
      if (payload == 'clear') {
        yield put({
          type: 'businessClear',
          payload: [],
        });
        return;
      }
      const response = yield call(getBusiness, payload);
      yield put({
        type: 'business',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getStation({ payload, callback }, { call, put }) {
      if (payload == 'clear') {
        yield put({
          type: 'stationClear',
          payload: [],
        });
        return;
      }
      const response = yield call(getStation, payload);
      yield put({
        type: 'station',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getBdManagerBusiness({ payload }, { call, put }) {
      const response = yield call(getBdManagerBusiness, payload);
      yield put({
        type: 'bdManagerBusiness',
        payload: response.data,
      });
    },
    *getBdManager({ payload }, { call, put }) {
      const response = yield call(getBdManager, payload);
      yield put({
        type: 'bdManager',
        payload: response.data,
      });
    },
    *getBdListForForm({ payload }, { call, put }) {
      const response = yield call(getBdListForForm, payload);
      yield put({
        type: 'bdListForForm',
        payload: response.data,
      });
    },
    *getMerchant({ payload, callback }, { call, put }) {
      const response = yield call(getMerchant, payload);
      yield put({
        type: 'merchant',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *getMerchantDish({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantDish, payload);
      yield put({
        type: 'merchantDish',
        payload: response.data,
      });
    },
    *getUser({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
    *getSubject({ payload }, { call, put }) {
      const response = yield call(getSubject, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
    *getMCategory({ payload }, { call, put }) {
      const response = yield call(getMCategory, payload);
      yield put({
        type: 'mCategory',
        payload: response.data,
      });
    },
    *getMCategoryLevel2({ payload }, { call, put }) {
      const response = yield call(getMCategory, payload);
      yield put({
        type: 'mCategoryLevel2',
        payload: response.data,
      });
    },
    *getMCategoryLevel3({ payload }, { call, put }) {
      const response = yield call(getMCategory, payload);
      yield put({
        type: 'mCategoryLevel3',
        payload: response.data,
      });
    },
    *getLevelMCategory({ payload }, { call, put }) {
      const response = yield call(getLevelMCategory, payload);
      yield put({
        type: 'levelMCategory',
        payload: response.data,
      });
    },
    *fetchCommonConfig({ payload }, { call, put }) {
      const response = yield call(getCommonConfig, payload);
      yield put({
        type: 'saveCommonConfig',
        payload: response.data,
      });
    },
    *fetchPermissionList({ payload, callback }, { call, put }) {
      const response = yield call(getPermissionList, payload);
      if (response.data.items.length > 0) {
        localStorage.setItem('REDIRECT', getRedirect(response.data.items));
      } else {
        localStorage.setItem('REDIRECT', '/exception/403');
      }
      yield put({
        type: 'commonPermissionList',
        payload: response.data,
      });
      if (callback) callback(response);
      if (response.code == 200) {
        // 跳转路由
        yield put(routerRedux.replace(redirect || localStorage.getItem('REDIRECT')));
      }
    },
    *fetchStationAgent({ payload }, { call, put }) {
      const response = yield call(getStationAgent, payload);
      yield put({
        type: 'commonStationAgent',
        payload: response.data,
      });
    },
    *fetchDriverEvaluateLabel({ payload }, { call, put }) {
      const response = yield call(getDriverEvaluateLabel, payload);
      yield put({
        type: 'commonDriverEvaluateLabel',
        payload: response.data,
      });
    },
  },

  reducers: {
    country(state, { payload }) {
      return {
        ...state,
        country: payload.items,
      };
    },
    city(state, { payload }) {
      return {
        ...state,
        city: payload.items,
      };
    },
    region(state, { payload }) {
      return {
        ...state,
        region: payload.items,
      };
    },
    business(state, { payload }) {
      return {
        ...state,
        business: payload.items,
      };
    },
    cityClear(state, { payload }) {
      return {
        ...state,
        city: payload,
      };
    },
    regionClear(state, { payload }) {
      return {
        ...state,
        region: payload,
      };
    },
    businessClear(state, { payload }) {
      return {
        ...state,
        business: payload,
      };
    },
    station(state, { payload }) {
      return {
        ...state,
        station: payload.items,
      };
    },
    stationClear(state, { payload }) {
      return {
        ...state,
        station: payload,
      };
    },
    bdManagerBusiness(state, { payload }) {
      return {
        ...state,
        bdManagerBusiness: payload.items,
      };
    },
    bdManager(state, { payload }) {
      return {
        ...state,
        bdManager: payload.items,
      };
    },
    bdListForForm(state, { payload }) {
      return {
        ...state,
        bdListForForm: payload.items,
      };
    },
    merchant(state, { payload }) {
      return {
        ...state,
        merchant: payload.items,
      };
    },
    merchantDish(state, { payload }) {
      return {
        ...state,
        merchantDish: payload.items,
      };
    },
    mCategory(state, { payload }) {
      return {
        ...state,
        getMCategory: payload.items,
      };
    },
    levelMCategory(state, { payload }) {
      return {
        ...state,
        levelMCategory: payload.items,
      };
    },
    saveCommonConfig(state, { payload }) {
      return {
        ...state,
        commonConfig: {
          ...state.commonConfig,
          ...payload.items
        },
      };
    },
    commonPermissionList(state, { payload }) {
      return {
        ...state,
        permissionList: getMenuMapArrData(payload.items),
      };
    },
    commonStationAgent(state, { payload }) {
      return {
        ...state,
        stationAgentList: payload.items,
      };
    },
    commonDriverEvaluateLabel(state, { payload }) {
      return {
        ...state,
        driverEvaluateLabel: payload.items,
      };
    },
  },

  subscriptions: {
    /* setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/delivery/dispatchCenter') {
          dispatch({ type: 'getCountry', payload: {} });
          dispatch({ type: 'getCity', payload: {} });
          dispatch({ type: 'getRegion', payload: {} });
          dispatch({ type: 'getStation', payload: {} });
        }
      });
    }, */
  },
};
