/**
 * 报告生成配置文件
 * 包含工具库、数据源、术语翻译等常量
 */

// ================================
// Vibe Coding 工具库 - V2.2 中国市场版
// ================================

export const VIBE_TOOL_LIBRARY = `
# Vibe Coding 工具库（中国市场版）

## 原则：国产工具优先，确保国内可访问

### 1. AI编辑器（主力开发工具）
**完全不会代码 → 扣子空间**（中文界面，最简单）
- **扣子空间** (字节): https://www.coze.cn/space - 对话式生成小程序/网页，国内访问，免费
- **豆包MarsCode** (字节): https://www.marscode.cn - 在线IDE + AI，类似Replit

**会一点代码，想学习 → Cursor**（边做边学）
- **Cursor**: https://cursor.com - 行业标准，$20/月，体验最好
- **Windsurf**: https://codeium.com/windsurf - Cascade功能强大
- **Trae** (字节): https://trae.ai - 国产，免费，类似Cursor

**有经验，想高效 → Claude Code**（最强但需命令行）
- **Claude Code**: 命令行工具，Claude Max订阅，agentic能力最强
- **Aider**: 开源，支持多模型，需自备API

### 2. 代码生成器（魔法层，快速原型）
**国产（无需科学上网）：**
- **扣子空间**: https://www.coze.cn/space - 字节出品，生成小程序/网页
- **豆包MarsCode**: https://www.marscode.cn - 在线开发环境

**国际（需科学上网）：**
- **v0.dev**: https://v0.dev - Vercel出品，最适合React/Next.js UI
- **Bolt.new**: https://bolt.new - StackBlitz出品，全栈应用生成
- **Lovable.dev**: https://lovable.dev - 全栈应用，适合非技术用户

### 3. 后端/数据库
**国产优先：**
- **MemFire Cloud**: https://memfiredb.com - Supabase国内版，兼容API，访问快
- **LeanCloud**: https://www.leancloud.cn - 老牌BaaS，功能全
- **微信云开发**: https://cloud.weixin.qq.com - 小程序首选

**国际备选：**
- **Supabase**: https://supabase.com - 功能最全，Auth + 数据库 + 实时
- **Convex**: https://convex.dev - 实时数据场景

### 4. AI API（大模型）
**国产（价格便宜，免费额度多）：**
- **DeepSeek**: https://platform.deepseek.com - 最便宜，代码能力强
- **通义千问** (阿里): https://dashscope.aliyun.com - 免费额度多
- **智谱GLM** (清华): https://open.bigmodel.cn - 中文理解好
- **月之暗面 Kimi**: https://platform.moonshot.cn - 长上下文
- **字节豆包**: https://www.volcengine.com/product/doubao - 和扣子生态打通
- **硅基流动**: https://siliconflow.cn - 聚合多模型，价格低

**国际备选：**
- **OpenAI API**: GPT-4o，需要信用卡
- **Anthropic API**: Claude系列，长文本好

### 5. 部署托管
**国产/国内友好：**
- **Zeabur**: https://zeabur.com - 华人团队，界面友好，国内访问快
- **Cloudflare Pages**: https://pages.cloudflare.com - 国内可访问，速度快
- **阿里云Serverless**: https://www.aliyun.com/product/fc - 大厂，稳定
- **腾讯云CloudBase**: https://cloud.tencent.com/product/tcb - 小程序云开发

**国际主流：**
- **Vercel**: https://vercel.com - 最流行，和v0/Next.js无缝配合
- **Netlify**: https://www.netlify.com - 类似Vercel
- **Railway**: https://railway.app - 支持数据库

### 6. 支付
**国内：**
- **微信支付**: https://pay.weixin.qq.com - 必备，需企业主体
- **支付宝**: https://open.alipay.com - 必备，需企业主体
- **面包多**: https://mbd.pub - 个人可用，赞赏/付费内容
- **爱发电**: https://afdian.net - 会员/赞助模式

**国际：**
- **Stripe**: https://stripe.com - 开发体验最好，需海外主体
- **LemonSqueezy**: https://lemonsqueezy.com - 数字产品，帮处理税务

## 零成本完整方案（中国用户）
推荐组合：**Trae + MemFire + DeepSeek + Zeabur**
- Trae - 字节AI编辑器，免费
- MemFire - Supabase国内版，免费tier
- DeepSeek - API极便宜
- Zeabur - 部署托管，免费额度

## 进阶方案（愿意付费）
推荐组合：**Cursor + Supabase + Claude API + Vercel**
- Cursor Pro - $20/月，体验最好
- Supabase - 免费tier够用
- Claude API - 代码能力强
- Vercel - 免费tier够用
`

