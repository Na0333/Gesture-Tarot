export type HandPoint = {
  x: number;
  y: number;
  z?: number;
};

export type GestureStatus =
  | "idle"
  | "left_swipe"
  | "right_swipe"
  | "index_up"
  | "paused"
  | "fist"
  | "drawing"
  | "drawn"
  | "complete";

type GestureConfig = {
  swipeThreshold: number;
  swipeFrames: number;
  swipeCooldown: number;
  indexStableFrames: number;
  indexCooldown: number;
  fistStableFrames: number;
  fistCooldown: number;
};

const defaultConfig: GestureConfig = {
  swipeThreshold: 0.16,
  swipeFrames: 8,
  swipeCooldown: 600,
  indexStableFrames: 10,
  indexCooldown: 1000,
  fistStableFrames: 9,
  fistCooldown: 1500
};

export function getPalmCenter(landmarks: HandPoint[]): HandPoint {
  const indices = [0, 5, 9, 13, 17];
  const center = indices.reduce(
    (acc, index) => {
      const point = landmarks[index];
      return {
        x: acc.x + point.x,
        y: acc.y + point.y,
        z: (acc.z ?? 0) + (point.z ?? 0)
      };
    },
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: center.x / indices.length,
    y: center.y / indices.length,
    z: (center.z ?? 0) / indices.length
  };
}

export function distance(a: HandPoint, b: HandPoint): number {
  const zDelta = (a.z ?? 0) - (b.z ?? 0);
  return Math.hypot(a.x - b.x, a.y - b.y, zDelta);
}

export function isIndexUp(landmarks: HandPoint[]): boolean {
  if (landmarks.length < 21) return false;

  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];

  const indexStraight = indexTip.y < indexPip.y - 0.035;
  const middleBent = middleTip.y > middlePip.y - 0.005;
  const ringBent = ringTip.y > ringPip.y - 0.005;
  const pinkyBent = pinkyTip.y > pinkyPip.y - 0.005;

  return indexStraight && middleBent && ringBent && pinkyBent;
}

export function isFist(landmarks: HandPoint[]): boolean {
  if (landmarks.length < 21) return false;

  const palmCenter = getPalmCenter(landmarks);
  const fingertipIndices = [4, 8, 12, 16, 20];
  const foldedFingers = [8, 12, 16, 20].filter((tipIndex) => {
    const pipIndex = tipIndex - 2;
    return landmarks[tipIndex].y > landmarks[pipIndex].y - 0.015;
  }).length;

  const averageTipDistance =
    fingertipIndices.reduce((sum, index) => sum + distance(landmarks[index], palmCenter), 0) /
    fingertipIndices.length;

  return foldedFingers >= 3 && averageTipDistance < 0.18;
}

export class GestureDetector {
  private readonly config: GestureConfig;
  private palmHistory: HandPoint[] = [];
  private lastTriggerAt = 0;
  private indexFrames = 0;
  private fistFrames = 0;

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  detect(landmarks: HandPoint[], now = performance.now()): GestureStatus {
    if (landmarks.length < 21) {
      this.resetStableFrames();
      return "idle";
    }

    const palmCenter = getPalmCenter(landmarks);
    this.palmHistory.push(palmCenter);
    if (this.palmHistory.length > this.config.swipeFrames) {
      this.palmHistory.shift();
    }

    if (isFist(landmarks)) {
      this.fistFrames += 1;
    } else {
      this.fistFrames = 0;
    }

    if (this.fistFrames >= this.config.fistStableFrames && this.canTrigger(now, this.config.fistCooldown)) {
      this.markTriggered(now);
      this.fistFrames = 0;
      this.indexFrames = 0;
      return "fist";
    }

    if (isIndexUp(landmarks)) {
      this.indexFrames += 1;
    } else {
      this.indexFrames = 0;
    }

    if (this.indexFrames >= this.config.indexStableFrames && this.canTrigger(now, this.config.indexCooldown)) {
      this.markTriggered(now);
      this.indexFrames = 0;
      return "index_up";
    }

    const swipe = this.detectSwipe(now);
    if (swipe) return swipe;

    return "idle";
  }

  reset(): void {
    this.palmHistory = [];
    this.lastTriggerAt = 0;
    this.resetStableFrames();
  }

  private detectSwipe(now: number): GestureStatus | null {
    if (this.palmHistory.length < this.config.swipeFrames) return null;
    if (!this.canTrigger(now, this.config.swipeCooldown)) return null;

    const first = this.palmHistory[0];
    const last = this.palmHistory[this.palmHistory.length - 1];
    const deltaX = last.x - first.x;

    if (deltaX < -this.config.swipeThreshold) {
      this.markTriggered(now);
      this.palmHistory = [];
      return "left_swipe";
    }

    if (deltaX > this.config.swipeThreshold) {
      this.markTriggered(now);
      this.palmHistory = [];
      return "right_swipe";
    }

    return null;
  }

  private canTrigger(now: number, cooldown: number): boolean {
    return now - this.lastTriggerAt > cooldown;
  }

  private markTriggered(now: number): void {
    this.lastTriggerAt = now;
  }

  private resetStableFrames(): void {
    this.indexFrames = 0;
    this.fistFrames = 0;
  }
}

export function gestureLabel(status: GestureStatus): string {
  const labels: Record<GestureStatus, string> = {
    idle: "等待手势",
    left_swipe: "向左滑动，切换上一张",
    right_swipe: "向右滑动，切换下一张",
    index_up: "竖起食指，暂停 / 继续",
    paused: "食指暂停中",
    fist: "抓握抽取成功",
    drawing: "命运牌正在飞入牌阵",
    drawn: "已抽取一张命运牌",
    complete: "五张命运牌已经完成"
  };

  return labels[status];
}
