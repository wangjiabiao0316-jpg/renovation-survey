import { Section, SectionKey } from '@/types';

// ============================================================
// 问卷问题完整定义
// 结构：A(感受) → B(愿景) → C(前提) → D(人) → E(空间) → F(物) → G(视觉) → H(收尾)
// ============================================================

export const SECTION_ORDER: SectionKey[] = [
  'a', 'b', 'c', 'd',
  'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11',
  'f', 'g', 'h',
];

export const SECTION_META: Record<SectionKey, { title: string; subtitle?: string }> = {
  a:  { title: '生活现状诊断', subtitle: '先聊聊你现在的居住感受' },
  b:  { title: '生活愿景', subtitle: '聊聊你理想中的生活方式' },
  c:  { title: '项目基本信息', subtitle: '房子的基本情况' },
  d:  { title: '家庭成员 & 生活习惯' },
  e1: { title: '玄关' },
  e2: { title: '客厅' },
  e3: { title: '餐厅' },
  e4: { title: '厨房' },
  e5: { title: '家政空间' },
  e6: { title: '卫生间' },
  e7: { title: '卧室' },
  e8: { title: '衣帽间' },
  e9: { title: '书房' },
  e10:{ title: '阳台' },
  e11:{ title: '宠物空间' },
  f:  { title: '储物总览', subtitle: '盘点一下需要收纳的东西' },
  g:  { title: '风格 & 审美', subtitle: '聊聊你喜欢的视觉风格' },
  h:  { title: '自由表达', subtitle: '还有什么想告诉设计师的' },
};

let qId = 0;
const q = (
  section: SectionKey,
  key: string,
  label: string,
  type: string,
  opts: Partial<Omit<import('@/types').Question, 'id' | 'section' | 'key' | 'label' | 'type'>> = {}
) => ({
  id: `q_${++qId}`,
  section,
  key,
  label,
  type,
  ...opts,
  sortOrder: qId,
  required: opts.required ?? false,
}) as import('@/types').Question;

// ────────────────────────────────────────────
// A · 生活现状诊断
// ────────────────────────────────────────────
const sectionA: Section = {
  key: 'a',
  title: SECTION_META.a.title,
  subtitle: SECTION_META.a.subtitle,
  questions: [
    q('a', 'pain_points', '你现在住的房子，最让你不舒服的 3 件事是什么？', 'textarea', {
      required: true,
      placeholder: '比如：采光太差、收纳不够用、厨房太小转不开身...',
      hint: '想到什么写什么，这些痛点正是设计的驱动力',
    }),
    q('a', 'abandoned_habits', '有没有因为空间限制而被迫放弃的习惯或爱好？', 'textarea', {
      placeholder: '比如：想在家健身但没地方，想做烘焙但台面不够...',
    }),
    q('a', 'weekday_routine', '请描述你一个普通工作日的居家动线', 'textarea', {
      placeholder: '早上起床 → ______ → ______ → ______ → 晚上入睡',
      hint: '目的是了解空间实际怎么被使用，谁几点出门、谁在家的节奏',
    }),
    q('a', 'weekend_routine', '休息日和工作日的居家状态有什么不同？', 'textarea', {}),
    q('a', 'idle_space', '现在的家里，哪个空间使用率最高？哪个基本闲置？', 'text', {
      placeholder: '最高：______  闲置：______  你觉得闲置的原因是什么？',
    }),
  ],
};

