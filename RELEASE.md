# Release Checklist

@anysort monorepo 手动发版流程（D6：手动版本 + 手动分包 CHANGELOG，无 CI 自动化）。

## 发版前

- [ ] 各包版本号已 bump（`packages/{core,vue,nuxt}/package.json` 的 `version`）
- [ ] 各包 `CHANGELOG.md` 已更新对应版本段
- [ ] **workspace 依赖联动**：core bump 时，检查 vue/nuxt 是否需要跟随 bump（它们 `dependencies` 含 `@anysort/core: workspace:*`，发布时 pnpm 替换为具体版本号；若 core 的 breaking 影响消费方，vue/nuxt 也应 bump）
- [ ] `pnpm -r build` 全绿（core → vue → nuxt 拓扑序）
- [ ] `pnpm -r test` 全绿
- [ ] `pnpm lint`（oxlint）无错

## 发布顺序（按依赖拓扑）

1. **@anysort/core**
   ```sh
   cd packages/core && pnpm publish --access public
   ```
2. **@anysort/vue**（依赖 core；发布时 `workspace:*` 自动替换为 core 的已发布版本）
   ```sh
   cd packages/vue && pnpm publish --access public
   ```
3. **@anysort/nuxt**（依赖 vue + core）
   ```sh
   cd packages/nuxt && pnpm publish --access public
   ```

## 发布后

- [ ] npm 校验：`npm view @anysort/core@<version>`
- [ ] （首次首发后）`npm deprecate anysort-typed "Renamed to @anysort/core, please switch"`
- [ ] git tag（可选）

## 注意

- **scoped 包首次发布必须 `--access public`**（否则默认 private，需付费 org plan）
- `workspace:*` 在 `pnpm publish` 时由 pnpm 自动替换为具体版本号
- 各包 `prepublishOnly` 钩子自动 build（core/vue/nuxt 各自）
- nuxt 包发布的是 `nuxt-module-build build` 产物（dist/module.mjs + runtime/），非 stub
