# Vue Joystick

A modern and feature-rich Vue 3 virtual joystick component with support for touch, mouse, and keyboard input. Perfect for games, remote controls, robotics dashboards, and directional interactions.

---

# Features

- 🎮 Mouse, touch, and keyboard support
- 🧭 Free movement, X-axis, and Y-axis modes
- ⚡ Built-in throttling and high-frequency optimization
- 🪄 Smooth damping animation and auto-center support
- 🎯 Dead zone support
- 📐 Direction, angle, and distance tracking
- ♿ Accessible keyboard interactions
- 🎨 Fully customizable styles
- 📦 Full TypeScript support

---

# Installation

## npm

```bash
npm install @seedlib/vue-joystick
```

## pnpm

```bash
pnpm add @seedlib/vue-joystick
```

## yarn

```bash
yarn add @seedlib/vue-joystick
```

---

# Quick Start

## Basic Usage

```vue
<template>
  <Joystick @change="handleChange" @start="handleStart" @end="handleEnd" />
</template>

<script setup lang="ts">
import { Joystick } from '@seedlib/vue-joystick';
import '@seedlib/vue-joystick/style.css';

const handleChange = pos => {
  console.log(pos);
};

const handleStart = () => {
  console.log('start');
};

const handleEnd = () => {
  console.log('end');
};
</script>
```

---

# API

## Attributes

| Attribute       | Description                                                                              | Type                           | Default     |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| maxRadius       | Maximum movement radius                                                                  | `number`                       | `32`        |
| size            | Component size                                                                           | `number`                       | `200`       |
| damping         | Drag damping factor (0-1); lower = smoother with longer trailing tail                   | `number`                       | `0.2`       |
| returnToCenter  | Whether to auto-center after release                                                     | `boolean`                      | `true`      |
| changeThrottle  | Throttle time for the change event (ms); `0` fires on every change                       | `number`                       | `500`       |
| mode            | Movement mode                                                                            | `'free' \| 'xAxis' \| 'yAxis'` | `'free'`    |
| disableKeyboard | Disable keyboard control                                                                 | `boolean`                      | `false`     |
| disabled        | Disable all interactions                                                                 | `boolean`                      | `false`     |
| color           | Primary color, hex only (`#RGB` / `#RRGGBB`); highlight/shadow/rim derived automatically, invalid value falls back to default gray | `string` | `'#c5d1da'` |

> `color` accepts hex only (e.g. `#3b82f6`, `#f00`); passing `rgb()`/`hsl()` or other formats **silently falls back** to the default gray `#c5d1da` without throwing. Props like `damping` and `changeThrottle` are reactive and can be updated at runtime.

---

## Events

| Event           | Description                              | Parameters                         |
| --------------- | ---------------------------------------- | ---------------------------------- |
| change          | Triggered when joystick position changes | `(pos: JoystickPosition)`          |
| start           | Triggered when interaction starts        | `() => void`                       |
| end             | Triggered when interaction ends          | `() => void`                       |
| directionChange | Triggered when direction changes         | `(dir: Direction, prev: Direction)` |
| enterDeadZone   | Triggered when entering dead zone        | `() => void`                       |
| leaveDeadZone   | Triggered when leaving dead zone         | `() => void`                       |
| reachBoundary   | Triggered when reaching max boundary     | `() => void`                       |

> The `change` callback's `pos` is a `JoystickPosition`: `x`/`y` range `-100..100` (right/up are positive), `distance` ranges `0..100`. When `changeThrottle > 0` it fires at the throttle interval and only on change; when `changeThrottle = 0` it fires on every coordinate change.

---

## Methods

| Method | Description             |
| ------ | ----------------------- |
| reset  | Reset joystick position |

---

## Slots

| Slot | Description                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------- |
| knob | Knob face content. Defaults to the inner disc + 4 directional dots; appearance is unchanged when not provided. |
| base | Base decoration layer (tick marks, N/E/S/W labels, custom ring, etc.), layered above the base well and below the knob; does not intercept pointer interaction. |

### Custom knob example

```vue
<template>
  <Joystick>
    <template #knob>
      <img src="./arrow.svg" alt="direction" class="my-knob-icon" />
    </template>
  </Joystick>
</template>
```

### Custom base example

```vue
<template>
  <Joystick>
    <template #base>
      <span class="tick" style="top:2%;left:50%">N</span>
      <span class="tick" style="top:50%;left:98%">E</span>
      <span class="tick" style="top:98%;left:50%">S</span>
      <span class="tick" style="top:50%;left:2%">W</span>
    </template>
  </Joystick>
</template>
```

---

# Type Definitions

## JoystickPosition

```ts
interface JoystickPosition {
  x: number;
  y: number;
  distance: number;
}
```

---

## Direction

```ts
type Direction = 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight' | 'center';
```

---

# Browser Support

| Browser         | Version   |
| --------------- | --------- |
| Chrome          | 90+       |
| Edge            | 90+       |
| Firefox         | 88+       |
| Safari          | 14+       |
| iOS Safari      | Supported |
| Android Browser | Supported |

---

# License

MIT
