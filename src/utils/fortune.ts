import type { TarotCard } from "../data/tarotCards";
import { spreadPositions } from "../data/tarotCards";

export type FortuneResult = {
  overallEnergy: string;
  positionInsights: Array<{
    position: string;
    card: TarotCard;
    text: string;
  }>;
  finalAdvice: string;
  mantra: string;
};

const positionPrefixes = [
  "当前状态位置描述此刻的主导能量",
  "隐藏挑战位置指出需要被看见的内在课题",
  "外部助力位置代表可借用的支持与资源",
  "近期变化位置提示接下来更容易浮现的变化方向",
  "最终建议位置给出这组牌的行动提醒"
];

const energyOpenings = [
  "这组牌会按照 Smith-Waite 大阿卡那正位牌义进行组合解读。",
  "这组牌以传统 Rider-Waite / Smith-Waite 正位含义为基础，只把牌义放入五张牌阵语境。",
  "这组命运牌显示的不是绝对预测，而是五张大阿卡那正位含义之间的关系。",
  "这组牌适合作为娱乐向自我观察参考，解读会尽量贴近传统正位牌义。"
];

const mantraFragments = [
  "让光照进正在变化的地方。",
  "我允许自己慢慢清晰，也允许答案逐步靠近。",
  "稳定、诚实、温柔，是今天最适合携带的护符。",
  "当我听见内心的声音，路也会一点点显现。"
];

export function generateFortune(cards: TarotCard[]): FortuneResult | null {
  if (cards.length < spreadPositions.length) return null;

  const keywordPool = cards.flatMap((card) => card.keywords);
  const primaryKeywords = Array.from(new Set(keywordPool)).slice(0, 8);
  const openingIndex = Math.abs(keywordPool.join("").length + cards[0].number) % energyOpenings.length;

  const positionInsights = cards.slice(0, 5).map((card, index) => ({
    position: spreadPositions[index],
    card,
    text: `${positionPrefixes[index]}。${card.nameCn}的传统关键词是“${card.keywords
      .slice(0, 3)
      .join(" / ")}”。${card.meaning} 放在“${spreadPositions[index]}”牌位时，它更适合作为一种观察角度，而不是绝对预测。`
  }));

  const finalCard = cards[4];

  return {
    overallEnergy: `${energyOpenings[openingIndex]} 本组关键词集中在 ${primaryKeywords.join("、")}。这些关键词来自抽到牌的传统正位含义，用来提示当下更值得观察的心理能量和行动倾向。`,
    positionInsights,
    finalAdvice: `最终建议由${finalCard.nameCn}给出：${finalCard.advice} 请把它作为娱乐互动和自我观察参考，不作为医疗、法律、财务等严肃建议。`,
    mantra: mantraFragments[(cards[1].number + cards[3].number) % mantraFragments.length]
  };
}
