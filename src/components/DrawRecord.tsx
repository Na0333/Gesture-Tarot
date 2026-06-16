import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { TarotCard } from "../data/tarotCards";
import TarotCardFace from "./TarotCardFace";

export type DrawRecordItem = {
  card: TarotCard;
  position: string;
  time: string;
};

type DrawRecordProps = {
  records: DrawRecordItem[];
  maxCards: number;
};

export default function DrawRecord({ records, maxCards }: DrawRecordProps) {
  return (
    <motion.section
      className="ornate-panel record-panel"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
    >
      <div className="panel-title">
        <Sparkles size={15} aria-hidden="true" />
        <span>抽卡记录</span>
        <Sparkles size={15} aria-hidden="true" />
      </div>

      {records.length === 0 ? (
        <div className="empty-state">尚未抽取命运牌。</div>
      ) : (
        <div className="record-list">
          {records.map((record, index) => (
            <motion.article
              className="record-item"
              key={`${record.card.id}-${record.position}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <TarotCardFace card={record.card} compact className="record-card" />
              <div>
                <strong>
                  {index + 1}. {record.card.nameCn}
                </strong>
                <span>
                  {record.card.roman}. {record.card.nameEn}
                </span>
                <small>{record.position}</small>
              </div>
              <time>{record.time}</time>
            </motion.article>
          ))}
        </div>
      )}

      <div className="record-count">
        已抽取 <strong>{records.length}</strong> / {maxCards} 张
      </div>
    </motion.section>
  );
}