// ────────────────────────────────────────────
// B · 生活愿景
// ────────────────────────────────────────────
const sectionB: Section = {
  key: 'b',
  title: SECTION_META.b.title,
  subtitle: SECTION_META.b.subtitle,
  questions: [
    q('b', 'home_feeling', '用一句话描述你理想中「家」的感觉', 'text', {
      required: true,
      placeholder: '比如："推开门就放松了"、"一家人围在一起的地方"',
    }),
    q('b', 'life_words', '用一个词形容现在的生活状态，再用一个词形容你希望的', 'text', {
      placeholder: '现在 ______ → 希望 ______',
    }),
    q('b', 'priorities_sort', '以下要素，对你的重要性排序是什么？', 'sort', {
      required: true,
      options: [
        { label: '家人之间的互动与亲密感', value: 'interaction' },
        { label: '每个人都有自己的独处角落', value: 'solitude' },
        { label: '招待朋友、社交聚会', value: 'social' },
        { label: '做事顺手、高效率的功能动线', value: 'efficiency' },
        { label: '好看、有审美氛围', value: 'aesthetics' },
        { label: '好打理、不用花太多时间维护', value: 'low_maintenance' },
      ],
      hint: '拖拽排序，排在上面的更重要。如果预算有限，最下面的一项可以优先牺牲',
    }),
    q('b', 'together_time', '什么时候最需要「在一起」？什么时候最需要「各自独处」？', 'textarea', {
      placeholder: '帮设计师理解你家庭关系的张弛节奏',
    }),
    q('b', 'future_changes', '未来 5-10 年，家庭结构或生活方式可能有哪些变化？', 'checkbox', {
      options: [
        { label: '可能增加家庭成员（新生/父母同住）', value: 'more_members' },
        { label: '孩子长大离家', value: 'kids_leave' },
        { label: '可能换工作/创业/长期在家办公', value: 'job_change' },
        { label: '暂无预期变化', value: 'no_change' },
        { label: '其他', value: 'other' },
      ],
      hint: '你希望这次装修能适应这些变化，还是更关注当下？',
    }),
    q('b', 'home_vs_house', '你觉得「家」和「房子」的区别是什么？', 'textarea', {
      hint: '这个问题没有标准答案，你的回答能告诉设计师很多',
    }),
  ],
};

// ────────────────────────────────────────────
// C · 项目基本信息
// ────────────────────────────────────────────
const sectionC: Section = {
  key: 'c',
  title: SECTION_META.c.title,
  subtitle: SECTION_META.c.subtitle,
  questions: [
    q('c', 'community', '房屋所在小区', 'text', { placeholder: '写小区名称即可' }),
    q('c', 'area', '房屋面积', 'text', {
      placeholder: '建筑面积 ____ ㎡  /  套内面积 ____ ㎡',
    }),
    q('c', 'layout', '户型结构', 'text', {
      placeholder: '比如：3 室 2 厅 2 卫 1 阳台',
    }),
    q('c', 'floor_info', '楼层 / 总楼层 / 电梯 / 朝向', 'text', {
      placeholder: '比如：12/18楼，有电梯，朝南',
    }),
    q('c', 'house_status', '房屋现状', 'radio', {
      options: [
        { label: '毛坯房', value: 'bare' },
        { label: '精装房（局部改造）', value: 'partial' },
        { label: '旧房翻新', value: 'full_reno' },
        { label: '二手房', value: 'second_hand' },
      ],
    }),
    q('c', 'move_in', '预计入住时间', 'radio', {
      options: [
        { label: '3 个月内', value: '3m' },
        { label: '半年内', value: '6m' },
        { label: '一年内', value: '1y' },
        { label: '不着急，看情况而定', value: 'no_rush' },
      ],
    }),
    q('c', 'budget_mode', '倾向装修模式', 'radio', {
      options: [
        { label: '半包', value: 'half' },
        { label: '全包', value: 'full' },
        { label: '不确定', value: 'unsure' },
      ],
    }),
    q('c', 'budget_range', '大致总预算区间', 'radio', {
      options: [
        { label: '10 万以内', value: 'below_10w' },
        { label: '10-20 万', value: '10_20w' },
        { label: '20-35 万', value: '20_35w' },
        { label: '35-50 万', value: '35_50w' },
        { label: '50 万以上', value: 'above_50w' },
        { label: '不方便说', value: 'private' },
      ],
    }),
    q('c', 'has_plan', '是否已经有了户型图或效果图？', 'radio', {
      options: [
        { label: '有，可以上传', value: 'yes' },
        { label: '还没有', value: 'no' },
      ],
    }),
  ],
};

