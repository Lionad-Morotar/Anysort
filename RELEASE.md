# Release Checklist

@anysort monorepo 手动发版流程（D6：手动版本 + 手动分包 CHANGELOG，无 CI 自动化）。

## 发版前

- [ ] 各包版本号已 bump（`packages/{core,vue,nuxt}/package.json` 的 `version`）
- [ ] 各包 `CHANGELOG.md` 已更新对应版本段
- [ ] **workspace 依赖联动**：core bump 时，检查 vue/nuxt 是否需要跟随 bump（它们 `dependencies` 含 `@anysort/core: workspace:*`，发布时 pnpm 替换为具体版本号；若 core 的 breaking 影响消费方，vue/nuxt 也应 bump）
- [ ] `pnpm -r build` 全绿（core → vue → nuxt 拓扑序）
- [ ] `pnpm -r test` 全绿
- [ ] `pnpm lint`（oxlint）无错

## 发布（收敛为一条命令）

```sh
pnpm release              # 正式发布
pnpm release -- --dry-run # 预演：完整链路 test → build → 各包 publish dry-run
```

`pnpm release`（`scripts/release.mjs`）自动完成：

- 门禁链：`prebuild → test`、`prerelease → build`（任何构建先过全量测试）
- 拓扑序分包发布：core → vue → nuxt（被依赖者先发）
- dist-tag 从版本号推导：`1.0.0-alpha.0` → `--tag alpha`，prerelease 不顶 latest
- registry 锁 npmjs：`--config.registry=https://registry.npmjs.org`（pnpm 12 publish 已无 `--registry` flag，且 `npm_config_registry` 环境变量不再覆盖用户 .npmrc 的镜像配置）
- `workspace:*` 由 pnpm publish 自动替换为实体版本号

## 发布后

- [ ] npm 校验：`npm view @anysort/core@<version>`
- [ ] （首次首发后）`npm deprecate anysort-typed "Renamed to @anysort/core, please switch"`
- [ ] git tag：monorepo 统一版本，单 tag `v<version>`

## 注意

- **scoped 包首次发布必须 `--access public`**（release.mjs 已内置）
- 各包 `prepublishOnly` 钩子自动 build（core/vue/nuxt 各自）
- nuxt 包发布的是 `nuxt-module-build build` 产物（dist/module.mjs + runtime/），非 stub
- 任一包发布失败即中止；已发布的包不会回滚，修复后重跑 `pnpm release` 即可
