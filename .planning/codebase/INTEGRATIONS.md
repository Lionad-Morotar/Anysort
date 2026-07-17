# INTEGRATIONS

Anysort 是纯前端/Node 通用排序库，零运行时依赖，无任何外部服务集成。

## 运行时依赖

无。`dependencies` 字段不存在，`package.json` 中所有条目都在 `devDependencies`（构建/测试工具）。

## 外部服务

无数据库、无鉴权、无 webhook、无第三方 API。

## 环境变量

- `NODE_ENV`：唯一被读取的环境变量
  - `development`：`src/utils.ts:3` 的 `isDev()` 返回 true，开启 `warn` 日志输出
  - `production`：构建启用压缩（`rollup.config.mjs:11`）、测试以生产模式运行（`package.json` test 脚本）

## 发布渠道

- **npm**：`anysort-typed`
- **GitHub**：`Lionad-Morotar/anysort`
- 仓库根存在 `codecov/` 目录，疑似历史覆盖率上传残留（当前 `nyc` reporter 仅配置 `text` + `json-summary`，无上传步骤）
