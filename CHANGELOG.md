## Changelog

##### 3.0.0

* 接口变更，使用 anysort(arr) 将会返回一个被包装的 arr 对象（以下简称为包装对象），并有能力直接通过属性调用排序插件，如：anysort(arr).has('a') 等同于 anysort(arr, 'has(a)')，也等同于 anysort(arr).apply('has(a)')
  - 错误使用：array.sort(anysort(['plugin-a', 'plugin-b']))
  - 可以使用：array.sort(anysort('plugin-a', 'plugin-b'))
  - 可以使用：anysort(arr, 'plugin-a', 'plugin-b')
  - 可以使用：anysort(arr, ['plugin-a', 'plugin-b'])
  - 可以使用：anysort(arr).apply('plugin-a', 'plugin-b')
  - 可以使用：anysort(arr).apply(['plugin-a', 'plugin-b'])
* 包装对象接口：
  - anysort(arr).apply('plugin(arg)')   // 等同于 anysort(arr, 'plugin(arg)')
  - anysort(arr).sort((a, b) => a - b)  // 等同于 anysort(arr, (a, b) => a - b)
  - anysort(arr).get('attr')            // 等同于 anysort(arr, 'attr')
  - anysort(arr).attra.attrb.result()   // 等同于 anysort(arr, 'attra.attrb')
  - anysort(arr).attra.plugin(arg)      // 等同于 anysort(arr, 'attra-plugin(arg)')
  - anysort(arr).plugina_pluginb(arg)   // 等同于 anysort(arr, 'plugina()-pluginb(arg)')
* 新增内置插件 get，用于获取对象中某个属性值：anysort(arr, get(object.a.b)) 等同于 anysort(arr, object.a.b)
* 新增内置插件 nth，用于获取数组的第 n 个值
* 新增默认配置项 autoSort，默认为 true，用于设定即使 anysort 在调用时传入空参数也会返回一个默认的排序函数（默认使用 little-than 的比较逻辑）
* 新增默认配置项 autoWrap，默认为 true，用于设定经 anysort 调用后回传的数组是否是包装对象
* 完善测试用例
* 修复跑测试用例时仍会输出警告的问题

##### 2.0.0

* 使用 TypeScript 重写了插件逻辑，修复了一些逻辑错误
* 内置插件只留下了关键的 i、reverse、rand、is、all、has、not、len
* 完善测试用例

##### 1.4.x

* 新增自定义插件功能
* 新增统计插件 all

##### 1.3.0

* 新增忽略大小写插件

##### 1.2.x

* 新增长度插件，以统计字符串或数组的长度
* null 或 undefined 的值在比较时会被移到队尾
* symbol 在比较时会使用其字符串字面量的字典顺序进行比较

##### 1.1.0

* 新增了随机排序插件

##### 1.0.0

* Anysort 正式版本发布啦~