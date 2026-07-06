import { ref, onMounted, onUnmounted, toValue, type Ref } from 'vue';
import type { JoystickOptions, JoystickPosition, Direction } from './types';

const DIRECTION_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type DirectionKey = (typeof DIRECTION_KEYS)[number];

const SNAP_THRESHOLD = 0.01;
const TILT_SCALE = 8;

// 角度区间 → Direction，从正上方顺时针，每45°一个区间
// 使用 22.5° 作为边界，保证8个方向均等
function angleToDirection(angleDeg: number): Direction {
  // 归一化到 [0, 360)
  const a = ((angleDeg % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return 'up';
  if (a < 67.5) return 'upRight';
  if (a < 112.5) return 'right';
  if (a < 157.5) return 'downRight';
  if (a < 202.5) return 'down';
  if (a < 247.5) return 'downLeft';
  if (a < 292.5) return 'left';
  return 'upLeft';
}

export function useJoystick(options: JoystickOptions = {}) {
  const {
    onChange,
    onStart,
    onEnd,
    onDirectionChange,
    onEnterDeadZone,
    onLeaveDeadZone,
    onReachBoundary
  } = options;

  // 选项以 getter 形式读取：传入 ref / getter 时响应式生效，传原始值则等价于快照（向后兼容）
  const getMaxRadius = () => toValue(options.maxRadius) ?? 32;
  const getDeadZone = () => toValue(options.deadZone) ?? 3;
  const getDamping = () => Math.max(0, Math.min(1, toValue(options.damping) ?? 0.18));
  const getReturnToCenter = () => toValue(options.returnToCenter) ?? true;
  const getChangeThrottle = () => toValue(options.changeThrottle) ?? 0;
  const getMode = () => toValue(options.mode) ?? 'free';
  const getDisableKeyboard = () => toValue(options.disableKeyboard) ?? false;
  const getDisabled = () => toValue(options.disabled) ?? false;

  const containerRef = ref<HTMLElement | null>(null);
  const knobRef = ref<HTMLElement | null>(null);
  const isDragging = ref(false);

  // ── 对外暴露的响应式状态 ──
  const normalizedX = ref(0);
  const normalizedY = ref(0);
  const distance = ref(0); // 0-100，离中心距离
  const angle = ref(0); // 0-360，从正上方顺时针
  const direction = ref<Direction>('center');
  const isAtBoundary = ref(false);

  const pressedKeys = new Set<DirectionKey>();

  let centerX = 0;
  let centerY = 0;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  let rafId: number | null = null;
  let lastChangeTime = 0;
  let isKeyboardActive = false;

  // 上一帧的状态，用于变化检测
  let prevDirection: Direction = 'center';
  let prevInDeadZone = true; // 初始在死区（中心）
  let prevAtBoundary = false;
  // 最近一次 onChange 派发的归一化坐标，用于变化检测（与对外 ref 分离，避免误判）
  let lastEmittedX = 0;
  let lastEmittedY = 0;

  // ─────────────────────────────────────
  // render
  // ─────────────────────────────────────

  function emitChange(nx: number, ny: number, dist: number) {
    lastEmittedX = nx;
    lastEmittedY = ny;
    onChange?.({ x: nx, y: ny, distance: dist });
  }

  function render() {
    const el = knobRef.value;
    if (!el) return;

    const maxRadius = getMaxRadius();
    const deadZone = getDeadZone();
    const damping = getDamping();
    const changeThrottle = getChangeThrottle();

    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;

    const tiltX = -(currentY / maxRadius) * TILT_SCALE;
    const tiltY = (currentX / maxRadius) * TILT_SCALE;

    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    const nx = Math.round((currentX / maxRadius) * 100);
    const ny = Math.round((-currentY / maxRadius) * 100);
    const dist = Math.round((Math.hypot(currentX, currentY) / maxRadius) * 100);

    // ── 派生状态计算 ──
    const inDeadZone = Math.hypot(currentX, currentY) < deadZone;
    // atan2 原点为右方顺时针，转换为从正上方顺时针
    const rawAngle = Math.atan2(currentX, -currentY) * (180 / Math.PI);
    const normalAngle = ((rawAngle % 360) + 360) % 360;
    const atBoundary = dist >= 99; // 留1%容差避免浮点抖动

    const nextDirection: Direction = inDeadZone ? 'center' : angleToDirection(normalAngle);

    // ── 更新响应式状态 ──
    normalizedX.value = nx;
    normalizedY.value = ny;
    distance.value = dist;
    angle.value = Math.round(normalAngle);
    direction.value = nextDirection;
    isAtBoundary.value = atBoundary;

    // ── 事件派发：死区进出 ──
    if (inDeadZone !== prevInDeadZone) {
      if (inDeadZone) {
        onEnterDeadZone?.();
      } else {
        onLeaveDeadZone?.();
      }
      prevInDeadZone = inDeadZone;
    }

    // ── 事件派发：边界碰撞 ──
    if (atBoundary && !prevAtBoundary) {
      onReachBoundary?.();
    }
    prevAtBoundary = atBoundary;

    // ── 事件派发：方向变化 ──
    if (nextDirection !== prevDirection) {
      onDirectionChange?.(nextDirection, prevDirection);
      prevDirection = nextDirection;
    }

    // ── onChange 派发：对比最近一次派发值，节流模式下仅在有变化时触发，避免静止时重复派发 ──
    if (nx !== lastEmittedX || ny !== lastEmittedY) {
      if (changeThrottle > 0) {
        const now = performance.now();
        if (now - lastChangeTime >= changeThrottle) {
          lastChangeTime = now;
          emitChange(nx, ny, dist);
        }
      } else {
        emitChange(nx, ny, dist);
      }
    }

    // ── RAF 循环控制：仍在运动 / 键盘激活 / 节流模式下尚有未派发的变化时继续 ──
    const isMoving = Math.abs(targetX - currentX) > SNAP_THRESHOLD || Math.abs(targetY - currentY) > SNAP_THRESHOLD;
    const hasUnemitted = nx !== lastEmittedX || ny !== lastEmittedY;
    const shouldContinue = isMoving || isKeyboardActive || (changeThrottle > 0 && hasUnemitted);

    if (shouldContinue) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }

  function startRenderLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(render);
    }
  }

  // ─────────────────────────────────────
  // math
  // ─────────────────────────────────────

  function clampToRadius(x: number, y: number) {
    const maxRadius = getMaxRadius();
    const deadZone = getDeadZone();
    const mode = getMode();

    const dist = Math.hypot(x, y);
    if (dist < deadZone) return { x: 0, y: 0 };

    let cx = mode === 'yAxis' ? 0 : x;
    let cy = mode === 'xAxis' ? 0 : y;

    const clamped = Math.hypot(cx, cy);
    if (clamped > maxRadius) {
      const scale = maxRadius / clamped;
      cx *= scale;
      cy *= scale;
    }

    return { x: cx, y: cy };
  }

  function updateTarget(x: number, y: number) {
    const next = clampToRadius(x, y);
    targetX = next.x;
    targetY = next.y;
    startRenderLoop();
  }

  // ─────────────────────────────────────
  // pointer
  // ─────────────────────────────────────

  function onPointerDown(e: PointerEvent) {
    if (getDisabled()) return;
    e.preventDefault();

    const rect = containerRef.value!.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    isDragging.value = true;
    containerRef.value?.focus();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);

    onStart?.();
  }

  function onPointerMove(e: PointerEvent) {
    updateTarget(e.clientX - centerX, e.clientY - centerY);
  }

  function onPointerUp(e: PointerEvent) {
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    target.removeEventListener('pointermove', onPointerMove);
    target.removeEventListener('pointerup', onPointerUp);

    isDragging.value = false;

    if (getReturnToCenter()) {
      updateTarget(0, 0);
    }

    onEnd?.();
  }

  // ─────────────────────────────────────
  // keyboard
  // ─────────────────────────────────────

  function calcKeyboardTarget(): { x: number; y: number } {
    const maxRadius = getMaxRadius();
    const mode = getMode();

    let x = 0;
    let y = 0;

    if (pressedKeys.has('ArrowLeft')) x -= maxRadius;
    if (pressedKeys.has('ArrowRight')) x += maxRadius;
    if (pressedKeys.has('ArrowUp')) y -= maxRadius;
    if (pressedKeys.has('ArrowDown')) y += maxRadius;

    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    if (mode === 'yAxis') x = 0;
    if (mode === 'xAxis') y = 0;

    return { x, y };
  }

  function isDirectionKey(key: string): key is DirectionKey {
    return (DIRECTION_KEYS as readonly string[]).includes(key);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (getDisabled() || getDisableKeyboard() || !isDirectionKey(e.key)) return;
    e.preventDefault();

    pressedKeys.add(e.key);
    isKeyboardActive = true;

    const next = calcKeyboardTarget();
    updateTarget(next.x, next.y);
  }

  function onKeyUp(e: KeyboardEvent) {
    if (getDisabled() || getDisableKeyboard() || !isDirectionKey(e.key)) return;
    e.preventDefault();

    pressedKeys.delete(e.key);

    const next = calcKeyboardTarget();
    if (next.x === 0 && next.y === 0) {
      isKeyboardActive = false;
    }

    updateTarget(next.x, next.y);
  }

  // ─────────────────────────────────────
  // lifecycle
  // ─────────────────────────────────────

  onMounted(() => {
    containerRef.value?.focus();
  });

  onUnmounted(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });

  // ─────────────────────────────────────
  // public api
  // ─────────────────────────────────────

  function reset() {
    updateTarget(0, 0);
  }

  return {
    containerRef: containerRef as Ref<HTMLElement | null>,
    knobRef: knobRef as Ref<HTMLElement | null>,
    isDragging,
    normalizedX,
    normalizedY,
    distance,
    angle,
    direction,
    isAtBoundary,
    handlers: { onPointerDown, onKeyDown, onKeyUp },
    reset
  };
}
