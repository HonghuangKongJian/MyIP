<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
      <!-- Modal Header -->
      <DialogHeader class="p-4 sm:p-6 pb-2 border-b shrink-0">
        <div class="flex items-center gap-2 text-primary font-semibold text-lg sm:text-xl">
          <BookOpen class="size-5 sm:size-6 text-primary shrink-0" />
          <span>核心网络与隐私检测工具教程与原理解析</span>
        </div>
        <p class="text-xs sm:text-sm text-muted-foreground mt-1">
          深入了解各项检测工具的底层实现机制、常见网络环境干扰与完全解耦的独立代码实现。
        </p>
      </DialogHeader>

      <!-- Main Tabs Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-3">
        <Tabs v-model="activeTab" class="w-full">
          <!-- Tab Navigation -->
          <TabsList class="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 p-1 bg-muted/60 rounded-lg mb-4">
            <TabsTrigger value="ip" class="py-2 text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background">
              <Globe class="size-4 shrink-0 text-blue-500" />
              <span>IP 探测与双栈</span>
            </TabsTrigger>
            <TabsTrigger value="webrtc" class="py-2 text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background">
              <ShieldAlert class="size-4 shrink-0 text-amber-500" />
              <span>WebRTC 泄漏</span>
            </TabsTrigger>
            <TabsTrigger value="dns" class="py-2 text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background">
              <Terminal class="size-4 shrink-0 text-purple-500" />
              <span>DNS 泄漏检测</span>
            </TabsTrigger>
            <TabsTrigger value="speedtest" class="py-2 text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background">
              <Activity class="size-4 shrink-0 text-emerald-500" />
              <span>网络测速引擎</span>
            </TabsTrigger>
          </TabsList>

          <!-- TAB 1: IP Lookup -->
          <TabsContent value="ip" class="space-y-4 focus-visible:outline-none">
            <div class="rounded-lg border bg-card p-4 space-y-3">
              <h3 class="text-base font-semibold flex items-center gap-2 text-foreground">
                <Globe class="size-4 text-blue-500" />
                <span>1. 多源探针链与双栈协议严格隔离</span>
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                在复杂的网络或代理（Proxy / TUN）环境下，单一探测源极易受到节点故障或协议混杂干扰。MyIP 采用了 <strong>Provider（数据源）与 Chain Runner（调度器）解耦</strong> 的架构。
              </p>
              
              <div class="rounded-md bg-muted/50 p-3 space-y-2 text-xs sm:text-sm font-mono">
                <div class="font-semibold text-foreground font-sans">🛡️ 为什么 IPv6 卡片需要专属校验器？</div>
                <p class="text-muted-foreground font-sans">
                  当用户使用双栈代理软件访问专属 IPv6 探针（如 <code>6.ipcheck.ing</code>）时，请求可能通过代理的 IPv4 出口与 Cloudflare 握手，导致端点回传代理节点的 IPv4 地址。若仅使用通用的 <code>isValidIP</code> 校验，就会把 IPv4 错误填入 IPv6 卡片中。
                  因此，MyIP 为每个协议卡片绑定专属校验器（<code>isIPv4</code> / <code>isOnlyIPv6</code>），非目标协议自动推进至下一备用源。
                </p>
              </div>

              <div class="rounded-md bg-muted/40 p-3 text-xs sm:text-sm">
                <span class="font-semibold text-foreground">💻 独立隔离代码演示：</span>
                <p class="text-muted-foreground mt-1 mb-2">已提供零依赖独立单文件脚本，包含多源 Fallback 机制与协议隔离：</p>
                <div class="flex items-center justify-between gap-2 p-2 bg-background border rounded font-mono text-xs">
                  <span class="truncate">node tutorials/01-ip-lookup/demo.js</span>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs shrink-0" @click="copyCommand('node tutorials/01-ip-lookup/demo.js')">
                    <component :is="copiedCommand === 'node tutorials/01-ip-lookup/demo.js' ? Check : Copy" class="size-3.5 mr-1" />
                    {{ copiedCommand === 'node tutorials/01-ip-lookup/demo.js' ? '已复制' : '复制命令' }}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- TAB 2: WebRTC Leak -->
          <TabsContent value="webrtc" class="space-y-4 focus-visible:outline-none">
            <div class="rounded-lg border bg-card p-4 space-y-3">
              <h3 class="text-base font-semibold flex items-center gap-2 text-foreground">
                <ShieldAlert class="size-4 text-amber-500" />
                <span>2. WebRTC 穿透与真实 IP 泄漏原理</span>
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                WebRTC 是一项端到端（P2P）实时通信技术。为了穿透路由器 NAT，它会向公共 STUN 服务器发起 UDP 探测以获取自身的“反射候选地址”（Server Reflexive Candidate，简称 <code>srflx</code>）。
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div class="border rounded-md p-3 bg-muted/30">
                  <div class="font-semibold text-foreground mb-1">🚨 为什么代理会失效？</div>
                  <p class="text-muted-foreground leading-relaxed">
                    普通浏览器代理插件仅拦截 HTTP/HTTPS 流量，而 WebRTC 的 STUN 探测工作在底层传输层（UDP），会直接绕过插件通过真实网卡向外发送，导致真实公网 IP 暴露无遗。
                  </p>
                </div>
                <div class="border rounded-md p-3 bg-muted/30">
                  <div class="font-semibold text-foreground mb-1">🛡️ 如何防范泄漏？</div>
                  <ul class="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>启用代理软件的全局 TUN / 虚拟网卡模式</li>
                    <li>Chrome: 禁用非代理 UDP</li>
                    <li>Firefox: 设置 <code>media.peerconnection.enabled = false</code></li>
                  </ul>
                </div>
              </div>

              <div class="rounded-md bg-muted/40 p-3 text-xs sm:text-sm">
                <span class="font-semibold text-foreground">💻 独立交互演示网页与解析脚本：</span>
                <p class="text-muted-foreground mt-1 mb-2">项目提供双击即可在浏览器运行的单文件 HTML 与 Node 算法脚本：</p>
                <div class="flex items-center justify-between gap-2 p-2 bg-background border rounded font-mono text-xs">
                  <span class="truncate">node tutorials/02-webrtc-leak/demo.js</span>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs shrink-0" @click="copyCommand('node tutorials/02-webrtc-leak/demo.js')">
                    <component :is="copiedCommand === 'node tutorials/02-webrtc-leak/demo.js' ? Check : Copy" class="size-3.5 mr-1" />
                    {{ copiedCommand === 'node tutorials/02-webrtc-leak/demo.js' ? '已复制' : '复制命令' }}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- TAB 3: DNS Leak -->
          <TabsContent value="dns" class="space-y-4 focus-visible:outline-none">
            <div class="rounded-lg border bg-card p-4 space-y-3">
              <h3 class="text-base font-semibold flex items-center gap-2 text-foreground">
                <Terminal class="size-4 text-purple-500" />
                <span>3. DNS 泄漏与动态随机子域名泛解析追踪</span>
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                即使网页访问通过了代理通道，如果域名的解析请求依然由本地运营商（ISP）的 DNS 服务器处理，就会导致 ISP 完整记录您的访问日志，甚至被识别出真实地理位置。
              </p>

              <div class="rounded-md bg-muted/50 p-3 text-xs sm:text-sm space-y-1.5 font-mono">
                <div class="font-semibold text-foreground font-sans">🔍 探测技术核心：泛解析追踪模型</div>
                <ol class="list-decimal list-inside text-muted-foreground font-sans space-y-1">
                  <li>客户端申请唯一测试 Token（例如 <code>xyz789</code>）；</li>
                  <li>向专属随机子域名发起解析：<code>probe.1.xyz789.bash.ws</code>；</li>
                  <li>权威 DNS 接收到来自您当前使用 DNS 递归服务器的查询请求，记录其来源 IP；</li>
                  <li>客户端请求报告，比对 DNS 解析节点 IP 与网页出口 IP，从而发现隐蔽泄漏。</li>
                </ol>
              </div>

              <div class="rounded-md bg-muted/40 p-3 text-xs sm:text-sm">
                <span class="font-semibold text-foreground">💻 独立隔离代码演示：</span>
                <p class="text-muted-foreground mt-1 mb-2">零依赖直接调用生产探测协议测试当前网络 DNS 出口：</p>
                <div class="flex items-center justify-between gap-2 p-2 bg-background border rounded font-mono text-xs">
                  <span class="truncate">node tutorials/03-dns-leak/demo.js</span>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs shrink-0" @click="copyCommand('node tutorials/03-dns-leak/demo.js')">
                    <component :is="copiedCommand === 'node tutorials/03-dns-leak/demo.js' ? Check : Copy" class="size-3.5 mr-1" />
                    {{ copiedCommand === 'node tutorials/03-dns-leak/demo.js' ? '已复制' : '复制命令' }}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- TAB 4: Speed Test -->
          <TabsContent value="speedtest" class="space-y-4 focus-visible:outline-none">
            <div class="rounded-lg border bg-card p-4 space-y-3">
              <h3 class="text-base font-semibold flex items-center gap-2 text-foreground">
                <Activity class="size-4 text-emerald-500" />
                <span>4. 网络测速引擎与时延/抖动算法</span>
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                网络测速绝非仅看单一文件的下载速度，而是通过时延（Latency）、网络抖动（Jitter）和自适应分块并发吞吐量构成的综合评价体系。
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div class="border rounded-md p-3 bg-muted/30">
                  <div class="font-semibold text-foreground mb-1">⏱️ 往返时延与 RFC 3550 抖动</div>
                  <p class="text-muted-foreground leading-relaxed">
                    连续发起多轮极轻量探测包计算真实 RTT；利用相邻测量差值的绝对加权均值得到抖动值，直接反映语音通话与在线游戏的抗丢包与稳定性。
                  </p>
                </div>
                <div class="border rounded-md p-3 bg-muted/30">
                  <div class="font-semibold text-foreground mb-1">🚀 流式吞吐量测算</div>
                  <p class="text-muted-foreground leading-relaxed">
                    通过分块流式读取与抛弃机制（避免浏览器内存溢出），消除 TCP 慢启动影响，以 <code>(Bytes × 8) / (Seconds × 10^6)</code> 精确计算真实下行带宽 Mbps。
                  </p>
                </div>
              </div>

              <div class="rounded-md bg-muted/40 p-3 text-xs sm:text-sm">
                <span class="font-semibold text-foreground">💻 独立命令行测速脚本：</span>
                <p class="text-muted-foreground mt-1 mb-2">原生连接 Cloudflare 边缘测速节点测试时延、抖动与 10MB 分块带宽：</p>
                <div class="flex items-center justify-between gap-2 p-2 bg-background border rounded font-mono text-xs">
                  <span class="truncate">node tutorials/04-speed-test/demo.js</span>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs shrink-0" @click="copyCommand('node tutorials/04-speed-test/demo.js')">
                    <component :is="copiedCommand === 'node tutorials/04-speed-test/demo.js' ? Check : Copy" class="size-3.5 mr-1" />
                    {{ copiedCommand === 'node tutorials/04-speed-test/demo.js' ? '已复制' : '复制命令' }}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Footer Action -->
      <div class="p-3 sm:p-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
        <span class="text-xs text-muted-foreground hidden sm:inline">
          💡 所有教程与代码源码保存在项目根目录的 <code class="px-1 py-0.5 rounded bg-muted">tutorials/</code> 目录中。
        </span>
        <Button variant="default" size="sm" class="ml-auto" @click="isOpen = false">
          完成浏览
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, ShieldAlert, Terminal, Activity, Copy, Check } from '@lucide/vue';
import { onAppEvent } from '@/utils/app-events';

const isOpen = ref(false);
const activeTab = ref('ip');
const copiedCommand = ref('');

const openModal = (tool = 'ip') => {
  activeTab.value = tool;
  isOpen.value = true;
};

const copyCommand = (cmd) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd);
    copiedCommand.value = cmd;
    setTimeout(() => {
      copiedCommand.value = '';
    }, 2000);
  }
};

let offEvent = null;
onMounted(() => {
  offEvent = onAppEvent('open-tutorial', ({ tool } = {}) => {
    openModal(tool || 'ip');
  });
});

onUnmounted(() => {
  if (offEvent) offEvent();
});

defineExpose({
  openModal,
});
</script>
