######betterVerInput v 1.0.1 版本          

------------
   2019-09-11更新
-  新增和修改的内容：
		1-1、示例参数新增:
						*上一个版本的参数不做赘述*
						new VerInput({
          							tarMap: ['input', 'textarea','select'],
         							warning_color: '#ed6b75',
          							agree_color: '#00c69b',
          							preventInput: true,  // input输入超长之后是否阻止继续输入
          							showBorder: true,   //true 未通过表单验证时会出现 常亮的颜色 颜色与设置的warning_color相同；
          							showRequire: true,   //未通过验证时是否展示相应的require提示 false 无提示信息
          							initShowVer:false, //是否在初始化的时候就进行表单校验 true 是 false 否 （false时会在getUnVerList时做表单验证）
          							getInitUnVer: function (ret) { //初始化之后会返回插件的初始化状态和为通过验证的数组（同1-2返回值的数据结构）
            							console.log(ret); 
            							console.log('表单插件初始化' + ret.state);
          							}
        							})
		
		1-2、返回值的变化(主动获取验证数组方法getUnVerList、初始化插件成功的回调方法getInitUnVer)中的返回值：{
				state:'success',  //返回插件初始化成功
				data:[
						{
							len        //监测的目标DOM
							requireTar //监测目标的requireDOM对象,
							tagName    //监测目标的标签名字
							type       //错误类型 预设了empty、less、more 三种错误类型自动验证无需设置
							value      //监测目标当前的值
							verkey     //监测目标的自定义key（该值会影响到某些功能的实现）
							vername    //监测目标的表单名字 比如'姓名'、'职位名称'等
						}
					]
				
				}
				
		1-3、新增接口：
				verUpdate()  // 该方法会重置 表单DOM和验证规则 ，用于动态表单的使用
				scrollToFirst() // 该方法调用时 会自动滚动到第一条未通过验证的表单元素位置，并标红，提示错误原因。
				refershDataKey(dom,boolean) //用于手动设置一个DOM是否被验证
				reloadDataKey(dom) //用于手动验证指定表单元素的验证状态状态
				scrollToTarget(dom)  //调用之后自动滚动到 指定的DOM对象；
##    完整用法
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7868166c784.png)
 - 可以自动对焦并滚动到未通过验证的表单，并自动对焦
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d78692983542.png)
 - 可以根据设置的规则实时并自动提示错误原因
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d786980907aa.png)
（空）
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7869b96fb40.png)
(少于)
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d786a14e4efe.png)
（大于）


###### 以上效果可以进行如下设置：
- js
```javascript
 app.VerInputSL = new VerInput({
          tarMap: ['input', 'textarea','select'],
          warning_color: '#ed6b75',
          agree_color: '#00c69b',
          preventInput: true,
          showBorder: true,
          showRequire: true,
          initShowVer:false,
          getInitUnVer: function (ret) {
            console.log(ret);
            console.log('表单插件初始化' + ret.state);
          }
        })
```
- html
```html
          <div class="item-row-area">
            <div class="handle-form-item">
              <span class="handle-label handle-item-must-star">核心优势</span>
              <textarea style="line-height:28px;"
                        class="handle-textarea"
                        v-model="reportData.data.CoreAdvantages"
                        data-max="500"
                        data-min="10"
                        data-verName="核心优势" // 带提示必设置
                        betterVer="true"  //必填项 需要设置
                        data-verKey="CoreAdvantages" //带提示必设置 与require标签ver_require 值必须一致
                        placeholder="核心优势不少于10字"></textarea>
            </div>
            <div 
			class="ver_require" // class必须一致
			data-ver_require="CoreAdvantages" //带提示必须设置 与 对应的表单元素的data-verKey 值必须一致
			></div> //因为DOM变化多端 为了该插件应用的范围更广泛 目前只可手动创建require标签
          </div>
          <div class="item-row-area">
            <div class="handle-form-item">
              <span class="handle-label">职业状态</span>
              <textarea style="line-height:28px;"
                        class="handle-textarea"
                        v-model="reportData.data.OccupationalStatus"
                         data-max="500"
                         data-min="2"
                        data-verKey="CoreAdvantages"
                        placeholder="职业状态不少于2字"></textarea>
            </div>
          </div>
```
- js
- 如何调用方法
```javascript
//在提交处直接调用getUnVerList即可自动对表单进行验证
 this.VerInputSL.getUnVerList(true,function () {
	    var list = Array.prototype.slice.call(arguments, 0);
		
 })
  app.VerInputSL.scrollToFirst(); //调用之后 自动滚动到 未通过验证的第一个元素位置
```
###### 以上就是本插件更新之后的基本用法