// ────────────────────────────────────────────
// D · 家庭成员 & 生活习惯
// ────────────────────────────────────────────
const sectionD: Section = {
  key: 'd',
  title: SECTION_META.d.title,
  subtitle: SECTION_META.d.subtitle,
  questions: [
    q('d', 'family_members', '常住成员档案', 'member-card', {
      required: true,
      hint: '点击「+ 添加成员」，为每位常住成员建立档案',
    }),
    q('d', 'has_pet', '宠物情况', 'radio', {
      options: [
        { label: '无宠物', value: 'no' },
        { label: '有宠物', value: 'yes' },
      ],
    }),
    q('d', 'pet_detail', '宠物种类和数量', 'text', {
      placeholder: '比如：猫 2 只 / 狗 1 只',
      condition: { dependsOn: 'has_pet', value: 'yes' },
    }),
    q('d', 'pet_area', '宠物主要活动区域？有无特殊需求？', 'textarea', {
      placeholder: '比如：猫爬架放置区域、狗门、宠物洗澡区...',
      condition: { dependsOn: 'has_pet', value: 'yes' },
    }),
  ],
};

// ────────────────────────────────────────────
// E · 空间功能需求（11个子空间）
// ────────────────────────────────────────────

const spaceQuestions = (section: SectionKey, roomName: string, questions: any[]) =>
  ({
    key: section,
    title: SECTION_META[section].title,
    questions: questions.map((item, i) => ({
      ...q(section, item.key, item.label, item.type, item.opts || {}),
      id: `q_${section}_${i + 1}`,
    })),
  } as Section);

// E1 · 玄关
const sectionE1 = spaceQuestions('e1', '玄关', [
  { key: 'shoe_count', label: '鞋子收纳量估算', type: 'radio', opts: {
    options: [
      { label: '少于 20 双', value: 'lt20' },
      { label: '20-50 双', value: '20_50' },
      { label: '50-100 双', value: '50_100' },
      { label: '100 双以上', value: 'gt100' },
    ],
  }},
  { key: 'storage_800', label: '是否需要入户储物间（"800 库"）？', type: 'radio', opts: {
    options: [
      { label: '需要', value: 'yes' },
      { label: '不需要', value: 'no' },
      { label: '看现场空间再说', value: 'maybe' },
    ],
  }},
  { key: 'large_items', label: '入户需要收纳的大件物品', type: 'checkbox', opts: {
    options: [
      { label: '婴儿车', value: 'stroller' },
      { label: '行李箱', value: 'luggage' },
      { label: '健身器材', value: 'fitness' },
      { label: '户外/露营装备', value: 'outdoor' },
      { label: '快递暂存区', value: 'package' },
      { label: '无特殊需求', value: 'none' },
    ],
  }},
  { key: 'notes', label: '关于玄关，还有什么想法？', type: 'textarea', opts: { placeholder: '有的话尽管说' } },
]);

// E2 · 客厅
const sectionE2 = spaceQuestions('e2', '客厅', [
  { key: 'media', label: '影音需求', type: 'radio', opts: {
    options: [
      { label: '需要电视', value: 'tv' },
      { label: '需要投影', value: 'projector' },
      { label: '都需要', value: 'both' },
      { label: '都不需要', value: 'none' },
    ],
  }},
  { key: 'activities', label: '客厅主要活动', type: 'checkbox', opts: {
    options: [
      { label: '家人聊天', value: 'chat' },
      { label: '看电视/电影', value: 'movie' },
      { label: '阅读', value: 'read' },
      { label: '工作/学习', value: 'work' },
      { label: '游戏', value: 'game' },
      { label: '健身/瑜伽', value: 'fitness' },
      { label: '亲子玩耍', value: 'kids' },
      { label: '宠物活动', value: 'pet' },
      { label: '待客', value: 'guest' },
      { label: '喝茶/咖啡', value: 'tea' },
      { label: '发呆放松', value: 'relax' },
    ],
  }},
  { key: 'dual_use', label: '客厅是否需要兼顾其他功能？', type: 'radio', opts: {
    options: [
      { label: '纯休闲区', value: 'pure' },
      { label: '需要兼书房', value: 'study' },
      { label: '需要兼儿童活动区', value: 'kids' },
      { label: '其他', value: 'other' },
    ],
  }},
  { key: 'notes', label: '关于客厅，还有什么想法？', type: 'textarea' },
]);

