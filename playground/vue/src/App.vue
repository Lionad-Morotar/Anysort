<script setup lang="ts">
import { ref } from 'vue'
import { useAnysort } from '@anysort/vue'

interface Post {
  title: string
  date: string
  views: number
}

const posts = ref<Post[]>([
  { title: 'A', date: '2021-01-01', views: 30 },
  { title: 'B', date: '2021-01-03', views: 10 },
  { title: 'C', date: '2021-01-02', views: 20 }
])

// 升降序切换：规则随 desc 响应式变化，useAnysort 自动重排
const desc = ref(false)
const sorted = useAnysort(posts, () => (desc.value ? 'views-reverse()' : 'views'))

function addPost () {
  posts.value.push({
    title: `New ${posts.value.length}`,
    date: '2021-01-04',
    views: Math.floor(Math.random() * 50)
  })
}
</script>

<template>
  <main>
    <h1>@anysort/vue playground</h1>
    <p>验证 <code>useAnysort</code> 在纯 Vite + Vue 3（非 Nuxt）环境工作。</p>

    <div>
      <button data-testid="toggle" @click="desc = !desc">
        按 views {{ desc ? '降序' : '升序' }}
      </button>
      <button data-testid="add" @click="addPost">添加随机 post</button>
    </div>

    <ul>
      <li v-for="p in sorted" :key="p.title">
        {{ p.title }} · views={{ p.views }} · {{ p.date }}
      </li>
    </ul>
  </main>
</template>