## 特殊用法
- 为了解决实际工作中插件不是正规的表单元素，还有动态表单的验证，以及各种棘手的情况。本插件提供几种工具方法用于操作插件内部的数据结构，用迂回的方式来满足特殊要求；
- 1、动态表单（在某种条件下必填，在某种条件下非必填）
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d786df0c4cbd.png)
	该例子中点击选中面议 目标非必填， 取消选中目标必填。解决方案：
	使用refershDataKey()方法：
		 app.VerInputSL.refershDataKey(想要控制的表单元素,b); // b 是一个布尔值 true移除验证该元素 false 添加验证该元素
		 
- 2、在vue中 数据的改变无法触发change事件导致的 无法实时的检测到值的变化：
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7884566f62f.png)
当我点击模糊搜索的选项时
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7884cd7a066.png)
即使选中了，也不会通过验证
这时在点击事件同时去触发
```javascript
this.VerInputSL.reloadDataKey.call(this.VerInputSL,dom); //dom是需要操作的表单元素
```
即可解决问题
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7885c3dd4aa.png)
- 3、本插件目前不兼容其他的插件比如日期、选择插件等等
		页面中出现自定插件的时候，需要去做手动验证结合本插件中提供的API去简介的完成需求
		比如在页面中：（出现了两个需要手动验证的非标单元素）
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7886f12eac1.png)
如何去做呢？
	提供一种解决方案：
			在调用getUnVerList 时 如果返回的args的长度是0 则本插件监控的表单元素 全部符合要求。
```javascript
this.VerInputSL.getUnVerList(true,function () {
	 var list = Array.prototype.slice.call(arguments, 0);
	if (list.length == 0) {
		// do some things
		//可以在这里手动去验证 本插件无法验证的表单 并结合 app.VerInputSL.scrollToTarget（dom）；去滚动到相应的元素位置即可
	}
})
```
完
![](http://192.168.30.10:8888/Public/Uploads/2019-09-11/5d7888cab0d05.jpg)
------------------------------华丽的分割线-----------------------------------
   
   
   
   
   
   
   
   
######betterVerInput v 1.0.0 版本          

------------

   2019-09-06更新
-  目录：D:\Projects\risfond\HeadHunter\HeadHunter.Web.Office3\js\betterVerInput.js
-  特点：简单易用，可扩展性较强，返回值丰富稳定。原生写法无任何依赖。
-  方法名称： VerInput(opts)
- 技术支持：allen.sun
## opts参数

|字段|类型|是否必填|默认|说明|
|:----    |:-------    |:--- |-- -|------      |
|tarMap	  |array     |是	|	 |	传入一个节点字符串数组           |
|warning_color |string |否	|    |	 警告颜色	|
|agree_color |string |否   |    |	 成功颜色		 |

## 示例 基础用法
```html
 <input autocomplete="off" 
                           data-max="6" 
                           data-min="1" 
                           betterVer="true"
                           v-model="reportData.data.AnnualSalary" type="text" name="name" value="" class="handle-input" placeholder="请填写目前年薪（必填）" />

```
1、betterVer = 'true'用于插件的初始化识别
2、data-max 允许输入的最大值
3、data-min 允许输入的最小值
```javascript
 this.VerInputSL = new VerInput({
        tarMap: ['input', 'textarea'], //目标示例 是一个id可以是一个class如:['#id','.name']
        warning_color: '#ed6b75', //颜色示例
        agree_color: '#00c69b', //颜色示例
      })
```
即可初始化插件

    
-  事件名称

|方法|类型|返回值类型|返回示例|作用|
|:----    |:-------    |:--- |-- -|
|getUnVerList	  |function     |Array	|[{min:'6',max:'10',tar:DOM节点,len:2,value:'123',verkey:'name'}]	 |返回未通过验证的节点信息|

- min 最小值
- max 最大值
- tar DOM节点
- len 当前输入的字数
- value 当前节点的值
- verkey 当前节点的key

## 示例
在任意的提交事件中可以调用事件
```javascript
  this.VerInputSL.getUnVerList(function () {
        var list = Array.prototype.slice.call(arguments, 0);
        console.log(list);
      })
```
返回值：
![](http://192.168.30.10:8888/Public/Uploads/2019-09-06/5d72275aeffc8.png)

返回一个列表既是当前未通过验证的所有表单信息

## 期望
- 未来的时间会逐渐完善插件的功能，包括支持正则表达式，类型验证，等等的数据验证
## End
- 本插件开发时间很短大约 3个小时，所以可能会有不稳定的情况，作者会逐渐优化中。
![](http://192.168.30.10:8888/Public/Uploads/2019-09-06/5d7229aea8006.jpg)


