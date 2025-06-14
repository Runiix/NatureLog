type Animal = {
  category: string;
  colors: string;
  common_name: string;
  created_at: string;
  description: string;
  endangerment_order: number;
  endangerment_status: string;
  habitat: string;
  id: number;
  image_link: string;
  lexicon_link: string;
  population_estimate: string;
  presence_time: string;
  scientific_name: string;
  sexual_dimorphism: string;
  similar_animals: string[];
  size_from: number;
  size_to: number;
  very_rare: boolean
};
export type SpottedAnimal = {
  animal_id: number;
  image: boolean;
  first_spotted_at: string;
};
export default Animal;
