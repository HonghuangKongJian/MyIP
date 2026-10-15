<template>
  <NavBar />
  <User ref="userRef" />
  <Achievements ref="achievementsRef" />
  <Preferences />
  <main id="mainpart" class="mx-auto w-full px-4 jn-container">
    <div class="rounded-md">
      <TutorialBanner />

      <!-- 顶部独立分页选项卡 (Section Page Switcher) -->
      <div class="my-5 p-1.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <button
          v-for="(sec, idx) in SECTIONS_LIST"
          :key="sec.id"
          @click="switchToSection(sec.id)"
          class="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer"
          :class="currentSection === sec.id 
            ? 'bg-primary text-primary-foreground shadow-sm scale-102' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
            :class="currentSection === sec.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'">
            {{ idx + 1 }}
          </span>
          <span>{{ sec.name }}</span>
        </button>
      </div>

      <!-- 1. IP 信息独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.IPInfo" v-show="currentSection === 'IPInfo'" class="space-y-6">
        <IPCheck />
        <ToolTutorialCard tool="ip" />
      </div>

      <!-- 2. 网络连通性独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.Connectivity" v-show="currentSection === 'Connectivity'" class="space-y-6">
        <Connectivity />
        <ToolTutorialCard tool="connectivity" />
      </div>

      <!-- 3. WebRTC 泄漏测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.WebRTC" v-show="currentSection === 'WebRTC'" class="space-y-6">
        <WebRTC />
        <ToolTutorialCard tool="webrtc" />
      </div>

      <!-- 4. DNS 泄漏测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.DNSLeakTest" v-show="currentSection === 'DNSLeakTest'" class="space-y-6">
        <DNSLeaks />
        <ToolTutorialCard tool="dns" />
      </div>

      <!-- 5. 网速测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.SpeedTest" v-show="currentSection === 'SpeedTest'" class="space-y-6">
        <SpeedTest />
        <ToolTutorialCard tool="speedtest" />
      </div>

      <!-- 6. 高级工具独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.AdvancedTools" v-show="currentSection === 'AdvancedTools'" class="space-y-6">
        <AdvancedTools ref="advancedToolsRef" />
        <ToolTutorialCard tool="advanced" />
      </div>

      <!-- 底部独立分页翻页控制器 (Pagination Footer) -->
      <div class="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div>
          <button 
            v-if="prevSection" 
            @click="switchToSection(prevSection.id)"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>上一页：{{ prevSection.name }}</span>
          </button>
          <div v-else class="text-xs text-muted-foreground/60 hidden sm:block">
            第一页（首屏）
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            第 {{ currentIndex + 1 }} 页 / 共 {{ SECTIONS_LIST.length }} 页
          </span>
          <div class="flex items-center gap-1.5">
            <button 
              v-for="(sec, idx) in SECTIONS_LIST" 
              :key="sec.id"
              @click="switchToSection(sec.id)"
              class="w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              :class="idx === currentIndex ? 'bg-primary text-primary-foreground shadow-2xs scale-110' : 'bg-muted text-muted-foreground hover:bg-accent'"
              :title="sec.name">
              {{ idx + 1 }}
            </button>
          </div>
        </div>

        <div>
          <button 
            v-if="nextSection" 
            @click="switchToSection(nextSection.id)"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <span>下一页：{{ nextSection.name }}</span>
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div v-else class="text-xs text-muted-foreground/60 hidden sm:block">
            最后一页
          </div>
        </div>
      </div>
    </div>
  </main>
  <FloatingDock :ready="showMaskButton" :mask-active="infoMaskLevel > 0">
    <InfoMask :showMaskButton.value="showMaskButton" :infoMaskLevel.value="infoMaskLevel"
      :toggleInfoMask="toggleInfoMask" />
    <ShareReport ref="shareReportRef" />
    <IPHistory />
    <QueryIP ref="queryIPRef" />
  </FloatingDock>
  <HelpModal ref="helpModalRef" />
  <TutorialsModal ref="tutorialsModalRef" />
  <Additional />
  <Footer />
</template>

<script setup>
// The homepage. Holds every top-level section plus the Advanced Tools drawer.
// Split out of App.vue when the app moved to history-mode routing: App is now a
// thin shell, and this component is what /'s <router-view> renders. The truly
// global widgets (tooltip provider, toast, PWA, theme) stay in App.
//
// Components — the test sections and the always-visible chrome load
// synchronously; everything the first paint can't show (dialogs, drawers,
// the below-fold Additional/Footer) is an async component so its code stays
// out of the route chunk and out of the mount's critical path. Their
// template refs are null until the chunk lands — consumers (use-shortcuts)
// must optional-chain.
import NavBar from './Nav.vue';
import InfoMask from './widgets/InfoMask.vue';
import FloatingDock from './widgets/FloatingDock.vue';
import TutorialBanner from './widgets/TutorialBanner.vue';
import ToolTutorialCard from './tutorials/ToolTutorialCard.vue';

// Vue + Store
import { ref, reactive, computed, onMounted, watch, defineAsyncComponent } from 'vue';