// E3 · 餐厅
const sectionE3 = spaceQuestions('e3', '餐厅', [
  { key: 'daily_diners', label: '日常用餐人数', type: 'text', opts: { placeholder: '____ 人' } },
  { key: 'party_freq', label: '多人聚餐频率', type: 'radio', opts: {
    options: [
      { label: '几乎不', value: 'never' },
      { label: '每月 1-2 次', value: 'monthly' },
      { label: '每周都有', value: 'weekly' },
      { label: '经常', value: 'often' },
    ],
  }},
  { key: 'island', label: '是否需要岛台？', type: 'radio', opts: {
    options: [
      { label: '需要，兼操作台', value: 'worktop' },
      { label: '需要，兼用餐/社交', value: 'social' },
      { label: '不需要', value: 'no' },
      { label: '不确定', value: 'unsure' },
    ],
  }},
  { key: 'bar_area', label: '是否需要独立的餐边水吧区（咖啡、调酒、茶）？', type: 'radio', opts: {
    options: [
      { label: '需要独立水吧', value: 'yes' },
      { label: '不需要', value: 'no' },
      { label: '可以和厨房合并', value: 'merge' },
    ],
  }},
  { key: 'dining_dual_use', label: '餐厅是否会兼作其他用途？', type: 'text', opts: { placeholder: '比如：工作、亲子手工...' } },
  { key: 'notes', label: '关于餐厅，还有什么想法？', type: 'textarea' },
]);

// E4 · 厨房
const sectionE4 = spaceQuestions('e4', '厨房', [
  { key: 'cooking_freq', label: '厨房使用频率', type: 'radio', opts: {
    options: [
      { label: '几乎不做饭', value: 'never' },
      { label: '偶尔（每周 2-3 次）', value: 'occasional' },
      { label: '经常（每天至少一顿）', value: 'daily' },
      { label: '重度使用（一日三餐都在家）', value: 'heavy' },
    ],
  }},
  { key: 'open_kitchen', label: '对开放式厨房的态度', type: 'radio', opts: {
    options: [
      { label: '非常接受', value: 'yes' },
      { label: '可以接受但担心油烟', value: 'hesitate' },
      { label: '不接受，必须封闭', value: 'no' },
      { label: '半开放（可开可合）', value: 'semi' },
    ],
  }},
  { key: 'appliances', label: '需要哪些嵌入式电器？', type: 'checkbox', opts: {
    options: [
      { label: '洗碗机', value: 'dishwasher' },
      { label: '蒸箱', value: 'steamer' },
      { label: '烤箱', value: 'oven' },
      { label: '微波炉', value: 'microwave' },
      { label: '嵌入式冰箱', value: 'fridge' },
      { label: '垃圾处理器', value: 'disposal' },
      { label: '净水系统', value: 'water_filter' },
    ],
  }},
  { key: 'small_appliances', label: '台面小家电大致数量和种类', type: 'textarea', opts: {
    placeholder: '比如：电饭煲、空气炸锅、咖啡机、破壁机、吐司机...',
  }},
  { key: 'main_cook', label: '下厨主力是谁？身高大致多少？', type: 'text', opts: {
    hint: '这决定了台面高度，很重要',
  }},
  { key: 'notes', label: '关于厨房，还有什么想法？', type: 'textarea' },
]);

