// Ptt 自動登入 Bot

// 取得 Boxjs 中儲存的帳號密碼
let username = $persistentStore.read("ptt.username");
let password = $persistentStore.read("ptt.password");

if (!username || !password) {
  console.log("帳號或密碼未設定，請在 Boxjs 中設置");
  $notification.post("Ptt Login Bot", "錯誤", "請在 Boxjs 中設置帳號密碼");
  $done();
}

// Ptt 登入的 URL
const loginUrl = "https://www.ptt.cc/ask/over18";

// 進行登入
function login() {
  $httpClient.post({
    url: loginUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `from=%2Fbbs%2Findex.html&yes=yes`
  }, function(error, response, data) {
    if (error) {
      console.log("登入失敗：" + error);
      $notification.post("Ptt Login Bot", "登入失敗", error);
    } else {
      console.log("登入成功");
      $notification.post("Ptt Login Bot", "登入成功", "已成功登入 Ptt");
    }
    $done();
  });
}

// 呼叫登入函數
login();