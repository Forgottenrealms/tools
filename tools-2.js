/**
 * 解决根据类名查找元素的兼容问题
 * @param className 待查找的类名
 * @param context 可选，查找元素的上下文：即在指定的 context 元素后代查找，该参数不传递，则默认为 document
 * @return 查找到的元素集合（HTMLCollection 或 Array）
 */
function getElementsByClassName(className, context) {
	// 未传递 context 这个参数，则默认为 document
	context = context || document;

	// 如果浏览器本身就支持使用 document.getElementsByClassName 方法，则直接调用
	if (context.getElementsByClassName) // 支持使用
		return context.getElementsByClassName(className);

	/* 不支持使用 */
	// 定义数组保存查找结果
	var result = [];
	// 查找所有元素
	var elements = context.getElementsByTagName("*");
	// 遍历所有元素
	for (var i = 0, len = elements.length; i < len; i++) {
		// 将当前遍历到元素的类名获取到
		var classNames = elements[i].className.split(" ");
		// 遍历当前元素的所有类名
		for (var j = 0, l = classNames.length; j < l; j++) {
			// 判断当前遍历到的类名是否和待查找的类名一致
			if (classNames[j] === className) {
				// 有相同，则说明当前遍历到的元素是待查找的元素
				result.push(elements[i]);
				break;
			}
		}
	}
	// 将查找结果返回
	return result;
}

/**
 * 根据选择器查找元素
 * @param selector 选择器   #id    .className   element
 * @param context 可选，查找元素的上下文：即在指定的 context 元素后代查找，该参数不传递，则默认为 document
 * @return 返回根据选择器查找到的元素
 */
function $(selector, context) {
	// 默认在文档中查询
	context = context || document;

	if (selector.indexOf("#") === 0) // id
		return document.getElementById(selector.slice(1));
	if (selector.indexOf(".") === 0) // className，调用自定义的函数解决根据类名查找元素兼容问题
		return getElementsByClassName(selector.slice(1), context);
	// element
	return context.getElementsByTagName(selector);
}

/**
 * 获取指定元素CSS属性指定属性的值
 * @param element DOM元素对象
 * @param attrName CSS属性名 "width"   "height"
 * @return  返回获取得到的CSS属性值
 */
function css(element, attrName) {
	/*if (window.getComputedStyle) { // 支持使用 getComputedStyle 方法
		console.log("getComputedStyle")
		return window.getComputedStyle(element)[attrName];
	} else {
		console.log("currentStyle")
		return element.currentStyle[attrName]; // IE9之前
	}*/

	return window.getComputedStyle
				? window.getComputedStyle(element)[attrName]
				: element.currentStyle[attrName];
}

/**
 * 注册事件监听，解决 addEventListener 与 attachEvent 兼容
 * 事件冒泡
 * @param element 待添加事件监听的DOM元素对象
 * @param type 事件类型字符串
 * @param callback 事件处理程序（函数）
 */
function on(element, type, callback) {
	if (element.addEventListener) { // 支持使用 addEventListener 方法
		if (type.indexOf("on") === 0) // 事件类型以 "on" 开头，去掉
			type = type.slice(2);
		element.addEventListener(type, callback, false);
	} else { // 不支持使用 addEventListener 方法
		if (type.indexOf("on") !== 0) // 事件类型不以 "on" 开头，添加
			type = "on" + type;
		element.attachEvent(type, callback);
	}
}

/**
 * 获取指定元素在文档中的坐标
 * @param element 待求解坐标的DOM元素对象
 * @return 返回元素在文档中的坐标对象，该对象包括两个属性：top、left   如：{top:5, left:-50}
 */
function offset(element) {
	var 
		_top = 0,
		_left = 0;
	while (element) {
		_top += element.offsetTop;
		_left += element.offsetLeft;
		element = element.offsetParent;
	}

	return {
		top: _top,
		left: _left
	};
}

/**
 * 保存cookie
 * @param key cookie名
 * @param value cookie值
 * @param options 可选项 {expires: 7, path: "/", domain: "", secure: true}
 */
function cookie(key, value, options) {
	if (typeof value !== "undefined") {
		// 保存 cookie
		options = options || {};
		var _cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		if (options.expires) { // 有设置失效时间
			var date = new Date()
			date.setDate(date.getDate() + options.expires);
			_cookie += "; expires=" + date.toUTCString();
		}
		if (options.path) // 有路径
			_cookie += "; path=" + options.path;
		if (options.domain) // 域
			_cookie += "; domain=" + options.domain;
		if (options.secure) // 安全
			_cookie += "; secure";
		return document.cookie = _cookie;
	}

	// 未传递 value 参数，读取 cookie
	var cookies = document.cookie.split("; ");
	for (var i = 0, len = cookies.length; i < len; i++) {
		var parts = cookies[i].split("=");
		var name = decodeURIComponent(parts.shift()); // cookie名
		if (name === key)
			return decodeURIComponent(parts.join("=")); // 返回查找到的cookie值
	}
	return undefined; // 未查找到cookie
}

/**
 * 删除 cookie
 * @param key cookie名
 * @param options 可选配置项
 */
function removeCookie(key, options) {
	options = options || {};
	options.expires = -1;
	cookie(key, "", options);
}

/**
 * 多属性运动框架
 * @param element 待添加运动动画效果的DOM元素
 * @param options 对象，保存的是多属性运动的目标终点值
 * @param speed 时间
 * @param fn 在运动结束后需要继续执行的函数
 */
function animate(element, options, speed, fn) {
	// 停止在指定元素上已有的运动
	clearInterval(element.timer);
	// 计算多属性初值、范围
	var start = {}, range = {};
	for (var attr in options) {
		start[attr] = parseFloat(css(element, attr));
		range[attr] = options[attr] - start[attr];
	}
	// 启动计时器前，记录启动时间
	var startTime = +new Date();
	// 启动计时器，运动
	element.timer = setInterval(function() {
		// 计算运动时间
		var elapsed = Math.min(+new Date() - startTime, speed);
		// 多属性按线性运动公式计算各属性当前值
		for (var attr in options) {
			var result = elapsed * range[attr] / speed + start[attr];
			// 设置对应CSS属性
			element.style[attr] = result + (attr === "opacity" ? "" : "px");
		}
		// 判断是否停止计时器
		if (speed === elapsed) { // 运动结束
			clearInterval(element.timer);
			// 如果有在运动结束后执行的函数，则调用执行
			fn && fn();
		}
	}, 1000/60)
}

/**
 * 淡入
 * @param element 待添加淡入动画效果的DOM元素
 * @param speed 时间
 * @param fn 在运动结束后需要继续执行的函数
 */
function fadeIn(element, speed, fn) {
	element.style.display = "block";
	element.style.opacity = 0;
	animate(element, {opacity: 1}, speed, fn);
}

/**
 * 淡出
 * @param element 待添加淡出动画效果的DOM元素
 * @param speed 时间
 * @param fn 在运动结束后需要继续执行的函数
 */
function fadeOut(element, speed, fn) {
	element.style.display = "block";
	element.style.opacity = 1;
	animate(element, {opacity: 0}, speed, function() {
		element.style.display = "none";
		fn && fn();
	});
}