// ================================
// 中国市场数据源配置
// ================================

export const CHINA_MARKET_DATA_SOURCES = {
  search_trends: [
    {
      name: '百度指数',
      url: 'https://index.baidu.com/v2/main/index.html',
      description: '查看关键词搜索趋势',
      how_to_use: '输入关键词，查看近90天趋势'
    },
    {
      name: '微信指数',
      url: '微信搜一搜',
      description: '微信生态内的热度',
      how_to_use: '在微信搜一搜中搜索关键词，查看指数'
    },
    {
      name: '抖音话题',
      url: 'https://www.douyin.com',
      description: '抖音平台的话题播放量',
      how_to_use: '搜索话题标签，查看播放量和讨论度'
    }
  ],

  user_feedback: [
    {
      name: '小红书',
      url: 'https://www.xiaohongshu.com',
      search_template: 'https://www.xiaohongshu.com/search_result?keyword=',
      description: '用户真实评论和痛点'
    },
    {
      name: '抖音评论区',
      url: 'https://www.douyin.com',
      description: '短视频评论中的用户反馈'
    },
    {
      name: '知乎',
      url: 'https://www.zhihu.com',
      search_template: 'https://www.zhihu.com/search?q=',
      description: '深度讨论和专业意见'
    },
    {
      name: 'V2EX',
      url: 'https://www.v2ex.com',
      description: '技术社区的开发者讨论'
    }
  ],

  app_stores: [
    {
      name: 'App Store (中国)',
      url: 'https://apps.apple.com/cn/',
      description: 'iOS应用商店'
    },
    {
      name: '应用宝',
      url: 'https://sj.qq.com',
      search_url: 'https://sj.qq.com/myapp/search.htm?kw=',
      description: '腾讯应用商店，安卓主流渠道'
    },
    {
      name: '华为应用市场',
      url: 'https://appgallery.huawei.com',
      description: '华为应用商店'
    }
  ]
}

// ================================
// 术语翻译表
// ================================

export const TERM_TRANSLATIONS = [
  { term: 'MVP', plain_text: '最小能用的版本', example: '不是做最小的产品，而是做刚好能验证想法的版本' },
  { term: '部署', plain_text: '把网页放到网上让别人能访问', example: '就像把你的作品搬到展厅，让所有人都能看到' },
  { term: 'API', plain_text: '现成的服务，你调用它帮你干活', example: '就像外卖API，你不用自己做饭，调用它就给你送来' },
  { term: '后端', plain_text: '存数据、处理逻辑的地方（用户看不到）', example: '就像餐厅的厨房，客人看不到但在工作' },
  { term: '前端', plain_text: '用户能看到的界面', example: '就像餐厅的大堂和菜单' },
  { term: '开源', plain_text: '免费公开的，可以直接拿来用', example: '就像开源食谱，任何人都能照着做' },
  { term: '技术栈', plain_text: '要用到的工具组合', example: '就像做饭需要的锅碗瓢盆' },
  { term: '冷启动', plain_text: '找到第一批用户', example: '新餐厅怎么吸引第一批客人' },
  { term: '变现', plain_text: '赚钱', example: '把流量转化为收入' },
  { term: '迭代', plain_text: '一点点改进', example: '不是一次做完美，而是不断优化' },
  { term: 'Serverless', plain_text: '不用管服务器，自动扩容的服务', example: '就像共享单车，用多少付多少，不用自己买' },
  { term: 'JSON', plain_text: '一种数据格式，方便程序之间传输信息', example: '就像标准化的表格格式' },
  { term: 'Git', plain_text: '代码版本管理工具', example: '就像文档的历史记录，可以回退到任何版本' },
  { term: 'Database', plain_text: '数据库，存储数据的地方', example: '就像一个超大的Excel表格' }
]

// ================================
// 劝退规则配置
// ================================

