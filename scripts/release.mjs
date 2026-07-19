#!/usr/bin/env node
/**
 * Anysort monorepo 分包发布脚本（拓扑序：core → vue → nuxt，被依赖者先发）。
 *
 * 设计要点：
 * - 必须用 pnpm publish：它会把 workspace:* 依赖替换为实体版本号（npm publish 会原样打包该协议）
 * - dist-tag 从版本号推导：1.0.0-alpha.0 → --tag alpha，避免 prerelease 顶掉 latest
 * - registry 经 --config.registry CLI 参数锁 npmjs（pnpm 12 的 publish 已无 --registry flag，
 *   且 npm_config_registry 环境变量不再覆盖用户 .npmrc 的镜像配置）
 * - 参数透传：pnpm release -- --dry-run 走完整链路（test → build → 各包 publish dry-run）
 */
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGES = ['core', 'vue', 'nuxt']
const REGISTRY = 'https://registry.npmjs.org'

// pnpm 会把命令行中的字面量 '--' 原样传入 argv，需过滤
const args = process.argv.slice(2).filter(a => a !== '--')
const dryRun = args.includes('--dry-run')

function pkgInfo (name) {
  const dir = join(root, 'packages', name)
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  return { dir, name: pkg.name, version: pkg.version }
}

/** 从版本号推导 dist-tag：1.0.0-alpha.0 → alpha；stable 返回 null（走 latest） */
function distTagOf (version) {
  const m = version.match(/-([a-zA-Z]+)/)
  return m ? m[1] : null
}

const infos = PACKAGES.map(pkgInfo)
console.log(`[release] 发布计划${dryRun ? '（dry-run）' : ''}：`)
for (const i of infos) {
  const tag = distTagOf(i.version)
  console.log(`  ${i.name}@${i.version}${tag ? ` (dist-tag: ${tag})` : ''}`)
}

for (const info of infos) {
  const tag = distTagOf(info.version)
  const publishArgs = ['publish', '--access', 'public', '--no-git-checks', `--config.registry=${REGISTRY}`]
  if (tag) publishArgs.push('--tag', tag)
  if (dryRun) publishArgs.push('--dry-run')
  console.log(`\n[release] >>> (cwd: packages/${info.dir.split('/').pop()}) pnpm ${publishArgs.join(' ')}`)
  try {
    execFileSync('pnpm', publishArgs, {
      stdio: 'inherit',
      cwd: info.dir,
    })
  } catch {
    console.error(`\n[release] ${info.name} 发布失败，已中止。已发布的包不会回滚，修复后重跑 pnpm release 即可。`)
    process.exit(1)
  }
}
console.log(`\n[release] 完成${dryRun ? '（dry-run，未实际发布）' : ''}`)
