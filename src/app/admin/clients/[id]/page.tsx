'use client';

import { useRouter } from 'next/navigation';
import { SECTION_ORDER, SECTION_META, ALL_SECTIONS } from '@/lib/questions';

// 模拟答案数据
const MOCK_ANSWERS: Record<string, any> = {
  pain_points: '1. 厨房太小，做菜转不开身\n2. 玄关鞋子堆一地，进门就烦\n3. 孩子没有安静写作业的地方',
  abandoned_habits: '想在家练瑜伽但客厅铺不开垫子',
  weekday_routine: '早上起床 → 准备早餐 → 送孩子上学 → 回家工作（远程） → 接孩子 → 做晚饭 → 辅导作业 → 入睡',
  weekend_routine: '周末会一家人去公园，下午在家看电影或各自看书',
  idle_space: '客厅使用率最高，次卧基本闲置（老人偶尔来住）',
  home_feeling: '推开门就放松，每个人都有自己的小角落',
  life_words: '忙碌 → 从容',
  priorities_sort: '["solitude", "efficiency", "interaction", "low_maintenance", "aesthetics", "social"]',
  together_time: '晚饭和周末需要一家人在一起，工作日的白天各自独处',
  future_changes: '["more_members"]',
  home_vs_house: '家是有温度的地方，房子只是建筑',
  community: '天通苑北二区',
  area: '建筑面积 98 ㎡ / 套内 82 ㎡',
  layout: '3 室 2 厅 1 卫 1 阳台',
  floor_info: '12/18楼，有电梯，朝南',
  house_status: 'second_hand',
  move_in: '3m',
  budget_mode: 'half',
  budget_range: '20_35w',
  has_plan: 'no',
  shoe_count: '20_50',
  storage_800: 'yes',
  large_items: '["stroller", "luggage"]',
  media: 'projector',
  activities: '["chat", "movie", "read", "kids", "relax"]',
  dual_use: 'kids',
  daily_diners: '3',
  party_freq: 'monthly',
  island: 'social',
  bar_area: 'merge',
  cooking_freq: 'daily',
  open_kitchen: 'semi',
  appliances: '["dishwasher", "oven", "disposal"]',
  main_cook: '我（女主人），身高 162cm',
  laundry: '["dryer", "hang"]',
  cleaning_devices: '["robot", "vacuum"]',
  cleaning_storage: 'cabinet',
  bathroom_count: '现有1个',
  master_bath: '["shower", "smart_toilet"]',
  guest_bath: '["seat", "dry_wet"]',
  bedroom_count: '3',
  guest_room: 'occasional',
  flexible_guest: 'yes',
  master_extra: '["lounge"]',
  bedroom_priority: 'quiet',
  closet_type: 'partition',
  closet_length: '2_4',
  vanity: 'in_bedroom',
  study_type: 'dedicated',
  study_user: '["focus", "tutoring"]',
  book_count: '200',
  balcony_use: '["plants", "relax"]',
  enclose: 'yes',
  balcony_vibe: 'both',
  has_pet: 'no',
  storage_items: '["clothes", "books", "kids", "daily_supplies"]',
  storage_style: 'both',
  storage_pain: '过季衣服和被子，永远找不到地方放',
  style: '["japanese", "nordic"]',
  color_tone: 'warm',
  color_taboo: '不喜欢大红色',
  material: '["wood", "fabric"]',
  elements: '["shutters", "rattan", "arch"]',
  lighting: 'varies',
  three_words: '放松、温暖、自在',
};

export default function ClientDetailPage() {
  const router = useRouter();

  const getAnswerDisplay = (sectionKey: string, questionKey: string) => {
    const value = MOCK_ANSWERS[questionKey];
    if (value === undefined) return <span className="text-gray-300 text-sm">未填写</span>;

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              {v}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(value)}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/admin/clients')}
            className="text-gray-400 hover:text-gray-600"
          >
            ← 返回
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">张先生 · 问卷详情</h1>
            <p className="text-xs text-gray-400">已提交 · 2026-06-01</p>
          </div>
        </div>

        {/* Answers by section */}
        <div className="space-y-4">
          {SECTION_ORDER.map((sectionKey) => {
            const meta = SECTION_META[sectionKey];
            const sectionDef = ALL_SECTIONS[sectionKey];
            if (!sectionDef) return null;

            return (
              <div key={sectionKey} className="card">
                <h3 className="font-medium text-sm text-gray-800 mb-3">
                  {meta.title}
                </h3>
                <div className="space-y-3">
                  {sectionDef.questions.map((q) => (
                    <div key={q.key}>
                      <label className="text-xs text-gray-400 block mb-1">
                        {q.label}
                      </label>
                      {getAnswerDisplay(sectionKey, q.key)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Export button */}
        <div className="mt-8 mb-4">
          <button className="btn-secondary w-full">
            导出 PDF
          </button>
        </div>
      </div>
    </div>
  );
}
