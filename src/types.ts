export interface JoystickPosition {
  x: number;
  y: number;
  distance: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight' | 'center';

export interface JoystickOptions {
  maxRadius?: number;
  deadZone?: number;
  damping?: number;
  returnToCenter?: boolean;
  changeThrottle?: number;
  mode?: 'free' | 'yAxis' | 'xAxis';
  disableKeyboard?: boolean;
  disabled?: boolean;
  onChange?: (pos: JoystickPosition) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onDirectionChange?: (direction: Direction, prev: Direction) => void;
  onEnterDeadZone?: () => void;
  onLeaveDeadZone?: () => void;
  onReachBoundary?: () => void;
}

/** 交互控制器（如虚拟摇杆）的组件属性接口定义 */
export interface Props {
  /** 限制控制节点移动的最大活动半径 */
  maxRadius?: number;
  /** 组件的基础渲染尺寸 */
  size?: number;
  /** 拖拽滑动时的物理阻尼系数，调节运动平滑度与阻力感 */
  damping?: number;
  /** 释放操作后是否自动平滑复位至中心点 */
  returnToCenter?: boolean;
  /** 坐标或状态变化事件的节流触发间隔时间（毫秒） */
  changeThrottle?: number;
  /** 移动维度约束模式，支持自由拖拽或锁定单轴运动 */
  mode?: 'free' | 'yAxis' | 'xAxis';
  /** 是否屏蔽键盘方向键的控制映射 */
  disableKeyboard?: boolean;
  /** 全局禁用开关，为 true 时将拦截所有用户交互与内部状态更新 */
  disabled?: boolean;
  /**
   * 组件主色调，仅接受 hex 格式（#RGB 或 #RRGGBB）。
   * 内部通过纯 JS 自动推导高光色、阴影色、轮廓色，
   * 无需手动指定派生色，传入非法值时静默回退到默认灰色。
   * @default '#c5d1da'
   * @example color="#3b82f6"
   * @example color="#f00"
   */
  color?: string;
}
