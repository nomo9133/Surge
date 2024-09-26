// Ptt 自動登入 Bot

// 初始化環境
const $ = new Env('Ptt Login');

// 取得 Boxjs 中儲存的帳號密碼
let username = $.getdata("ptt.username");
let password = $.getdata("ptt.password");

if (!username || !password) {
  $.log("帳號或密碼未設定，請在 Boxjs 中設置");
  $.msg("Ptt Login Bot", "錯誤", "請在 Boxjs 中設置帳號密碼");
  $.done();
}

// Ptt 登入的 URL
const loginUrl = "https://www.ptt.cc/ask/over18";

// 進行登入
function login() {
  const loginData = {
    url: loginUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `from=%2Fbbs%2Findex.html&yes=yes`
  };

  $.post(loginData, (error, response, data) => {
    if (error) {
      $.log("登入失敗：" + error);
      $.msg("Ptt Login Bot", "登入失敗", error);
    } else if (response.statusCode === 200) {
      $.log("登入成功");
      $.msg("Ptt Login Bot", "登入成功", "已成功登入 Ptt");
    } else {
      $.log("登入失敗，狀態碼：" + response.statusCode);
      $.msg("Ptt Login Bot", "登入失敗", "狀態碼：" + response.statusCode);
    }
    $.done();
  });
}

// 呼叫登入函數
login();

// 支援的 Env 模組
function Env(t) {
  this.name = t;
  this.data = null;
  this.logs = [];
  this.isSurge = () => undefined !== this.$httpClient;
  this.isQuanX = () => undefined !== this.$task;
  this.getdata = (key) => {
    if (this.isSurge()) return $persistentStore.read(key);
    if (this.isQuanX()) return $prefs.valueForKey(key);
  };
  this.setdata = (key, val) => {
    if (this.isSurge()) return $persistentStore.write(val, key);
    if (this.isQuanX()) return $prefs.setValueForKey(val, key);
  };
  this.msg = (title, subtitle, body) => {
    if (this.isSurge()) $notification.post(title, subtitle, body);
    if (this.isQuanX()) $notify(title, subtitle, body);
  };
  this.log = (log) => this.logs.push(log);
  this.post = (request, callback) => {
    if (this.isSurge()) {
      $httpClient.post(request, callback);
    } else if (this.isQuanX()) {
      request.method = 'POST';
      $task.fetch(request).then(
        (response) => {
          callback(null, response, response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
  };
  this.done = (value = {}) => {
    if (this.isSurge()) return $done(value);
    if (this.isQuanX()) return $done(value);
  };
}