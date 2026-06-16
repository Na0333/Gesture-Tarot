import { motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import type { FortuneResult as FortuneText } from "../utils/fortune";

type FortuneResultProps = {
  fortune: FortuneText | null;
  visible: boolean;
  onReset: () => void;
};

export default function FortuneResult({ fortune, visible, onReset }: FortuneResultProps) {
  if (!fortune || !visible) return null;

  return (
    <motion.section
      className="ornate-panel fortune-panel"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      aria-label="完整运势分析"
    >
      <div className="panel-title">
        <Sparkles size={15} aria-hidden="true" />
        <span>五张命运牌分析</span>
        <Sparkles size={15} aria-hidden="true" />
      </div>

      <motion.div className="fortune-content" initial="hidden" animate="show">
        <FortuneParagraph title="总体能量" text={fortune.overallEnergy} delay={0} />
        {fortune.positionInsights.map((insight, index) => (
          <FortuneParagraph
            key={insight.position}
            title={`${insight.position}：${insight.card.nameCn}`}
            text={insight.text}
            delay={0.08 * (index + 1)}
          />
        ))}
        <FortuneParagraph title="最终建议" text={fortune.finalAdvice} delay={0.5} />
        <motion.div
          className="mantra"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.58 }}
        >
          <span>今日箴言</span>
          <strong>{fortune.mantra}</strong>
        </motion.div>
      </motion.div>

      <button type="button" className="gold-button reset-wide" onClick={onReset}>
        <RotateCcw size={18} aria-hidden="true" />
        重新开始
      </button>
    </motion.section>
  );
}

function FortuneParagraph({ title, text, delay }: { title: string; text: string; delay: number }) {
  return (
    <motion.article
      className="fortune-paragraph"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38 }}
    >
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.article>
  );
}
