# 说明
这是一个用于前端实现长连接的SDK，需要搭配 [v-socket](https://github.com/vaas1993/v-socket) 使用。

# 安装
```
npm install v-socket-js-sdk --save
```

# 使用
```javascript
let instance = new VSocket()

// 登录，三个参数从后端返回，具体见 v-socket 文档
insatnce.login(server, appid, password)

// 接收消息事件
instance.onReceive(message => {
    // WebSocket消息只支持字符串，若需要其它格式需要序列化返回，然后前端在这里反序列化后使用
    console.log(message)
})
```

# 方法
- close()
> 关闭连接，关闭成功时会触发连接关闭事件

- heartbeat()
> 心跳，执行该方法后会定时发送心跳包保持连接活跃，默认不执行

- setHeartbeatInterval(millisecond)
> 设置心跳间隔，默认 10000 毫秒

- setHeartbeatInterval()
> 获取当前心跳间隔

- login(server, appid, password)
> 登录连接消息，三个参数需要建议从后端返回，具体见 v-socket 文档

- setReconnectCount(number)
> 设置断线重试次数，默认为 3 次，设置为 0 表示不自动重试

- getReconnectCount()
> 获取断线重试次数

- onLoginSuccess(callback)
> 监听登录成功事件

- offLoginSuccess(callback)
> 取消监听登录成功事件

- onReceive(callback)
> 监听接收消息事件

- offReceive(callback)
> 取消监听接收消息事件

- onDisconnect(callback)
> 监听断开连接事件（手动调用 close 方法并且断开成功后，也会触发该事件）

- offDisconnect(callback)
> 取消监听断开连接事件

- onConnectFail(callback)
> 监听连接失败事件，调用 login 方法后如果连接失败则触发该事件，触发后不会自动重试

- offConnectFail(callback)
> 取消监听连接失败事件