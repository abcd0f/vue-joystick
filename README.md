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

| 属性            | 说明                                                          | 类型                           | 默认值     |
| --------------- | ------------------------------------------------------------- | ------------------------------ | ---------- |
| maxRadius       | 最大移动半径                                                  | `number`                       | `32`       |
| size            | 组件尺寸                                                      | `number`                       | `200`      |
| damping         | 拖拽阻尼系数（0-1），值越小越平滑、拖尾越长                   | `number`                       | `0.2`      |
| returnToCenter  | 松开后是否自动回中                                            | `boolean`                      | `true`     |
| changeThrottle  | change 事件节流时间（ms），设为 `0` 则每次变化都触发          | `number`                       | `500`      |
| mode            | 移动模式                                                      | `'free' \| 'xAxis' \| 'yAxis'` | `'free'`   |
| disableKeyboard | 是否禁用键盘控制                                              | `boolean`                      | `false`    |
| disabled        | 是否禁用组件                                                  | `boolean`                      | `false`    |
| color           | 组件主色调，仅接受 hex（`#RGB` / `#RRGGBB`），自动派生高光/阴影/轮廓色，非法值回退默认灰 | `string` | `'#c5d1da'` |

> `color` 仅支持 hex 格式（如 `#3b82f6`、`#f00`）；传入 `rgb()`/`hsl()` 等非法值会**静默回退**到默认灰色 `#c5d1da`，不会抛错。`damping` 与 `changeThrottle` 等属性支持运行时响应式更新。

---

## Events

| 事件名          | 说明               | 回调参数                         |
| --------------- | ------------------ | -------------------------------- |
| change          | 摇杆位置变化时触发 | `(pos: JoystickPosition)`        |
| start           | 开始拖动时触发     | `() => void`                     |
| end             | 结束拖动时触发     | `() => void`                     |
| directionChange | 方向变化时触发     | `(dir: Direction, prev: Direction)` |
| enterDeadZone   | 进入死区时触发     | `() => void`                     |
| leaveDeadZone   | 离开死区时触发     | `() => void`                     |
| reachBoundary   | 触达边界时触发     | `() => void`                     |

> `change` 回调的 `pos` 为 `JoystickPosition`：`x`/`y` 取值 `-100..100`（右/上为正方向），`distance` 取值 `0..100`。`changeThrottle > 0` 时按节流间隔触发且仅在有变化时派发；`changeThrottle = 0` 时每次坐标变化都触发。

---

## Methods

| 方法名 | 说明         |
| ------ | ------------ |
| reset  | 重置摇杆位置 |

---

## Slots

| 插槽名 | 说明                                                                |
| ------ | ------------------------------------------------------------------- |
| knob   | 旋钮面板内容。默认渲染内盘 + 4 个方向点；未传入时外观与默认一致      |
| base   | 圆形底座装饰层（刻度、东南西北标记、自定义环等），覆于底座之上、旋钮之下，不拦截指针交互 |

### 自定义旋钮示例

```vue
<template>
  <Joystick>
    <template #knob>
      <img src="./arrow.svg" alt="方向" class="my-knob-icon" />
    </template>
  </Joystick>
</template>
```

### 自定义底座示例

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
