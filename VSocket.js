function VSocket() {
    /**
     * 连接实例
     * @param {WebSocket}
     */
    this._socket = undefined

    /**
     * 事件处理器，那一系列 on 和 off 方法最终都会在这个属性里体现
     * @type {Object<string, Array>}
     */
    this._events = {}

    /**
     * 断线重连次数
     * @type {number}
     */
    this._reconnectCount = 5

    /**
     *
     * @type {boolean}
     */
    this.connected = false;

    /**
     * 连接配置，调用 login 方法时赋值
     * @type {object}
     */
    this._connectConfig = {
        server: '',
        appid: '',
        password: '',
    }
}

let reconnected = 0
let timeout = undefined
function reconnect(data, instance) {
    if( reconnected < instance._reconnectCount ) {
        clearTimeout(timeout)
        console.log("连接断开，将在 3 秒后重试")
        timeout = setTimeout(() => {
            instance.login(
                instance._connectConfig.server,
                instance._connectConfig.appid,
                instance._connectConfig.password,
            )
            reconnected++
        }, 3000)
    }
}

/**
 * 登录成功事件名
 * @type {string}
 */
VSocket.EVENT_LOGIN_SUCCESS = 'LOGON'

/**
 * 接收到新消息的事件名
 * @type {string}
 */
VSocket.EVENT_RECEIVE = 'RECEIVED'

/**
 * 连接断开的事件名
 * @type {string}
 */
VSocket.EVENT_DISCONNECT = 'CLOSED'

/**
 * 连接失败的事件名
 * @type {string}
 */
VSocket.EVENT_CONNECT_FAIL = 'CONNECT_FAIL'

VSocket.prototype = {
    constructor: VSocket,

    /**
     * 初始化
     * @param {string} server 服务地址
     * @returns {Promise}
     */
    init(server) {
        return new Promise(next => {
            this.connected = false
            this._socket = new WebSocket(server)
            this._socket.onmessage = res => {
                try {
                    let data = JSON.parse(res.data || '{}')
                    this._trigger(data.type, data.message)
                } catch (e) {
                    console.error("错误的消息格式：")
                    console.error(res.data)
                }
            }

            this._socket.onopen = () => {
                this.connected = true
                next()
            }
            this._socket.onclose = res => {
                this._trigger( this.connected ? this.constructor.EVENT_DISCONNECT : this.constructor.EVENT_CONNECT_FAIL, res)
            }
            this.offDisconnect(reconnect)
            this.onDisconnect(reconnect)
        })
    },

    /**
     * 登录
     * 该方法只能在 init 方法完成后调用，否则报错
     * @param {string} server 服务地址
     * @param {string} appid 应用ID
     * @param {string} password 密码
     */
    async login(server, appid, password) {
        this._connectConfig = {
            server,
            appid,
            password
        }

        await this.init(server)
        this._socket.send(JSON.stringify({
            action: 'login',
            data: {
                appid,
                password,
            }
        }))
    },

    /**
     * 设置断线重连次数
     * @param count
     */
    setReconnectCount(count) {
        this._reconnectCount = count
    },

    /**
     * 获取断线重连次数
     * @returns {number}
     */
    getReconnectCount() {
        return this._reconnectCount
    },

    /**
     * 添加事件监听
     * @param {string} eventName
     * @param {function} callback
     */
    _on(eventName, callback) {
        if( !Array.isArray(this._events[eventName]) ) {
            this._events[eventName] = [];
        }
        this._events[eventName].push(callback)
    },

    /**
     * 移除事件监听
     * @param {string} eventName
     * @param {function|null} callback 传入一个函数，将只移除对应的监听器，否则移除该事件的全部监听器
     */
    _off(eventName, callback = null) {
        if( callback === null ) {
            delete this._events[eventName]
            return
        }
        for(let index in (this._events[eventName] || [])) {
            if( callback === this._events[eventName][index] ) {
                this._events[eventName].splice(index, 1)
            }
        }
    },

    /**
     * 触发事件
     * @param {string} eventName
     * @param data
     */
    _trigger(eventName, data) {
        for (let handler of this._events[eventName] || []) {
            handler(data, this)
        }
    },

    /**
     * 登录成功事件
     * @param {function} callback
     */
    onLoginSuccess(callback) {
        this._on(this.constructor.EVENT_LOGIN_SUCCESS, callback)
    },

    /**
     * 移除登录成功事件监听
     * @param {function|null} callback 传入一个函数，将只移除对应的监听器，否则移除该事件的全部监听器
     */
    offLoginSuccess(callback = null) {
        this._off(this.constructor.EVENT_LOGIN_SUCCESS, callback)
    },

    /**
     * 接收消息事件
     * @param {function} callback
     */
    onReceive(callback) {
        this._on(this.constructor.EVENT_RECEIVE, callback)
    },

    /**
     * 移除新消息事件监听
     * @param {function|null} callback 传入一个函数，将只移除对应的监听器，否则移除该事件的全部监听器
     */
    offReceive(callback = null) {
        this._off(this.constructor.EVENT_RECEIVE, callback)
    },

    /**
     * 连接断开事件
     * @param {function} callback
     */
    onDisconnect (callback) {
        this._on(this.constructor.EVENT_DISCONNECT, callback)
    },

    /**
     * 移除连接断开事件监听
     * @param {function|null} callback 传入一个函数，将只移除对应的监听器，否则移除该事件的全部监听器
     */
    offDisconnect (callback = null) {
        this._off(this.constructor.EVENT_DISCONNECT, callback)
    },

    /**
     * 连接失败事件
     * @param {function} callback
     */
    onConnectFail (callback) {
        this._on(this.constructor.EVENT_CONNECT_FAIL, callback)
    },

    /**
     * 移除连接失败事件监听
     * @param {function|null} callback 传入一个函数，将只移除对应的监听器，否则移除该事件的全部监听器
     */
    offConnectFail (callback = null) {
        this._off(this.constructor.EVENT_CONNECT_FAIL, callback)
    },
}

export default VSocket