// E5 · 家政空间
const sectionE5 = spaceQuestions('e5', '家政空间', [
  { key: 'laundry', label: '洗衣晾晒需求', type: 'checkbox', opts: {
    options: [
      { label: '独立烘干机', value: 'dryer' },
      { label: '洗烘一体', value: 'washer_dryer' },
      { label: '需要晾晒区', value: 'hang' },
      { label: '迷你洗衣机（内衣/婴儿）', value: 'mini' },
      { label: '手洗区', value: 'hand_wash' },
    ],
  }},
  { key: 'cleaning_devices', label: '清洁电器', type: 'checkbox', opts: {
    options: [
      { label: '扫拖机器人', value: 'robot' },
      { label: '手持吸尘器', value: 'vacuum' },
      { label: '洗地机', value: 'scrubber' },
    ],
  }},
  { key: 'cleaning_storage', label: '家政工具收纳需求', type: 'radio', opts: {
    options: [
      { label: '集中收纳在设备间/阳台', value: 'central' },
      { label: '分散在各区域', value: 'scattered' },
      { label: '需要一个单独的家政柜', value: 'cabinet' },
    ],
  }},
  { key: 'notes', label: '关于家政空间，还有什么想法？', type: 'textarea' },
]);

// E6 · 卫生间
const sectionE6 = spaceQuestions('e6', '卫生间', [
  { key: 'bathroom_count', label: '卫生间现有数量和是否需要调整？', type: 'text', opts: { placeholder: '现有____个，需要____个' } },
  { key: 'master_bath', label: '主卫需求', type: 'checkbox', opts: {
    options: [
      { label: '浴缸', value: 'bathtub' },
      { label: '淋浴房', value: 'shower' },
      { label: '双台盆', value: 'double_sink' },
      { label: '智能马桶', value: 'smart_toilet' },
      { label: '如厕+淋浴即可，不需要太复杂', value: 'simple' },
    ],
  }},
  { key: 'guest_bath', label: '客卫 / 次卫需求', type: 'checkbox', opts: {
    options: [
      { label: '蹲便器', value: 'squat' },
      { label: '坐便器', value: 'seat' },
      { label: '干湿分离', value: 'dry_wet' },
      { label: '考虑客人使用体验', value: 'guest_exp' },
      { label: '实用就行', value: 'practical' },
    ],
  }},
  { key: 'bathroom_storage', label: '卫生间收纳需求', type: 'textarea', opts: {
    placeholder: '化妆品、护肤品、卫生用品囤货量...',
  }},
  { key: 'notes', label: '关于卫生间，还有什么想法？', type: 'textarea' },
]);

// E7 · 卧室
const sectionE7 = spaceQuestions('e7', '卧室', [
  { key: 'bedroom_count', label: '需要几间固定卧室？', type: 'text', opts: { placeholder: '____ 间' } },
  { key: 'guest_room', label: '是否需要独立客房？', type: 'radio', opts: {
    options: [
      { label: '需要，经常有人住（月均 ≥ 1 次）', value: 'often' },
      { label: '偶尔有客，但不想为此浪费一间房', value: 'occasional' },
      { label: '不需要', value: 'no' },
    ],
  }},
  { key: 'flexible_guest', label: '如果偶尔接待，是否接受灵活方案（折叠床、沙发床）而非固定客房？', type: 'radio', opts: {
    options: [
      { label: '接受', value: 'yes' },
      { label: '不接受', value: 'no' },
    ],
  }},
  { key: 'master_extra', label: '主卧是否需要额外功能区？', type: 'checkbox', opts: {
    options: [
      { label: '小型休闲角落（躺椅/阅读角）', value: 'lounge' },
      { label: '工作台', value: 'desk' },
      { label: '婴儿床区域', value: 'crib' },
      { label: '不需要', value: 'none' },
    ],
  }},
  { key: 'bedroom_priority', label: '卧室最看重什么？', type: 'radio', opts: {
    options: [
      { label: '安静好睡', value: 'quiet' },
      { label: '收纳够用', value: 'storage' },
      { label: '温馨氛围', value: 'cozy' },
      { label: '有窗景/采光', value: 'view' },
    ],
  }},
  { key: 'notes', label: '关于卧室，还有什么想法？', type: 'textarea' },
]);

