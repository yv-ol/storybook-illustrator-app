
# Personalized Storybook Illustrator

This project is a web application that uses Google's Gemini and Imagen models to generate unique illustrations for user-written stories. It's a demonstration of how to combine language and image models to create a cohesive, personalized piece of content, like a children's storybook.

## See it in Action
- [Vercel Deployment](https://storybook-illustrator-4jo1ywlmb-yv-os-projects.vercel.app)
- [Demo](https://youtu.be/YiOz1zq--eg)

## Features

- **Dynamic Story Illustration:** Generate unique images for each page of your story (from 1 to 5 pages).
- **Character Consistency:** Uses prompt engineering techniques to help maintain a consistent character appearance across multiple illustrations: a fun (and not always rewarding) challenge with generative models.
- **Multiple Art Styles:** Choose from 9 distinct art styles, from "Watercolor and Ink" to "Bold Line Art," to define the look of your book.
- **"Surprise Me!" Mode:** Feeling uninspired? Let the AI generate a character, a multi-page story, and a random art style for you.
- **PDF Export:** Compile your finished story and illustrations into a downloadable PDF, ready for printing.
- **Secure API Key Handling:** Your Google AI API key is stored exclusively in your browser's `localStorage` and is never sent to any server besides Google's.

## How it Works

This application uses a multi-step AI orchestration process, where different models are used for the tasks they excel at:

1.  **User Input:** You provide the creative foundation: an art style, a main character description, and the text for each page of the story. Or, if you used the *Surprise Me!* button, Gemini would've done this for you.
2.  **Title Generation (Gemini):** The app sends the character description and story text to the `gemini-2.5-flash` model to brainstorm a short, catchy title for the book.
3.  **Prompt Engineering (Gemini):** This is the most crucial step. For each image (cover and pages), the app does not send your raw text to the image model. Instead, it asks `gemini-2.5-flash` to act as an "expert prompt engineer." It gives Gemini the art style, character description, and page text, and instructs it to create a new, highly detailed prompt optimized for a text-to-image AI. This ensures the illustrations are rich, consistent, and adhere to the chosen style.
4.  **Image Generation (Imagen):** The detailed prompt created by Gemini is then sent to the `imagen-3.0-generate-002` model, which generates the beautiful, high-quality illustration.
5.  **Iteration:** This prompt engineering and image generation cycle repeats for the cover, each story page, and the back cover, creating a complete, illustrated book.

## The Tech Stack

This application is built with:

- **Frontend:** React, TypeScript, and Tailwind CSS for a modern, type-safe, and rapidly-styled user interface.
- **Coordinator:** [Google AI Studio](https://aistudio.google.com/), in all its knowledgeable, stubborn, and overcorrecting glory.
- **AI Models:**
  - **Google Gemini 2.5 Flash:** The workhorse for all language tasks: generating titles, creating plots for the "Surprise Me!" feature, and performing the crucial "prompt engineering" step.
  - **Google Imagen 3:** The powerful image generation model that brings the story to life, creating illustrations based on the engineered prompts.
- **PDF Generation:** `jspdf` & `html2canvas` work together to convert the DOM elements into a client-side generated PDF.
- **Bundler:** This project uses `esbuild` for a fast and simple build process that bundles all dependencies.

## Getting Started

### Prerequisites

- A modern web browser.
- [Node.js](https://nodejs.org/) and npm installed on your machine.
- A Google AI API key. You can get one for free from [Google AI Studio](https://aistudio.google.com/) if you're using this ON Google AI Studio. If not, you have to get an API key with billing enabled to generate images via Imagen, which kinda sucks.

### Running the Application

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/personalized-storybook-illustrator.git
    cd personalized-storybook-illustrator
    ```

2.  **Install Dependencies:**
    Open your terminal in the project directory and run:
    ```bash
    npm install
    ```

3.  **Build the Project:**
    This command runs `esbuild` to bundle your TypeScript/React code into a single JavaScript file in the `dist/` folder.
    ```bash
    npm run build
    ```

4.  **Run a Local Web Server:**
    Because the app uses modern JavaScript modules, you can't just open `index.html` directly in your browser. It needs to be served by a local server. After building, run one of these commands from the project root:
    
    - **Using `npx serve` (Recommended):**
      ```bash
      npx serve
      ```
    - **Using Python 3:**
      ```bash
      python -m http.server
      ```

5.  **Enter Your API Key:**
    Open the URL provided by your local server (e.g., `http://localhost:3000`). The app will prompt you for your Google AI API key. Paste it in to continue. The key is stored only in your browser's local storage for future visits.

## About the Author

Cobbled together by Yvette at [yvetteo.com](https://yvetteo.com) via Google AI Studio. This application is a portfolio project, not intended for commercial use.
