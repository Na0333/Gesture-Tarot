import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Lock, RotateCcw, Sparkles } from "lucide-react";
import CameraHandTracker from "./components/CameraHandTracker";
import CardInterpretation from "./components/CardInterpretation";
import DrawRecord, { type DrawRecordItem } from "./components/DrawRecord";
import FortuneResult from "./components/FortuneResult";
import GestureGuide from "./components/GestureGuide";
import TarotCarousel from "./components/TarotCarousel";
import TarotSpread from "./components/TarotSpread";
import { spreadPositions, tarotCards, type TarotCard } from "./data/tarotCards";
import { generateFortune } from "./utils/fortune";
import { gestureLabel, type GestureStatus } from "./utils/gesture";

type SavedDrawRecord = {
  cardId: string;
  time: string;
};

const STORAGE_KEY = "gesture-tarot:last-draw";
const MAX_DRAW = spreadPositions.length;

export default function App() {
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [gestureStatus, setGestureStatus] = useState<GestureStatus>("idle");
  const [paused, setPaused] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [deck, setDeck] = useState<TarotCard[]>(() => shuffleDeck(tarotCards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [records, setRecords] = useState<DrawRecordItem[]>([]);
  const [inspectedCard, setInspectedCard] = useState<TarotCard | undefined>();
  const [fortuneVisible, setFortuneVisible] = useState(false);
  const drawTimerRef = useRef<number | null>(null);

  const availableCards = useMemo(() => {
    const drawnIds = new Set(drawnCards.map((card) => card.id));
    return deck.filter((card) => !drawnIds.has(card.id));
  }, [deck, drawnCards]);

  const currentCard = availableCards[currentIndex] ?? availableCards[0];
  const complete = drawnCards.length >= MAX_DRAW;
  const fortune = useMemo(() => generateFortune(drawnCards), [drawnCards]);
  const statusText = complete ? gestureLabel("complete") : paused ? gestureLabel("paused") : gestureLabel(gestureStatus);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { records: SavedDrawRecord[] };
      const restoredRecords = parsed.records
        .map((record, index) => {
          const card = tarotCards.find((item) => item.id === record.cardId);
          if (!card) return null;
          return {
            card,
            time: record.time,
            position: spreadPositions[index] ?? "命运牌"
          };
        })
        .filter(Boolean) as DrawRecordItem[];

      if (restoredRecords.length) {
        const restoredCards = restoredRecords.map((record) => record.card);
        setRecords(restoredRecords.slice(0, MAX_DRAW));
        setDrawnCards(restoredCards.slice(0, MAX_DRAW));
        setInspectedCard(restoredCards[restoredCards.length - 1]);
        setGestureStatus(restoredRecords.length >= MAX_DRAW ? "complete" : "drawn");
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!records.length) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const payload = {
      savedAt: new Date().toISOString(),
      records: records.map((record) => ({
        cardId: record.card.id,
        time: record.time
      }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [records]);

  useEffect(() => {
    if (currentIndex >= availableCards.length) {
      setCurrentIndex(0);
    }
  }, [availableCards.length, currentIndex]);

  useEffect(() => {
    if (!experienceStarted || paused || drawing || complete || availableCards.length <= 1) return;

    const timer = window.setInterval(() => {
      stepCarousel(1, "idle", false);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [experienceStarted, paused, drawing, complete, availableCards.length, currentIndex]);

  useEffect(() => {
    if (complete) {
      setGestureStatus("complete");
      setPaused(false);
    }
  }, [complete]);

  useEffect(() => {
    return () => {
      if (drawTimerRef.current) window.clearTimeout(drawTimerRef.current);
    };
  }, []);

  const stepCarousel = useCallback(
    (direction: 1 | -1, status: GestureStatus, announce = true, steps = 2) => {
      if (!availableCards.length || complete || drawing) return;

      setCurrentIndex((index) => {
        const nextIndex = (index + direction * steps + availableCards.length * steps) % availableCards.length;
        return nextIndex;
      });

      if (announce) setGestureStatus(status);
    },
    [availableCards, complete, drawing]
  );

  const drawCurrentCard = useCallback(() => {
    if (complete || drawing || !currentCard) return;
    if (drawnCards.some((card) => card.id === currentCard.id)) return;

    setDrawing(true);
    setGestureStatus("drawing");

    drawTimerRef.current = window.setTimeout(() => {
      const position = spreadPositions[drawnCards.length] ?? "命运牌";
      const time = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());

      setDrawnCards((cards) => [...cards, currentCard].slice(0, MAX_DRAW));
      setRecords((items) => [...items, { card: currentCard, position, time }].slice(0, MAX_DRAW));
      setInspectedCard(currentCard);
      setDrawing(false);
      setGestureStatus(drawnCards.length + 1 >= MAX_DRAW ? "complete" : "drawn");
      setCurrentIndex((index) => {
        const nextLength = Math.max(availableCards.length - 1, 1);
        return index % nextLength;
      });
    }, 720);
  }, [availableCards.length, complete, currentCard, drawing, drawnCards, drawnCards.length]);

  const handleGesture = useCallback(
    (gesture: GestureStatus) => {
      if (gesture === "left_swipe" && !paused) {
        stepCarousel(-1, "left_swipe");
        return;
      }

      if (gesture === "right_swipe" && !paused) {
        stepCarousel(1, "right_swipe");
        return;
      }

      if (gesture === "index_up") {
        setPaused((value) => !value);
        setGestureStatus(paused ? "idle" : "paused");
        return;
      }

      if (gesture === "fist") {
        drawCurrentCard();
      }
    },
    [drawCurrentCard, paused, stepCarousel]
  );

  function handleReset() {
    setDeck(shuffleDeck(tarotCards));
    setDrawnCards([]);
    setRecords([]);
    setCurrentIndex(0);
    setInspectedCard(undefined);
    setPaused(false);
    setDrawing(false);
    setGestureStatus("idle");
    setFortuneVisible(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  function startExperience() {
    if (!records.length) {
      setDeck(shuffleDeck(tarotCards));
      setCurrentIndex(0);
    }
    setExperienceStarted(true);
    setCameraError("");
    setGestureStatus("idle");
  }

  if (!experienceStarted) {
    return (
      <div className="app-shell welcome-shell">
        <BackgroundChrome />
        <main className="welcome-card">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="welcome-mark">
              <Sparkles size={28} aria-hidden="true" />
            </div>
            <h1>Gesture Tarot</h1>
            <p className="welcome-subtitle">用手势唤醒你的五张命运牌</p>
            <p className="welcome-copy">
              前置摄像头会在本地识别手势：左右滑动切换塔罗牌，竖起食指暂停，握拳抽取命运牌。
            </p>
            <button type="button" className="gold-button welcome-button" onClick={startExperience}>
              <Camera size={20} aria-hidden="true" />
              开启摄像头
            </button>
            <div className="privacy-note">
              <Lock size={16} aria-hidden="true" />
              摄像头画面仅用于本地手势识别，不会上传或保存。
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <BackgroundChrome />
      <div className="dashboard">
        <header className="top-grid">
          <GestureGuide />

          <motion.div
            className="hero-title"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="title-ornament" aria-hidden="true" />
            <h1>Gesture Tarot</h1>
            <p>用手势唤醒你的五张命运牌</p>
            <div className="status-pill">状态：{statusText}</div>
            {cameraError && <div className="camera-error">{cameraError}</div>}
          </motion.div>

          <CameraHandTracker
            enabled={experienceStarted}
            paused={paused}
            gestureStatus={gestureStatus}
            onGesture={handleGesture}
            onCameraError={(message) =>
              setCameraError(
                message || "请允许浏览器摄像头权限。部分浏览器需要在 HTTPS 或 localhost 环境下使用摄像头。"
              )
            }
          />
        </header>

        <main className="main-grid">
          <aside className="left-column">
            <CardInterpretation card={inspectedCard} hasDrawn={records.length > 0} />
            <button type="button" className="reset-button" onClick={handleReset}>
              <RotateCcw size={20} aria-hidden="true" />
              重新开始
            </button>
          </aside>

          <section className="center-column">
            <TarotCarousel
              cards={availableCards}
              currentIndex={currentIndex}
              paused={paused}
              drawing={drawing}
              complete={complete}
              onPrev={() => stepCarousel(-1, "left_swipe")}
              onNext={() => stepCarousel(1, "right_swipe")}
              onDraw={drawCurrentCard}
            />
            <TarotSpread
              drawnCards={drawnCards}
              fortuneVisible={fortuneVisible}
              onShowFortune={() => setFortuneVisible(true)}
            />
            <div className="footer-privacy">
              <Lock size={16} aria-hidden="true" />
              摄像头画面仅用于本地手势识别，不会上传或保存。
            </div>
          </section>

          <aside className="right-column">
            <DrawRecord records={records} maxCards={MAX_DRAW} />
            {complete && !fortuneVisible && (
              <button type="button" className="gold-button side-fortune-button" onClick={() => setFortuneVisible(true)}>
                查看运势分析
              </button>
            )}
          </aside>
        </main>

        <FortuneResult fortune={fortune} visible={fortuneVisible} onReset={handleReset} />
      </div>
    </div>
  );
}

function BackgroundChrome() {
  return (
    <>
      <div className="cosmic-bg" aria-hidden="true" />
      <div className="star-field star-field-a" aria-hidden="true" />
      <div className="star-field star-field-b" aria-hidden="true" />
      <div className="corner-frame corner-frame-tl" aria-hidden="true" />
      <div className="corner-frame corner-frame-tr" aria-hidden="true" />
      <div className="corner-frame corner-frame-bl" aria-hidden="true" />
      <div className="corner-frame corner-frame-br" aria-hidden="true" />
    </>
  );
}

function shuffleDeck(cards: TarotCard[]): TarotCard[] {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(randomUnit() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function randomUnit(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 0xffffffff;
  }
  return Math.random();
}
