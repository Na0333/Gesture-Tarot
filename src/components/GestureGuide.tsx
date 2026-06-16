import { Check, Hand, MoveLeft, MoveRight, Pause } from "lucide-react";
import { motion } from "framer-motion";

const gestures = [
  {
    title: "手向左滑",
    subtitle: "上一张",
    icon: MoveLeft
  },
  {
    title: "手向右滑",
    subtitle: "下一张",
    icon: MoveRight
  },
  {
    title: "竖起食指",
    subtitle: "暂停 / 继续",
    icon: Pause
  },
  {
    title: "握拳",
    subtitle: "确认抽取",
    icon: Check
  }
];

export default function GestureGuide() {
  return (
    <motion.section
      className="ornate-panel gesture-guide"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="panel-title panel-title-left">
        <Hand size={16} aria-hidden="true" />
        <span>手势说明</span>
      </div>
      <div className="gesture-grid">
        {gestures.map((gesture) => {
          const Icon = gesture.icon;
          return (
            <div className="gesture-card" key={gesture.title}>
              <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
              <strong>{gesture.title}</strong>
              <span>{gesture.subtitle}</span>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
