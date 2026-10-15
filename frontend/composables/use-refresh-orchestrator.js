// Refresh / initial load sequence orchestration
//
// Input:
//   - store: main store
//   - t: i18n translation function
//   - userPreferences: computed(() => store.userPreferences)
//   - infoMaskLevel: ref<number> — reset to 0 when refreshing
//
// Output:
//   - loadingControl(): initial load sequence starts (after all cards are mounted)
//
// Internal:
//   - monitor store.shouldRefreshEveryThing, trigger refresh → reset loadingStatus → dispatch section commands → Alert → reset flag
//
// Sections are driven through the command bus (utils/app-commands.js): the
// owner components register ipinfo:refresh / connectivity:run / webrtc:run /
// dnsleak:run at setup, before loadingControl's mounted gate opens. Dispatches
// here are fire-and-forget — completion is reported on the event bus.

import { watch } from 'vue';
import { dispatchAppCommand, waitForAppCommand } from '../utils/app-commands.js';

const runCommand = async (name, payload) => {
    try {
        await waitForAppCommand(name, { timeoutMs: 10000 });
        await dispatchAppCommand(name, payload);
    } catch (error) {
        console.warn(`[refresh-orchestrator] ${name} failed:`, error);
    }
};

function scheduleTimedTasks(tasks) {
    tasks.forEach((task) => {
        setTimeout(() => {
            task.action();
            if (task.after) task.after();
        }, task.delay);
    });
}

export function useRefreshOrchestrator({ store, t, userPreferences, infoMaskLevel }) {
    const executedSections = new Set();

    const refreshingAlert = () => {
        store.setAlert(
            true,
            'text-success',
            t('alert.refreshEverythingMessage'),
            t('alert.refreshEverythingTitle'),
        );
    };

    const runSection = (section, isRefresh = false) => {
        if (section === 'IPInfo') {
            store.setLoadingStatus('IPInfo', false);
            runCommand('ipinfo:refresh');
            executedSections.add('IPInfo');
        } else if (section === 'Connectivity') {
            store.setLoadingStatus('Connectivity', false);
            runCommand('connectivity:run', { trigger: isRefresh ? 'refresh' : 'boot' });
            executedSections.add('Connectivity');
        } else if (section === 'WebRTC') {
            store.setLoadingStatus('WebRTC', false);
            runCommand('webrtc:run', { isRefresh });
            executedSections.add('WebRTC');
        } else if (section === 'DNSLeakTest') {
            store.setLoadingStatus('DNSLeakTest', false);
            runCommand('dnsleak:run', { isRefresh });
            executedSections.add('DNSLeakTest');
        }
    };

    const refreshEverything = () => {
        const current = store.currentSection || 'IPInfo';
        runSection(current, true);
        refreshingAlert();
        infoMaskLevel.value = 0;
        store.setRefreshEveryThing(false);
    };

    const loadingControl = () => {
        const current = store.currentSection || 'IPInfo';
        const allSections = ['IPInfo', 'Connectivity', 'WebRTC', 'DNSLeakTest'];
        allSections.forEach((s) => {
            if (s !== current) {
                store.setLoadingStatus(s, true);
            }
        });
        runSection(current, false);
    };

    watch(
        () => store.currentSection,
        (newSection) => {
            if (newSection && !executedSections.has(newSection)) {
                setTimeout(() => {
                    runSection(newSection, false);
                }, 150);
            }
        },
    );

    watch(
        () => store.shouldRefreshEveryThing,
        (newVal) => {
            if (newVal) refreshEverything();
        },
    );

    return { loadingControl };
}
