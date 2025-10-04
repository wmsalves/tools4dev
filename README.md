# 🛠️ Tools4Dev

**Tools4Dev** is a web-based collection of useful, open-source utilities designed to assist developers with common daily tasks.

## ✨ Features

- **CPF Generator:** Generate valid Brazilian CPF numbers (formatted or unformatted) for testing purposes.
- **QR Code Generator:** Create QR codes from any text or URL, with customization options for size, margin, and error correction.
- **UUID Generator:** Generate RFC 4122 version 4 UUIDs, with options for uppercase and hyphen removal.
- **Password Generator:** Create secure passwords with customizable rules (length, character sets, etc.) and a strength indicator.
- **Timestamp Converter:** Convert between human-readable local dates and Unix timestamps (in seconds or milliseconds).
- **URL Shortener:** Shorten long URLs using the `cleanuri.com` API.

## ⚙️ Tech Stack

- **Frontend**: Angular (v17+) with TypeScript & Vite.
- **Key Features**:
  - **Standalone Components:** For a more modular and simplified architecture.
  - **Angular Signals:** For granular and reactive state management.
  - **Zoneless Change Detection:** For maximum UI performance.
  - **Server-Side Rendering (SSR):** For faster initial load times and improved SEO.
- **Styling**: SCSS with a custom design token system.

## 🚀 Getting Started

Instructions on how to set up and run the project locally.

### Prerequisites

- Node.js (v18 or newer)
- Angular CLI (v17 or higher)

### Local Setup

1.  Clone the repository:
    ```bash
    git clone [https://github.com/wmsalves/tools4dev.git](https://github.com/wmsalves/tools4dev.git)
    ```
2.  Navigate to the project folder:
    ```bash
    cd tools4dev
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    ng serve
    ```
    The application will be available at `http://localhost:4200`.

## 📜 Available Scripts

- `npm start` or `ng serve`: Starts the development server.
- `npm run build` or `ng build`: Compiles the application for production.
- `npm test` or `ng test`: Runs unit tests via Karma.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new tools, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
