const $ = new Env('ApkTw')
$.VAL_login = $.getdata('chavy_cookie_apktw')

!(async () => {
  $.log('', `🔔 ${$.name}, 開始!`, '')
  await login()
  await getHash()
  if (!$.isSigned) {
    await sign()
  }
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失敗! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 結束!`, ''), $.done()
  })

// 登入
function login() {
  $.log("登入..");
  const url = JSON.parse($.VAL_login)
  return new Promise((resove) => {
    $.post(url, (error, response, data) => {
      try {
        $.log("登入成功");
      } catch (e) {
        $.log(`❗️ ${$.name}, 登入失敗!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
      } finally {
        resove()
      }
    })
  })
}

function getHash() {
  $.log("取得Hash..");
  return new Promise((resolve, reject) => {
    const loginInfo = JSON.parse($.VAL_login);
    const url = {
      url: 'https://apk.tw/',
      headers: {
        'Host': 'apk.tw',
        'Referer': 'https://apk.tw/forum.php',
        'Accept': '*/*',
        'cookie': loginInfo.headers.cookie,
        'User-Agent': loginInfo.headers["user-agent"]
      }
    };

    //$.log("本次使用cookie: " + loginInfo.headers.cookie);

    $.get(url, (error, response, data) => {
      if (error) {
        $.log(`❗️ ${$.name}, 執行失敗!`, ` error = ${error}`, `response = ${JSON.stringify(response)}`, '');
        reject(error);
        return;
      }

      try {
        // 取得使用者名稱
        const usernameMatch = /<a href="space-uid-\d+\.html" target="_blank" title="訪問我的空間" class="showmenu">([^<]+)<\/a>/.exec(data);
        if (usernameMatch) {
          $.username = usernameMatch[1];
          $.log(`使用者名稱: ${$.username}`);
        }

        // 取得用戶組
        const usergroupMatch = /<a href="home\.php\?mod=spacecp&amp;ac=usergroup"><strong>\s*(.*?)\s*<\/strong><\/a>/.exec(data);
        if (usergroupMatch) {
          let usergroup = usergroupMatch[1].trim();
          
          // 使用正則表達式提取用戶組，如果存在 "用戶組:" 前綴
          const groupMatch = /用戶組:\s*(.+)/.exec(usergroup);
          if (groupMatch) {
            $.usergroup = groupMatch[1].trim();
          } else {
            // 如果沒有匹配到 "用戶組:"，則使用 split 方法
            const parts = usergroup.split(/:\s*/);
            $.usergroup = parts[parts.length - 1].trim();
          }
          
          $.log(`用戶組: ${$.usergroup}`);
        }

        $.log("檢查是否已經簽到");
        if (/\/source\/plugin\/dsu_amupper\/images\/wb\.gif/.test(data)) {
          $.log("已經簽到");
          $.isSigned = true;
          $.isSignSuc = true;
        } else {
          $.log("尚未簽到");
          $.isSigned = false;
          const match = /formhash=([^&]+)/.exec(data);
          if (match) {
            $.hash = match[1];
            $.log("找到hash值: " + $.hash);
          } else {
            $.log("找不到hash");
            $.isSignSuc = false;
          }
        }
        resolve();
      } catch (e) {
        $.log(`❗️ ${$.name}, 執行失敗!`, ` error = ${e}`, `response = ${JSON.stringify(response)}`, '');
        reject(e);
      }
    });
  });
}

function sign() {
  return new Promise((resolve) => {
    if ($.isSigned) {
      $.log("已經簽到,跳過簽到流程");
      $.isSignSuc = true;
      resolve();
      return;
    }
    
    if (!$.hash) {
      $.log("沒有找到 hash 值,無法進行簽到");
      $.isSignSuc = false;
      resolve();
      return;
    }
    
    const loginInfo = JSON.parse($.VAL_login);
    const url = {
      url: `https://apk.tw/plugin.php?id=dsu_amupper:pper&ajax=1&formhash=${$.hash}`,
      headers: {
        'Host': 'apk.tw',
        'Referer': 'https://apk.tw/forum.php',
        'Accept': '*/*',
        'cookie': loginInfo.headers.cookie,
        'User-Agent': loginInfo.headers["user-agent"]
      }
    };
    
    $.get(url, (error, response, data) => {
      $.log("簽到中..")
      try {
        if (error) throw new Error(error)
        if (/\/source\/plugin\/dsu_amupper\/images\/wb\.gif/.test(data)) {
          $.isSignSuc = true
          $.log("簽到成功");
        } else {
          $.isSignSuc = false
          $.log("簽到失敗");
        }
      } catch (e) {
        $.isSignSuc = false
        $.log(`❗️ ${$.name}, 執行失敗!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
      } finally {
        resolve()
      }
    })
  })
}

function showmsg() {
  return new Promise((resove) => {
    if ($.isSigned) {
      $.subt = '簽到: 重複'
    } else if (!$.isSigned && $.isSignSuc) {
      $.subt = '簽到: 成功'
    } else {
      $.subt = '簽到: 失敗'
    }
    $.desc = `使用者名稱: ${$.username || '未知'}`
    $.desc += `\n用戶組: ${$.usergroup || '未知'}`
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}