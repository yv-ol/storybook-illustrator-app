# Personalized Storybook Illustrator
Or: *How I Learned to Stop Worrying and Let the Robots Draw*

This project is a web application that uses Google's Gemini and Imagen models to generate unique illustrations for user-written stories. It's a demonstration of how to combine language and image models to create a cohesive, personalized piece of content, like a children's storybook.

## Features

- **Dynamic Story Illustration:** Generate unique images for each page of your story (from 1 to 5 pages).
- **Character Consistency:** Uses prompt engineering techniques to help maintain a consistent character appearance across multiple illustrations—a fun challenge with generative models! Also, not always effective!
- **Multiple Art Styles:** Choose from 9 distinct art styles, from "Watercolor and Ink" to "Bold Line Art," to define the look of your book.
- **"Surprise Me!" Mode:** Feeling uninspired? Let the AI generate a character, a multi-page story, and a random art style for you.
- **PDF Export:** Compile your finished story and illustrations into a downloadable PDF, ready for printing.
- **Secure API Key Handling:** Your Google AI API key is stored exclusively in your browser's `localStorage` and is never sent to any server besides Google's.

## The Tech Stack

This application is built with:

- **Frontend:** React, TypeScript, and Tailwind CSS for a modern, type-safe, and rapidly-styled user interface.
- **Coordinator:** Google AI Studio
- **AI Models:**
  - **Google Gemini 2.5 Flash:** Used for its speed and advanced reasoning. It generates story titles, creates plots for the "Surprise Me!" feature, and performs the crucial "prompt engineering" step.
  - **Google Imagen 3:** The powerful image generation model that brings the story to life, creating illustrations based on the engineered prompts.
- **PDF Generation:** `jspdf` & `html2canvas` work together to convert the DOM elements into a client-side generated PDF.
- **Bundler:** This project uses `esbuild` for a fast and simple build process that bundles all dependencies.

## How It Works: The Generation Pipeline

When you click the "Generate" button, the application kicks off a chain of sequential, client-side API calls:

1.  **Title Generation:** First, Gemini is asked to create a short, catchy title based on the main character and the story you've written.
2.  **Prompt Engineering (The "Secret Sauce"):** For each page, instead of just sending your raw text to the image model, the app first sends it to Gemini. It asks Gemini to act as an expert "prompt engineer," converting your simple story sentence into a detailed, descriptive paragraph that the image model (Imagen) can better understand and illustrate. This helps with detail, composition, and maintaining the art style.
3.  **Image Generation:** The enhanced prompt from the previous step is then sent to Imagen to generate the illustration. This process is repeated for the cover, each story page, and the back cover.
4.  **Assembly:** The generated title and images are displayed in the viewer, ready for you to browse.
5.  **PDF Export:** When you choose to export, the app uses `html2canvas` to take "screenshots" of each formatted page and `jspdf` to assemble them into a final PDF document.

## Getting Started

### Prerequisites

- A modern web browser.
- [Node.js](https://nodejs.org/) installed on your machine.
- A Google AI API key. You can get one for free from [Google AI Studio](https://aistudio.google.com/).

### Running the Application

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/personalized-storybook-illustrator.git
    cd personalized-storybook-illustrator
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build the Project:**
    This command runs `esbuild` to bundle your code into the `dist` folder.
    ```bash
    npm run build
    ```

4.  **Run a Local Web Server:**
    Because the app uses ES Modules (`import`), you can't just open the `index.html` file directly from your file system. It needs to be served by a web server. After building, run one of these commands from the project root:
    
    - **Using `npx serve`:**
      ```bash
      npx serve
      ```
    - **Using Python:**
      ```bash
      # For Python 3
      python -m http.server
      ```

5.  **Enter Your API Key:**
    When you first open the app, it will prompt you for your Google AI API key. Paste it in to continue. The key is stored only in your browser's local storage for future visits.

## About the Author

Cobbled together by Yvette at [yvetteo.com](https://yvetteo.com). This application is a portfolio project, not intended for commercial use.