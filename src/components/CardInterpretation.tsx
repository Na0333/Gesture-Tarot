import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Sparkles } from "lucide-react";
import type { TarotCard } from "../data/tarotCards";
import TarotCardFace from "./TarotCardFace";

type CardInterpretationProps = {
  card?: TarotCard;
  hasDrawn: boolean;
};

export default function CardInterpretation({ card, hasDrawn }: CardInterpretationProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.section
      className="ornate-panel interpretation-panel"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.06 }}
    >
      <div className="panel-title">
        <Sparkles size={15} aria-hidden="true" />
        <span>当前卡牌解读</span>
        <Sparkles size={15} aria-hidden="true" />
      </div>

      {!card ? (
        <div className="empty-state">滑动手掌，让命运牌开始流转。</div>
      ) : (
        <>
          <div className="card-summary">
            <TarotCardFace card={card} compact className="summary-card" />
            <div>
              <h2>{card.nameCn}</h2>
              <p>
                {card.number}. {card.nameEn}
              </p>
              <span className="summary-label">{hasDrawn ? "刚抽到的命运牌" : "当前中心牌"}</span>
            </div>
          </div>

          <div className="keyword-row" aria-label="关键词">
            {card.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>

          {expanded && (
            <motion.div
              className="reading-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ReadingBlock title="牌义解读" text={card.meaning} />
              <ReadingBlock title="爱情 / 人际" text={card.love} />
              <ReadingBlock title="学习 / 事业" text={card.career} />
              <ReadingBlock title="情绪状态" text={card.emotion} />
              <ReadingBlock title="今日建议" text={card.advice} />
            </motion.div>
          )}

          <button type="button" className="collapse-button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "收起解读" : "展开解读"}
            <ChevronUp size={18} className={expanded ? "" : "is-down"} aria-hidden="true" />
          </button>
        </>
      )}
    </motion.section>
  );
}

function ReadingBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="reading-block">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
