# Planning Guide

A shared credit card expense tracker that helps manage personal vs. household spending, tracks cash deposits from parents, and calculates settlement balances.

**Experience Qualities**:
1. **Clear** - Immediately show the current balance state and what's owed without confusion
2. **Efficient** - Quick transaction entry with minimal taps to log expenses or deposits
3. **Trustworthy** - Accurate calculations and persistent records that both parties can rely on

**Complexity Level**: Light Application (multiple features with basic state)
  - Manages transactions with categorization, running balances, and settlement tracking across multiple views

## Essential Features

### Transaction Logging
- **Functionality**: Record expenses as either "Personal" or "Household" with amount, description, and date
- **Purpose**: Maintain accurate records of all credit card usage to calculate proper settlements
- **Trigger**: User taps "Add Expense" button
- **Progression**: Select category (Personal/Household) → Enter amount → Add description → Save → Updates balance display
- **Success criteria**: Transaction appears in list, balance calculations update correctly

### Cash Deposit Tracking
- **Functionality**: Log when parents deposit cash to cover household expenses
- **Purpose**: Track incoming cash to offset household spending obligations
- **Trigger**: User taps "Add Deposit" button
- **Progression**: Enter deposit amount → Add optional note → Save → Updates owed balance
- **Success criteria**: Deposit recorded, household balance reduced appropriately

### Balance Dashboard
- **Functionality**: Display current state: total household expenses, total deposits received, net amount owed to/from parents
- **Purpose**: Provide instant clarity on financial position without manual calculation
- **Trigger**: App launch or any transaction update
- **Progression**: Auto-calculates on load → Shows three key numbers (household spent, deposits received, balance) → Color-codes status
- **Success criteria**: Math is accurate, updates in real-time, visually distinguishes positive/negative balances

### Transaction History
- **Functionality**: Scrollable list of all transactions with filtering by type (All/Personal/Household/Deposits)
- **Purpose**: Provide transparency and ability to review past activity
- **Trigger**: Available on main screen below dashboard
- **Progression**: View list → Filter by type → Tap transaction to view details → Option to delete if needed
- **Success criteria**: All transactions visible, filters work correctly, deletion updates balances

## Edge Case Handling

- **Empty State**: Show helpful onboarding message when no transactions exist yet
- **Negative Deposits**: Prevent entry of negative amounts with validation
- **Accidental Entries**: Allow deletion of transactions with confirmation dialog
- **Large Numbers**: Format currency properly with commas for readability
- **Quick Entry**: Auto-focus amount field when adding transaction for speed

## Design Direction

The design should feel trustworthy and straightforward like a banking app, with clear numerical hierarchy and calming colors that reduce financial anxiety, favoring a minimal interface where numbers take center stage.

## Color Selection

Analogous scheme using cool blues and greens to evoke trust, stability, and financial confidence.

- **Primary Color**: Deep Blue (oklch(0.45 0.12 250)) - Conveys trust and financial stability, used for primary actions
- **Secondary Colors**: Slate Gray (oklch(0.65 0.02 250)) - Supporting neutral for less prominent UI elements
- **Accent Color**: Emerald Green (oklch(0.65 0.15 155)) - Positive financial actions and balances (deposits, you're owed money)
- **Destructive**: Warm Red (oklch(0.55 0.22 25)) - Personal expenses and negative balances (you owe money)

**Foreground/Background Pairings**:
- Background (White oklch(0.99 0 0)): Foreground oklch(0.25 0.02 250) - Ratio 11.8:1 ✓
- Card (Light Blue oklch(0.97 0.01 250)): Foreground oklch(0.25 0.02 250) - Ratio 11.2:1 ✓
- Primary (Deep Blue oklch(0.45 0.12 250)): White oklch(0.99 0 0) - Ratio 7.1:1 ✓
- Secondary (Slate oklch(0.65 0.02 250)): Foreground oklch(0.25 0.02 250) - Ratio 4.6:1 ✓
- Accent (Emerald oklch(0.65 0.15 155)): White oklch(0.99 0 0) - Ratio 4.9:1 ✓
- Destructive (Red oklch(0.55 0.22 25)): White oklch(0.99 0 0) - Ratio 5.2:1 ✓

## Font Selection

Clean, numerical-friendly sans-serif that ensures numbers are easily scannable and distinguishable, using Inter for its excellent tabular figure support.

- **Typographic Hierarchy**:
  - H1 (Balance Amount): Inter Bold / 48px / Tabular nums / Tight spacing
  - H2 (Section Headers): Inter Semibold / 20px / Normal spacing
  - H3 (Transaction Amount): Inter Semibold / 18px / Tabular nums
  - Body (Descriptions): Inter Regular / 15px / Relaxed line-height (1.6)
  - Caption (Dates, Labels): Inter Medium / 13px / Muted color

## Animations

Subtle and purposeful - primarily smooth number transitions when balances update and gentle slide-ins for new transactions, avoiding anything that delays financial clarity.

- **Purposeful Meaning**: Number changes animate to draw attention to balance updates, reinforcing that the action was recorded
- **Hierarchy of Movement**: Balance cards get subtle scale feedback on update (most important), transaction list items fade in on add (secondary)

## Component Selection

- **Components**:
  - Card: Balance dashboard sections with subtle shadows
  - Button: Primary actions (Add Expense/Deposit) with distinct visual weight
  - Dialog: Transaction entry forms with focused input flow
  - Badge: Category indicators (Personal/Household/Deposit) with color coding
  - ScrollArea: Transaction history list
  - Separator: Visual breaks between sections
  - Select: Category picker for filtering
  
- **Customizations**:
  - Custom balance card with large typography and color-coded backgrounds
  - Transaction list items with left accent border indicating type
  
- **States**:
  - Buttons: Disabled when form incomplete, loading state during save
  - Inputs: Error state for invalid amounts, focus state with primary color ring
  - Cards: Hover state shows subtle elevation increase
  
- **Icon Selection**:
  - Plus (Add transaction)
  - ArrowDown (Deposit received)
  - House (Household expense)
  - User (Personal expense)
  - Trash (Delete transaction)
  - Funnel (Filter)
  
- **Spacing**: Generous padding (p-6) on cards for breathing room, consistent gap-4 in forms, gap-3 in lists
- **Mobile**: Single column layout, full-width cards, sticky balance header on scroll, bottom sheet for transaction entry on mobile
