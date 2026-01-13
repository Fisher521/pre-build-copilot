/**
 * 报告生成的JSON格式示例
 * V2.2版本
 */

export const REPORT_JSON_SCHEMA = `{
  "one_liner_conclusion": "一句话总结（如：很适合新手入门，但要注意API成本）",
  "score": {
    "feasibility": 85,
    "breakdown": { "tech": 90, "market": 70, "onboarding": 80, "user_match": 85 }
  },
  "why_worth_it": [
    "✓ 你自己就是用户，能第一时间知道好不好用",
    "✓ 技术上不难，主要是界面 + API 调用",
    "✓ 现有工具都太复杂了，有简化空间"
  ],
  "risks": [
    "! 这类工具很多人做过，需要想清楚你的不一样在哪",
    "! 做完后怎么让别人知道？这个要提前想"
  ],
  "market_analysis": {
    "demand_signals": [
      {
        "platform": "百度指数",
        "keyword": "辅导作业",
        "description": "近90天搜索趋势显示持续关注",
        "url": "https://index.baidu.com/v2/main/index.html#/trend/辅导作业",
        "verified": true
      },
      {
        "platform": "小红书",
        "keyword": "辅导作业崩溃",
        "description": "约12万+篇笔记，讨论度高",
        "url": "https://www.xiaohongshu.com/search_result?keyword=辅导作业崩溃",
        "verified": false
      }
    ],
    "user_voices": [
      {
        "platform": "小红书",
        "quote": "每天辅导作业血压飙升，求一个能帮我先检查的工具",
        "insight": "家长最核心的需求是「省心」而非「教学」"
      },
      {
        "platform": "抖音评论区",
        "quote": "要是有个AI能帮我看完作业就好了"
      }
    ],
    "competitors": [
      {
        "name": "作业帮",
        "description": "应用商店教育榜 Top 3",
        "pros": ["拍照搜题准确率高", "题库全"],
        "cons": ["广告多", "主要面向学生自己用"],
        "opportunity": "没有「家长视角」的作业检查功能",
        "urls": {
          "app_store": "https://apps.apple.com/cn/app/作业帮/id858819963",
          "android_store": "https://sj.qq.com/myapp/detail.htm?apkName=com.baidu.homework"
        },
        "verified": true,
        "download_rank": "教育类前三"
      },
      {
        "name": "小猿搜题",
        "pros": ["OCR识别准", "解题过程详细"],
        "cons": ["会员才能看完整解析"],
        "opportunity": "侧重解题，不是帮家长「检查完成情况」",
        "urls": {
          "official": "https://www.yuansouti.com"
        },
        "verified": true
      }
    ],
    "opportunity": "现有产品都是「帮学生做题」，你可以做「帮家长检查」。家长要的不是解题过程，是「完成了没有」「哪里可能错了」",
    "search_trends": {
      "value": "百度指数显示「辅导作业」关键词持续高热度",
      "source": "百度指数",
      "source_url": "https://index.baidu.com/v2/main/index.html#/trend/辅导作业",
      "verified": true,
      "note": "具体数字请点击链接自行查看"
    },
    "verification_guide": "建议你自己去看看：\\n1. 小红书搜索「辅导作业」「检查作业」，看看家长在抱怨什么\\n2. 抖音搜索「小学生作业」，看评论区的真实反馈\\n3. 应用商店看作业帮、小猿搜题的差评，找到痛点"
  },
  "product_approaches": {
    "approaches": [
      {
        "id": "approach_a",
        "name": "方案A：拍照识别模式",
        "description": "家长拍照上传作业，AI识别并生成检查报告",
        "workflow": [
          { "step": 1, "action": "拍照上传", "detail": "家长用手机拍作业照片" },
          { "step": 2, "action": "OCR识别", "detail": "识别题目和答案" },
          { "step": 3, "action": "AI检查", "detail": "判断完成度和可能的错误" },
          { "step": 4, "action": "生成报告", "detail": "给家长看哪里要重点检查" }
        ],
        "pros": ["操作简单，符合家长习惯", "不需要手动输入"],
        "cons": ["OCR准确率影响体验", "手写字可能识别不准"],
        "best_for": "需要每天检查作业的家长",
        "complexity": "medium"
      },
      {
        "id": "approach_b",
        "name": "方案B：语音对话模式",
        "description": "家长语音描述作业情况，AI给建议",
        "workflow": [
          { "step": 1, "action": "语音输入", "detail": "家长说：今天有5道数学题" },
          { "step": 2, "action": "AI对话", "detail": "AI问：都做完了吗？" },
          { "step": 3, "action": "生成建议", "detail": "给出检查重点" }
        ],
        "pros": ["最简单，像聊天一样", "不需要拍照"],
        "cons": ["功能相对简单", "不如拍照直观"],
        "best_for": "不会用复杂工具的家长",
        "complexity": "low"
      }
    ],
    "recommended_id": "approach_a",
    "recommendation_reason": "拍照模式虽然技术稍难，但用户价值更大。可以先做简化版（只识别完成度），再逐步优化"
  },
  "product_approach_guidance": [
    {
      "question": "你的用户更愿意拍照还是手动输入？",
      "options": [
        { "id": "photo", "text": "拍照（快但可能不准）", "leads_to": "approach_a" },
        { "id": "manual", "text": "语音/输入（慢但准确）", "leads_to": "approach_b" }
      ],
      "purpose": "帮你选择最适合的产品形态"
    }
  ],
  "tech_options": {
    "option_a": {
      "id": "simple",
      "name": "极简方案（最快）",
      "tools": ["扣子空间", "豆包MarsCode"],
      "tools_glossary": [
        {
          "name": "扣子空间",
          "explanation": "字节出品，对话式生成网页/小程序，中文界面最简单",
          "url": "https://www.coze.cn/space",
          "is_domestic": true
        }
      ],
      "capability": "基础功能，快速验证想法",
      "difficulty": 2,
      "dev_time": "2-3天",
      "cost": "免费",
      "fit_for": "完全不会代码，想快速试试"
    },
    "option_b": {
      "id": "standard",
      "name": "标准方案（推荐）",
      "tools": ["Cursor", "MemFire Cloud", "DeepSeek API", "Zeabur"],
      "tools_glossary": [
        {
          "name": "Cursor",
          "explanation": "AI编辑器，边写边学，$20/月",
          "url": "https://cursor.com",
          "is_domestic": false
        },
        {
          "name": "MemFire Cloud",
          "explanation": "数据库（Supabase国内版），存用户数据和作业记录",
          "url": "https://memfiredb.com",
          "is_domestic": true
        },
        {
          "name": "DeepSeek",
          "explanation": "国内最便宜的大模型，识别作业够用",
          "url": "https://platform.deepseek.com",
          "is_domestic": true
        },
        {
          "name": "Zeabur",
          "explanation": "部署托管（华人团队），国内访问快",
          "url": "https://zeabur.com",
          "is_domestic": true
        }
      ],
      "capability": "完整功能，可长期迭代",
      "difficulty": 3,
      "dev_time": "1-2周",
      "cost": "约50-100元/月",
      "fit_for": "会一点代码，想认真做"
    },
    "zero_cost_option": {
      "id": "zero_cost",
      "name": "零成本方案",
      "tools": ["Trae", "MemFire免费版", "DeepSeek", "Zeabur免费版"],
      "tools_glossary": [
        {
          "name": "Trae",
          "explanation": "字节AI编辑器，免费，类似Cursor",
          "url": "https://trae.ai",
          "is_domestic": true
        }
      ],
      "capability": "完整功能，免费额度足够测试",
      "difficulty": 3,
      "dev_time": "1-2周",
      "cost": "0元（使用免费额度）",
      "fit_for": "零成本试试vibe coding"
    },
    "advice": "如果完全不会代码，用扣子空间最快。如果愿意学习，推荐标准方案（Cursor）。预算紧张可以用零成本方案。"
  },
  "development_path": {
    "recommended_tools": [
      {
        "id": "koozi",
        "name": "扣子空间",
        "type": "网页端，中文界面",
        "best_for": "完全不会代码",
        "cost": "免费",
        "url": "https://www.coze.cn/space",
        "is_domestic": true
      },
      {
        "id": "cursor",
        "name": "Cursor",
        "type": "图形界面",
        "best_for": "会一点代码，想学习",
        "cost": "$20/月",
        "url": "https://cursor.com",
        "is_domestic": false
      },
      {
        "id": "claude-code",
        "name": "Claude Code",
        "type": "命令行",
        "best_for": "有经验，想高效",
        "cost": "Claude Max订阅",
        "url": "https://www.anthropic.com/claude/code",
        "is_domestic": false
      }
    ],
    "service_connections": [
      {
        "category": "代码托管（必须）",
        "services": [
          {
            "name": "GitHub",
            "description": "免费，Cursor/Claude Code都能直接连",
            "url": "https://github.com",
            "is_domestic": false,
            "recommended": true
          }
        ]
      },
      {
        "category": "数据库（如果需要存数据）",
        "services": [
          {
            "name": "MemFire Cloud",
            "description": "Supabase国内版，兼容API，访问快",
            "url": "https://memfiredb.com",
            "is_domestic": true,
            "recommended": true
          },
          {
            "name": "Supabase",
            "description": "功能全，国际版",
            "url": "https://supabase.com",
            "is_domestic": false,
            "recommended": false
          }
        ]
      },
      {
        "category": "AI能力（如果需要调用大模型）",
        "services": [
          {
            "name": "DeepSeek",
            "description": "国内最便宜，效果好",
            "url": "https://platform.deepseek.com",
            "is_domestic": true,
            "recommended": true
          },
          {
            "name": "通义千问",
            "description": "阿里，免费额度多",
            "url": "https://dashscope.aliyun.com",
            "is_domestic": true,
            "recommended": true
          }
        ]
      },
      {
        "category": "部署上线",
        "services": [
          {
            "name": "Zeabur",
            "description": "华人团队，国内访问友好",
            "url": "https://zeabur.com",
            "is_domestic": true,
            "recommended": true
          },
          {
            "name": "Vercel",
            "description": "国际主流，和GitHub一键连接",
            "url": "https://vercel.com",
            "is_domestic": false,
            "recommended": false
          }
        ]
      }
    ],
    "recommended_stack": "推荐路径：Cursor + MemFire + DeepSeek + Zeabur\\n\\n为什么这样选：\\n- Cursor - 写代码体验好，社区教程多\\n- MemFire - Supabase国内版，存用户数据和作业记录\\n- DeepSeek - 国内最便宜的大模型，识别作业够用\\n- Zeabur - 国内访问快，部署简单\\n\\n预计时间：1-2天（如果顺利）"
  },
  "fastest_path": [
    {
      "title": "Step 1: 选择你的主力开发工具",
      "description": "完全不会代码 → 扣子空间（中文界面，最简单）\\n会一点代码，想学习 → Cursor（边做边学）\\n有经验，想高效 → Claude Code（最强但需命令行）",
      "action_label": "了解工具选择",
      "action_url": "",
      "expandable_why": {
        "reason": "每个人的技术水平不同，选对工具能事半功倍。扣子空间最简单，Cursor最适合学习，Claude Code最高效。",
        "example": "就像做饭：扣子空间是叫外卖（最快），Cursor是照着菜谱做（学得快），Claude Code是请大厨（最专业）"
      }
    },
    {
      "title": "Step 2: 连接必要的服务",
      "description": "根据项目需要，接入这些服务：\\n- 代码托管：GitHub（免费）\\n- 数据库：MemFire Cloud（如果要存数据）\\n- AI能力：DeepSeek（如果要调用大模型）\\n- 部署上线：Zeabur（做完要让别人访问）",
      "action_label": "查看服务列表",
      "expandable_why": {
        "reason": "先用免费版，跑通了再考虑付费",
        "example": "就像装修房子，先把水电通了，再考虑买家具"
      }
    },
    {
      "title": "Step 3: 开始开发",
      "description": "不是"先设计UI → 再写后端 → 再部署"\\n而是"描述你要什么 → AI帮你一步步做 → 边做边调"\\n\\n用Cursor的话：\\n1. 新建项目文件夹\\n2. 打开Composer（Cmd+I），描述你要做什么\\n3. AI会帮你生成代码、创建文件、安装依赖\\n4. 遇到问题继续对话，让它帮你改",
      "copy_text": "我要做一个[项目名称]，主要功能是[核心功能]。目标用户是[用户群体]。请帮我用Next.js + TypeScript搭建基础框架。",
      "action_label": "复制提示词"
    }
  ],
  "cost_estimate": {
    "time_breakdown": "最简版（扣子空间）：2-3天\\n标准版（Cursor）：1-2周\\n完整版（细节打磨）：1个月",
    "money_breakdown": "开发期间：0元\\n上线后每月：\\n• Zeabur托管（免费额度够用）：0元\\n• 域名（可选）：0-100元/年\\n• MemFire数据库（如果用）：0-25美元\\n\\n月度总计：0-200元"
  },
  "pitfalls": [
    "想做的功能太多，一直做不完 → 先砍到只剩一个核心功能，能用就上线",
    "花太多时间在界面细节上 → 丑但能用 > 好看但没做完",
    "做完不知道发到哪里 → 做之前就想好给谁用，目标用户在哪"
  ],
  "validation_methods": [
    {
      "id": "social_post",
      "name": "朋友圈/社群测试",
      "duration": "10分钟",
      "description": "发个朋友圈或社群消息，看看有多少人感兴趣",
      "steps": [
        "用一句话描述你要做的东西",
        "说明能解决什么问题",
        "问大家：有这个需求的扣1，觉得没必要的扣2",
        "如果收到10个以上的1，说明需求真实"
      ],
      "expected_outcome": "至少10人表示感兴趣"
    },
    {
      "id": "landing_page",
      "name": "假的落地页",
      "duration": "30分钟",
      "description": "做一个介绍页面，收集感兴趣的人的联系方式",
      "steps": [
        "用v0或扣子空间做一个介绍页面",
        "说明产品功能和价值",
        "加一个"感兴趣的留下微信/邮箱"的表单",
        "发到社交媒体或相关社群"
      ],
      "expected_outcome": "收集到20+联系方式再开始做正式版"
    }
  ],
  "prompt_framework": {
    "structure": "提示词 = 角色 + 任务 + 上下文 + 约束 + 输出格式",
    "tips": [
      "先写简单版，看看效果",
      "根据结果加约束",
      "加上例子，告诉AI你想要的输出",
      "持续迭代，每次用的时候微调"
    ],
    "project_specific_guide": "针对你这个项目的提示词思路：\\n\\n核心流程：图片 → OCR识别 → AI分析 → 生成报告\\n\\n每个环节的要点：\\n1. OCR识别环节：告诉AI这是手写作业，可能有涂改\\n2. AI分析环节：明确年级和科目，区分「肯定错了」和「可能有问题」\\n3. 生成报告环节：指定输出格式，用家长能懂的话\\n\\n💡 建议：在Cursor里写代码时，把这些要点告诉AI，让它帮你写具体的提示词"
  },
  "next_steps": {
    "today": [
      "用扣子空间或v0生成第一版界面",
      "部署上线看看效果"
    ],
    "this_week": [
      "发到小红书/即刻收集反馈",
      "找3个家长朋友试用"
    ],
    "later": [
      "有人用了再加用户登录功能",
      "有人愿意付费再考虑买域名"
    ]
  },
  "learning_takeaways": [
    "怎么用提示词让AI输出结构化结果",
    "怎么处理AI可能出错的情况（加兜底逻辑）",
    "怎么设计让不懂技术的人也能用的界面",
    "怎么使用国产AI工具降低成本"
  ],
  "term_translations": [
    { "term": "MVP", "plain_text": "最小能用的版本", "example": "不是做最小的产品，而是刚好能验证想法的版本" },
    { "term": "部署", "plain_text": "把网页放到网上让别人能访问" },
    { "term": "API", "plain_text": "现成的服务，你调用它帮你干活", "example": "就像外卖API，不用自己做饭" }
  ],
  "exit_options": {
    "message": "看完觉得有点复杂？没关系，你有几个选择",
    "alternatives": [
      "收藏这份报告，以后有空再做",
      "换一个更简单的想法试试",
      "找一个会写代码的朋友一起做",
      "直接把这份报告发给开发者，让他帮你做"
    ]
  },
  "feedback_prompt": {
    "question": "这个报告对你有帮助吗？",
    "options": ["👍 有用", "👎 没用", "💬 有话想说"]
  }
}`
