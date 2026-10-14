<!--
  TutorialBanner.vue
  Prominent tutorial entrance banner showcasing core networking and privacy tools.
-->
<template>
  <div v-if="isVisible"
    class="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-4 sm:p-5 mb-6 shadow-xs transition-all duration-300">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <!-- Left side: Icon + Title + Description -->
      <div class="flex items-start gap-3.5 min-w-0">
        <div
          class="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/25 mt-0.5 shadow-2xs">
          <BookOpen class="size-5 text-primary" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              核心网络与隐私检测工具教程
            </h3>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-2xs">
              原理解析 & 独立代码
            </span>
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            深入揭秘多源 IP 双栈隔离、WebRTC 穿透打洞与防泄漏、DNS 随机泛解析追踪、网络测速与 RFC 抖动算法，提供零依赖独立运行代码。
          </p>
        </div>
      </div>

      <!-- Right side: Quick Tags & Action Button -->
      <div class="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-start md:justify-end">
        <div class="hidden lg:flex items-center gap-1.5 mr-1">
          <button v-for="tag in quickTags" :key="tag.tool" type="button" @click="openTutorial(tag.tool)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background/80 hover:bg-background border border-border/80 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs">
            <component :is="tag.icon" class="size-3.5" :class="tag.color" />
            <span>{{ tag.label }}</span>
          </button>
        </div>

        <Button size="sm"
          class="gap-1.5 font-medium px-4 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:scale-105"
          @click="openTutorial('ip')">
          <BookOpen class="size-4" />
          <span>查看全部教程</span>
          <ArrowRight class="size-3.5 ml-0.5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Globe, ShieldAlert, Terminal, Activity } from '@lucide/vue';
import { emitAppEvent } from '@/utils/app-events.js';

const isVisible = ref(true);

const quickTags = [
  { tool: 'ip', label: 'IP 双栈', icon: Globe, color: 'text-blue-500' },
  { tool: 'webrtc', label: 'WebRTC 泄漏', icon: ShieldAlert, color: 'text-amber-500' },
  { tool: 'dns', label: 'DNS 泛解析', icon: Terminal, color: 'text-purple-500' },
  { tool: 'speedtest', label: '测速引擎', icon: Activity, color: 'text-emerald-500' },
];

const openTutorial = (tool = 'ip') => {
  emitAppEvent('open-tutorial', { tool });
};
</script>
