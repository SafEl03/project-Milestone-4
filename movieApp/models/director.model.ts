import mongoose from "mongoose";

const directorSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    age: Number,
    isActive: Boolean,
    birthDate: String,
    imageUrl: String,
    nationality: String,
    awards: [String],
    notableMovies: [String],
    filmCompany: {
        id: String,
        name: String,
        foundedYear: Number,
        founder: String,
        headquarters: String,
        logoUrl: String,
    },
});

export const DirectorModel = mongoose.model("Director", directorSchema);
