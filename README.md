# 🎼 SKRID (Client)

SKRID Platform is a web-based interface for querying and exploring musical patterns stored in a graph database.
This repository contains only the **client** side (vueJS) of the platform.

The **backend** (query compilation, result processing, etc.) is maintained in a separate repository:
➡️ [SKRID Backend Repository](https://gitlab.inria.fr/skrid/backend)

The **frontend** (connecting the client and the backend) is maintained in a separate repository:
➡️ [SKRID Frontend Repository](https://gitlab.inria.fr/skrid/frontend)

---

## ✨ Features
- Interface for melodic and rhythmic search via interactive piano interface input
- Flexible contour search
- Display of musical score collection
- Score result details with note hover tooltips, including optional membership function degrees when provided by the API
- Communication with a Python backend via REST endpoints (through the frontend server)

---

## 📁 Code Structure
```
.
├── public/          # Images and sounds
│
└── src/
    ├── assets/
    ├── components/
    │   ├── common/  # Main components (keyboard, stave, ...)
    │   └── layout/  # Header, footer
    ├── constants/
    ├── lib/
    ├── router/
    ├── services/
    ├── stores/
    ├── types/       # Type definitions
    ├── views/       # Definition of the pages
    │
    ├── App.vue
    ├── shims-vue.d.ts
    └── main.ts
```

---

## 🚀 Getting Started (development setup)
The following instructions are to run the development server only.

To deploy in production, see the [frontend's README](https://gitlab.inria.fr/skrid/frontend/-/blob/main/README.md).

### 1. Clone the repository
```bash
git clone https://gitlab.inria.fr/skrid/client.git
cd client/
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create the `.env` file
Copy the example `.env` file and adjust the values:
```bash
cp .env.example .env
```

### 4. Start the vue server (for development)
```bash
npm run dev
```

Then visit `http://localhost:5173` in your browser.

---

## 🐞 Backend and Frontend Dependencies
This client communicates with the frontend API calls. The frontend must be installed and running separately.

Note that the frontend itself depends on the backend.

By default, the client expects the frontend to be available at `http://localhost:3000`.

<!-- TODO: where can the URL and port can be configured? -->
<!-- > Endpoint URLs and port can be configured in `index.js` -->

---

## 💡 Development Notes
- If you modify `index.js`, restart the server to apply changes.

For database setup and ingestion scripts, see the backend project.

- cors package was install for develloppement, don't need in production. need cors to allow vue dev server to connect to frontend server

### Recommended IDE Setup
[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Type Support for `.vue` Imports in TS
TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Customize configuration
See [Vite Configuration Reference](https://vite.dev/config/).

### Project Setup
#### Compile and Hot-Reload for Development
```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production
```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)
```sh
npm run lint
```

---

## 🖊️ Roadmap, Known Bugs & Tasks
See [TODO.md](TODO.md) for planned features and known issues.

---

## License
This project is distributed under the MIT License.  
See [LICENSE](./LICENSE) for details.  
(Copyright © 2023–2025 IRISA)
