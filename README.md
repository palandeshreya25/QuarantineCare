# Quarantine Centre Tracker

Simple web app for a 74-bed virus quarantine & treatment centre.

- **Nurse** – daily temperature checklist (no missed or duplicate readings)
- **Doctor** – patients ready to visit (temperature already taken), 7-day fever history, notes, record death
- **Admin** – automatic discharge queue (3 full fever-free days), admit patients to free beds
- **Stats** – mortality vs 15% benchmark, success rate vs 85%, daily completion, excess patient-days

## Run
Open `index.html` in a browser. No build step.

## Host on GitHub Pages
Push to GitHub → Settings → Pages → Deploy from branch `main` / root.

## Rules (edit in `app.js`)
- Fever threshold: `TH = 38.0` °C
- Capacity: `CAP = 74`
- A fever-free day requires a recorded reading below the threshold; a missed day breaks the streak.

## Limitations
Data is stored in each browser's localStorage (demo data is seeded on first load). A shared backend and logins are needed before real multi-user use.
