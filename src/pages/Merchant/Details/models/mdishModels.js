import {
  getMerchantMdishList,
  saveMerchantMdish,
  editMerchantMdish,
  deleteMerchantMdish,
  getMerchantMdishDetails,
  changeStatus,
  getMcategoryList,
  saveMcategory,
  editMcategory,
  getMcategoryInfo,
  deleteMcategory,
  submitMbientSave,
  getMbientInfo,
  getDishTagList,
  saveDishTag,
  editDishTag,
  getDishTagInfo,
  deleteDishTag,
  getDishAttributeList,
  saveDishAttribute,
  editDishAttribute,
  getDishAttributeInfo,
  deleteDishAttribute,
  saveMuserShopInfo,
  getMuserShopInfo,
  getMerchantFinanceList,
  getMerchantOrderList,
  getMerchantCommentList,
  deleteMerchantComment,
} from '@/services/mdish';

let dataList = {
  list: [],
  pagination: {},
};

export default {
  namespace: 'mdish',

  state: {
    // merchantAllList: dataList,
    // details: {},
    mdishList: dataList,
    financeList: dataList,
    commentList: dataList,
    mdishDetails: {},
    mdishUserShopInfo: {},
    mcategoryList: {},
    dishTagList: [],
    dishAttributeList: [],
  },

  effects: {
    // 商品管理
    *fetchMdishList({ payload }, { call, put }) {
      const response = yield call(getMerchantMdishList, payload);
      yield put({
        type: 'getMdishList',
        payload: response.data,
      });
    },
    *fetchSaveMdish({ payload, callback }, { call }) {
      const response = yield call(saveMerchantMdish, payload);
      if (callback) callback(response);
    },
    *fetchEditMdish({ payload, callback }, { call }) {
      const response = yield call(editMerchantMdish, payload);
      if (callback) callback(response);
    },
    *fetchMdishDelete({ payload, callback }, { call }) {
      const response = yield call(deleteMerchantMdish, payload);
      if (callback) callback(response);
    },
    *fetchMdishDetails({ payload, callback }, { call, put }) {
      const response = yield call(getMerchantMdishDetails, payload);
      if (callback) callback(response);
      yield put({
        type: 'mdishDetails',
        payload: response.data,
      });
    },

    //获取商品分类
    *getMcategoryList({ payload, callback }, { call, put }) {
      const response = yield call(getMcategoryList, payload);
      yield put({
        type: 'mdishMcategoryList',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchSaveMcategory({ payload, callback }, { call }) {
      const response = yield call(saveMcategory, payload);
      if (callback) callback(response);
    },
    *fetchEditMcategory({ payload, callback }, { call }) {
      const response = yield call(editMcategory, payload);
      if (callback) callback(response);
    },
    *fetchMcategoryDelete({ payload, callback }, { call }) {
      const response = yield call(deleteMcategory, payload);
      if (callback) callback(response);
    },

    // 快捷上下架
    *fetchChangeStatus({ payload, callback }, { call }) {
      const response = yield call(changeStatus, payload);
      if (callback) callback(response);
    },

    //获取店铺门面/环境 - 保存
    *fetchMbientSave({ payload, callback }, { call }) {
      // console.log(111);
      const response = yield call(submitMbientSave, payload);
      // console.log(response);
      if (callback) callback(response);
    },
    *fetchMbientInfo({ payload, callback }, { call, put }) {
      // console.log(111);
      const response = yield call(getMbientInfo, payload);
      // yield put({
      //   type: 'mdishMcategoryList',
      //   payload: response.data,
      // });
      if (callback) callback(response);
    },

    //获取商品标签
    *getDishTagList({ payload }, { call, put }) {
      const response = yield call(getDishTagList, payload);
      yield put({
        type: 'dishTagList',
        payload: response.data,
      });
    },
    *fetchSaveDishTag({ payload, callback }, { call }) {
      const response = yield call(saveDishTag, payload);
      if (callback) callback(response);
    },
    *fetchEditDishTag({ payload, callback }, { call }) {
      const response = yield call(editDishTag, payload);
      if (callback) callback(response);
    },
    *fetchDishTagInfo({ payload, callback }, { call }) {
      const response = yield call(getDishTagInfo, payload);
      if (callback) callback(response);
    },
    *fetchDishTagDelete({ payload, callback }, { call }) {
      const response = yield call(deleteDishTag, payload);
      if (callback) callback(response);
    },

    //获取商品属性
    *getDishAttributeList({ payload }, { call, put }) {
      const response = yield call(getDishAttributeList, payload);
      yield put({
        type: 'dishAttributeList',
        payload: response.data,
      });
    },
    *fetchSaveDishAttribute({ payload, callback }, { call }) {
      const response = yield call(saveDishAttribute, payload);
      if (callback) callback(response);
    },
    *fetchEditDishAttribute({ payload, callback }, { call }) {
      const response = yield call(editDishAttribute, payload);
      if (callback) callback(response);
    },
    *fetchDishAttributeInfo({ payload, callback }, { call }) {
      const response = yield call(getDishAttributeInfo, payload);
      if (callback) callback(response);
    },
    *fetchDishAttributeDelete({ payload, callback }, { call }) {
      const response = yield call(deleteDishAttribute, payload);
      if (callback) callback(response);
    },

    // 店铺配置
    *fetchSaveMuserShopInfo({ payload, callback }, { call }) {
      const response = yield call(saveMuserShopInfo, payload);
      if (callback) callback(response);
    },
    *fetchMuserShopInfo({ payload, callback }, { call, put }) {
      const response = yield call(getMuserShopInfo, payload);
      if (callback) callback(response);
      yield put({
        type: 'mdishUserShopInfo',
        payload: response.data,
      });
    },

    //资金明细列表
    *fetchFinanceList({ payload }, { call, put }) {
      const response = yield call(getMerchantFinanceList, payload);
      yield put({
        type: 'getFinanceList',
        payload: response.data,
      });
    },
    //订单列表
    *fetchOrderList({ payload }, { call, put }) {
      const response = yield call(getMerchantOrderList, payload);
      yield put({
        type: 'getOrderList',
        payload: response.data,
      });
    },
    //评价列表
    *fetchCommentList({ payload }, { call, put }) {
      const response = yield call(getMerchantCommentList, payload);
      yield put({
        type: 'getCommentList',
        payload: response.data,
      });
    },
    *fetchMerchantCommentDelete({ payload, callback }, { call }) {
      const response = yield call(deleteMerchantComment, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    getMdishList(state, { payload }) {
      return {
        ...state,
        mdishList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    mdishDetails(state, { payload }) {
      return {
        ...state,
        mdishDetails: payload.items,
      };
    },
    mdishMcategoryList(state, { payload }) {
      return {
        ...state,
        mcategoryList: payload.items,
      };
    },
    dishTagList(state, { payload }) {
      return {
        ...state,
        dishTagList: payload.items,
      };
    },
    dishAttributeList(state, { payload }) {
      return {
        ...state,
        dishAttributeList: payload.items,
      };
    },
    mdishUserShopInfo(state, { payload }) {
      return {
        ...state,
        mdishUserShopInfo: payload.items,
      };
    },
    getFinanceList(state, { payload }) {
      return {
        ...state,
        financeData: {
          order_claim: payload.order_claim,
          order_income: payload.order_income,
          order_refund: payload.order_refund,
          order_withdraw: payload.order_withdraw,
          platform_reward: payload.platform_reward,
        },
        financeList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    getOrderList(state, { payload }) {
      return {
        ...state,
        orderList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    getCommentList(state, { payload }) {
      return {
        ...state,
        commentList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
  },
};
