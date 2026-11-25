# Component Guidelines & React Native Mapping: Balaji Fresh
**Stitch Project ID:** `8350282291516773685`  
**Platform:** Expo React Native (iOS & Android)

---

## 1. Web to React Native Primitive Mapping

Stitch designs are generated as HTML/CSS prototypes with Tailwind tokens. When translating into production React Native code, the following mapping rules apply:

| Web / Stitch Element | React Native Component | Usage & Best Practices |
|:---|:---|:---|
| `<div class="flex flex-col">` | `<View style={styles.container}>` | `flexDirection: 'column'` is default in React Native. Use `gap` or margins. |
| `<header>` / `<nav>` / `<section>` | `<View>` / `<SafeAreaView>` | Use `react-native-safe-area-context` for notch and home indicator clearance. |
| `<main class="overflow-y-auto">` | `<ScrollView>` or `<FlatList>` | Use `FlatList` with `keyExtractor` for produce catalogs, `ScrollView` for forms/details. |
| `<h1>`, `<h2>`, `<p>`, `<span>` | `<Text style={styles.text}>` | All text must be wrapped inside `<Text>`. No bare text strings inside `<View>`. |
| `<button>`, `<a href="#">` | `<Pressable style={({ pressed }) => ...}>` | Use `Pressable` for tactile feedback (`transform: [{ scale: 0.98 }]`). Never use web `<a>`. |
| `<input type="text">` | `<TextInput placeholderTextColor={...}>` | Specify `keyboardType`, `returnKeyType`, and `autoCapitalize="none"`. |
| `<img src="..." alt="...">` | `<Image source={{ uri }} resizeMode="cover">` | Provide fallback placeholder backgrounds while remote images load. |
| Material Symbols icon fonts | `@expo/vector-icons` (`MaterialIcons`) | Use vector icons directly; ensure `size` and `color` props are explicitly passed. |
| CSS Drop Shadows | `Platform.select({ ios: { shadowColor, ... }, android: { elevation } })` | Centralized in `src/theme/shadows.ts`. |
| Sticky CSS Headers/Footers | `<View style={styles.stickyBar}>` outside `<ScrollView>` | Pin absolute or sibling views outside the scrollable area. |

---

## 2. Component Hierarchy & Atomic Architecture

```
src/components/
├── ui/                                # Atomic UI Primitives (Design System)
│   ├── Button.tsx                     # Primary, Secondary, Outline, Ghost
│   ├── Badge.tsx                      # Deal, Fresh, Harvest, Success, Neutral
│   ├── Card.tsx                       # Surface container with 4 shadow levels
│   └── Input.tsx                      # Form text field with error & icon slots
└── common/                            # Composite Molecules & Organisms
    ├── HeaderBar.tsx                  # Top bar (Location + Slot ticker + Avatar)
    ├── QuantityStepper.tsx            # (- count +) stepper with 48px touch targets
    ├── WeightPillSelector.tsx         # Horizontal portion toggle chips
    ├── DeliveryThresholdBar.tsx       # Progress bar for free delivery
    ├── MandiTrustPledge.tsx           # 3-pillar freshness assurance card
    ├── ProductCard.tsx                # 1:1 produce card with dynamic stepper
    ├── DeliverySlotCard.tsx           # Selectable morning/evening shift card
    ├── DeliveryPartnerCard.tsx        # Driver Ramesh Kumar card with call/chat
    ├── StepProgressTracker.tsx        # 4-stage vertical delivery stepper
    └── BillSummaryCard.tsx            # Transparent Mandi price & savings summary
```

---

## 3. Component Specifications & Props

### A. Atomic UI Components (`src/components/ui/`)

#### 1. `Button`
- **Purpose:** Primary calls-to-action ("Add to Basket", "Get OTP", "Place Order").
- **Props:**
  ```typescript
  interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  }
  ```
- **States:** Default, Pressed (scale 0.98, opacity 0.88), Disabled (`#E7E9E4` fill, `#707A6C` text), Loading (`ActivityIndicator`).
- **Touch Target:** Guaranteed minimum height of 48px (52px for primary checkout actions).

#### 2. `Badge`
- **Purpose:** Daily mandi rate indicators, discount pills, status tags.
- **Props:**
  ```typescript
  interface BadgeProps {
    label: string;
    variant?: 'deal' | 'fresh' | 'harvest' | 'neutral' | 'success';
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  }
  ```
