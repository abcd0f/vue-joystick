# Vue Joystick

一个现代化、功能丰富的 Vue 3 虚拟摇杆组件，支持触摸、鼠标、键盘控制，适用于游戏控制、机器人遥控、远程操作、方向输入等场景。

---

# 特性

- 🎮 支持鼠标、触摸、键盘多输入方式
- 🧭 支持自由模式 / X 轴 / Y 轴限制
- ⚡ 内置节流与高频事件优化
- 🪄 平滑阻尼动画与自动回中
- 🎯 死区（Dead Zone）支持
- 📐 输出角度、方向、距离等状态
- ♿ 完整键盘可访问性支持
- 🎨 高度可定制样式
- 📦 TypeScript 类型完整支持

---

# 安装

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

# 快速开始

## 基础使用

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

| 属性            | 说明                      | 类型                           | 默认值   |
| --------------- | ------------------------- | ------------------------------ | -------- |
| maxRadius       | 最大移动半径              | `number`                       | `32`     |
| size            | 组件尺寸                  | `number`                       | `200`    |
| damping         | 阻尼系数，值越大越平滑    | `number`                       | `0.2`    |
| returnToCenter  | 松开后是否自动回中        | `boolean`                      | `true`   |
| changeThrottle  | change 事件节流时间（ms） | `number`                       | `500`    |
| mode            | 移动模式                  | `'free' \| 'xAxis' \| 'yAxis'` | `'free'` |
| disableKeyboard | 是否禁用键盘控制          | `boolean`                      | `false`  |
| disabled        | 是否禁用组件              | `boolean`                      | `false`  |

---

## Events

| 事件名          | 说明               | 回调参数      |
| --------------- | ------------------ | ------------- |
| change          | 摇杆位置变化时触发 | `(pos)`       |
| start           | 开始拖动时触发     | `() => void`  |
| end             | 结束拖动时触发     | `() => void`  |
| directionChange | 方向变化时触发     | `(dir, prev)` |
| enterDeadZone   | 进入死区时触发     | `() => void`  |
| leaveDeadZone   | 离开死区时触发     | `() => void`  |
| reachBoundary   | 触达边界时触发     | `() => void`  |

---

## Methods

| 方法名 | 说明         |
| ------ | ------------ |
| reset  | 重置摇杆位置 |

---

# 类型定义

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

# 浏览器支持

| 浏览器          | 版本 |
| --------------- | ---- |
| Chrome          | 90+  |
| Edge            | 90+  |
| Firefox         | 88+  |
| Safari          | 14+  |
| iOS Safari      | 支持 |
| Android Browser | 支持 |

---

# License

MIT
