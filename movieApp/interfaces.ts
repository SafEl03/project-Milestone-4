

export interface FilmCompany {
  id: string;
  name: string;
  foundedYear: number;
  founder: string;
  headquarters: string;
  logoUrl: string;
}


export interface Director {
  id: string;
  name: string;
  description: string;
  age: number;
  isActive: boolean;
  birthDate: string;
  imageUrl: string;
  nationality: string;
  awards: string[];
  notableMovies: string[];
  filmCompany: FilmCompany;
}


export interface Movie {
  id: string;
  name: string;
  description: string;
  releaseYear: number;
  isPopular: boolean;
  releaseDate: string;
  imageUrl: string;
  genre: string;
  actors: string[];
  director: {
    id: string;
    name: string;
    nationality: string;
    awards: number;
    imageUrl: string;
  };
}


export { }