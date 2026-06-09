#!/usr/bin/env node
// 生成问卷内容 PDF
// Usage: node scripts/generate-questionnaire-pdf.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

// ============================================================
// 问卷完整内容 — 从 src/lib/questions.ts 提取的结构化数据
// ============================================================
const SECTIONS = [
  {
    key: 'A', num: 1, title: '生活现状诊断', subtitle: '先聊聊你现在的居住感受',
    questions: [
      { label: '你现在住的房子，最让你不舒服的 3 件事是什么？', type: '长文本', required: true, hint: '想到什么写什么，这些痛点正是设计的驱动力', placeholder: '比如：采光太差、收纳不够用、厨房太小转不开身...' },
      { label: '有没有因为空间限制而被迫放弃的习惯或爱好？', type: '长文本', placeholder: '比如：想在家健身但没地方，想做烘焙但台面不够...' },
      { label: '请描述你一个普通工作日的居家动线', type: '长文本', hint: '目的是了解空间实际怎么被使用，谁几点出门、谁在家的节奏', placeholder: '早上起床 → ______ → ______ → ______ → 晚上入睡' },
      { label: '休息日和工作日的居家状态有什么不同？', type: '长文本' },
      { label: '现在的家里，哪个空间使用率最高？哪个基本闲置？', type: '短文本', placeholder: '最高：______  闲置：______  你觉得闲置的原因是什么？' },
    ]
  },
  {
    key: 'B', num: 2, title: '生活愿景', subtitle: '聊聊你理想中的生活方式',
    questions: [
      { label: '用一句话描述你理想中「家」的感觉', type: '短文本', required: true, placeholder: '比如："推开门就放松了"、"一家人围在一起的地方"' },
      { label: '用一个词形容现在的生活状态，再用一个词形容你希望的', type: '短文本', placeholder: '现在 ______ → 希望 ______' },
      { label: '以下要素，对你的重要性排序是什么？', type: '排序', required: true, hint: '拖拽排序，排在上面的更重要。如果预算有限，最下面的一项可以优先牺牲', options: ['家人之间的互动与亲密感', '每个人都有自己的独处角落', '招待朋友、社交聚会', '做事顺手、高效率的功能动线', '好看、有审美氛围', '好打理、不用花太多时间维护'] },
      { label: '什么时候最需要「在一起」？什么时候最需要「各自独处」？', type: '长文本', placeholder: '帮设计师理解你家庭关系的张弛节奏' },
      { label: '未来 5-10 年，家庭结构或生活方式可能有哪些变化？', type: '多选', hint: '你希望这次装修能适应这些变化，还是更关注当下？', options: ['可能增加家庭成员（新生/父母同住）', '孩子长大离家', '可能换工作/创业/长期在家办公', '暂无预期变化', '其他'] },
      { label: '你觉得「家」和「房子」的区别是什么？', type: '长文本', hint: '这个问题没有标准答案，你的回答能告诉设计师很多' },
    ]
  },
  {
    key: 'C', num: 3, title: '项目基本信息', subtitle: '房子的基本情况',
    questions: [
      { label: '房屋所在小区', type: '短文本', placeholder: '写小区名称即可' },
      { label: '房屋面积', type: '短文本', placeholder: '建筑面积 ____ ㎡  /  套内面积 ____ ㎡' },
      { label: '户型结构', type: '短文本', placeholder: '比如：3 室 2 厅 2 卫 1 阳台' },
      { label: '楼层 / 总楼层 / 电梯 / 朝向', type: '短文本', placeholder: '比如：12/18楼，有电梯，朝南' },
      { label: '房屋现状', type: '单选', options: ['毛坯房', '精装房（局部改造）', '旧房翻新', '二手房'] },
      { label: '预计入住时间', type: '单选', options: ['3 个月内', '半年内', '一年内', '不着急，看情况而定'] },
      { label: '倾向装修模式', type: '单选', options: ['半包', '全包', '不确定'] },
      { label: '大致总预算区间', type: '单选', options: ['10 万以内', '10-20 万', '20-35 万', '35-50 万', '50 万以上', '不方便说'] },
      { label: '是否已经有了户型图或效果图？', type: '单选', options: ['有，可以上传', '还没有'] },
    ]
  },
  {
    key: 'D', num: 4, title: '家庭成员 & 生活习惯', subtitle: '',
    questions: [
      { label: '常住成员档案', type: '成员卡片（可添加多条）', required: true, hint: '点击「+ 添加成员」，为每位常住成员建立档案' },
      { label: '宠物情况', type: '单选', options: ['无宠物', '有宠物'] },
      { label: '宠物种类和数量', type: '短文本', placeholder: '比如：猫 2 只 / 狗 1 只', condition: '选择"有宠物"时显示' },
      { label: '宠物主要活动区域？有无特殊需求？', type: '长文本', placeholder: '比如：猫爬架放置区域、狗门、宠物洗澡区...', condition: '选择"有宠物"时显示' },
    ]
  },
  {
    key: 'E1', num: 5, title: '玄关', subtitle: '',
    questions: [
      { label: '鞋子收纳量估算', type: '单选', options: ['少于 20 双', '20-50 双', '50-100 双', '100 双以上'] },
      { label: '是否需要入户储物间（"800 库"）？', type: '单选', options: ['需要', '不需要', '看现场空间再说'] },
      { label: '入户需要收纳的大件物品', type: '多选', options: ['婴儿车', '行李箱', '健身器材', '户外/露营装备', '快递暂存区', '无特殊需求'] },
      { label: '关于玄关，还有什么想法？', type: '长文本', placeholder: '有的话尽管说' },
    ]
  },
  {
    key: 'E2', num: 6, title: '客厅', subtitle: '',
    questions: [
      { label: '影音需求', type: '单选', options: ['需要电视', '需要投影', '都需要', '都不需要'] },
      { label: '客厅主要活动', type: '多选', options: ['家人聊天', '看电视/电影', '阅读', '工作/学习', '游戏', '健身/瑜伽', '亲子玩耍', '宠物活动', '待客', '喝茶/咖啡', '发呆放松'] },
      { label: '客厅是否需要兼顾其他功能？', type: '单选', options: ['纯休闲区', '需要兼书房', '需要兼儿童活动区', '其他'] },
      { label: '关于客厅，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E3', num: 7, title: '餐厅', subtitle: '',
    questions: [
      { label: '日常用餐人数', type: '短文本', placeholder: '____ 人' },
      { label: '多人聚餐频率', type: '单选', options: ['几乎不', '每月 1-2 次', '每周都有', '经常'] },
      { label: '是否需要岛台？', type: '单选', options: ['需要，兼操作台', '需要，兼用餐/社交', '不需要', '不确定'] },
      { label: '是否需要独立的餐边水吧区（咖啡、调酒、茶）？', type: '单选', options: ['需要独立水吧', '不需要', '可以和厨房合并'] },
      { label: '餐厅是否会兼作其他用途？', type: '短文本', placeholder: '比如：工作、亲子手工...' },
      { label: '关于餐厅，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E4', num: 8, title: '厨房', subtitle: '',
    questions: [
      { label: '厨房使用频率', type: '单选', options: ['几乎不做饭', '偶尔（每周 2-3 次）', '经常（每天至少一顿）', '重度使用（一日三餐都在家）'] },
      { label: '对开放式厨房的态度', type: '单选', options: ['非常接受', '可以接受但担心油烟', '不接受，必须封闭', '半开放（可开可合）'] },
      { label: '需要哪些嵌入式电器？', type: '多选', options: ['洗碗机', '蒸箱', '烤箱', '微波炉', '嵌入式冰箱', '垃圾处理器', '净水系统'] },
      { label: '台面小家电大致数量和种类', type: '长文本', placeholder: '比如：电饭煲、空气炸锅、咖啡机、破壁机、吐司机...' },
      { label: '下厨主力是谁？身高大致多少？', type: '短文本', hint: '这决定了台面高度，很重要' },
      { label: '关于厨房，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E5', num: 9, title: '家政空间', subtitle: '',
    questions: [
      { label: '洗衣晾晒需求', type: '多选', options: ['独立烘干机', '洗烘一体', '需要晾晒区', '迷你洗衣机（内衣/婴儿）', '手洗区'] },
      { label: '清洁电器', type: '多选', options: ['扫拖机器人', '手持吸尘器', '洗地机'] },
      { label: '家政工具收纳需求', type: '单选', options: ['集中收纳在设备间/阳台', '分散在各区域', '需要一个单独的家政柜'] },
      { label: '关于家政空间，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E6', num: 10, title: '卫生间', subtitle: '',
    questions: [
      { label: '卫生间现有数量和是否需要调整？', type: '短文本', placeholder: '现有____个，需要____个' },
      { label: '主卫需求', type: '多选', options: ['浴缸', '淋浴房', '双台盆', '智能马桶', '如厕+淋浴即可，不需要太复杂'] },
      { label: '客卫 / 次卫需求', type: '多选', options: ['蹲便器', '坐便器', '干湿分离', '考虑客人使用体验', '实用就行'] },
      { label: '卫生间收纳需求', type: '长文本', placeholder: '化妆品、护肤品、卫生用品囤货量...' },
      { label: '关于卫生间，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E7', num: 11, title: '卧室', subtitle: '',
    questions: [
      { label: '需要几间固定卧室？', type: '短文本', placeholder: '____ 间' },
      { label: '是否需要独立客房？', type: '单选', options: ['需要，经常有人住（月均 ≥ 1 次）', '偶尔有客，但不想为此浪费一间房', '不需要'] },
      { label: '如果偶尔接待，是否接受灵活方案（折叠床、沙发床）而非固定客房？', type: '单选', options: ['接受', '不接受'] },
      { label: '主卧是否需要额外功能区？', type: '多选', options: ['小型休闲角落（躺椅/阅读角）', '工作台', '婴儿床区域', '不需要'] },
      { label: '卧室最看重什么？', type: '单选', options: ['安静好睡', '收纳够用', '温馨氛围', '有窗景/采光'] },
      { label: '关于卧室，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E8', num: 12, title: '衣帽间', subtitle: '',
    questions: [
      { label: '是否需要独立衣帽间？', type: '单选', options: ['需要，越大越好', '可以接受主卧内隔出衣帽区', '不需要，衣柜即可'] },
      { label: '衣物总量估算（参考现有衣柜长度）', type: '单选', options: ['少于 2 米', '2-4 米', '4-6 米', '6 米以上'] },
      { label: '是否需要梳妆台？', type: '单选', options: ['需要，在衣帽间内', '需要，在卧室内', '不需要'] },
      { label: '是否有需要特殊收纳的衣物？', type: '长文本', placeholder: '比如：长裙、西装、礼服、大量包包...' },
      { label: '关于衣帽间，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E9', num: 13, title: '书房', subtitle: '',
    questions: [
      { label: '书房需求', type: '单选', options: ['需要独立书房', '在公共区域设办公/阅读角落即可', '不需要专门区域'] },
      { label: '谁会主要使用书房？使用场景是什么？', type: '多选', options: ['专注工作（需要安静）', '轻度办公（可以开放）', '阅读', '游戏', '亲子学习/辅导作业'] },
      { label: '书籍存量大致估计', type: '短文本', placeholder: '大约 ____ 本' },
      { label: '书房是否需要兼顾其他功能？', type: '长文本', placeholder: '比如：偶尔客房、储物、展示收藏等' },
      { label: '关于书房，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E10', num: 14, title: '阳台', subtitle: '',
    questions: [
      { label: '阳台主要功能', type: '多选', options: ['养植物/绿植', '晾晒', '休闲（放椅子晒太阳）', '家务操作（洗衣/收纳）', '宠物空间', '储物'] },
      { label: '是否考虑封阳台？', type: '单选', options: ['封', '不封', '看物业规定'] },
      { label: '对阳台的想象更接近', type: '单选', options: ['实用型（功能为主）', '治愈型（绿植+休闲角）', '两者兼顾'] },
      { label: '关于阳台，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'E11', num: 15, title: '宠物空间', subtitle: '仅当 D 部分选择"有宠物"时显示',
    questions: [
      { label: '是否需要为宠物设计专属区域？', type: '单选', options: ['需要一个小范围活动/休息区', '不需要，和人共用空间即可'] },
      { label: '宠物相关需求', type: '多选', options: ['猫爬架/抓板区域', '狗狗专属角落/小门', '宠物洗澡区', '宠物喂食/饮水区', '猫砂盆隐藏位'] },
      { label: '关于宠物空间，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'F', num: 16, title: '储物总览', subtitle: '盘点一下需要收纳的东西',
    questions: [
      { label: '需要收纳的物品类别', type: '多选', options: ['日常消耗品囤货', '衣物鞋包', '床上用品/换季被褥', '书籍', '手办/模型/收藏品', '电子产品/数码配件/数据线', '运动/户外装备', '行李箱', '儿童玩具/用品', '过季电器', '工具/五金/DIY 材料', '食品/厨房囤货', '药品/医药箱'] },
      { label: '你更倾向于哪种收纳方式？', type: '单选', options: ['集中收纳（一个储物间/大柜子解决一切）', '分散收纳（每样东西放在使用场景附近）', '结合'] },
      { label: '有没有觉得「永远找不到地方放」的东西？', type: '短文本', placeholder: '它的存在让你每次看到都很头疼...' },
      { label: '关于储物，还有什么要补充的？', type: '长文本' },
    ]
  },
  {
    key: 'G', num: 17, title: '风格 & 审美', subtitle: '聊聊你喜欢的视觉风格',
    questions: [
      { label: '你倾向的风格方向', type: '多选', options: ['现代简约', '日式/原木', '侘寂', '法式', '美式复古', '工业风', '新中式', '北欧', '不知道怎么说，用图片表达'] },
      { label: '倾向的色调', type: '单选', options: ['暖色系（米白、奶油、木色、大地色）', '冷色系（灰、蓝、黑白）', '中性色（不冷不暖）', '大胆撞色'] },
      { label: '有没有绝对不能接受的颜色？', type: '短文本' },
      { label: '对材质和触感的偏好', type: '多选', options: ['原木温暖感', '石材/瓷砖清爽感', '金属/玻璃精致感', '布艺/软包柔和感', '微水泥/艺术涂料质感', '不太在意，听设计师的'] },
      { label: '你被哪些设计元素吸引？', type: '多选', options: ['双开门', '壁炉', '实木百叶折叠门', '手工砖/马赛克', '玻璃砖', '不锈钢/金属', '镜面', '铁艺', '清水混凝土', '原木/做旧质感', '艺术涂料', '拱门/弧形', '石膏线/线条', '藤编/自然材质', '交给设计师判断'] },
      { label: '对灯光有什么感觉上的偏好？', type: '单选', options: ['喜欢明亮的', '喜欢暖暗的、有氛围的', '不同区域不同氛围', '需要无主灯设计', '不太了解，听设计师的'] },
      { label: '上传你收集的灵感图片', type: '图片上传', hint: '小红书、Pinterest 截图都可以，每张图可以加备注说明吸引你的地方' },
      { label: '关于风格审美，还有什么想法？', type: '长文本' },
    ]
  },
  {
    key: 'H', num: 18, title: '自由表达', subtitle: '还有什么想告诉设计师的',
    questions: [
      { label: '关于你的生活方式，还有什么想让设计师知道的？', type: '长文本', placeholder: '特别的兴趣爱好、收藏、仪式感需求、未来可能的家庭变化、对某个空间的执念...' },
      { label: '对你来说，理想的家最重要的三个词', type: '短文本', required: true, placeholder: '① ______  ② ______  ③ ______' },
      { label: '还有什么想对设计师说的话？', type: '长文本', placeholder: '任何你想说的，这里都是你的天地' },
    ]
  },
];

// 类型显示名称映射
const TYPE_NAMES = {
  '短文本': '✎ 短文本',
  '长文本': '▣ 长文本',
  '单选': '◉ 单项选择',
  '多选': '☑ 多项选择',
  '排序': '⇅ 拖拽排序',
  '图片上传': '🖼 图片上传',
  '成员卡片（可添加多条）': '👤 成员卡片',
};

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generateHtml() {
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>装修需求采集问卷</title>
<style>
  @page { size: A4; margin: 2cm 1.8cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 11px;
    line-height: 1.7;
    color: #1a1a1a;
    max-width: 100%;
  }

  /* ---- Cover ---- */
  .cover {
    text-align: center;
    padding: 80px 0 60px;
    page-break-after: always;
  }
  .cover h1 {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }
  .cover .subtitle {
    font-size: 16px;
    color: #888;
    margin-bottom: 40px;
  }
  .cover .meta {
    font-size: 12px;
    color: #aaa;
    line-height: 2;
  }
  .cover .divider {
    width: 60px;
    height: 1px;
    background: #ccc;
    margin: 40px auto;
  }
  .cover .stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 24px;
  }
  .cover .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }
  .cover .stat-label {
    font-size: 11px;
    color: #999;
  }

  /* ---- TOC ---- */
  .toc {
    page-break-after: always;
  }
  .toc h2 {
    font-size: 18px;
    margin-bottom: 24px;
  }
  .toc-item {
    display: flex;
    align-items: baseline;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 11px;
  }
  .toc-num {
    width: 32px;
    color: #999;
    flex-shrink: 0;
  }
  .toc-title {
    font-weight: 500;
    flex: 1;
  }
  .toc-meta {
    color: #bbb;
    font-size: 10px;
  }

  /* ---- Section ---- */
  .section {
    page-break-before: always;
    padding-top: 8px;
  }
  .section:first-of-type {
    page-break-before: avoid;
  }
  .section-header {
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #1a1a1a;
  }
  .section-num {
    font-size: 10px;
    color: #999;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .section-title {
    font-size: 18px;
    font-weight: 700;
    margin-top: 2px;
  }
  .section-subtitle {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
  }
  .section-stats {
    font-size: 10px;
    color: #bbb;
    margin-top: 6px;
  }

  /* ---- Question ---- */
  .question {
    margin-bottom: 18px;
    padding: 12px 14px;
    background: #fafafa;
    border-radius: 6px;
    border-left: 3px solid #e0e0e0;
    break-inside: avoid;
  }
  .question.required {
    border-left-color: #c44;
  }
  .q-label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .q-label .required-star {
    color: #c44;
    margin-left: 2px;
  }
  .q-type {
    display: inline-block;
    font-size: 9px;
    color: #888;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 1px 6px;
    margin-bottom: 6px;
  }
  .q-hint {
    font-size: 10px;
    color: #999;
    margin-top: 4px;
    font-style: italic;
  }
  .q-placeholder {
    font-size: 10px;
    color: #c0c0c0;
    margin-top: 2px;
  }
  .q-condition {
    font-size: 9px;
    color: #999;
    background: #f5f5f5;
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    margin-top: 4px;
  }
  .q-options {
    margin-top: 6px;
    padding-left: 8px;
  }
  .q-options li {
    font-size: 10px;
    color: #666;
    line-height: 2;
    list-style: circle;
  }

  /* ---- Footer ---- */
  .footer {
    page-break-before: always;
    text-align: center;
    padding: 80px 0;
    color: #aaa;
    font-size: 11px;
    line-height: 2;
  }

  /* ---- Print tweaks ---- */
  @media print {
    body { font-size: 10px; }
    .section { page-break-before: always; }
    .section:first-of-type { page-break-before: avoid; }
  }
</style>
</head>
<body>

<!-- ====== COVER ====== -->
<div class="cover">
  <h1>装修需求采集问卷</h1>
  <div class="subtitle">帮助你梳理生活，帮助设计师读懂你</div>
  <div class="divider"></div>
  <div class="stats">
    <div><div class="stat-value">${SECTIONS.length}</div><div class="stat-label">维度</div></div>
    <div><div class="stat-value">${SECTIONS.reduce((s, sec) => s + sec.questions.length, 0)}</div><div class="stat-label">问题</div></div>
  </div>
  <div class="meta" style="margin-top:48px;">
    本问卷由设计师发送链接 → 客户填写<br>
    共 ${SECTIONS.length} 个步骤，建议预留 20-30 分钟<br>
    可中途退出，下次登录继续填写
  </div>
</div>

<!-- ====== TOC ====== -->
<div class="toc">
  <h2>问卷结构</h2>
`;

  for (const sec of SECTIONS) {
    html += `  <div class="toc-item"><span class="toc-num">${String(sec.num).padStart(2, '0')}</span><span class="toc-title">${escapeHtml(sec.title)}</span><span class="toc-meta">${sec.questions.length} 题</span></div>\n`;
  }

  html += `</div>\n`;

  // ====== SECTIONS ======
  for (const sec of SECTIONS) {
    const subtitle = sec.subtitle || '';

    html += `
<div class="section">
  <div class="section-header">
    <div class="section-num">Part ${sec.num} · ${sec.key}</div>
    <div class="section-title">${escapeHtml(sec.title)}</div>
    ${subtitle ? `<div class="section-subtitle">${escapeHtml(subtitle)}</div>` : ''}
    <div class="section-stats">${sec.questions.length} 个问题</div>
  </div>
`;

    for (const q of sec.questions) {
      const reqClass = q.required ? ' required' : '';
      const typeLabel = TYPE_NAMES[q.type] || q.type;

      html += `  <div class="question${reqClass}">
    <div class="q-type">${typeLabel}</div>
    <div class="q-label">${escapeHtml(q.label)}${q.required ? '<span class="required-star">*必填</span>' : ''}</div>
`;

      if (q.placeholder) {
        html += `    <div class="q-placeholder">↳ ${escapeHtml(q.placeholder)}</div>\n`;
      }
      if (q.hint) {
        html += `    <div class="q-hint">💡 ${escapeHtml(q.hint)}</div>\n`;
      }
      if (q.condition) {
        html += `    <div class="q-condition">条件：${escapeHtml(q.condition)}</div>\n`;
      }
      if (q.options && q.options.length > 0) {
        html += `    <ul class="q-options">${q.options.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>\n`;
      }

      html += `  </div>\n`;
    }

    html += `</div>\n`;
  }

  // ====== FOOTER ======
  html += `
<div class="footer">
  <p>— 问卷到此结束 —</p>
  <p>感谢你花时间认真填写，这些思考是最好的设计起点。</p>
  <p style="margin-top:16px; font-size:10px;">装修需求采集问卷 · ${new Date().toISOString().slice(0, 10)}</p>
</div>

</body>
</html>`;

  return html;
}

async function main() {
  const html = generateHtml();
  const htmlPath = path.join(ROOT, '问卷内容.html');
  const pdfPath = path.join(ROOT, '问卷内容.pdf');

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✅ HTML: ' + htmlPath);

  // 用 Playwright 生成 PDF
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px;color:#bbb;text-align:center;width:100%;padding:8px 0;">装修需求采集问卷</div>',
    footerTemplate: '<div style="font-size:8px;color:#bbb;text-align:center;width:100%;padding:8px 0;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();

  console.log('✅ PDF: ' + pdfPath);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
