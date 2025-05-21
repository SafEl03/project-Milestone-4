import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    releaseYear: Number,
    isPopular: Boolean,
    releaseDate: String,
    imageUrl: String,
    genre: String,
    actors: [String],
    director: {
        id: String,
        name: String,
        nationality: String,
        awards: Number,
        imageUrl: String,
    },
});

export const MovieModel = mongoose.model("Movie", movieSchema);