// E8 · 衣帽间
const sectionE8 = spaceQuestions('e8', '衣帽间', [
  { key: 'closet_type', label: '是否需要独立衣帽间？', type: 'radio', opts: {
    options: [
      { label: '需要，越大越好', value: 'big' },
      { label: '可以接受主卧内隔出衣帽区', value: 'partition' },
      { label: '不需要，衣柜即可', value: 'wardrobe' },
    ],
  }},
  { key: 'closet_length', label: '衣物总量估算（参考现有衣柜长度）', type: 'radio', opts: {
    options: [
      { label: '少于 2 米', value: 'lt2' },
      { label: '2-4 米', value: '2_4' },
      { label: '4-6 米', value: '4_6' },
      { label: '6 米以上', value: 'gt6' },
    ],
  }},
  { key: 'vanity', label: '是否需要梳妆台？', type: 'radio', opts: {
    options: [
      { label: '需要，在衣帽间内', value: 'in_closet' },
      { label: '需要，在卧室内', value: 'in_bedroom' },
      { label: '不需要', value: 'no' },
    ],
  }},
  { key: 'special_clothing', label: '是否有需要特殊收纳的衣物？', type: 'textarea', opts: {
    placeholder: '比如：长裙、西装、礼服、大量包包...',
  }},
  { key: 'notes', label: '关于衣帽间，还有什么想法？', type: 'textarea' },
]);

// E9 · 书房
const sectionE9 = spaceQuestions('e9', '书房', [
  { key: 'study_type', label: '书房需求', type: 'radio', opts: {
    options: [
      { label: '需要独立书房', value: 'dedicated' },
      { label: '在公共区域设办公/阅读角落即可', value: 'corner' },
      { label: '不需要专门区域', value: 'none' },
    ],
  }},
  { key: 'study_user', label: '谁会主要使用书房？使用场景是什么？', type: 'checkbox', opts: {
    options: [
      { label: '专注工作（需要安静）', value: 'focus' },
      { label: '轻度办公（可以开放）', value: 'light' },
      { label: '阅读', value: 'read' },
      { label: '游戏', value: 'game' },
      { label: '亲子学习/辅导作业', value: 'tutoring' },
    ],
  }},
  { key: 'book_count', label: '书籍存量大致估计', type: 'text', opts: { placeholder: '大约 ____ 本' } },
  { key: 'study_dual', label: '书房是否需要兼顾其他功能？', type: 'textarea', opts: {
    placeholder: '比如：偶尔客房、储物、展示收藏等',
  }},
  { key: 'notes', label: '关于书房，还有什么想法？', type: 'textarea' },
]);

// E10 · 阳台
const sectionE10 = spaceQuestions('e10', '阳台', [
  { key: 'balcony_use', label: '阳台主要功能', type: 'checkbox', opts: {
    options: [
      { label: '养植物/绿植', value: 'plants' },
      { label: '晾晒', value: 'dry' },
      { label: '休闲（放椅子晒太阳）', value: 'relax' },
      { label: '家务操作（洗衣/收纳）', value: 'chores' },
      { label: '宠物空间', value: 'pet' },
      { label: '储物', value: 'storage' },
    ],
  }},
  { key: 'enclose', label: '是否考虑封阳台？', type: 'radio', opts: {
    options: [
      { label: '封', value: 'yes' },
      { label: '不封', value: 'no' },
      { label: '看物业规定', value: 'depends' },
    ],
  }},
  { key: 'balcony_vibe', label: '对阳台的想象更接近', type: 'radio', opts: {
    options: [
      { label: '实用型（功能为主）', value: 'practical' },
      { label: '治愈型（绿植+休闲角）', value: 'healing' },
      { label: '两者兼顾', value: 'both' },
    ],
  }},
  { key: 'notes', label: '关于阳台，还有什么想法？', type: 'textarea' },
]);

