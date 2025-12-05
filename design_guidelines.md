# DeFi Slot Machine - Design Guidelines

## Design Approach: Casino Gaming Psychology + Web3 Aesthetics

**Reference Framework**: Modern online casino slots (Evolution Gaming, Pragmatic Play) merged with Web3 gaming interfaces (Decentral Games, Zed Run) to create an immersive, psychologically optimized gambling experience.

## Core Design Principles

1. **Maximum Visual Stimulation**: Every interaction triggers visual feedback
2. **Anticipation Architecture**: Build tension through progressive reveals
3. **Celebration Amplification**: Wins feel significantly more rewarding than they are
4. **Ambient Engagement**: Subtle animations maintain attention during idle states

## Layout System

**Spacing Foundation**: Tailwind units of 2, 4, 6, and 8 for tight, gaming-optimized layouts

**Viewport Strategy**:
- Single-screen application (100vh) - no scrolling
- Game occupies 70% vertical space
- Controls and info panels: 30%

**Grid Structure**:
```
┌─────────────────────────────┐
│   Header Bar (8vh)          │ Balance, Wallet, Settings
├─────────────────────────────┤
│                             │
│   Slot Machine (62vh)       │ 3x3 reel display
│                             │
├─────────────────────────────┤
│   Control Panel (20vh)      │ Bet controls, Spin button
│   + Liquidity Info          │
└─────────────────────────────┘
```

## Typography

**Font Selection**: 
- Primary: Orbitron (via Google Fonts) - futuristic, tech-forward
- Secondary: Inter - clean UI readability

**Type Scale**:
- Balance/Winnings Display: text-6xl font-bold (60px+)
- Reel Symbols: text-5xl (48px) 
- Bet Amount: text-3xl font-semibold
- Labels/Info: text-sm font-medium
- Footer Stats: text-xs

## Component Specifications

### 1. Slot Machine Reels (Core Game Element)

**Layout**: 3x3 grid with 16px gaps between reels and 8px between symbols
**Reel Container**: Rounded-3xl with thick border, subtle inner shadow for depth
**Symbol Display**: Each symbol in rounded-2xl container with 4px padding
**Dimensions**: Each reel column 160px wide on desktop, 120px mobile

**Symbol Hierarchy**:
- Common symbols: Standard size, minimal effects
- Rare symbols: Pulsing glow effect, slightly enlarged
- Jackpot symbols: Animated sparkle particles, prominent border

### 2. Spin Button (Primary CTA)

**Position**: Center bottom of control panel
**Size**: 160px × 160px circular button
**States**:
- Idle: Gentle breathing animation (scale 1.0 to 1.05)
- Hover: Intensified glow, scale 1.1
- Active/Spinning: Rotation animation, disabled state
- Insufficient Funds: Shake animation, dimmed

**Typography**: "SPIN" in text-2xl font-black

### 3. Header Components

**Wallet Connection**:
- Right-aligned, rounded-full button
- Shows: "0x1234...5678" when connected
- "Connect Wallet" when disconnected

**Balance Display**:
- Left-aligned, prominent positioning
- Format: "1,234.56 ETH" in text-4xl font-bold
- Real-time update animation on change

**Settings Icon**: Far right, subtle icon button (24px)

### 4. Control Panel

**Bet Amount Selector**:
- Horizontal layout with - / display / + buttons
- Display shows: "0.01 ETH" in text-2xl font-semibold
- Increment buttons: 48px × 48px, rounded-lg
- Quick bet buttons: "MIN | x2 | x5 | MAX" as pill buttons below

**Liquidity Pool Stats** (subtle info panel):
- Small cards showing: "Pool Size", "Your Share", "24h Volume"
- text-xs labels, text-lg values
- Grid of 3 columns on desktop, stack on mobile

### 5. Win Celebration Overlay

**Trigger**: On winning combinations
**Layout**: Fullscreen overlay with backdrop blur
**Elements**:
- Center: Win amount in massive text-8xl font-black
- Particle effects radiating from center
- Confetti cannon animation from top
- Pulsing border around winning symbols
- "CLAIM" button to dismiss and credit balance

**Duration**: 3-5 seconds for small wins, 8-12 seconds for jackpots

## Animation Strategy

**Critical Animations** (high psychological impact):

1. **Reel Spin Sequence**:
   - Each reel spins independently with staggered stop times
   - Elastic easing on stop (bounces slightly)
   - Speed: 0.8s per reel with 0.2s delay between reels
   - Near-miss: If 2/3 symbols match, slow final reel dramatically

2. **Anticipation Build**:
   - Symbol pulse on potential win during spin
   - Screen shake on big win potential
   - Progressive sound intensity

3. **Win Feedback**:
   - Instant symbol highlight (0.1s)
   - Border pulse animation (0.3s)
   - Coin cascade from top (1-2s)
   - Value counter incrementing rapidly (0.5-1s)

4. **Idle Engagement**:
   - Subtle symbol shimmer every 3-5 seconds
   - Spin button gentle breathing
   - Background ambient particle drift

**Performance**: Use CSS transforms (translate, scale, rotate) and opacity only. No layout-shifting animations.

## Responsive Strategy

**Desktop (1024px+)**: Full immersive layout as described
**Tablet (768-1023px)**: Reduce reel size to 140px, tighter spacing (4px)
**Mobile (< 768px)**: 
- Stack layout vertically
- Reel columns: 100px wide
- Single-column control panel
- Larger touch targets (56px minimum)

## Asset Requirements

**Icons**: Use Heroicons (CDN) for:
- Wallet icon, Settings gear, Info circles
- Plus/minus for bet controls
- Disconnect icon

**Symbol Graphics**: 
- Use large emoji as placeholders (💎, 🔥, ⚡, 🎰, 💰, 🌟, 🍀, 👑, 🎯)
- Final implementation: Custom SVG symbols (note for later development)
- Size: 64px × 64px minimum for crisp display

## Images

**Background Treatment**:
- Subtle radial gradient emanating from slot machine center
- Particle field background (animated dots/stars) using Canvas API or CSS animation
- No hero image - this is a full-app experience

**Texture Overlays**:
- Subtle noise texture on slot machine body for tactile feel
- Glass morphism effect on control panels (backdrop-filter: blur)

## Accessibility Considerations

- Announce spin results to screen readers
- Keyboard navigation: Space to spin, arrows for bet adjustment
- Reduced motion mode: Disable particle effects, maintain functional animations only
- High contrast mode support for symbol differentiation
- Focus indicators on all interactive elements with 3px outline

## Web3 Integration Preparation

**Wallet States**:
- Disconnected: Prominent "Connect Wallet" messaging
- Connecting: Loading spinner overlay
- Connected: Show balance, address, network indicator
- Wrong Network: Warning banner with switch network button

**Transaction Feedback**:
- Pending spin: Overlay with transaction hash link
- Confirmed: Instant result reveal
- Failed: Error modal with retry option

## Unique Differentiators

1. **Progressive Jackpot Meter**: Top-center animated bar showing pool growth
2. **Recent Winners Ticker**: Bottom scroll showing recent big wins (social proof)
3. **Combo Multipliers**: Visual indicator when consecutive wins increase payout
4. **Provably Fair Badge**: Small indicator linking to blockchain verification

This design creates a dopamine-optimized experience leveraging proven casino psychology while maintaining the transparency and trustless nature of DeFi.