// Sections: IPCheck is synchronous for immediate critical-path paint; other sections lazy-load on navigation
import IPCheck from './IpInfos.vue';
const Connectivity = defineAsyncComponent(() => import('./ConnectivityTest.vue'));
const WebRTC = defineAsyncComponent(() => import('./WebRtcTest.vue'));
const DNSLeaks = defineAsyncComponent(() => import('./DnsLeaksTest.vue'));
const SpeedTest = defineAsyncComponent(() => import('./SpeedTest.vue'));
const AdvancedTools = defineAsyncComponent(() => import('./Advanced.vue'));

// Async (off-critical-path) components
const Additional = defineAsyncComponent(() => import('./Additional.vue'));
const Footer = defineAsyncComponent(() => import('./Footer.vue'));
const User = defineAsyncComponent(() => import('./User.vue'));
const Achievements = defineAsyncComponent(() => import('./Achievements.vue'));
const Preferences = defineAsyncComponent(() => import('./widgets/Preferences.vue'));
const QueryIP = defineAsyncComponent(() => import('./widgets/QueryIP.vue'));
const HelpModal = defineAsyncComponent(() => import('./widgets/Help.vue'));
const TutorialsModal = defineAsyncComponent(() => import('./widgets/TutorialsModal.vue'));
const IPHistory = defineAsyncComponent(() => import('./widgets/IPHistory.vue'));
const ShareReport = defineAsyncComponent(() => import('./report/ShareReportDialog.vue'));
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';

// Composables
import { useInfoMask } from '@/composables/use-info-mask.js';
import { useRefreshOrchestrator } from '@/composables/use-refresh-orchestrator.js';
import { useShortcuts } from '@/composables/use-shortcuts.js';
import { useDocumentMeta } from '@/composables/use-document-meta.js';

const { t } = useI18n();
const store = useMainStore();
const configs = computed(() => store.configs);
const userPreferences = computed(() => store.userPreferences);
const currentSection = computed(() => store.currentSection);

// 6 大功能独立分页列表
const SECTIONS_LIST = [
  { id: 'IPInfo', name: 'IP 信息' },
  { id: 'Connectivity', name: '网络连通性' },
  { id: 'WebRTC', name: 'WebRTC 检查' },
  { id: 'DNSLeakTest', name: 'DNS 泄漏测试' },
  { id: 'SpeedTest', name: '网速测试' },
  { id: 'AdvancedTools', name: '高级网络工具' },
];

// 响应式已访问模块记录（用于按需加载）
const visitedSections = reactive({
  IPInfo: true,
  Connectivity: false,
  WebRTC: false,
  DNSLeakTest: false,
  SpeedTest: false,
  AdvancedTools: false,
});

watch(
  () => store.currentSection,
  (sec) => {
    if (sec && sec in visitedSections) {
      visitedSections[sec] = true;
    }
  },
  { immediate: true },
);

// 当前页码与翻页计算
const currentIndex = computed(() => {
  const idx = SECTIONS_LIST.findIndex(s => s.id === store.currentSection);
  return idx === -1 ? 0 : idx;
});

const prevSection = computed(() => {
  return currentIndex.value > 0 ? SECTIONS_LIST[currentIndex.value - 1] : null;
});

const nextSection = computed(() => {
  return currentIndex.value < SECTIONS_LIST.length - 1 ? SECTIONS_LIST[currentIndex.value + 1] : null;
});

const switchToSection = (sectionId) => {
  store.changeSection(sectionId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Template refs — UI chrome only; the test sections are reached through the
// command bus (utils/app-commands.js), not refs.
const userRef = ref(null);
const achievementsRef = ref(null);
const queryIPRef = ref(null);
const helpModalRef = ref(null);
const tutorialsModalRef = ref(null);
const shareReportRef = ref(null);
const advancedToolsRef = ref(null);

// Info mask
const { infoMaskLevel, isInfosLoaded, showMaskButton, toggleInfoMask } = useInfoMask({
    store,
    t,
});

// Refresh / initial load sequence
const { loadingControl } = useRefreshOrchestrator({
    store,
    t,
    userPreferences,
    infoMaskLevel,
});

// Shortcuts
const { loadShortcuts } = useShortcuts({
    refs: {
        queryIPRef, helpModalRef, shareReportRef, advancedToolsRef,
        isInfosLoaded, toggleInfoMask,
    },
    store, t, configs, userPreferences,
});


// Localized homepage head. Provide title/description explicitly via t() rather
// than leaning on use-document-meta's DEFAULT_META snapshot: that snapshot is
// taken at module load, before the (now async) locale messages land, so it would
// pin the head to index.html's English title. Reactive t() also re-applies the
// right copy when SPA-navigating back from a /tools/:slug page.
useDocumentMeta(() => ({
    title: t('page.title'),
    description: t('page.description'),
    canonical: `${window.location.origin}/`,
}));

onMounted(() => {
    loadingControl();
    loadShortcuts();
});
</script>
