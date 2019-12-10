export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      {
        component: '404',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // dashboard -- 首页
      { path: '/', redirect: '/home/index' },
      {
        path: '/home/index',
        icon: 'home',
        name: 'home',
        component: './Home/Index',
      },
      // member -- 用户管理
      {
        path: '/member/consumer',
        icon: 'user',
        name: 'member',
        routes: [
          {
            path: '/member/consumer',
            component: './Member/Consumer',
          },
          {
            path: '/member/consumer/details/:id',
            component: './Member/ConsumerDetails',
          },
          {
            path: '/member/consumer/bonusDetails/:id',
            component: './Member/BonusDetails',
          },
        ],
      },
      // merchant -- 商家管理
      {
        path: '/merchant',
        icon: 'shop',
        name: 'merchant',
        // authority: ['admin'],
        routes: [
          {
            path: '/merchant/all',
            name: 'all',
            component: './Merchant/MerchantAll',
          },
          {
            path: '/merchant/create',
            component: './Merchant/Create/index',
          },
          {
            path: '/merchant/details/:id',
            component: './Merchant/Details/index',
          },
          {
            path: '/merchant/commodity/:id',
            component: './Merchant/Details/CommodityCreate',
          },
          {
            path: '/merchant/claim',
            name: 'claim',
            component: './Merchant/Claim',
          },
          {
            path: '/merchant/follow',
            name: 'follow',
            component: './Merchant/Follow',
          },
          {
            path: '/merchant/cooperation',
            name: 'cooperation',
            component: './Merchant/Cooperation',
          },
          {
            path: '/merchant/auditing',
            name: 'auditing',
            component: './Merchant/Auditing',
          },
          {
            path: '/merchant/auditing/:id',
            component: './Merchant/AuditingDetails/index',
          },
        ],
      },
      // driver -- 骑手管理
      {
        path: '/deliveryman',
        icon: 'smile',
        name: 'deliveryman',
        // component: './Deliveryman/Info',
        routes: [
          // {
          //   path: '/deliveryman',
          //   redirect: '/deliveryman/member',
          // },
          {
            path: '/deliveryman/member',
            name: 'member',
            component: './Deliveryman/Member/List',
          },
          {
            path: '/deliveryman/member/details/:id',
            component: './Deliveryman/Member/Details',
          },
          {
            path: '/deliveryman/evaluateSettings',
            name: 'evaluateSettings',
            component: './Deliveryman/EvaluateSettings',
          },
          {
            path: '/deliveryman/evaluateSettings/evaluateLabel',
            component: './Deliveryman/evaluateSettings/EvaluateLabel',
          },
          {
            path: '/deliveryman/rewardSettings',
            name: 'rewardSettings',
            component: './Deliveryman/RewardSettings',
          },
        ],
      },
      // deliveryman -- 调度中心
      /* {
        path: '/dispatchCenter',
        icon: 'solution',
        name: 'dispatchCenter',
        routes: [
          {
            path: '/dispatchCenter/index',
            name: 'index',
            component: './Delivery/DispatchCenter/List',
          },
        ],
      }, */
      // deliveryman -- 配送管理
      {
        path: '/delivery',
        icon: 'solution',
        name: 'delivery',
        routes: [
          {
            path: '/delivery/dispatchCenter',
            name: 'dispatchCenter',
            component: './Delivery/DispatchCenter/index',
          },
          {
            path: '/delivery/dispatchCenter/list',
            component: './Delivery/DispatchCenter/List',
          },
          {
            path: '/delivery/order',
            name: 'order',
            component: './Delivery/Order/List',
          },
          {
            path: '/delivery/order/details/:id',
            component: './Delivery/Order/Details',
          },
          {
            path: '/delivery/statistics',
            name: 'statistics',
            component: './Delivery/Statistics/List',
          },
          {
            path: '/delivery/statistics/details/:id',
            component: './Delivery/Statistics/StatisticsDetails',
          },
        ],
      },
      // order -- 订单管理
      {
        path: '/order',
        icon: 'shopping-cart',
        name: 'order',
        // component: './Order/Info',
        routes: [
          // {
          //   path: '/order',
          //   redirect: '/order/home',
          // },
          {
            path: '/order/home',
            name: 'home',
            component: './Order/Home/List',
          },
          {
            path: '/order/home/details/:order_no/:user_id',
            component: './Order/Home/Details',
          },
          {
            path: '/order/service',
            name: 'service',
            component: './Order/Service/List',
          },
          {
            path: '/order/service/details/:id',
            component: './Order/Service/Details',
          },
        ],
      },
      // message -- 消息管理
      {
        path: '/message',
        icon: 'message',
        name: 'message',
        routes: [
          {
            path: '/message/consumer',
            name: 'consumer',
            component: './Message/Consumer/Index',
          },
          {
            path: '/message/consumer/history',
            component: './Message/Consumer/History',
          },
          {
            path: '/message/merchant',
            name: 'merchant',
            component: './Message/Merchant/Index',
          },
          {
            path: '/message/merchant/history',
            component: './Message/Merchant/History',
          },
          {
            path: '/message/deliveryman',
            name: 'deliveryman',
            component: './Message/Deliveryman/Index',
          },
          {
            path: '/message/deliveryman/history',
            component: './Message/Deliveryman/History',
          },
          {
            path: '/message/bd',
            name: 'bd',
            component: './Message/Bd/Index',
          },
          {
            path: '/message/bd/history',
            component: './Message/Bd/History',
          },
        ],
      },
      // visit -- 拜访管理
      {
        path: '/visit',
        icon: 'environment',
        name: 'visit',
        routes: [
          {
            path: '/visit/records',
            name: 'records',
            component: './Visit/VisitRecords',
          },
          {
            path: '/visit/routes',
            name: 'routes',
            component: './Visit/VisitRoutes',
          },
        ],
      },
      // statistics -- 统计管理
      {
        path: '/statistics',
        icon: 'appstore',
        name: 'statistics',
        routes: [
          {
            path: '/statistics/operate',
            name: 'operate',
            component: './Statistics/Operate/Operate',
          },
          {
            path: '/statistics/bonus',
            name: 'bonus',
            component: './Statistics/Bonus/Bonus',
          },
          {
            path: '/statistics/bonus/details/:type',
            component: './Statistics/Bonus/Details',
          },
          {
            path: '/statistics/coupon',
            name: 'coupon',
            component: './Statistics/Coupon/Coupon',
          },
          {
            path: '/statistics/merchant',
            name: 'merchant',
            component: './Statistics/Merchant/Merchant',
          },
          {
            path: '/statistics/merchant/saledish/:id',
            name: 'merchant',
            component: './Statistics/Merchant/SaleDishMerchant',
          },
          {
            path: '/statistics/merchant/saledish/details/:id',
            component: './Statistics/Merchant/Details',
          },
          {
            path: '/statistics/region',
            name: 'region',
            component: './Statistics/Region/Region',
          },
          {
            path: '/statistics/consumer',
            name: 'consumer',
            component: './Statistics/Consumer/Consumer',
          },
        ],
      },
      // config -- 平台配置
      {
        path: '/config',
        icon: 'tool',
        name: 'config',
        routes: [
          {
            path: '/config/base',
            name: 'base',
            component: './Config/Base/Base',
            routes: [
              {
                path: '/config/base',
                redirect: '/config/base/classify',
              },
              {
                path: '/config/base/classify',
                component: './Config/Base/Classify',
              },
              {
                path: '/config/base/classify/level_two/:id',
                component: './Config/Base/Classify',
              },
              {
                path: '/config/base/classify/level_three/:id',
                component: './Config/Base/Classify',
              },
              {
                path: '/config/base/ads',
                component: './Config/Base/Ads',
              },
              {
                path: '/config/base/ads/list/:type',
                component: './Config/Base/AdsList',
              },
              {
                path: '/config/base/ads/create',
                component: './Config/Base/AdsCreate',
              },
              {
                path: '/config/base/activity',
                component: './Config/Base/Activity',
              },
              {
                path: '/config/base/activity/edit',
                component: './Config/Base/ActivityEdit',
              },
              {
                path: '/config/base/delivery',
                component: './Config/Base/Delivery',
              },
              {
                path: '/config/base/delivery/edit',
                component: './Config/Base/DeliveryEdit',
              },
              {
                path: '/config/base/delivery/edit/:id',
                component: './Config/Base/DeliveryEdit',
              },
              {
                path: '/config/base/share',
                component: './Config/Base/Share',
              },
              {
                path: '/config/base/updateSetInfo',
                component: './Config/Base/UpdateSetInfo',
              },
              {
                path: '/config/base/hotSearch',
                component: './Config/Base/HotSearch',
              },
              {
                path: '/config/base/returnGoods',
                component: './Config/Base/ReturnGoods',
              },
              {
                path: '/config/base/mapSetting',
                component: './Config/Base/MapSetting',
              },
              {
                path: '/config/base/indexMCategory',
                component: './Config/Base/indexMCategory',
              },
              {
                path: '/config/base/userGetRedPacketBg',
                component: './Config/Base/userGetRedPacketBg',
              },
              {
                path: '/config/base/riskParamSet',
                component: './Config/Base/riskParamSet',
              },
            ],
          },
          {
            path: '/config/aboutUs',
            name: 'aboutUs',
            component: './Config/AboutUs/AboutUs',
          },
          {
            path: '/config/helpUs',
            name: 'helpUs',
            component: './Config/HelpUs/HelpUs',
          },
          {
            path: '/config/promotion',
            name: 'promotion',
            component: './Config/Promotion/Promotion',
          },
          {
            path: '/config/promotion/create',
            component: './Config/Promotion/Create',
          },
          {
            path: '/config/promotion/details/:id',
            component: './Config/Promotion/Details',
          },
          {
            path: '/config/explain',
            name: 'explain',
            component: './Config/Explain/Explain',
          },
        ],
      },
      // feedback -- 意见反馈
      {
        path: '/feedback',
        icon: 'book',
        name: 'feedback',
        routes: [
          {
            path: '/feedback/consumer',
            name: 'consumer',
            component: './Feedback/Consumer',
          },
          {
            path: '/feedback/merchant',
            name: 'merchant',
            component: './Feedback/Merchant',
          },
          {
            path: '/feedback/driveryman',
            name: 'driveryman',
            component: './Feedback/Driveryman',
          },
        ],
      },
      // setting -- 角色管理
      {
        path: '/setting',
        icon: 'setting',
        name: 'setting',
        routes: [
          {
            path: '/setting/user',
            name: 'user',
            component: './Setting/User/List',
          },
          {
            path: '/setting/user/create',
            component: './Setting/User/Create',
          },
          {
            path: '/setting/user/edit/:id',
            component: './Setting/User/Edit',
          },
          {
            path: '/setting/role',
            name: 'role',
            component: './Setting/Role/List',
          },
          {
            path: '/setting/role/create',
            component: './Setting/Role/Create',
          },
          {
            path: '/setting/role/edit/:id',
            component: './Setting/Role/Edit',
          },
          {
            path: '/setting/role/authority/:id',
            component: './Setting/Role/Authority',
          },
          {
            path: '/setting/permission',
            name: 'permission',
            component: './Setting/Permission/List',
          },
          {
            path: '/setting/permission/create',
            component: './Setting/Permission/Create',
          },
          {
            path: '/setting/permission/edit/:id',
            component: './Setting/Permission/Edit',
          },
        ],
      },
      // 出入证管理
      {
        path: '/accesscard',
        icon: 'setting',
        name: 'accesscard',
        // component: './AccessCard/List',
        routes: [
          {
            path: '/accesscard',
            component: './AccessCard/List',
          },
          {
            path: '/accesscard/create',
            component: './AccessCard/Create',
          },
          {
            path: '/accesscard/edit/:id',
            component: './AccessCard/Create',
          },
          //   {
          //     path: '/accesscard/edit',
          //     component: './AccessCard/Edit',
          //   },
          {
            path: '/accesscard/details/:id',
            component: './AccessCard/Details',
          },
        ],
      },
      // 城市商圈管理
      {
        path: '/business',
        icon: 'setting',
        name: 'business',
        routes: [
          { path: '/business', redirect: '/business/country' },
          {
            path: '/business/country',
            component: './Business/Country',
          },
          {
            path: '/business/city/:id',
            component: './Business/City',
          },
          {
            path: '/business/region/:id',
            component: './Business/Region',
          },
          {
            path: '/business/region/details/:id',
            component: './Business/RegionDetails',
          },
          {
            path: '/business/:id',
            component: './Business/Business',
          },
          {
            path: '/business/details/:id',
            component: './Business/BusinessDetails',
          },
        ],
      },
      // 站点管理
      {
        path: '/station',
        icon: 'setting',
        name: 'station',
        routes: [
          {
            path: '/station',
            component: './Station/Station',
          },
          {
            path: '/station/details/:id',
            component: './Station/Details',
          },
        ],
      },
      // 站长管理
      {
        path: '/stationmaster',
        icon: 'setting',
        name: 'stationmaster',
        routes: [
          {
            path: '/stationmaster',
            component: './StationMaster/StationMaster',
          },
          {
            path: '/stationmaster/details/:id',
            component: './StationMaster/Details',
          },
        ],
      },
      // BD团队管理
      {
        path: '/bd',
        icon: 'setting',
        name: 'bd',
        routes: [
          {
            path: '/bd',
            component: './Bd/BdList',
          },
          {
            path: '/bd/details/:id',
            component: './Bd/Details',
          },
        ],
      },
      // 官网管理
      {
        path: '/official',
        icon: 'laptop',
        name: 'official',
        routes: [
          {
            path: '/official/information',
            name: 'information',
            component: './Official/information',
          },
          {
            path: '/official/news',
            name: 'news',
            component: './Official/information',
          },
          {
            path: '/official/contact-us',
            name: 'contactUs',
            component: './Official/information',
          },
          {
            path: '/official/app-download',
            name: 'appDownload',
            component: './Official/information',
          },
          {
            path: '/official/ads',
            name: 'ads',
            component: './Official/information',
          },
        ],
      },
      // exception
      {
        path: '/exception/403',
        hideInMenu: true,
        component: './Exception/403',
      },
      {
        path: '/exception/404',
        hideInMenu: true,
        component: './Exception/404',
      },
      {
        path: '/exception/500',
        hideInMenu: true,
        component: './Exception/500',
      },
      {
        component: '404',
      },
    ],
  },
];
