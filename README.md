# MGNREGA District Performance Dashboard – Manipur

A full MERN stack dashboard to visualize MGNREGA performance across districts of Manipur.

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Recharts
- Backend: Node.js + Express.js + MongoDB
- Data Source: data.gov.in MGNREGA datasets (API key via .env)
- Scheduler: node-cron (auto data refresh)
- Deploy: Render

## Project Structure
```
.
├── backend
│   ├── package.json
│   ├── .env.example
│   └── src
│       ├── index.js
│       ├── utils
│       │   ├── db.js
│       │   └── scheduler.js
│       ├── services
│       │   └── mgnregaService.js
│       ├── models
│       │   └── DistrictData.js
│       ├── controllers
│       │   └── dataController.js
│       └── routes
│           └── dataRoutes.js
├── frontend
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles
│       │   └── globals.css
│       ├── api
│       │   └── client.js
│       ├── components
│       │   ├── MetricCard.jsx
│       │   └── TrendChart.jsx
│       └── pages
│           ├── Home.jsx
│           └── Dashboard.jsx
├── render.yaml
└── .gitignore
```

## Prerequisites
- Node.js 18+
- MongoDB (local or a cloud instance like MongoDB Atlas)
- data.gov.in API key

## Environment Variables
Create `backend/.env` from the example:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mgnrega_manipur
ALLOWED_ORIGIN=http://localhost:5173
DATA_GOV_API_KEY=YOUR_DATA_GOV_IN_API_KEY
# Resource IDs from data.gov.in (example placeholders; replace with valid ones)
DATA_GOV_DISTRICTS_RESOURCE_ID=YOUR_DISTRICTS_RESOURCE_ID
DATA_GOV_METRICS_RESOURCE_ID=YOUR_METRICS_RESOURCE_ID
```

Create `frontend/.env` from the example:
```
VITE_API_BASE_URL=http://localhost:5000
```

## Install and Run (Local)
In two terminals:

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Render Deployment
- The repository includes `render.yaml` with two services: backend (Node) and frontend (static build served by Render).
- Configure environment variables in Render dashboard for the backend service.

## Notes on data.gov.in
- The service expects resource IDs for districts and metrics datasets and uses filters for `state_name=MANIPUR`.
- Replace the example resource IDs in `backend/.env` with the actual dataset resource IDs you plan to use.
- Endpoints used by the frontend:
  - `GET /api/districts`
  - `GET /api/data/:district`

## License
MIT