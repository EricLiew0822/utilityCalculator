# House Utility Bill Calculator

> ⚡ **Created with Gemini Antigravity**  
> 🌐 **Live Web Application**: [https://utilitycalculator.netlify.app/](https://utilitycalculator.netlify.app/)  
> 📦 **GitHub Repository**: [https://github.com/EricLiew0822/utilityCalculator](https://github.com/EricLiew0822/utilityCalculator)

---

An integrated utility billing application designed for housemates and shared rental properties. It simplifies complex utility calculations with individual room air-conditioner sub-meters, equitable common area electricity sharing, per-person water bill division, and automatic month-to-month surplus balance carryover reconciliation.

---

## 🌟 Key Features

- **Responsive Modern UI**: Rebuilt with **Bootstrap 5 CDN** for optimal usability across smartphones, tablets, and desktop widescreen displays.
- **Accurate Rate Calculation**: Formulates net electricity unit rates by deducting prior surplus balances and applying the house ceiling rule to prevent under-collection.
- **Sub-Meter AC Tracking**: Calculates exact room air conditioning consumption from previous and current meter readings, split equally across occupants in that room.
- **Common Area Electricity Sharing**: Computes unmetered common usage (total grid kWh minus room sub-meters) and divides costs evenly across all house occupants.
- **Per-Person Water Bill Division**: Splits water utility charges equally across housemates.
- **Financial Reconciliation & Balance Carryover**: Computes collected totals, actual utility payables, and exact surplus balances to deduct before next month's billing.
- **Printable A4 PDF Statement**: Generates an official, print-ready utility invoice statement (`invoice.html`) with customizable columns and one-click PDF printing.
- **Copyable Summary Report**: Instant clipboard copying of formatted calculation breakdowns for house chat groups.
- **Browser Persistence**: Saves entered records locally via `localStorage` so data is preserved across sessions, with prefilled demo data for first-time visitors.
- **One-Click Next Month Roll Forward**: Shifts current meter readings to previous readings, applies the ending surplus deduction, and clears monthly usage inputs for fresh figures.

---

## 🛠️ Tech Stack

- **UI Framework**: [Bootstrap 5.3.3](https://getbootstrap.com/) via CDN & [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/)
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **Frontend Engine**: Pure Vanilla JavaScript with HTML5 `localStorage` persistence
- **Backend & CLI**: Python 3 standard library (`dataclasses`, `math`, `unittest`)
- **Hosting & Serverless**: [Netlify](https://www.netlify.com/) (Continuous Deployment & Python Functions)

---

## 📐 Mathematical Formulation

### 1. Electricity Unit Rate
$$\text{Net Electric Amount} = \max(0, \text{Gross Electric Bill} - \text{Previous Balance Deduction})$$

$$\text{Effective Unit Rate} = \text{ceil}\left(\frac{\text{Net Electric Amount}}{\text{Total Grid Usage (kWh)}}\right)$$

### 2. Room Air Conditioner Cost
$$\text{Room kWh} = \max(0, \text{Current Meter} - \text{Previous Meter})$$

$$\text{Room AC Share / Tenant} = \frac{\text{Room kWh} \times \text{Effective Unit Rate}}{\text{Room Tenant Count}}$$

### 3. Common Area Electricity
$$\text{Common Grid Usage (kWh)} = \max\left(0, \text{Total Grid kWh} - \sum \text{Room kWh}\right)$$

$$\text{Common Electric / Tenant} = \frac{\text{Common Grid Usage} \times \text{Effective Unit Rate}}{\text{Total House Occupants}}$$

### 4. Water Utility Share
$$\text{Water Share / Tenant} = \frac{\text{Total Water Bill}}{\text{Total House Occupants}}$$

### 5. Individual Total & Monthly Carryover
$$\text{Tenant Payable} = \text{Common Electric} + \text{Room AC Share} + \text{Water Share}$$

$$\text{Total Collected} = \sum \text{Round}(\text{Tenant Payable})$$

$$\text{Actual Payable} = \text{Gross Electric Bill} + \text{Total Water Bill}$$

$$\text{Next Month Surplus Carryover} = \max(0, \text{Total Collected} - \text{Actual Payable})$$

---

## 📂 Project Architecture

```
utilityCalculator/
├── netlify.toml                # Netlify deployment and function routing configuration
├── netlify/
│   └── functions/
│       └── calculate.py        # Python serverless backend handler
├── public/                     # Frontend client (served by Netlify)
│   ├── index.html              # Responsive Bootstrap 5 interface & inputs
│   ├── invoice.html            # Standalone printable A4 PDF statement
│   ├── styles.css              # Custom styling overrides & PDF preview
│   ├── app.js                  # Frontend calculation engine, state & PDF generator
│   └── favicon.svg             # Custom application vector icon
├── src_python/
│   ├── calculator.py           # Core Python engine, dataclasses & CLI prompt
│   ├── main.py                 # Interactive terminal runner
│   └── test_calculator.py      # Automated unit test suite
└── README.md
```

---

## 💻 Local Development & Testing

### 1. Run Python Unit Tests
```bash
cd src_python
python3 test_calculator.py
```

### 2. Run Terminal Interactive CLI
```bash
python3 src_python/main.py
```

### 3. Run Local Web Server
Start a local web server to preview the frontend:
```bash
python3 -m http.server 8000 --directory public
```
Visit `http://localhost:8000` in your web browser.

---

## 🚀 Deployment

The project is preconfigured for continuous deployment with **Netlify**.

1. Commit and push updates to the repository `main` branch.
2. Netlify builds the site automatically using settings defined in [`netlify.toml`](file:///Users/ericlsyy/.gemini/antigravity/scratch/bill-calculator/netlify.toml):
   - **Publish Directory**: `public`
   - **Functions Directory**: `netlify/functions`

---

## 📄 License

Open-source under the MIT License.
