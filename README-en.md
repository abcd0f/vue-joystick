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

| Attribute       | Description                          | Type                           | Default  |
| --------------- | ------------------------------------ | ------------------------------ | -------- |
| maxRadius       | Maximum movement radius              | `number`                       | `32`     |
| size            | Component size                       | `number`                       | `200`    |
| damping         | Damping factor for smoother motion   | `number`                       | `0.2`    |
| returnToCenter  | Whether to auto-center after release | `boolean`                      | `true`   |
| changeThrottle  | Throttle time for change event (ms)  | `number`                       | `500`    |
| mode            | Movement mode                        | `'free' \| 'xAxis' \| 'yAxis'` | `'free'` |
| disableKeyboard | Disable keyboard control             | `boolean`                      | `false`  |
| disabled        | Disable all interactions             | `boolean`                      | `false`  |

---

## Events

| Event           | Description                              | Parameters    |
| --------------- | ---------------------------------------- | ------------- |
| change          | Triggered when joystick position changes | `(pos)`       |
| start           | Triggered when interaction starts        | `() => void`  |
| end             | Triggered when interaction ends          | `() => void`  |
| directionChange | Triggered when direction changes         | `(dir, prev)` |
| enterDeadZone   | Triggered when entering dead zone        | `() => void`  |
| leaveDeadZone   | Triggered when leaving dead zone         | `() => void`  |
| reachBoundary   | Triggered when reaching max boundary     | `() => void`  |

---

## Methods

| Method | Description             |
| ------ | ----------------------- |
| reset  | Reset joystick position |

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
