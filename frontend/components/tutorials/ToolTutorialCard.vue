<!--
  ToolTutorialCard.vue
  In-page tutorial and architectural deep-dive component displayed directly beneath each feature.
-->
<template>
  <section id="tutorial-section" class="mt-8 pt-6 border-t border-border/60">
    <div class="rounded-xl border border-primary/20 bg-card/60 backdrop-blur-xs p-5 md:p-6 shadow-xs space-y-6">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div class="flex items-center gap-2.5">
          <div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <BookOpen class="size-5" />
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{{ currentContent.title }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/15 text-primary border border-primary/20">
                原理解析 & 实战代码
              </span>
            </h3>
            <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {{ currentContent.subtitle }}
            </p>
          </div>
        </div>

        <div v-if="currentContent.demoCommand" class="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" class="h-8 gap-1.5 text-xs font-mono cursor-pointer border-primary/30 hover:bg-primary/10"
            @click="copyCommand(currentContent.demoCommand)">
            <component :is="isCopied ? Check : Copy" class="size-3.5 text-primary" />
            <span>{{ isCopied ? '已复制命令' : '复制独立运行命令' }}</span>
          </Button>
        </div>
      </div>

      <!-- Content Grid: 1. Core Principles (Left) & Key Highlights (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Main Analysis (Span 2) -->
        <div class="lg:col-span-2 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <div class="rounded-lg bg-muted/40 p-4 border border-border/40 space-y-2">
            <h4 class="font-semibold text-foreground flex items-center gap-2 text-base">
              <Sparkles class="size-4 text-amber-500" />
              <span>底层机制与工作流</span>
            </h4>
            <p v-for="(p, idx) in currentContent.principles" :key="idx" class="text-sm">
              {{ p }}
            </p>
          </div>

          <!-- Flowchart or Step Matrix -->
          <div v-if="currentContent.steps && currentContent.steps.length" class="space-y-2">
            <h4 class="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Layers class="size-4 text-primary" />
              <span>核心步骤流程</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div v-for="(step, sIdx) in currentContent.steps" :key="sIdx"
                class="rounded-md border border-border/50 bg-background/60 p-3 space-y-1">
                <div class="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                  <span class="size-4 rounded-full bg-primary/15 flex items-center justify-center text-[10px]">{{ sIdx + 1 }}</span>
                  <span>{{ step.title }}</span>
                </div>
                <p class="text-xs text-muted-foreground leading-normal">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Technical Insights & Safeguards -->
        <div class="space-y-4">
          <div class="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
            <h4 class="font-semibold text-foreground text-sm flex items-center gap-2">
              <ShieldCheck class="size-4 text-emerald-500" />
              <span>核心指标与要点</span>
            </h4>
            <ul class="space-y-2 text-xs">
              <li v-for="(item, iIdx) in currentContent.insights" :key="iIdx" class="flex items-start gap-2">
                <span class="text-primary font-bold mt-0.5">•</span>
                <span class="leading-relaxed">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Standalone Demo Runner Box -->
          <div v-if="currentContent.demoCommand" class="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Terminal class="size-3.5 text-primary" />
                <span>零依赖单文件测试</span>
              </span>
              <span class="text-[10px] text-muted-foreground font-mono">Node.js 18+</span>
            </div>
            <p class="text-xs text-muted-foreground">
              无需安装复杂的项目前端依赖，脱离系统即可独立验证核心探测算法：
            </p>
            <div class="p-2 rounded bg-background border font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
              <span class="text-foreground truncate select-all">{{ currentContent.demoCommand }}</span>
              <Button size="icon" variant="ghost" class="size-6 shrink-0" @click="copyCommand(currentContent.demoCommand)">
                <component :is="isCopied ? Check : Copy" class="size-3 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BookOpen, Copy, Check, Sparkles, Layers, ShieldCheck, Terminal } from '@lucide/vue';

const props = defineProps({
  tool: {
    type: String,
    required: true,
  },
});

const isCopied = ref(false);

const copyCommand = (cmd) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
};

const TUTORIAL_DATA = {
  ip: {
    title: 'IP 探针与双栈协议严格隔离原理解析',
    subtitle: '多源 Fallback 调度模型、专属协议校验器以及代理环境下的 IPv4/IPv6 穿透防护',
    demoCommand: 'node tutorials/01-ip-lookup/demo.js',
    principles: [
      '在公共网络与代理环境下获取真实公网 IP 时，单一查询接口极易因限流、网络抖动或墙体阻断而失效。MyIP 采用了 Provider（单一数据源）与 Chain Runner（探针链调度器）彻底解耦的架构。',
      '当用户开启双栈代理/TUN 模式访问 IPv6 端点时，请求常通过代理节点的 IPv4 出口与远端握手，返回代理节点的 IPv4。为此，MyIP 为每张卡片绑定专属校验器（isIPv4 与 isOnlyIPv6），一旦协议不匹配立即自动降级至备用探针。'
    ],
    steps: [
      { title: '发起探测', desc: '根据卡片类型选择探测源链条，如 [Cloudflare IPv4, MyExternalIP]' },
      { title: '接口请求', desc: '通过 fetchWithTimeout 发起带超时保护的无状态原始请求' },
      { title: '专属协议校验', desc: '经由 isIPv4 或 isOnlyIPv6 校验，严禁双栈混杂穿透' },
      { title: '故障降级', desc: '首选源异常或校验未通过时，毫秒级静默推进至备用探针' }
    ],
    insights: [
      '支持 IPv4 与 IPv6 物理卡片独立对比，互不污染',
      '集成 Cloudflare、ipcheck.ing、ipify 等多节点交叉冗余',
      '严格排除内网保留地址（RFC 1918 / 4193）及非公网路由 IP',
      '提供独立解耦脚本，可直接在终端中单独调试各源健康度'
    ]
  },
  connectivity: {
    title: '全球网络连通性探测原理解析',
    subtitle: '跨域探针技术、HTTP 状态嗅探与区域网络阻断行为诊断',
    demoCommand: 'node -e "console.log(\'Connectivity test relies on browser cross-origin fetch/image probes.\')"',
    principles: [
      '网络连通性测试通过浏览器直接向全球知名服务（Google、GitHub、Cloudflare、YouTube、Telegram 等）发起轻量跨域探测。',
      '利用探测响应的时延（Latency）与错误特征（DNS 失败、连接超时、TCP RST、TLS 握手阻断），判断当前网络出口的分流规则与防火墙拦截状态。'
    ],
    steps: [
      { title: '节点采样', desc: '覆盖境内外关键 CDN、主流开发平台与社交媒体节点' },
      { title: '跨域探针', desc: '通过轻量资源加载或 HEAD 探测捕获网络连通性' },
      { title: '时延测量', desc: '毫秒级计算 TCP + TLS 握手完整往返时延' },
      { title: '阻断模式识别', desc: '精准区分是本地 DNS 污染、TCP 重置还是连接超时' }
    ],
    insights: [
      '直观对比直连流量与代理通道的访问效率与稳定性',
      '诊断代理软件（Clash/V2Ray/Sing-box）的分流规则是否生效',
      '提供一键重新检测与失败节点单点重试机制'
    ]
  },
  webrtc: {
    title: 'WebRTC 穿透与真实 IP 泄漏防范教程',
    subtitle: 'NAT 穿透打洞机制、STUN 协议 UDP 传输特性及绕过浏览器代理的根源剖析',
    demoCommand: 'node tutorials/02-webrtc-leak/demo.js',
    principles: [
      'WebRTC 是一项端到端（P2P）实时音视频通信技术。为了穿透家庭路由器 NAT，浏览器必须向公共 STUN 服务器发起打洞探测以获取反射候选地址（srflx）。',
      '绝大多数普通浏览器代理插件仅拦截 HTTP/HTTPS 协议，而 WebRTC 底层使用的是 UDP 数据包，会直接绕过插件从本地真实物理网卡发送，导致家庭宽带真实 IP 彻底暴露！'
    ],
    steps: [
      { title: '创建 PeerConnection', desc: '配置公共 STUN 服务器发起 ICE Candidate 收集' },
      { title: 'UDP 探测出站', desc: '向 STUN 发送 Binding Request，直接穿透 NAT' },
      { title: '捕获候选地址', desc: '监听 onicecandidate 事件，提取 typ srflx 候选地址' },
      { title: '比对与预警', desc: '比对 STUN 反射 IP 与 HTTP 出口 IP，一旦不一致即刻判定泄漏' }
    ],
    insights: [
      '候选类型：host 为局域网地址，srflx 为外网暴露真实 IP（主要泄漏源）',
      '防御措施 1：启用代理软件的全局 TUN / 虚拟网卡模式，接管系统所有 UDP 流量',
      '防御措施 2：Firefox 用户可在 about:config 中禁用 media.peerconnection.enabled',
      '提供独立 HTML 与 Node 脚本，双击即可本地直观复现检测流程'
    ]
  },
  dns: {
    title: 'DNS 泄漏与动态随机子域名泛解析追踪模型',
    subtitle: '递归解析隐秘监听、泛解析关联追踪及本地运营商劫持排查',
    demoCommand: 'node tutorials/03-dns-leak/demo.js',
    principles: [
      'DNS 泄漏是指网络流量虽然通过代理隧道出站，但域名的解析请求依然流向了本地宽带运营商（ISP）的 DNS 服务器。',
      '这会导致本地运营商完整记录用户的所有网站访问清单，甚至直接断定用户正在使用代理；未加密的 UDP 53 DNS 还极易被篡改或劫持。'
    ],
    steps: [
      { title: '申请会话 Token', desc: '向检测服务端申请全局唯一测试标识符（Session ID）' },
      { title: '构造专属随机子域名', desc: '组装动态子域名，例如 probe.xyz123.bash.ws' },
      { title: '发起递归查询', desc: '客户端请求解析，由当前使用的 Local DNS 向上级权威服务器递归查询' },
      { title: '捕获权威日志比对', desc: '权威 DNS 记录来源 LocalDNS 的 IP，客户端取回报告比对是否属于本地 ISP' }
    ],
    insights: [
      '判定依据：若 DNS 服务器归属地与网页出口 IP 国家/地区不一致，即存在隐蔽泄漏',
      '防范手段：开启代理工具的“远端解析（Remote DNS）”或使用安全加密 DNS（DoH / DoT）',
      '集成 bash.ws、surfshark、myipstack 等多上游交叉验证'
    ]
  },
  speedtest: {
    title: '网络测速引擎与时延/抖动算法教程',
    subtitle: '多并发分块流式传输、RFC 3550 抖动计算模型及 TCP 慢启动规避方案',
    demoCommand: 'node tutorials/04-speed-test/demo.js',
    principles: [
      '真正的网络质量评估绝不仅仅是看单文件下载速率，而是通过往返时延（RTT）、网络抖动（Jitter）和自适应分块并发吞吐量构成的综合评价体系。',
      '现代 Web 测速引擎通过并发连接突破单流瓶颈，采用流式读取（ReadableStream）即读即弃机制，杜绝前端内存溢出；同时消除 TCP 慢启动偏差。'
    ],
    steps: [
      { title: '就近边缘寻路', desc: '连接 Cloudflare 全球边缘节点进行首包往返' },
      { title: '时延与抖动测试', desc: '连续多轮轻量请求采样，计算相邻样本差值绝对均值（RFC 3550）' },
      { title: '带宽阶梯预热', desc: '以 1MB-5MB 小块探测当前网络梯队，自适应匹配测速并发包尺寸' },
      { title: '流式吞吐量测算', desc: '通过公式 (Bytes × 8) / (Seconds × 10^6) 实时精准计算 Mbps' }
    ],
    insights: [
      'RFC 3550 抖动算法直接决定在线游戏和实时语音会议的抗丢包抗卡顿能力',
      '支持从 10MB 到 100MB 自定义下载/上传包大小',
      '提供独立 Node.js 命令行脚本，直连 Cloudflare 边缘节点测速'
    ]
  },
  advanced: {
    title: '高级网络工具箱功能指南与排障实战',
    subtitle: 'DNS 全球多节点解析、MTR 链路跳数路由追踪、Whois 与 IP 掩码计算实战',
    demoCommand: '',
    principles: [
      'MyIP 集成了涵盖网络工程、安全审计与日常排障的 10 余项专业高级工具，解决深层次网络疑难杂症。',
      '包含 MTR 路由逐跳探测（精确捕获哪一跳路由丢包）、DNS 全球递归解析（排查域名解析是否全球生效或被区域污染）、Whois/ASN 归属画像等。'
    ],
    steps: [
      { title: 'DNS 全球解析', desc: '查询域名在 Google、Cloudflare、OpenDNS 等节点的解析一致性' },
      { title: 'MTR 路由追踪', desc: '诊断数据包出境时经过的骨干网跳数、AS 路径及丢包节点' },
      { title: 'ASN 与 BGP 剖析', desc: '查看 IP 所属自治系统（ASN）、广播前缀及运营商互联情况' },
      { title: '子网掩码计算', desc: '精准换算 IPv4/IPv6 CIDR 前缀、可用主机范围与广播地址' }
    ],
    insights: [
      '完全支持移动端抽屉与独立页面直达（/tools/:slug）',
      '提供一键导出诊断报告功能，方便与网络管理员协同排障'
    ]
  }
};

const currentContent = computed(() => {
  return TUTORIAL_DATA[props.tool] || TUTORIAL_DATA.ip;
});
</script>
