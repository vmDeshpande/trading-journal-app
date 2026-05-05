# 📈 Trading Journal (Local-First)

A fast, fully offline-capable trading journal built for serious traders who want to improve their decision-making—not just track profits.

This app is designed to stay lightweight, private, and focused on journaling rather than becoming a bloated trading dashboard.

---

## 🚀 Features

### 📅 Calendar-Based Journaling

* Interactive monthly calendar
* Click any date to view or log trades
* Color-coded days:

  * 🟢 Profit
  * 🔴 Loss
  * ⚪ No trades
* Clean layout that scales even with multiple trades per day

---

### 🧾 Multiple Trades Per Day

* Add multiple trades for a single date
* Each trade is stored independently
* Daily summary includes:

  * Total trades
  * Net P&L
  * Win rate

---

### 📝 Trade Entry (Modal UI)

Each trade includes:

* Index / Symbol (SPY, QQQ, etc.)
* Direction (BUY / SELL)
* Entry Price
* Exit Price
* Auto-calculated P&L
* Execution Quality (1–10 scale)
* Notes (optional)
* Image uploads (chart screenshots)

Real-time validation and live P&L calculation while entering values.

---

### 📸 Image Upload (Fully Local)

* Attach multiple images to each trade
* Drag & drop or file upload
* Stored locally using IndexedDB
* Preview thumbnails + full-screen view
* No cloud or external storage

---

### 📊 Simple Analytics (Journal-Focused)

* Weekly P&L
* Monthly P&L
* Win/Loss ratio
* Average trade
* Pie charts for profit vs loss distribution

All analytics are computed from actual trades (not per-day assumptions).

---

### 💾 100% Local Storage

* IndexedDB (primary storage)
* localStorage fallback
* No backend, no APIs
* Works completely offline

👉 Your data never leaves your device.

---

### 📥 Export to Excel

* Export all trades into `.xlsx`
* Includes:

  * Trade data
  * Weekly summary
  * Monthly summary
* Clean format for further analysis

---

## 🧠 Philosophy

This is a **journal**, not a trading platform.

It focuses on:

* What you did
* Why you did it
* Whether you followed your rules

Not on overcomplicated dashboards or predictions.

---

## 🛠 Tech Stack

* **Framework**: Next.js (App Router)
* **UI**: Tailwind CSS + shadcn/ui
* **Storage**: IndexedDB (idb)
* **Charts**: Recharts
* **Export**: xlsx
* **Icons**: Lucide

---

## 📂 Project Structure

```
/app
/components
/hooks
/lib
/public
/styles
```

---

## ⚙️ Getting Started

```bash
pnpm install
pnpm dev
```

Open:

```
http://localhost:3000
```

---

## 💡 Usage Tips

* Log trades immediately after execution
* Be honest with execution quality (1–10)
* Use notes to capture reasoning
* Attach chart screenshots for review
* Review weekly to identify patterns

---

## 🔒 Privacy

* No server
* No tracking
* No analytics
* No data collection

Everything runs locally in your browser.

---

## ⚠️ Notes

* Clearing browser data will delete journal entries
* Export regularly to keep backups

---

## 📌 Future Improvements

* Strategy tagging
* Mistake tracking
* Psychology logging
* Trade filtering

---

## ❤️ Built For Traders

Simple. Fast. Private.

Track → Reflect → Improve.
