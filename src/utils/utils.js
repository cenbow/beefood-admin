import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { message, Modal } from 'antd';
import { getLocale } from 'umi-plugin-react/locale';
import fetch from 'dva/fetch';
import router from 'umi/router';
import defaultSettings from '@/defaultSettings';
import { getTranslate } from '@/services/common';
import configVar from '@/utils/configVar';

export function fixedZero (val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance (type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode (nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase (n) {
  return nzh.toMoney(n);
}

function getRelation (str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr (routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes (path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery () {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath (path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl (path) {
  return reg.test(path);
}

export function formatWan (val) {
  const v = val * 1;
  if (!v) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro () {
  return window.location.hostname === 'preview.pro.ant.design';
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

// 获取使用语言
export function getLocaleLang (val) {
  const selectedLang = getLocale();
  const languageLabels = {
    'zh-CN': '_cn',
    'en-US': '_en',
    'en-GB': '_kh',
  };
  return val + languageLabels[selectedLang];
}

// 区分性别
export function whatSex (val) {
  const sex = ['男', '女', '保密'];
  return sex[val - 1];
}

// 缩略图
export function getBase64 (img, callback) {
  const reader = new FileReader();
  if (callback) {
    reader.addEventListener('load', () => callback(reader.result));
  }
  reader.readAsDataURL(img);
}

// // 上传图片格式的判断
// export function beforeUpload(file) {
//   const isJpgOrPng =
//     file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
//   if (!isJpgOrPng) {
//     // message.error('仅支持.png/.jpg/.jpeg格式');
//   }
//   const isLt3M = file.size / 1024 / 1024 < 3;
//   if (!isLt3M) {
//     // message.error('图片大小限制300K以内!');
//   }
//   return false; //手动上传
// }
// 上传图片格式的判断
export function beforeUpload (file) {
  var ifUnload;
  const isJpgOrPng =
    file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  const isLt3M = file.size / 1024 / 1024 < 3;
  if (!isJpgOrPng) {
    message.error('仅支持.png/.jpg/.jpeg格式');
    ifUnload = false;
  } else if (!isLt3M) {
    message.error('图片大小限制300K以内!');
    ifUnload = false;
  } else {
    ifUnload = true;
  }
  return ifUnload;
}
// 获取翻译: 中文='zh-cn',英文='en',柬文='km'
/* export const getTranslatorVal = async (content, dest, src) => {
  let postData = {
    content: content,
    src: src || 'zh-cn',
    dest: dest,
  };
  let formData = new FormData();
  Object.keys(postData).forEach(key => {
    formData.append(key, postData[key]);
  });
  const res = await fetch(defaultSettings.translator_api, {
    method: 'POST',
    body: formData,
  })
    .then(function(response) {
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    })
    .then(function(res) {
      if (res.status == 1) {
        return res.data;
      } else {
        message.error('网络不给力，请重新再试');
      }
    });
  return res;
}; */

// goBack
export function goBack () {
  Modal.confirm({
    title: '温馨提示',
    content: '确定放弃修改内容?',
    onOk: () => {
      router.goBack();
    },
  });
}

//防抖函数：规定一定时间后只执行一次fn
export function debounce (fn, delay) {
  var timer;
  return () => {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

//获取动态路由
export function getMenuMapArrData (routes) {
  routes.forEach((item, i) => {
    item.labelname = item.name;
    item.label = item.name;
    if (item.children.length > 0) {
      var arr = [];
      var arr1 = [];
      item.children.forEach(item1 => {
        if (item1.isMenu) {
          arr1.push(item1.isMenu);
        }
      });
      if (arr1.indexOf(1) == -1) {
        item.children.forEach(item2 => {
          if (item2.name) {
            arr1.push(item2.name);
          }
        });
        item.children = arr1;
      }

      // if (item.children[0].isMenu == 0) {
      //   item.children.forEach(item1 => {
      //     arr.push(item1.name);
      //   });
      //   item.children = arr;
      // } else {
      // }
    }
  });
  return routes;
}

//获取功能菜单
export function getMenu (menu, oneMenu, twoMenu) {
  let menuArr = [];
  if (menu.length > 0) {
    menu.forEach(item => {
      if (item.label == 'menu.' + oneMenu) {
        item.children.forEach(item1 => {
          if (twoMenu == null) {
            menuArr.push(item1);
          } else {
            if (item1.name == 'menu.' + oneMenu + '.' + twoMenu) {
              if (item1.children.length > 0) {
                menuArr = item1.children;
              }
            }
          }
        });
      }
    });
  }

  return menuArr;
}

//获取重定向的路由
export function getRedirect (data) {
  if (data.length == 0) {
    return;
  } else if (data[0].path == '/home/index') {
    return '/home/index';
  } else if (data[0].path == '/member/consumer') {
    return '/member/consumer';
  } else if (data[0].path == '/accesscard') {
    return '/accesscard';
  } else if (data[0].path == '/business') {
    return '/business';
  } else if (data[0].path == '/station') {
    return '/station';
  } else if (data[0].path == '/stationmaster') {
    return '/stationmaster';
  } else if (data[0].path == '/bd') {
    return '/bd';
  } else if (
    data[0].path != '/home/index' ||
    data[0].path == '/member/consumer' ||
    data[0].path == '/accesscard' ||
    data[0].path == '/business' ||
    data[0].path == '/station' ||
    data[0].path == '/bd'
  ) {
    return data[0].children[0].path;
  }
}

const utils = {
  getDateTime(time) {
    const nowTimeDate = new Date(time.format('YYYY/MM/DD'));
    return Math.round(nowTimeDate.getTime() / 1000).toString();
  },
  getEndDateTime(time) {
    const nowTimeDate = new Date(time);
    return Math.round(nowTimeDate.setHours(23, 59, 59) / 1000).toString();
  },
  //时间日期筛选
  getDateTimeMap(rangeTimeValue) {
    if (rangeTimeValue && Object.keys(rangeTimeValue).length > 0) {
      return utils.getDateTime(rangeTimeValue[0]) + ',' + utils.getDateTime(rangeTimeValue[1]);
    } else {
      return undefined;
    }
  },
  //格式化时间戳
  deteFormat(time, format = 'YYYY-MM-DD HH:mm:ss') {
    return time ? moment(time * 1000).format(format) : '-';
  },
  // 时间赋值
  setDateValue(time, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(new Date(time * 1000), format);
  },
  //判断是否JSON
  isJSON (str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  },
  //判断是否有操作权限
  isHasMenu (menu, name) {
    try {
      return menu.indexOf(name) != -1 ? true : false;
    } catch (e) {
      return false;
    }
  },
  //接口请求数据是否正常
  successReturn (res, callback) {
    let status = false;
    if (!res || (res && res.code != 200)) {
      message.error(res ? res.msg : '网络错误');
      status = false;
    } else {
      status = true;
    }
    if (status) {
      if (typeof callback === 'function') {
        //FunName为函数名称
        callback();
      }
    }
    return status;
  },
  // 多语言翻译
  async translator (form, name, type) {
    let name_cn = '',
      name_en = '',
      name_kh = '',
      symbol = '',
      content = '',
      lang = '',
      data = '';
    // 判断是否数组名称过来的
    if (type != undefined && type == 'array') {
      symbol = ']';
    }
    name_cn = name + '_cn' + symbol;
    name_en = name + '_en' + symbol;
    name_kh = name + '_kh' + symbol;
    // 获取form中的值
    const content_cn = form.getFieldValue(name_cn) || '';
    const content_en = form.getFieldValue(name_en) || '';
    const content_kh = form.getFieldValue(name_kh) || '';
    if (content_cn == '' && content_en == '' && content_kh == '') {
      return message.error('请输入内容！');
    } else if (content_cn != '') {
      content = content_cn;
      lang = 'cn';
    } else if (content_en != '') {
      content = content_en;
      lang = 'en';
    } else if (content_kh != '') {
      content = content_kh;
      lang = 'kh';
    }
    // 表单提交
    let formData = new FormData();
    formData.append('content', content);
    const res = await getTranslate(formData);
    if (!utils.successReturn(res)) return;
    // 赋值
    data = res.data.items;
    switch (lang) {
      case 'cn':
        form.setFieldsValue({
          [name_en]: data.en,
          [name_kh]: data.kh,
        });
        break;
      case 'en':
        form.setFieldsValue({
          [name_cn]: data.cn,
          [name_kh]: data.kh,
        });
        break;
      case 'kh':
        form.setFieldsValue({
          [name_cn]: data.cn,
          [name_en]: data.en,
        });
        break;
    }
    return data;
  },
  //加载本地矢量图
  onMapStyleLoad (map) {
    map.addSource('city_tile_source', configVar.mapConfig.city_tile_source);
    map.addLayer(configVar.mapConfig.addLayer_polygon);
    map.addLayer(configVar.mapConfig.addLayer_normal);
    map.addLayer(configVar.mapConfig.addLayer_select_line);
  },
  // 处理JSON.parse数据
  isJsonParse (obj) {
    if (obj) {
      try {
        obj = JSON.parse(obj)
      } catch (error) {
        console.log('不是JSON数据');
      }
    }
    return obj;
  },
  //JSON格式数组
  jsonArray (arr) {
    if (arr) {
      return utils.isJsonParse(arr);
    }
    return [];
  },
  //字符串转数组
  string_to_array (str) {
    if (str) {
      return str.split(',');
    }
    return [];
  },
  //数据修改前后对比,is:是否对比，obj1：数据1，obj2：数据2，
  objectContrast (is, obj1, obj2) {
    obj1 = String(String(obj1) || "");
    obj2 = String(String(obj2) || "");
    if (Object.keys(is).length > 0 && obj1 != obj2) {
      return 'common_dl_red';
    }
    return '';
  },
  // 处理金额输入校验格式
  isMoney () {
    return /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/;
  },
  // 数字校验格式
  isRealNum() {
    return /^[0-9]*[1-9][0-9]*$/;
  },
  // 匹配非负整数（正整数 + 0）
  isIntNum() {
    return /^[1-9]\d*|0$/;
  },
  // 处理金额的显示或提交保存时的状态，0：显示。1：提交
  handleMoney(val, type) {
    return type == 1 ? parseFloat((val * 100).toPrecision(12)) : parseFloat((val / 100).toPrecision(12));
  },
  // 判断是否为空
  isEmpty (v) {
    switch (typeof v) {
      case 'undefined':
        return true;
      case 'string':
        if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
        break;
      case 'boolean':
        if (!v) return true;
        break;
      case 'number':
        if (0 === v || isNaN(v)) return true;
        break;
      case 'object':
        if (null === v || v.length === 0) return true;
        for (var i in v) {
          return false;
        }
        return true;
    }
    return false;
  },

};
export default utils;
