import {
  getDeliverymanMemberList,
  getDriverList,
  getDriverEdit,
  getDriverApprove,
  getDriverUnapproved,
  getDriverDelete,
  getDriverAdd,
  getDriverDetail,
  getHorsemanEdit,
} from '@/services/deliveryman';

export default {
  namespace: 'deliverymanMemberList',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    detail: {},
    data1: {
      list: [
        {
          basic_price: 0,
          d_driver_grade_award: {
            id: '',
            driver_grade_id: '',
            award_price: {
              deliver_on_time_rate: 0,
              price: 0,
            },
            bring_price: [{ gt: 0, price: 0 }, { lt: 0, price: 0 }],
            append_price: 0,
          },
        },
      ],
    },
  },

  effects: {
    // consumer
    *fetchDeliverymanMemberList({ payload }, { call, put }) {
      const response = yield call(getDeliverymanMemberList, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
    //奖励设置-列表
    *fetchDriverList({ payload, callback }, { call, put }) {
      const response = yield call(getDriverList, payload);
      yield put({
        type: 'driverList',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    //奖励设置-修改
    *fetchDriverDradeEdit({ payload, callback }, { call, put }) {
      const response = yield call(getDriverEdit, payload);
      if (callback) callback(response);
    },
    //通过认证
    *fetchDriverApprove({ payload, callback }, { call, put }) {
      const response = yield call(getDriverApprove, payload);
      if (callback) callback(response);
    },
    //不通过认证
    *fetchDriverUnapproved({ payload, callback }, { call, put }) {
      const response = yield call(getDriverUnapproved, payload);
      if (callback) callback(response);
    },
    //删除骑手
    *fetchDriverDelete({ payload, callback }, { call, put }) {
      const response = yield call(getDriverDelete, payload);
      if (callback) callback(response);
    },
    //添加骑手
    *fetchDriverAdd({ payload, callback }, { call, put }) {
      const response = yield call(getDriverAdd, payload);
      console.log(response);
      if (callback) callback(response);
    },
    //编辑骑手
    *fetchDriverEdit({ payload, callback }, { call, put }) {
      const response = yield call(getHorsemanEdit, payload);
      console.log(response);
      if (callback) callback(response);
    },
    //获取骑手详情页面
    *fetchDriverDetail({ payload, callback }, { call, put }) {
      const response = yield call(getDriverDetail, payload);
      yield put({
        type: 'detail',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *consumerAdd({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *consumerRemove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *consumerUpdate({ payload, callback }, { call, put }) {
      const response = yield call(updateRule, payload);
      yield put({
        type: 'save',
        payload: response.data,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        // data: action.payload,
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
    driverList(state, action) {
      return {
        ...state,
        // data: action.payload,
        data1: {
          list: action.payload.items,
        },
      };
    },
    detail(state, action) {
      return {
        ...state,
        // data: action.payload,
        detail: action.payload.items,
      };
    },
  },
};
