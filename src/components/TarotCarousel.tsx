import { AnimatePresence, motion } from "framer-motion";
import { Hand, MoveLeft, MoveRight, Sparkles } from "lucide-react";
import type { TarotCard } from "../data/tarotCards";
import TarotCardFace from "./TarotCardFace";

type TarotCarouselProps = {
  cards: TarotCard[];
  currentIndex: number;
  paused: boolean;
  drawing: boolean;
  complete: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDraw: () => void;
};

const offsets = [-2, -1, 0, 1, 2];

export default function TarotCarousel({
  cards,
  currentIndex,
  paused,
  drawing,
  complete,
  onPrev,
  onNext,
  onDraw
}: TarotCarouselProps) {
  const currentCard = cards[currentIndex] ?? cards[0];
  const showCurrentFace = drawing && !complete;

  function cardAt(offset: number) {
    if (!cards.length) return undefined;
    return cards[(currentIndex + offset + cards.length) % cards.length];
  }

  if (!currentCard) {
    return (
      <section className="carousel-stage is-complete">
        <Sparkles size={36} aria-hidden="true" />
        <h2>五张命运牌已完成</h2>
        <p>查看下方运势分析，或重新开始新的仪式。</p>
      </section>
    );
  }

  return (
    <section className="carousel-stage" aria-label="塔罗牌滚动抽卡区">
      <div className="zodiac-disc" aria-hidden="true" />
      <div className="carousel-glow" aria-hidden="true" />
      <div className="particle-ring" aria-hidden="true" />
      {paused && <motion.div className="pause-ring" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} />}
      {drawing && (
        <motion.div
          className="draw-burst"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.55] }}
          transition={{ duration: 0.85 }}
          aria-hidden="true"
        />
      )}

      <div className="card-wheel">
        <AnimatePresence mode="popLayout" initial={false}>
          {offsets.map((offset) => {
            const card = cardAt(offset);
            if (!card) return null;

            const isCenter = offset === 0;
            const x = offset * 126;
            const rotateY = offset * -18;
            const zIndex = 10 - Math.abs(offset);
            const opacity = isCenter ? 1 : Math.max(0.32, 0.78 - Math.abs(offset) * 0.18);
            const scale = isCenter ? 1.08 : offset === -1 || offset === 1 ? 0.86 : 0.72;
            const revealed = isCenter && showCurrentFace;

            return (
              <motion.button
                type="button"
                className={`wheel-card ${isCenter ? "is-center" : ""} ${revealed ? "is-revealing" : ""}`}
                key={`${card.id}-${offset}`}
                aria-label={revealed ? `正在翻开的卡牌 ${card.nameCn}` : "未翻开的塔罗牌背面"}
                onClick={isCenter ? onDraw : offset < 0 ? onPrev : onNext}
                initial={{ opacity: 0, x: x * 0.75, scale: scale * 0.95, rotateY }}
                animate={{ opacity, x, scale, rotateY, zIndex }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ type: "spring", stiffness: 230, damping: 26, mass: 0.82 }}
                disabled={complete}
              >
                <TarotCardFace card={card} revealed={revealed} active={isCenter} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="current-card-name">
        <span className="spark-dot" />
        <h2>{complete ? "牌阵完成" : showCurrentFace ? currentCard.nameCn : "未知命运牌"}</h2>
        <span className="spark-dot" />
        <p>{complete ? "五张命运牌已经进入牌阵" : showCurrentFace ? `${currentCard.number}. ${currentCard.nameEn}` : "握拳后翻开当前牌面"}</p>
      </div>

      <div className="carousel-actions">
        <button type="button" className="gesture-action" onClick={onPrev} disabled={complete}>
          <MoveLeft size={24} aria-hidden="true" />
          <span>
            向左滑动
            <small>上一张</small>
          </span>
        </button>
        <button type="button" className="draw-action" onClick={onDraw} disabled={complete || drawing}>
          <Hand size={18} aria-hidden="true" />
          <span>{complete ? "已完成牌阵" : drawing ? "翻牌中" : "握拳翻开并抽取"}</span>
        </button>
        <button type="button" className="gesture-action" onClick={onNext} disabled={complete}>
          <span>
            向右滑动
            <small>下一张</small>
          </span>
          <MoveRight size={24} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
