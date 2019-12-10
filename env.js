const configs = {
  // 本地环境
  local: {
    // API_SERVER: 'http://rap2api.qqty.com/app/mock/30',
    API_SERVER: 'http://adminapi-dev.cambeefood.com/v1',
    MQTT_API: '192.168.1.36',
    MQTT_PORT: 8083,
    USER_NAME: 'mqtt_appclient_nologin',
    PASSWORD: 'mqtt_appclient_nologin',
  },
  // 测试环境
  dev: {
    API_SERVER: 'http://adminapi-dev.cambeefood.com/v1',
    MQTT_API: '192.168.1.36',
    MQTT_PORT: 8083,
    USER_NAME: 'mqtt_appclient_nologin',
    PASSWORD: 'mqtt_appclient_nologin',
  },
  // 演示环境
  test: {
    API_SERVER: 'http://adminapi-test.cambeefood.com/v1',
    MQTT_API: '192.168.1.36',
    MQTT_PORT: 8083,
    USER_NAME: 'mqtt_appclient_nologin',
    PASSWORD: 'mqtt_appclient_nologin',
  },
  // 生产环境
  production: {
    API_SERVER: 'http://v1.cambeefood.com/v1',
    MQTT_API: '192.168.1.36',
    MQTT_PORT: 8083,
    USER_NAME: 'mqtt_appclient_nologin',
    PASSWORD: 'mqtt_appclient_nologin',
  },
};

export default configs;
