/**
 * playground/vanilla —— 手动 IDE 类型试验场。
 *
 * 这个文件不跑测试，只供你在 IDE 里改代码、看红线，验证 anysort 的类型与 DX。
 * tsconfig.json 的 paths 把 @anysort/core 映射到 core 源码，IDE 始终用最新类型（无需先 build core）。
 *
 * 玩法：
 * - 合法调用看自动补全（如敲 `chain(posts).created.` 会有提示）
 * - 取消底部「故意错误」区的注释，看 IDE 报红
 * - 改 arg 类型 / 路径 / 插件名，观察类型层反馈
 */
import anysort, { chain, parseRule, compileSpec, compileRule, validateRule, validateSpec } from '@anysort/core'
import type { SortSpec, SortRule, SortFn } from '@anysort/core'

const posts = [
  { name: 'Bob', age: 30, created: { date: '2020-01-01' } },
  { name: 'Alice', age: 25, created: { date: '2021-01-01' } },
  { name: 'carol', age: 25, created: { date: '2019-01-01' } },
]

/* ===== 字符串命令 ===== */
anysort([...posts], 'name')
anysort([...posts], 'age-reverse()')
anysort([...posts], 'age', 'name')               // 多属性短路：age 升序，平局按 name
anysort([...posts], 'created.date-reverse()')

/* ===== 链式（Full Typed）=====
 * .created.date 沿元素 keyof 自动补全；
 * .run() / .compile() / .spec 三个出口分别返回 T[] / SortFn<T> / SortRule */
const byDateDesc = chain(posts).created.date.reverse().run()
const ageFn: SortFn<typeof posts[number]> = chain(posts).age.compile()
const nameRule: SortRule = chain(posts).name.spec

/* ===== IR 数据描述符（可 JSON 序列化、可从配置/外部构造）===== */
const spec: SortSpec = [
  { ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }] },
  { ops: [{ type: 'get', path: ['age'] }] },
]
anysort([...posts], ...spec)
compileRule(parseRule('age-reverse()'))

/* ===== 比较函数逃生口（不进 IR，与其他规则短路合并）===== */
anysort([...posts], 'name', (a, b) => a.age - b.age)

/* ===== 自定义插件：anysort.extend 返回新实例，类型认自定义插件 ===== */
const mysort = anysort.extend({
  evenFirst: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1) },
})
// mysort 的字符串命令认 'evenFirst'（SortCMD<_, BuiltinPluginName | 'evenFirst'>）
mysort([1, 2, 3, 4], 'evenFirst()')
// mysort 的链式也认（ChainPluginCalls 含 evenFirst）
mysort.chain([1, 2, 3, 4]).evenFirst().run()
void mysort

/* ===== IR 结构校验 ===== */
validateRule({ ops: [{ type: 'get', path: ['name'] }] })
validateSpec(spec)

/* ===== loose 模式：未知插件 warn+skip（不抛）===== */
compileSpec([{ ops: [{ type: 'call', plugin: 'typoPlugin' }] }], { loose: true })

// 消费上面的绑定，避免 unused 警告
void [byDateDesc, ageFn, nameRule]

/* ============ 故意错误（取消注释看 IDE 报红）============
chain(posts).created.typo                    // ← 非法路径：typo 不在 keyof created
chain(posts).name.nth('two')                 // ← nth 要 number arg
chain(posts).reverse().run()                 // ← posts 元素没 reverse 属性
anysort([...posts], { wrong: true })         // ← 非法 IR（缺 ops）
anysort([...posts], { ops: [{ type: 'bad' }] }) // ← 非法 op type
compileRule({ ops: [{ type: 'call', plugin: 'typo' }] }) // ← 严格模式未知插件（运行时抛）
*/