// E11 · 宠物空间（条件显示：仅 D2 选"有宠物"时可见）
const sectionE11 = spaceQuestions('e11', '宠物空间', [
  { key: 'pet_space_needed', label: '是否需要为宠物设计专属区域？', type: 'radio', opts: {
    options: [
      { label: '需要一个小范围活动/休息区', value: 'yes' },
      { label: '不需要，和人共用空间即可', value: 'no' },
    ],
  }},
  { key: 'pet_needs', label: '宠物相关需求', type: 'checkbox', opts: {
    options: [
      { label: '猫爬架/抓板区域', value: 'cat_tree' },
      { label: '狗狗专属角落/小门', value: 'dog_corner' },
      { label: '宠物洗澡区', value: 'wash' },
      { label: '宠物喂食/饮水区', value: 'feed' },
      { label: '猫砂盆隐藏位', value: 'litter' },
    ],
  }},
  { key: 'notes', label: '关于宠物空间，还有什么想法？', type: 'textarea' },
]);

// ────────────────────────────────────────────
// F · 储物总览
// ────────────────────────────────────────────
const sectionF: Section = {
  key: 'f',
  title: SECTION_META.f.title,
  subtitle: SECTION_META.f.subtitle,
  questions: [
    q('f', 'storage_items', '需要收纳的物品类别', 'checkbox', {
      options: [
        { label: '日常消耗品囤货', value: 'daily_supplies' },
        { label: '衣物鞋包', value: 'clothes' },
        { label: '床上用品/换季被褥', value: 'bedding' },
        { label: '书籍', value: 'books' },
        { label: '手办/模型/收藏品', value: 'collectibles' },
        { label: '电子产品/数码配件/数据线', value: 'electronics' },
        { label: '运动/户外装备', value: 'sports' },
        { label: '行李箱', value: 'luggage' },
        { label: '儿童玩具/用品', value: 'kids' },
        { label: '过季电器', value: 'seasonal_appliances' },
        { label: '工具/五金/DIY 材料', value: 'tools' },
        { label: '食品/厨房囤货', value: 'food' },
        { label: '药品/医药箱', value: 'medicine' },
      ],
    }),
    q('f', 'storage_style', '你更倾向于哪种收纳方式？', 'radio', {
      options: [
        { label: '集中收纳（一个储物间/大柜子解决一切）', value: 'central' },
        { label: '分散收纳（每样东西放在使用场景附近）', value: 'scattered' },
        { label: '结合', value: 'both' },
      ],
    }),
    q('f', 'storage_pain', '有没有觉得「永远找不到地方放」的东西？', 'text', {
      placeholder: '它的存在让你每次看到都很头疼...',
    }),
    q('f', 'notes', '关于储物，还有什么要补充的？', 'textarea'),
  ],
};

