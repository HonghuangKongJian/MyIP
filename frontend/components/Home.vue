<template>
  <NavBar />
  <User ref="userRef" />
  <Achievements ref="achievementsRef" />
  <Preferences />
  <main id="mainpart" class="mx-auto w-full px-4 jn-container">
    <div class="rounded-md">
      <TutorialBanner />

      <!-- 1. IP 信息独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('IPInfo')" v-show="currentSection === 'IPInfo'" class="space-y-6">
        <IPCheck />
        <ToolTutorialCard tool="ip" />
      </div>

      <!-- 2. 网络连通性独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('Connectivity')" v-show="currentSection === 'Connectivity'" class="space-y-6">
        <Connectivity />
        <ToolTutorialCard tool="connectivity" />
      </div>

      <!-- 3. WebRTC 泄漏测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('WebRTC')" v-show="currentSection === 'WebRTC'" class="space-y-6">
        <WebRTC />
        <ToolTutorialCard tool="webrtc" />
      </div>

      <!-- 4. DNS 泄漏测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('DNSLeakTest')" v-show="currentSection === 'DNSLeakTest'" class="space-y-6">
        <DNSLeaks />
        <ToolTutorialCard tool="dns" />
      </div>

      <!-- 5. 网速测试独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('SpeedTest')" v-show="currentSection === 'SpeedTest'" class="space-y-6">
        <SpeedTest />
        <ToolTutorialCard tool="speedtest" />
      </div>

      <!-- 6. 高级工具独立页：上面是功能，下面是教程 -->
      <div v-if="visitedSections.has('AdvancedTools')" v-show="currentSection === 'AdvancedTools'" class="space-y-6">
        <AdvancedTools ref="advancedToolsRef" />
        <ToolTutorialCard tool="advanced" />
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
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';

// On-demand Async Components for sections
const IPCheck = defineAsyncComponent(() => import('./IpInfos.vue'));
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
import { useSectionTracking } from '@/composables/use-section-tracking.js';
import { useDocumentMeta } from '@/composables/use-document-meta.js';

const { t } = useI18n();
const store = useMainStore();
const configs = computed(() => store.configs);
const userPreferences = computed(() => store.userPreferences);
const currentSection = computed(() => store.currentSection);

// Only load and render the current active section on startup, lazily mount subsequent sections on demand
const visitedSections = ref(new Set([store.currentSection || 'IPInfo']));
watch(
  () => store.currentSection,
  (sec) => {
    if (sec) visitedSections.value.add(sec);
  },
  { immediate: true },
);

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

// Scroll monitoring + section tracking (logic from widgets/Patch.vue)
useSectionTracking();

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