- **Styling:** Fully rounded pill (`Radius.full`), uppercase bold typography (`labelSm`), subtle internal padding (8px horizontal, 2px vertical).

#### 3. `Card`
- **Purpose:** Base elevated white container for items, delivery information, and bill summaries.
- **Props:**
  ```typescript
  interface CardProps {
    children: React.ReactNode;
    elevation?: 'level0' | 'level1' | 'level2' | 'level3';
    style?: StyleProp<ViewStyle>;
  }
  ```
- **Styling:** `#FFFFFF` background, 16px corner radius (`Radius.xl`), 1px hairline border (`#E7E9E4`).

#### 4. `Input`
- **Purpose:** Phone number entry, address inputs, search bars.
- **Props:**
  ```typescript
  interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
  }
  ```
- **Styling:** 52px height, 12px corner radius, `#F2F4EF` resting background, `#BA1A1A` border on error state.

---

### B. Common Grocery Components (`src/components/common/`)

#### 1. `HeaderBar`
- **Location:** Sticky top on all primary tabs.
- **Composition:**
  - Balaji Fresh leaf logo badge (`#A3F69C` background).
  - Location chip with down-arrow (`Sector 14, Gurugram`).
  - Circular profile avatar.
  - Sub-banner ticker: "🌅 Next Delivery: Tomorrow 8:00 AM - 12:00 PM | EARLY FRESH".
- **Safe Area:** Automatically offsets by `insets.top`.

#### 2. `ProductCard`
- **Layout:**
  - 1:1 Aspect ratio image container with 16px border radius.
  - Floating top-left badge: "TODAY'S RATE" (`#FFDDB8` amber fill).
  - Produce title: English name bold (`Fresh Hybrid Tomatoes`).
  - Subtitle: Hindi/Gujarati regional name (`Tamatar (ટામેટા)`).
  - Price row: Rupee bold price (`₹38`) + strikethrough MRP (`₹45`) + unit (`/kg`).
  - Weight selector row: 3-4 horizontal pill chips (`250g`, `500g`, `1kg`).
  - Action button: Full-width green "ADD" button that transforms into a 3-part stepper (`-`, `1`, `+`) upon selection.

#### 3. `QuantityStepper`
- **Dimensions:** 32px button width/height with 44px minimum tap hit area.
- **Styling:** Left button `-` in white, center count in slate bold (`#191C1A`), right button `+` in leaf green (`#0D631B`).
- **Interaction:** Haptic click feedback on increment and decrement.

#### 4. `DeliveryThresholdBar`
- **Logic:** Tracks current basket total against ₹249 free delivery threshold.
- **Unlocked State:** Green banner with confetti emoji (`🎉 You have unlocked FREE Delivery!`).
- **In-Progress State:** Shows remaining amount (e.g. *Add ₹69 more for Free Morning Delivery*) with smooth green progress fill.

#### 5. `MandiTrustPledge`
- **Structure:** 3 horizontal micro-cards:
  - "Zero Cold Storage" (Mandi to kitchen).
  - "Direct Wholesale" (Fair farmer rates).
  - "Tare-Weighed" (Digital scale doorstep check).

#### 6. `DeliveryPartnerCard`
- **Structure:**
  - Driver portrait avatar (Ramesh Kumar).
  - Verified mandi partner badge + 4.9 rating pill.
  - Van registration number (`HR 26 EA 4022`).
  - 2 Action buttons: "Call Partner" and "WhatsApp Support".

---

## 4. Performance & 60fps Guidelines

1. **FlatList Optimization:**
   - Always supply `getItemLayout` for fixed-height item rows to eliminate measurement overhead.
   - Set `initialNumToRender={6}` and `maxToRenderPerBatch={8}` for catalog lists.
   - Use `windowSize={5}` to conserve memory on budget Android hardware.
2. **Memoization:**
   - Wrap `ProductCard` and `WeightPill` in `React.memo` with custom comparator to prevent re-rendering untouched produce cards when one card changes quantity.
3. **Image Caching & Placeholders:**
   - Use a lightweight neutral background (`#F2F4EF`) on image containers while remote images load to eliminate layout shifts.
4. **Haptic & Touch Responsiveness:**
   - Use native driver for animations (`useNativeDriver: true`).
   - Use `Pressable` with `hitSlop={8}` on small buttons to ensure 100% first-tap accuracy.