// ────────────────────────────────────────────
// G · 风格 & 审美
// ────────────────────────────────────────────
const sectionG: Section = {
  key: 'g',
  title: SECTION_META.g.title,
  subtitle: SECTION_META.g.subtitle,
  questions: [
    q('g', 'style', '你倾向的风格方向', 'checkbox', {
      options: [
        { label: '现代简约', value: 'modern' },
        { label: '日式/原木', value: 'japanese' },
        { label: '侘寂', value: 'wabi_sabi' },
        { label: '法式', value: 'french' },
        { label: '美式复古', value: 'american' },
        { label: '工业风', value: 'industrial' },
        { label: '新中式', value: 'chinese' },
        { label: '北欧', value: 'nordic' },
        { label: '不知道怎么说，用图片表达', value: 'image' },
      ],
    }),
    q('g', 'color_tone', '倾向的色调', 'radio', {
      options: [
        { label: '暖色系（米白、奶油、木色、大地色）', value: 'warm' },
        { label: '冷色系（灰、蓝、黑白）', value: 'cool' },
        { label: '中性色（不冷不暖）', value: 'neutral' },
        { label: '大胆撞色', value: 'bold' },
      ],
    }),
    q('g', 'color_taboo', '有没有绝对不能接受的颜色？', 'text'),
    q('g', 'material', '对材质和触感的偏好', 'checkbox', {
      options: [
        { label: '原木温暖感', value: 'wood' },
        { label: '石材/瓷砖清爽感', value: 'stone' },
        { label: '金属/玻璃精致感', value: 'metal' },
        { label: '布艺/软包柔和感', value: 'fabric' },
        { label: '微水泥/艺术涂料质感', value: 'cement' },
        { label: '不太在意，听设计师的', value: 'defer' },
      ],
    }),
    q('g', 'elements', '你被哪些设计元素吸引？', 'checkbox', {
      options: [
        { label: '双开门', value: 'double_door' },
        { label: '壁炉', value: 'fireplace' },
        { label: '实木百叶折叠门', value: 'shutters' },
        { label: '手工砖/马赛克', value: 'handmade_tile' },
        { label: '玻璃砖', value: 'glass_block' },
        { label: '不锈钢/金属', value: 'steel' },
        { label: '镜面', value: 'mirror' },
        { label: '铁艺', value: 'iron' },
        { label: '清水混凝土', value: 'concrete' },
        { label: '原木/做旧质感', value: 'aged_wood' },
        { label: '艺术涂料', value: 'art_paint' },
        { label: '拱门/弧形', value: 'arch' },
        { label: '石膏线/线条', value: 'molding' },
        { label: '藤编/自然材质', value: 'rattan' },
        { label: '交给设计师判断', value: 'defer' },
      ],
    }),
    q('g', 'lighting', '对灯光有什么感觉上的偏好？', 'radio', {
      options: [
        { label: '喜欢明亮的', value: 'bright' },
        { label: '喜欢暖暗的、有氛围的', value: 'warm_dim' },
        { label: '不同区域不同氛围', value: 'varies' },
        { label: '需要无主灯设计', value: 'no_main' },
        { label: '不太了解，听设计师的', value: 'defer' },
      ],
    }),
    q('g', 'inspo_images', '上传你收集的灵感图片', 'image', {
      hint: '小红书、Pinterest 截图都可以，每张图可以加备注说明吸引你的地方',
    }),
    q('g', 'notes', '关于风格审美，还有什么想法？', 'textarea'),
  ],
};

// ────────────────────────────────────────────
// H · 自由表达
// ────────────────────────────────────────────
const sectionH: Section = {
  key: 'h',
  title: SECTION_META.h.title,
  subtitle: SECTION_META.h.subtitle,
  questions: [
    q('h', 'lifestyle_extra', '关于你的生活方式，还有什么想让设计师知道的？', 'textarea', {
      placeholder: '特别的兴趣爱好、收藏、仪式感需求、未来可能的家庭变化、对某个空间的执念...',
    }),
    q('h', 'three_words', '对你来说，理想的家最重要的三个词', 'text', {
      required: true,
      placeholder: '① ______  ② ______  ③ ______',
    }),
    q('h', 'last_words', '还有什么想对设计师说的话？', 'textarea', {
      placeholder: '任何你想说的，这里都是你的天地',
    }),
  ],
};

// ────────────────────────────────────────────
// 汇总导出
// ────────────────────────────────────────────

export const ALL_SECTIONS: Record<SectionKey, Section> = {
  a: sectionA,
  b: sectionB,
  c: sectionC,
  d: sectionD,
  e1: sectionE1,
  e2: sectionE2,
  e3: sectionE3,
  e4: sectionE4,
  e5: sectionE5,
  e6: sectionE6,
  e7: sectionE7,
  e8: sectionE8,
  e9: sectionE9,
  e10: sectionE10,
  e11: sectionE11,
  f: sectionF,
  g: sectionG,
  h: sectionH,
};

export function getSection(key: SectionKey): Section {
  return ALL_SECTIONS[key];
}

export function getNextSection(current: SectionKey): SectionKey | null {
  const idx = SECTION_ORDER.indexOf(current);
  if (idx === -1 || idx === SECTION_ORDER.length - 1) return null;
  return SECTION_ORDER[idx + 1];
}

export function getPrevSection(current: SectionKey): SectionKey | null {
  const idx = SECTION_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return SECTION_ORDER[idx - 1];
}

export function getTotalSteps(): number {
  return SECTION_ORDER.length;
}

export function getStepIndex(section: SectionKey): number {
  return SECTION_ORDER.indexOf(section);
}

export { sectionD, sectionE11 };
