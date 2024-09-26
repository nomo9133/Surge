// Boxjs Ptt Login Bot

// 取得 Boxjs 中儲存的帳號密碼
let username = $persistentStore.read("ptt_username") || "";
let password = $persistentStore.read("ptt_password") || "";

if (!username || !password) {
  console.log("請在 Boxjs 中設置 Ptt 帳號和密碼");
  $notification.post("Ptt Login Bot", "錯誤", "未設置帳號密碼");
  $done();
}

// Ptt 登入的 URL
const loginUrl = "https://www.ptt.cc/ask/over18";

// 登入流程
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
      $done();
    } else {
      console.log("登入成功");
      $notification.post("Ptt Login Bot", "登入成功", "已成功登入 Ptt");
      $done();
    }
  });
}

// 如果帳號和密碼存在，進行登入
login();