<script setup lang="ts">
// useAnysort 与 ref 均由 @anysort/nuxt auto-import，组件中免 import
const posts = ref([
  { title: 'A', views: 30 },
  { title: 'B', views: 10 },
  { title: 'C', views: 20 }
])

// 'views' 命令：get views 路径默认升序 → B(10) C(20) A(30)
const sorted = useAnysort(posts, 'views')
</script>

<template>
  <main>
    <h1>@anysort/nuxt playground</h1>
    <p>验证 auto-import useAnysort + runtimeConfig 默认配置。</p>
    <ul>
      <li v-for="p in sorted" :key="p.title" data-testid="post">
        {{ p.title }}: {{ p.views }}
      </li>
    </ul>
  </main>
</template>
