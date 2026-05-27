/** 合法 hex 颜色的正则：#RGB / #RRGGBB */
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// ─────────────────────────────────────────────────────
// 解析 / 序列化
// ─────────────────────────────────────────────────────

/** 将 #RGB / #RRGGBB 解析为 RGB 对象，格式非法时返回 null */
export function parseHex(hex: string): RGB | null {
  if (!HEX_RE.test(hex)) return null;
  const h = hex.slice(1);
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16)
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

/** RGB → #RRGGBB */
export function toHex({ r, g, b }: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map(v =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

// ─────────────────────────────────────────────────────
// 混合操作（线性 RGB 空间，感知均匀）
// ─────────────────────────────────────────────────────

/**
 * 将 hex 颜色与白色混合
 * @param hex  输入色
 * @param amount 0 = 纯白，1 = 原色
 */
export function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex({
    r: rgb.r + (255 - rgb.r) * (1 - amount),
    g: rgb.g + (255 - rgb.g) * (1 - amount),
    b: rgb.b + (255 - rgb.b) * (1 - amount)
  });
}

/**
 * 将 hex 颜色与黑色混合
 * @param hex  输入色
 * @param amount 0 = 纯黑，1 = 原色
 */
export function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex({
    r: rgb.r * amount,
    g: rgb.g * amount,
    b: rgb.b * amount
  });
}

// ─────────────────────────────────────────────────────
// 校验
// ─────────────────────────────────────────────────────

/** 判断是否合法 hex 颜色 */
export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex);
}

// ─────────────────────────────────────────────────────
// 推导摇杆整套色调
// ─────────────────────────────────────────────────────

export interface JoystickPalette {
  base: string; // handle 环填充色（主色原值）
  light: string; // 高光面、渐变亮端
  dark: string; // 阴影面、渐变暗端
  rim: string; // knob 内盘亮端
  dot: string; // 四个定位点
}

/**
 * 从单个 hex 主色推导摇杆完整色板。
 * 传入非法值时静默回退到默认灰色方案。
 */
export function deriveJoystickPalette(hex: string): JoystickPalette {
  const fallback = '#c5d1da';
  const base = isValidHex(hex) ? hex : fallback;
  return {
    base,
    light: lighten(base, 0.55),
    dark: darken(base, 0.55),
    rim: lighten(base, 0.75),
    dot: lighten(base, 0.3)
  };
}
