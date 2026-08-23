# Integrated Electricity & Water Bill Calculator

An integrated electricity and water bill splitting calculator designed for housemates / rental sharing with room air-conditioner sub-meters, common area consumption sharing, and automated month-to-month balance carryover.

Built with **Python core logic** and hosted as a modern responsive web app ready for **Netlify**.

---

## ⚡ Mathematical Model & Features

1. **Unit Rate Formulation**:
   $$\text{Rate} = \text{ceil}\left(\frac{\text{Electric Bill} - \text{Previous Balance Deduction}}{\text{Total Grid kWh}}\right)$$
   *(e.g., $(157.15 - 2.42) / 477 = 0.3244 \approx \text{RM } 0.33/\text{kWh}$)*
2. **Room AC Sub-metering**:
   $$\text{Room AC Cost} = (\text{Curr Meter} - \text{Prev Meter}) \times \text{Rate}$$
   Split equally among the occupants of the room.
3. **Common Area Usage**:
   $$\text{Common kWh} = \text{Total Grid kWh} - \sum \text{Room kWh}$$
   $$\text{Common Cost / Person} = \frac{\text{Common kWh} \times \text{Rate}}{\text{Total Headcount}}$$
4. **Water Bill Sharing**:
   $$\text{Water Cost / Person} = \frac{\text{Total Water Bill}}{\text{Total Headcount}}$$
5. **Reconciliation & Carryover**:
   $$\text{Next Month Balance} = \text{Total Collected} - (\text{Electric Bill} + \text{Water Bill})$$
   Automatically applied to next month's bill calculation!
6. **One-Click WhatsApp Report**: Generates the exact formatted WhatsApp message to copy and send to house group chats.

---

## 📁 Project Structure

```
bill-calculator/
├── netlify.toml                # Netlify build configuration
├── netlify/
│   └── functions/
│       └── calculate.py        # Python serverless function handler
├── public/                     # Static Web App (served by Netlify)
│   ├── index.html              # Modern responsive UI
│   ├── styles.css              # Custom styling, typography & cards
│   └── app.js                  # Dynamic room builder, math engine & storage
├── src_python/
│   ├── calculator.py           # Core Python engine & dataclasses
│   └── test_calculator.py      # Unit tests
└── README.md
```

---

## 🚀 Running & Testing

### 1. Run Python Unit Tests
```bash
cd src_python
python3 test_calculator.py
```

### 2. Run Local Web Server
You can preview the frontend locally with Python's built-in HTTP server:
```bash
python3 -m http.server 8000 --directory public
```
Then open `http://localhost:8000` in your browser.

---

## 🌐 Deploying to Netlify

### Option 1: Netlify CLI (Fastest)
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

### Option 2: Git Repository (Continuous Deployment)
1. Push this directory to your GitHub / GitLab repository.
2. Log in to [Netlify](https://app.netlify.com).
3. Click **"Add new site" -> "Import an existing project"**.
4. Netlify will automatically detect `netlify.toml` with:
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`
5. Click **Deploy Site**.
