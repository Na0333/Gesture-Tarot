import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { TarotCard } from "../data/tarotCards";
import { spreadPositions } from "../data/tarotCards";
import TarotCardFace from "./TarotCardFace";

type TarotSpreadProps = {
  drawnCards: TarotCard[];
  onShowFortune: () => void;
  fortuneVisible: boolean;
};

export default function TarotSpread({ drawnCards, onShowFortune, fortuneVisible }: TarotSpreadProps) {
  const complete = drawnCards.length === spreadPositions.length;

  return (
    <motion.section
      className="spread-panel"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      aria-label="你的五张命运牌"
    >
      <div className="panel-title spread-title">
        <Sparkles size={15} aria-hidden="true" />
        <span>你的五张命运牌</span>
        <Sparkles size={15} aria-hidden="true" />
      </div>

      <div className="spread-grid">
        {spreadPositions.map((position, index) => {
          const card = drawnCards[index];
          return (
            <div className="spread-slot" key={position}>
              <motion.div
                className="spread-card-wrap"
                initial={card ? { rotateY: -100, opacity: 0, y: -32 } : false}
                animate={{ rotateY: 0, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
              >
                <TarotCardFace card={card} revealed={Boolean(card)} active={index === drawnCards.length - 1} compact />
              </motion.div>
              <strong>{index + 1}</strong>
              <span>{position}</span>
            </div>
          );
        })}
      </div>

      {complete && !fortuneVisible && (
        <motion.button
          type="button"
          className="gold-button spread-fortune-button"
          onClick={onShowFortune}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
        >
          查看运势分析
        </motion.button>
      )}
    </motion.section>
  );
}
