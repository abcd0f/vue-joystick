<!-- Joystick.vue -->
<template>
  <div class="joystick-wrap" :style="cssVars">
    <div class="joystick-inner">
      <div
        ref="containerRef"
        class="joystick-container"
        tabindex="0"
        @keydown="handlers.onKeyDown"
        @keyup="handlers.onKeyUp"
      >
        <div class="joystick-around">
          <div class="base-slot">
            <slot name="base" />
          </div>
          <div class="handle">
            <div
              ref="knobRef"
              class="button-wrapper"
              :class="{ dragging: isDragging }"
              @pointerdown="handlers.onPointerDown"
            >
              <slot name="knob">
                <div class="inside">
                  <span v-for="i in 4" :key="i" class="dot" />
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Props, JoystickPosition, Direction } from './types';

import { computed } from 'vue';
import { useJoystick } from './useJoystick';
import { deriveJoystickPalette } from './color';

const props = withDefaults(defineProps<Props>(), {
  maxRadius: 32,
  size: 200,
  damping: 0.2,
  returnToCenter: true,
  changeThrottle: 500,
  mode: 'free',
  disableKeyboard: false,
  disabled: false,
  color: '#c5d1da'
});

const emit = defineEmits<{
  change: [pos: JoystickPosition];
  start: [];
  end: [];
  directionChange: [direction: Direction, prev: Direction];
  enterDeadZone: [];
  leaveDeadZone: [];
  reachBoundary: [];
}>();

// 从单个主色推导整套色调（线性 RGB 空间混合，派生高光 / 阴影 / 轮廓色）
const cssVars = computed(() => {
  const p = deriveJoystickPalette(props.color);
  return {
    '--joystick-size': `${props.size}px`,
    '--j-base': p.base,
    '--j-light': p.light,
    '--j-dark': p.dark,
    '--j-rim': p.rim,
    '--j-dot': p.dot
  };
});

const {
  containerRef,
  knobRef,
  isDragging,
  normalizedX,
  normalizedY,
  distance,
  angle,
  direction,
  isAtBoundary,
  handlers,
  reset
} = useJoystick({
  maxRadius: () => props.maxRadius,
  damping: () => props.damping,
  returnToCenter: () => props.returnToCenter,
  changeThrottle: () => props.changeThrottle,
  mode: () => props.mode,
  disableKeyboard: () => props.disableKeyboard,
  disabled: () => props.disabled,
  onChange: pos => emit('change', pos),
  onStart: () => emit('start'),
  onEnd: () => emit('end'),
  onDirectionChange: (dir, prev) => emit('directionChange', dir, prev),
  onEnterDeadZone: () => emit('enterDeadZone'),
  onLeaveDeadZone: () => emit('leaveDeadZone'),
  onReachBoundary: () => emit('reachBoundary')
});

defineExpose({
  x: normalizedX,
  y: normalizedY,
  distance,
  angle,
  direction,
  isAtBoundary,
  reset
});
</script>

<!-- styles 保持不变 -->

<style scoped>
.joystick-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
  user-select: none;
  --joystick-size: 200px;
  /* 默认色调，会被 cssVars 覆盖 */
  --j-base: #c5d1da;
  --j-light: #f5f8fa;
  --j-dark: #9da4a8;
  --j-rim: #dde4e8;
  --j-dot: #e7ecef;
}

.joystick-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.joystick-container {
  position: relative;
  outline: none;
  touch-action: none;
}

.joystick-around {
  position: relative;
  width: var(--joystick-size);
  height: var(--joystick-size);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  /* 硬编码 → CSS 变量 */
  background: conic-gradient(from 0deg, var(--j-dark), var(--j-light), var(--j-dark), var(--j-light), var(--j-dark));
}

/* #base 插槽容器：铺满底座、位于 handle 之下、不拦截指针 */
.base-slot {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.handle {
  position: relative;
  z-index: 1;
  width: calc(var(--joystick-size) * 0.775);
  height: calc(var(--joystick-size) * 0.775);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  /* 硬编码 → CSS 变量 */
  background: var(--j-base);
  box-shadow:
    0 0 calc(10px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.5),
    0 calc(10px * var(--joystick-size) / 200px) calc(10px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.2),
    inset 0 0 calc(16px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.85),
    inset 0 0 calc(24px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.75),
    inset 0 0 calc(48px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.2);
}

.button-wrapper {
  width: calc(var(--joystick-size) * 0.51);
  height: calc(var(--joystick-size) * 0.51);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  /* 硬编码 → CSS 变量 */
  background-image: linear-gradient(0deg, var(--j-dark), var(--j-light));
  box-shadow:
    0 calc(2px * var(--joystick-size) / 200px) calc(10px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.5),
    0 calc(2px * var(--joystick-size) / 200px) calc(10px * var(--joystick-size) / 200px) -2px rgba(0, 0, 0, 0.2),
    0 calc(10px * var(--joystick-size) / 200px) calc(10px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.4),
    inset 0 calc(-3px * var(--joystick-size) / 200px) calc(3px * var(--joystick-size) / 200px) rgba(89, 91, 92, 0.6);
  will-change: transform;
  transform: translate3d(0, 0, 0);
  transition:
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.2s ease;
  cursor: grab;
  overflow: hidden;
}

.button-wrapper.dragging {
  transition: none;
  cursor: grabbing;
}

.inside {
  position: relative;
  width: calc(var(--joystick-size) * 0.425);
  height: calc(var(--joystick-size) * 0.425);
  border-radius: 50%;
  /* 硬编码 → CSS 变量 */
  background-image: linear-gradient(180deg, var(--j-dark), var(--j-rim));
  box-shadow:
    inset 0 calc(3px * var(--joystick-size) / 200px) calc(6px * var(--joystick-size) / 200px) rgba(152, 160, 163, 0.4),
    inset 0 calc(-3px * var(--joystick-size) / 200px) calc(6px * var(--joystick-size) / 200px) rgba(238, 244, 246, 0.4);
  pointer-events: none;
}

.dot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: calc(var(--joystick-size) * 0.04);
  height: calc(var(--joystick-size) * 0.04);
  border-radius: 50%;
  /* 硬编码 → CSS 变量 */
  background: var(--j-dot);
  box-shadow:
    0 calc(2px * var(--joystick-size) / 200px) calc(2px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.3),
    inset 0 calc(-2px * var(--joystick-size) / 200px) calc(2px * var(--joystick-size) / 200px) rgba(0, 0, 0, 0.2);
}

.dot:nth-child(1) {
  left: 50%;
  top: 10%;
}
.dot:nth-child(2) {
  left: 90%;
  top: 50%;
}
.dot:nth-child(3) {
  left: 50%;
  top: 90%;
}
.dot:nth-child(4) {
  left: 10%;
  top: 50%;
}
</style>
