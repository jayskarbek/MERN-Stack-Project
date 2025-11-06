# Flutter Mobile Client

This directory contains the Flutter application that mirrors the existing web
experience while targeting Android/iOS (and optionally web/desktop).

The app consumes the current Express API (`backend/server.js`) without changing
any behaviour in the web frontend.

## 1. Prerequisites
- Install Flutter (3.24+). Follow the official guide:
  https://docs.flutter.dev/get-started/install
- Ensure `flutter` and `dart` are on your `PATH` and verify with:
  ```bash
  flutter --version
  flutter doctor
  ```
- Node/Express backend running locally on `http://localhost:5000`, or update the
  `.env` file with the deployed base URL.
- Optional: Android SDK / Xcode tooling for device builds (`flutter doctor`
  will flag anything missing).

## 2. Project Layout
```
mobile/
├── README.md
└── app/
    ├── lib/
    │   ├── app.dart                  # MaterialApp + routing
    │   ├── main.dart                 # Bootstraps providers & dotenv
    │   ├── controllers/              # ChangeNotifiers for auth & parks
    │   ├── models/                   # Dart models for API responses
    │   ├── services/                 # API client & repositories
    │   └── features/
    │       ├── auth/                 # Login/Register screens
    │       └── parks/                # Park list & details screens
    ├── pubspec.yaml                  # Dependencies (http, provider, dotenv…)
    ├── analysis_options.yaml         # Static analysis configuration
    └── .env.example                  # Sample API base URL
```

## 3. Configure Environment
- Copy `.env.example` to `.env` inside `mobile/app/` and set:
  ```
  API_BASE_URL=http://localhost:5000/api
  ```
  Use the deployed backend URL when testing against remote infrastructure.
- `flutter_dotenv` loads this file on app start; if `.env` is missing it falls
  back to `.env.example`.

## 4. Install Dependencies & Run
From the repo root:
```bash
cd mobile/app
# One-time scaffolding for native platform folders (safe to re-run)
flutter create . --platforms=android,ios,web
flutter pub get
flutter run                  # chooses an attached emulator/device
# or for web testing
flutter run -d chrome
```

The app automatically wires up:
- login/registration flows using the existing `/api/login` & `/api/register`
  routes.
- park listing & detail screens with live ratings and review submission.
- Provider-backed state management to share auth tokens with the HTTP client.

## 5. Development Notes
- Controllers live in `lib/controllers/` and can be extended for features like
  favourites or offline caching.
- `ParksController` caches parks & reviews in memory; call
  `loadParks(forceRefresh: true)` when the backend data changes.
- Replace the placeholder UI elements gradually with production-ready designs.
- Add widget / integration tests under `test/` or `integration_test/` once the
  flows stabilise.

Keep this doc in sync as mobile work continues.
