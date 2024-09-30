const $ = new Env('ApkTw')

!(async () => {
  $.log('', `🔔 ${$.name}, 獲取會話: 開始!`, '')
  const session = {}
  session.url = $request.url
  session.headers = $request.headers
  delete session.headers['Content-Length']

  // 獲取請求中的 cookie
  let headerCookies = session.headers['cookie'] || session.headers['Cookie'] || ''
  $.log(`請求 cookie: ${headerCookies}`)

  // 將請求的 cookie 轉換為 Map
  let cookieMap = new Map()
  headerCookies.split('; ').forEach(cookie => {
    const [key, value] = cookie.split('=')
    cookieMap.set(key, value)
  })

  // 獲取響應中的 Set-Cookie 標頭
  let responseCookies = $response.headers['Set-Cookie'] || $response.headers['set-cookie'] || ''
  if (typeof responseCookies === 'string') {
    responseCookies = [responseCookies]
  }
  $.log(`響應 Set-Cookie: ${JSON.stringify(responseCookies)}`)

  // 處理每個 Set-Cookie
  responseCookies.forEach(setCookie => {
    $.log(`set-cookie: ${setCookie}`)
    let cookies = setCookie.split(/(xfhP_\d{4}_[^=]+)=/).filter(part => part)
    
    for (let i = 0; i < cookies.length; i += 2) {
      let key = cookies[i].trim()
      let valueWithAttributes = cookies[i + 1].trim()
      let [value, ...attributes] = valueWithAttributes.split(';').map(attr => attr.trim())
      
      $.log(`解析出的 cookie: ${key}=${value}, 屬性: ${attributes.join('; ')}`)
      
      if (value.toLowerCase() === 'deleted') {
        cookieMap.delete(key)
      } else {
        let cookieObj = {
          value: value,
          path: '/',
          secure: false,
          httponly: false
        }
        
        attributes.forEach(attr => {
          const [attrKey, attrValue] = attr.split('=').map(s => s.trim().toLowerCase())
          switch (attrKey) {
            case 'expires':
              cookieObj.expires = attrValue
              break
            case 'path':
              cookieObj.path = attrValue
              break
            case 'secure':
              cookieObj.secure = true
              break
            case 'httponly':
              cookieObj.httponly = true
              break
          }
        })
        
        cookieMap.set(key, JSON.stringify(cookieObj))
      }
    }
  })

  // 將合併後的 cookie 轉換為字符串
  const mergedCookies = Array.from(cookieMap, ([key, value]) => {
    try {
      const cookieObj = JSON.parse(value)
      return `${key}=${cookieObj.value}`
    } catch {
      return `${key}=${value}`
    }
  }).join('; ')

  // 更新 session.headers 中的 cookie
  session.headers.cookie = mergedCookies

  $.log('', `整合後的 cookie: ${mergedCookies}`)
  
  if ($.setdata(JSON.stringify(session), 'chavy_cookie_apktw')) {
    $.subt = '獲取會話: 成功!'
    $.desc = `已保存整合後的 Cookie 到 headers 中`
  } else {
    $.subt = '獲取會話: 失敗!'
    $.desc = `無法保存會話資訊`
  }
})()
  .catch((e) => {
    $.subt = '獲取會話: 失敗!'
    $.desc = `原因: ${e}`
    $.log(`❌ ${$.name}, 獲取會話: 失敗! 原因: ${e}!`)
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 獲取會話: 結束!`, ''), $.done()
  })

  // prettier-ignore
  function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}