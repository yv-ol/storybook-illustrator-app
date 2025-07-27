export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl: string;
}

export interface BookCover {
  title: string;
  imageUrl: string;
}

export type ArtStyle = "Watercolor and Ink" | "Children's Crayon Drawing" | "Vibrant Digital Art" | "Soft Pastel" | "Classic Pen and Ink" | "Whimsical Gouache" | "Bold Line Art" | "Nostalgic Tones" | "Mixed Media Collage";

export interface SurpriseContent {
    character: string;
    story: string[];
}