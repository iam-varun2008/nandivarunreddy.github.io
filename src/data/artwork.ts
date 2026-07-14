export type Artwork = {
  id: string;
  title: string;
  image: string;
  alt: string;
  completionTime: string;
  medium: string;
  description?: string;
  available: boolean;
};

export const artworkIntro =
  "Outside technology, I create realistic graphite portraits. Each artwork requires patience, close observation and attention to small details. This practice has strengthened the same concentration and precision that I apply to programming and cybersecurity.";

export const artworks: Artwork[] = [
  {
    id: "portrait-1",
    title: "Graphite Portrait 01 — title to be added",
    image: "art/portrait-1.webp",
    alt: "Varun Reddy's first realistic graphite portrait",
    completionTime: "To be added",
    medium: "Graphite pencil",
    available: false
  },
  {
    id: "portrait-2",
    title: "Graphite Portrait 02 — title to be added",
    image: "art/portrait-2.webp",
    alt: "Varun Reddy's second realistic graphite portrait",
    completionTime: "To be added",
    medium: "Graphite pencil",
    available: false
  },
  {
    id: "portrait-3",
    title: "Graphite Portrait 03 — title to be added",
    image: "art/portrait-3.webp",
    alt: "Varun Reddy's third realistic graphite portrait",
    completionTime: "To be added",
    medium: "Graphite pencil",
    available: false
  }
];