export const DISSUASION_RULES = {
  // 硬性障碍（必须劝退）
  hard_blockers: [
    {
      condition: 'needs_offline_operations',
      keywords: ['线下', '配送', '物流', '供应商', '商家入驻', '地推'],
      reason: '需要线下运营，不是写代码能解决的',
      alternatives: '可以考虑纯线上的信息聚合版本'
    },
    {
      condition: 'needs_license',
      keywords: ['支付', '金融', '贷款', '投资', '医疗', '诊断', '开药'],
      reason: '需要金融/医疗牌照，个人无法申请',
      alternatives: '可以做信息展示、健康建议（免责声明）等不涉及监管的功能'
    },
    {
      condition: 'needs_custom_ai_model',
      keywords: ['训练模型', '机器学习', '深度学习', 'GPU集群'],
      reason: '需要训练自己的AI模型，成本和技术门槛都很高',
      alternatives: '使用现有的AI API（如GPT、Claude）就能实现90%的功能'
    }
  ],

  // 软性警告（提示但不强制劝退）
  soft_warnings: [
    {
      condition: 'two_sided_marketplace',
      keywords: ['双边市场', '平台', '买家卖家', '供需匹配'],
      reason: '双边市场冷启动极难，需要同时吸引买卖双方',
      suggestion: '先做单边，例如只做信息展示，等有流量再引入另一边'
    },
    {
      condition: 'high_concurrency',
      keywords: ['高并发', '百万用户', '秒杀', '抢购'],
      reason: '高并发架构复杂，不适合一个人快速做出来',
      suggestion: '先做功能验证，有用户了再考虑扩容，不要过早优化'
    }
  ]
}

// ================================
// 快速验证方法模板
// ================================

export const VALIDATION_METHODS_TEMPLATE = [
  {
    id: 'social_post',
    name: '朋友圈/社群测试',
    duration: '10分钟',
    description: '发个朋友圈或社群消息，看看有多少人感兴趣',
    steps: [
      '用一句话描述你要做的东西',
      '说明能解决什么问题',
      '问大家：有这个需求的扣1，觉得没必要的扣2',
      '如果收到10个以上的1，说明需求真实'
    ],
    expected_outcome: '至少10人表示感兴趣'
  },
  {
    id: 'landing_page',
    name: '假的落地页',
    duration: '30分钟',
    description: '做一个介绍页面，收集感兴趣的人的联系方式',
    steps: [
      '用v0或扣子空间做一个介绍页面',
      '说明产品功能和价值',
      '加一个"感兴趣的留下微信/邮箱"的表单',
      '发到社交媒体或相关社群',
      '看有多少人愿意留联系方式'
    ],
    expected_outcome: '收集到20+联系方式再开始做正式版'
  },
  {
    id: 'user_interview',
    name: '找5个目标用户聊聊',
    duration: '1小时',
    description: '深度访谈，了解真实需求和痛点',
    steps: [
      '找5个符合目标用户画像的人',
      '问他们现在怎么解决这个问题',
      '问他们最烦的是什么',
      '问如果有你这个工具，他们会用吗',
      '问他们愿意付费吗，多少钱能接受'
    ],
    expected_outcome: '发现至少3个共性痛点，且有人表示愿意付费'
  }
]

// ================================
// 提示词教学框架
// ================================

export const PROMPT_FRAMEWORK_GUIDE = `
# 提示词教学框架

## 为什么不直接给你提示词
每个人的项目细节不同，给固定的提示词反而会限制你。
教你怎么写提示词，你以后做任何项目都用得上。

## 写好提示词的框架
**提示词 = 角色 + 任务 + 上下文 + 约束 + 输出格式**

### 示例框架
【角色】你是一个小学语文/数学老师
【任务】帮我检查学生的作业完成情况
【上下文】这是一份小学三年级的数学作业，共10道计算题
【约束】用家长能理解的话来说，不要太专业
【输出格式】分三部分回复：完成情况、可能的错误、给孩子的鼓励

## 进阶技巧：让提示词越来越好
1. **先写简单版**，看看效果
   "帮我检查这份作业"

2. **根据结果加约束**
   "帮我检查这份作业，重点看有没有漏做的题"

3. **加上例子**，告诉AI你想要的输出
   "帮我检查这份作业，像这样输出：
    ✅ 第1题：正确
    ❓ 第2题：答案可能有问题，建议检查计算过程
    ⬜ 第3题：未完成"

4. **持续迭代**，每次用的时候根据效果微调

💡 记住：好的提示词是改出来的，不是一次写好的
`
