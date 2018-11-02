/**
 * 解决根据类名查找元素的兼容问题
 * @param className 待查找的类名
 * @param context 可选，查找元素的上下文：即在指定的 context 元素后代查找，该参数不传递，则默认为 document
 * @return 查找到的元素集合（HTMLCollection 或 Array）
 */

function getElementsByClassName(className,context){
	// 未传递 context 这个参数，则默认为 document
	context = context||document;
	// 如果浏览器本身就支持使用 document.getElementsByClassName 方法，则直接调用
	if(context.getElementsByClassName){		//支持使用
		return context.getElementsByClassName(className);
	}
	
	/* 不支持使用 */
	// 定义数组保存查找结果
	var arr = [];
	// 查找所有元素
	var elements = context.getElementsByTagName("*");
	// 遍历所有元素
	for(var i = 0,len = elements.length;i < len;i++){
		// 将当前遍历到元素的类名获取到
		var classNames = elements[i].className.split(" ");
		// 遍历当前元素的所有类名
		for(var j=0;j<classNames.length;j++){
			// 判断当前遍历到的类名是否和待查找的类名一致
			if(classNames[j] === className){
				// 有相同，则说明当前遍历到的元素是待查找的元素
				arr.push(elements[i]);
				break;
			}
		}	
	}
	// 将查找结果返回
	return arr;
}

/**
 * 根据选择器查找元素
 * @param selector 选择器   #id    .className   element
 * @param context 可选，查找元素的上下文：即在指定的 context 元素后代查找，该参数不传递，则默认为 document
 * @return 返回根据选择器查找到的元素
 */
function $(selector,context){
	// 默认在文档中查询
	context = context||document;
	if(selector.indexOf("#") === 0)
		return context.getElementById(selector.slice(1));
	if(selector.indexOf(".") === 0) // className，调用自定义的函数解决根据类名查找元素兼容问题
		return getElementsByClassName(selector.slice(1), context);
	return context.getElementsByTagName(selector);
}