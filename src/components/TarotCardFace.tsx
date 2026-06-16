import type { CSSProperties } from "react";
import type { TarotCard } from "../data/tarotCards";

type TarotCardFaceProps = {
  card?: TarotCard;
  revealed?: boolean;
  active?: boolean;
  compact?: boolean;
  className?: string;
};

export default function TarotCardFace({
  card,
  revealed = true,
  active = false,
  compact = false,
  className = ""
}: TarotCardFaceProps) {
  const style = {
    "--card-color": card?.color ?? "#d6a84f"
  } as CSSProperties;

  if (!revealed || !card) {
    return (
      <div
        className={`tarot-card-face tarot-card-back ${active ? "is-active" : ""} ${compact ? "is-compact" : ""} ${className}`}
        style={style}
        aria-label="未抽取的塔罗牌背面"
      >
        <div className="card-border">
          <div className="back-star" />
          <div className="back-orbit back-orbit-a" />
          <div className="back-orbit back-orbit-b" />
          <div className="back-diamond" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tarot-card-face ${active ? "is-active" : ""} ${compact ? "is-compact" : ""} ${className}`}
      style={style}
      aria-label={`${card.nameCn}，${card.nameEn}`}
    >
      <div className="card-border">
        <div className="card-number">{card.roman}</div>
        <div className="card-sky">
          <span className="moon" />
          <span className="sun" />
          <span className="orbit orbit-a" />
          <span className="orbit orbit-b" />
          <span className="constellation-dot dot-a" />
          <span className="constellation-dot dot-b" />
          <span className="constellation-dot dot-c" />
        </div>
        <div className="card-figure">
          <span className="figure-aura" />
          <span className="figure-core" />
          <span className="figure-step" />
        </div>
        <div className="card-caption">
          <strong>{card.nameCn}</strong>
          <span>
            {card.number}. {card.nameEn}
          </span>
        </div>
      </div>
    </div>
  );
}
