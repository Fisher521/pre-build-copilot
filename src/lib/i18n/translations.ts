/**
 * Internationalization Translations
 *
 * This file contains all UI text translations for Chinese (zh) and English (en)
 */

export type Language = 'zh' | 'en'

export const translations = {
  // ===== Common =====
  common: {
    loading: {
      zh: '加载中...',
      en: 'Loading...',
    },
    error: {
      zh: '出错了',
      en: 'Error',
    },
    retry: {
      zh: '重试',
      en: 'Retry',
    },
    back: {
      zh: '返回',
      en: 'Back',
    },
    next: {
      zh: '下一步',
      en: 'Next',
    },
    skip: {
      zh: '跳过',
      en: 'Skip',
    },
    confirm: {
      zh: '确认',
      en: 'Confirm',
    },
    cancel: {
      zh: '取消',
      en: 'Cancel',
    },
    submit: {
      zh: '提交',
      en: 'Submit',
    },
    comingSoon: {
      zh: '即将上线',
      en: 'Coming Soon',
    },
  },

  // ===== Navigation =====
  nav: {
    vibeChecker: {
      zh: 'Vibe Checker',
      en: 'Vibe Checker',
    },
    aiPulse: {
      zh: 'AI Pulse',
      en: 'AI Pulse',
    },
  },

  // ===== Home Page =====
  home: {
    tagline: {
      zh: 'Just Start Today - 写代码前，先 vibe 一下',
      en: 'Just Start Today - Vibe check before you code',
    },
    socialProof: {
      zh: '已有 <strong>2,000+</strong> 个项目完成评估',
      en: '<strong>2,000+</strong> projects evaluated',
    },
    inputLabel: {
      zh: '告诉我你想做什么',
      en: 'Tell me what you want to build',
    },
    privacyNote: {
      zh: '你的想法仅用于本次评估，不会被存储或分享给第三方',
      en: 'Your idea is only used for this evaluation and will not be stored or shared',
    },
    inputPlaceholder: {
      zh: '随便说说你的想法，不用想得太清楚...',
      en: "Just share your idea, doesn't have to be perfect...",
    },
    inputHint: {
      zh: '按 Enter 发送，Shift+Enter 换行',
      en: 'Press Enter to send, Shift+Enter for new line',
    },
    analyzing: {
      zh: '分析中...',
      en: 'Analyzing...',
    },
    startEval: {
      zh: '开始评估',
      en: 'Start Evaluation',
    },
    hotIdeas: {
      zh: '试试这些热门想法：',
      en: 'Try these popular ideas:',
    },
    examples: [
      {
        icon: '📰',
        title: { zh: 'AI 新闻站', en: 'AI News Site' },
        desc: { zh: '每日新闻 AI 摘要', en: 'Daily AI news digest' },
      },
      {
        icon: '🧠',
        title: { zh: '思维导图', en: 'Mind Map' },
        desc: { zh: '读书笔记自动生成', en: 'Auto-generate reading notes' },
      },
      {
        icon: '🎯',
        title: { zh: '落地页生成', en: 'Landing Page' },
        desc: { zh: '一句话生成落地页', en: 'One-liner to landing page' },
      },
    ],
    threeSteps: {
      zh: '三步搞定可行性分析',
      en: 'Three steps to feasibility analysis',
    },
    steps: [
      { icon: '📝', label: { zh: '描述想法', en: 'Describe' }, sub: { zh: '30秒输入', en: '30s input' } },
      { icon: '🔍', label: { zh: 'AI 分析', en: 'AI Analysis' }, sub: { zh: '智能评估', en: 'Smart eval' } },
      { icon: '📊', label: { zh: '获得报告', en: 'Get Report' }, sub: { zh: '可行方案', en: 'Action plan' } },
    ],
    loadingMessages: [
      { text: { zh: '正在理解你的想法...', en: 'Understanding your idea...' }, icon: '🧠' },
      { text: { zh: '分析项目关键信息...', en: 'Analyzing key info...' }, icon: '🔍' },
      { text: { zh: '提取核心功能点...', en: 'Extracting core features...' }, icon: '✨' },
      { text: { zh: '识别目标用户群体...', en: 'Identifying target users...' }, icon: '👥' },
      { text: { zh: '马上就好...', en: 'Almost done...' }, icon: '🚀' },
    ],
    yourIdea: {
      zh: '你的想法：',
      en: 'Your idea:',
    },
    networkError: {
      zh: '网络错误，请检查连接后重试',
      en: 'Network error, please check your connection',
    },
    createFailed: {
      zh: '创建对话失败',
      en: 'Failed to create conversation',
    },
  },

  // ===== AI Pulse Page =====
  aiPulse: {
    title: {
      zh: 'AI Pulse',
      en: 'AI Pulse',
    },
    subtitle: {
      zh: '探索 AI 世界的最新动态',
      en: 'Explore the latest in AI',
    },
    comingSoon: {
      zh: '即将上线，敬请期待',
      en: 'Coming soon, stay tuned',
    },
    features: [
      {
        icon: '🔥',
        title: { zh: 'AI 热点', en: 'AI Trends' },
        desc: { zh: '实时追踪 AI 领域热门话题', en: 'Track hot topics in AI' },
      },
      {
        icon: '📊',
        title: { zh: '趋势分析', en: 'Trend Analysis' },
        desc: { zh: '深度解读 AI 发展趋势', en: 'Deep dive into AI trends' },
      },
      {
        icon: '💡',
        title: { zh: '灵感库', en: 'Inspiration' },
        desc: { zh: '发现最具潜力的 AI 项目', en: 'Discover promising AI projects' },
      },
    ],
  },

  // ===== Review Page =====
  review: {
    title: {
      zh: '我理解了你的想法',
      en: 'I understood your idea',
    },
    subtitle: {
      zh: '请确认以下信息，可以直接修改',
      en: 'Please confirm the info below, feel free to edit',
    },
    projectName: {
      zh: '项目名称',
      en: 'Project Name',
    },
    projectNamePlaceholder: {
      zh: '给你的项目起个名字',
      en: 'Give your project a name',
    },
    coreFeature: {
      zh: '核心功能',
      en: 'Core Feature',
    },
    coreFeaturePlaceholder: {
      zh: '这个产品最核心要做什么',
      en: 'What is the core function of this product',
    },
    targetUser: {
      zh: '目标用户',
      en: 'Target Users',
    },
    targetUserPlaceholder: {
      zh: '谁会用这个产品',
      en: 'Who will use this product',
    },
    problemSolved: {
      zh: '解决什么问题',
      en: 'Problem Solved',
    },
    problemSolvedPlaceholder: {
      zh: '用户现在遇到什么痛点',
      en: 'What pain points do users have',
    },
    backLabel: {
      zh: '← 重新描述',
      en: '← Re-describe',
    },
    nextLabel: {
      zh: '确认继续 →',
      en: 'Confirm & Continue →',
    },
    analyzing: {
      zh: '正在分析你的想法...',
      en: 'Analyzing your idea...',
    },
    savingSteps: [
      { text: { zh: '保存项目信息...', en: 'Saving project info...' }, icon: '💾' },
      { text: { zh: '生成个性化问题...', en: 'Generating questions...' }, icon: '🤔' },
      { text: { zh: '准备下一步...', en: 'Preparing next step...' }, icon: '✨' },
    ],
    projectInfo: {
      zh: '项目信息',
      en: 'Project Info',
    },
    loadFailed: {
      zh: '加载失败',
      en: 'Failed to load',
    },
    saveFailed: {
      zh: '保存失败，请重试',
      en: 'Failed to save, please retry',
    },
  },

  // ===== Report Page =====
  report: {
    title: {
      zh: '项目评估报告',
      en: 'Project Evaluation Report',
    },
    generating: {
      zh: '正在生成评估报告',
      en: 'Generating evaluation report',
    },
    estimatedTime: {
      zh: '预计需要 {time} 秒',
      en: 'Estimated {time} seconds',
    },
    almostDone: {
      zh: '即将完成',
      en: 'Almost done',
    },
    overallProgress: {
      zh: '整体进度',
      en: 'Overall Progress',
    },
    processing: {
      zh: '处理中...',
      en: 'Processing...',
    },
    loadingSteps: [
      { id: 'analyze', label: { zh: '分析项目信息', en: 'Analyzing project info' } },
      { id: 'market', label: { zh: '搜索市场竞品', en: 'Searching market & competitors' } },
      { id: 'approach', label: { zh: '设计产品方案', en: 'Designing product approach' } },
      { id: 'tech', label: { zh: '匹配技术栈', en: 'Matching tech stack' } },
      { id: 'path', label: { zh: '规划实施路径', en: 'Planning implementation path' } },
      { id: 'report', label: { zh: '生成完整报告', en: 'Generating full report' } },
    ],
    waitingTips: [
      { zh: '💡 好的产品想法比代码更重要', en: '💡 A good product idea matters more than code' },
      { zh: '🚀 先做出来，再慢慢完善', en: '🚀 Ship first, iterate later' },
      { zh: '📊 80%的项目失败是因为没人用，不是技术问题', en: '📊 80% of projects fail due to no users, not tech issues' },
      { zh: '⚡ Vibe Coding 的精髓：能用就行', en: '⚡ Vibe Coding essence: if it works, ship it' },
      { zh: '🎯 找到第一个愿意付费的用户比10000行代码更有价值', en: '🎯 Finding one paying user beats 10,000 lines of code' },
      { zh: '💪 一个周末做出MVP，比一个月做出完美产品更好', en: '💪 A weekend MVP beats a month-long perfect product' },
    ],
    aiGenerating: {
      zh: 'AI 正在综合分析你的项目，生成个性化建议',
      en: 'AI is analyzing your project and generating personalized advice',
    },
    generateFailed: {
      zh: '生成失败',
      en: 'Generation Failed',
    },
    retryLater: {
      zh: '请稍后重试',
      en: 'Please try again later',
    },
    restart: {
      zh: '重新开始',
      en: 'Start Over',
    },
    backToHome: {
      zh: '返回首页',
      en: 'Back to Home',
    },
    retry: {
      zh: '重试',
      en: 'Retry',
    },
    share: {
      zh: '分享',
      en: 'Share',
    },
    copied: {
      zh: '已复制',
      en: 'Copied',
    },
    download: {
      zh: '下载',
      en: 'Download',
    },
    navSections: {
      score: { zh: '评分', en: 'Score' },
      analysis: { zh: '分析', en: 'Analysis' },
      market: { zh: '市场', en: 'Market' },
      approach: { zh: '方案', en: 'Approach' },
      tech: { zh: '技术', en: 'Tech' },
      path: { zh: '路径', en: 'Path' },
      cost: { zh: '成本', en: 'Cost' },
    },
    feasibilityScore: {
      zh: '可行性评分',
      en: 'Feasibility Score',
    },
    scoreBreakdown: {
      tech: { zh: '技术可行', en: 'Tech Feasibility' },
      market: { zh: '市场机会', en: 'Market Opportunity' },
      onboarding: { zh: '上手难度', en: 'Ease of Start' },
      userMatch: { zh: '用户匹配', en: 'User Match' },
    },
    whyWorthIt: {
      zh: '为什么值得做',
      en: 'Why It\'s Worth Building',
    },
    risks: {
      zh: '需要注意的风险',
      en: 'Risks to Consider',
    },
    marketAnalysis: {
      zh: '市场分析',
      en: 'Market Analysis',
    },
    opportunity: {
      zh: '机会洞察',
      en: 'Opportunity Insight',
    },
    searchTrends: {
      zh: '搜索趋势',
      en: 'Search Trends',
    },
    competitors: {
      zh: '现有竞品',
      en: 'Existing Competitors',
    },
    view: {
      zh: '查看',
      en: 'View',
    },
    productApproach: {
      zh: '产品策略',
      en: 'Product Strategy',
    },
    approachDesc: {
      zh: '选择产品的功能范围和 MVP 策略，决定先做什么、后做什么',
      en: 'Choose product scope and MVP strategy - what to build first',
    },
    recommended: {
      zh: '推荐',
      en: 'Recommended',
    },
    complexity: {
      low: { zh: '简单', en: 'Simple' },
      medium: { zh: '中等', en: 'Medium' },
      high: { zh: '复杂', en: 'Complex' },
      unknown: { zh: '未知', en: 'Unknown' },
    },
    suggestion: {
      zh: '建议：',
      en: 'Suggestion:',
    },
    detailFlow: {
      zh: '详细流程',
      en: 'Detailed Flow',
    },
    pros: {
      zh: '优势',
      en: 'Pros',
    },
    cons: {
      zh: '劣势',
      en: 'Cons',
    },
    bestFor: {
      zh: '最适合：',
      en: 'Best for:',
    },
    techOptions: {
      zh: '技术实现方案',
      en: 'Tech Implementation',
    },
    techStack: {
      zh: '技术栈',
      en: 'Tech Stack',
    },
    capability: {
      zh: '能力：',
      en: 'Capability:',
    },
    chinaOption: {
      zh: '🇨🇳 国内方案',
      en: '🇨🇳 China Stack',
    },
    globalOption: {
      zh: '🌍 海外方案',
      en: '🌍 Global Stack',
    },
    vibeCoderOption: {
      zh: '🚀 Vibe Coder 方案',
      en: '🚀 Vibe Coder Stack',
    },
    vibeToolchain: {
      zh: 'Vibe Coding 工具链',
      en: 'Vibe Coding Toolchain',
    },
    fastestPath: {
      zh: '最快上手路径',
      en: 'Fastest Path to Launch',
    },
    copyablePrompt: {
      zh: '可复制的提示词',
      en: 'Copyable Prompt',
    },
    clickToCopy: {
      zh: '点击复制',
      en: 'Click to copy',
    },
    goExecute: {
      zh: '去执行 →',
      en: 'Execute →',
    },
    costEstimate: {
      zh: '成本预估',
      en: 'Cost Estimate',
    },
    timeInvestment: {
      zh: '时间投入',
      en: 'Time Investment',
    },
    moneyInvestment: {
      zh: '金钱投入',
      en: 'Money Investment',
    },
    pitfallGuide: {
      zh: '避坑指南',
      en: 'Pitfall Guide',
    },
    feedback: {
      title: {
        zh: '这份报告对你有帮助吗？',
        en: 'Was this report helpful?',
      },
      helpful: {
        zh: '有用',
        en: 'Helpful',
      },
      notHelpful: {
        zh: '没帮助',
        en: 'Not Helpful',
      },
      thanks: {
        zh: '感谢你的反馈！',
        en: 'Thanks for your feedback!',
      },
      thanksDesc: {
        zh: '你的意见将帮助我们改进',
        en: 'Your input helps us improve',
      },
      privacyNote: {
        zh: '反馈仅用于改进产品，不会关联你的项目内容',
        en: 'Feedback is only used to improve the product',
      },
    },
    evalNewProject: {
      zh: '评估新项目',
      en: 'Evaluate New Project',
    },
    saveReport: {
      zh: '保存报告',
      en: 'Save Report',
    },
    shareMenu: {
      copyLink: { zh: '复制链接', en: 'Copy Link' },
      systemShare: { zh: '系统分享', en: 'System Share' },
      weibo: { zh: '分享到微博', en: 'Share to Weibo' },
      twitter: { zh: '分享到 X', en: 'Share to X' },
    },
  },

  // ===== Questions Page =====
  questions: {
    stage1Title: {
      zh: '基本信息',
      en: 'Basic Info',
    },
    stage2Title: {
      zh: '补充信息（可选）',
      en: 'Additional Info (Optional)',
    },
    skipToReport: {
      zh: '跳过，直接生成报告',
      en: 'Skip to report',
    },
    generateReport: {
      zh: '生成完整报告 →',
      en: 'Generate Full Report →',
    },
    notSure: {
      zh: '不确定 / 先跳过',
      en: 'Not sure / Skip',
    },
    generating: {
      zh: '正在生成针对你项目的评估问题...',
      en: 'Generating evaluation questions for your project...',
    },
    refreshHint: {
      zh: '如果长时间没反应，请刷新重试',
      en: 'If nothing happens, please refresh and try again',
    },
    prevStep: {
      zh: '上一步',
      en: 'Previous',
    },
    nextQuestion: {
      zh: '下一题 →',
      en: 'Next →',
    },
    doubleClickHint: {
      zh: '双击选项可直接进入下一题',
      en: 'Double-click to proceed directly',
    },
  },

  // ===== Question Bank =====
  questionBank: {
    // Q1: Product description
    q1: {
      question: {
        zh: '用一句话描述，你想做的这个东西是什么？\n\n比如：「一个帮人快速生成周报的工具」「一个追踪加密货币价格的 App」\n\n（随便说，不用很精确）',
        en: 'Describe in one sentence what you want to build.\n\nFor example: "A tool that helps generate weekly reports" or "An app that tracks crypto prices"\n\n(Just share roughly, doesn\'t need to be precise)',
      },
    },
    // Q2: Target user
    q2: {
      question: {
        zh: '这个东西主要是给谁用的？',
        en: 'Who is this mainly for?',
      },
      options: {
        self: { zh: '主要给自己用', en: 'Mainly for myself' },
        friends: { zh: '给身边的朋友/同事用', en: 'For friends/colleagues' },
        specific: { zh: '给特定的一群人（比如设计师、学生）', en: 'For a specific group (e.g., designers, students)' },
        public: { zh: '希望大家都能用', en: 'For everyone' },
      },
    },
    // Q3: Product form
    q3: {
      question: {
        zh: '你希望它是什么形式？',
        en: 'What form do you want it to take?',
      },
      options: {
        web: { zh: '网页（电脑或手机都能打开）', en: 'Web app (works on desktop & mobile)' },
        mobile: { zh: '手机 App', en: 'Mobile App' },
        plugin: { zh: '浏览器插件', en: 'Browser Extension' },
        wechat: { zh: '微信小程序', en: 'Mini Program / PWA' },
        skip: { zh: '还没想好', en: 'Not sure yet' },
      },
    },
    // Q4: Timeline preference
    q4: {
      question: {
        zh: '你更希望这个项目是？',
        en: 'What\'s your timeline preference?',
      },
      options: {
        quick: { zh: '一两天随便试试', en: '1-2 days quick experiment' },
        mvp: { zh: '一两周认真做个 MVP', en: '1-2 weeks serious MVP' },
        long: { zh: '如果顺了，可以长期做', en: 'Long-term if it works out' },
        unsure: { zh: '现在还没想清楚', en: 'Haven\'t decided yet' },
      },
    },
    // Q5: Technical comfort
    q5: {
      question: {
        zh: '你现在更像哪种状态？',
        en: 'Which describes you best?',
      },
      options: {
        code_simple: { zh: '会写代码，但不想折腾复杂架构', en: 'Can code, but want to keep it simple' },
        ai_build: { zh: '技术一般，主要靠 AI + 拼起来', en: 'Moderate skills, rely on AI tools' },
        code_good: { zh: '技术不错，但不想一开始就重', en: 'Good at coding, but want to start light' },
        unsure: { zh: '不太确定', en: 'Not sure' },
      },
    },
    // Q6: Budget preference
    q6: {
      question: {
        zh: '你对「花钱」这件事的感觉更接近？',
        en: 'How do you feel about spending money?',
      },
      options: {
        free: { zh: '能不花钱最好', en: 'Prefer free if possible' },
        little: { zh: '每月几十块可以接受', en: 'A few dollars/month is fine' },
        invest: { zh: '如果有希望，几百块也行', en: 'Willing to invest if promising' },
        later: { zh: '现在还不想考虑', en: 'Don\'t want to think about it yet' },
      },
    },
    // Q7: Commercialization intent
    q7: {
      question: {
        zh: '你现在做这个项目，更像是？',
        en: 'What\'s your goal with this project?',
      },
      options: {
        self_maybe: { zh: '自己用 + 顺便看看有没有人愿意付费', en: 'Personal use + maybe monetize' },
        business: { zh: '明确想做一个能赚钱的产品', en: 'Building a money-making product' },
        first: { zh: '先做出来再说', en: 'Build first, figure out later' },
        unsure: { zh: '还没想清楚', en: 'Haven\'t figured it out' },
      },
    },
    // Q8: Market awareness
    q8: {
      question: {
        zh: '你现在对市场的感觉更像是？',
        en: 'How do you feel about the market?',
      },
      options: {
        exists: { zh: '我感觉可能已经有人做过', en: 'I think others have done this' },
        unseen: { zh: '我没见过类似的，但也不确定', en: 'Haven\'t seen similar, but not sure' },
        uncheck: { zh: '我完全没查过', en: 'Haven\'t checked at all' },
        doesnt_matter: { zh: '不重要，先做再说', en: 'Doesn\'t matter, just build' },
      },
    },
  },

  // ===== Feedback Modal =====
  feedback: {
    title: {
      helpful: { zh: '感谢你的认可！', en: 'Thanks for your feedback!' },
      notHelpful: { zh: '感谢你的反馈', en: 'Thanks for your feedback' },
    },
    subtitle: {
      helpful: { zh: '能告诉我们哪里做得好吗？', en: 'What did we do well?' },
      notHelpful: { zh: '能告诉我们哪里可以改进吗？', en: 'How can we improve?' },
    },
    placeholder: {
      zh: '写下你的想法...',
      en: 'Share your thoughts...',
    },
    submit: {
      zh: '提交反馈',
      en: 'Submit Feedback',
    },
    submitting: {
      zh: '提交中...',
      en: 'Submitting...',
    },
    skipSubmit: {
      zh: '跳过',
      en: 'Skip',
    },
    privacyNote: {
      zh: '你的反馈仅用于改进产品体验，不会与项目内容关联',
      en: 'Your feedback is only used to improve the product',
    },
  },

  // ===== Voice Button =====
  voice: {
    startRecording: {
      zh: '点击说话',
      en: 'Click to speak',
    },
    recording: {
      zh: '正在录音...',
      en: 'Recording...',
    },
    processing: {
      zh: '处理中...',
      en: 'Processing...',
    },
  },
} as const

/**
 * Get translation by key path
 */
export function t(
  path: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      console.warn(`Translation not found: ${path}`)
      return path
    }
  }

  // If value is an object with lang keys
  if (value && typeof value === 'object' && lang in value) {
    value = value[lang]
  }

  // Replace params
  if (typeof value === 'string' && params) {
    Object.entries(params).forEach(([key, val]) => {
      value = value.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
    })
  }

  return typeof value === 'string' ? value : path
}
