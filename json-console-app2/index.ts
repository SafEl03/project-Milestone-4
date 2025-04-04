import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Movie, Director } from "./interfaces"; // als je een interface hebt


dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);


app.get("/movies", async (req, res) => {
    const filter = req.query.filter?.toString().toLowerCase() || "";
    const sortKey = req.query.sort?.toString() || "";

    try {
        const response = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/refs/heads/main/jsonfiles/movies.json");
        const movies: Movie[] = await response.json();

        // FILTER
        let filteredMovies = movies;
        if (filter) {
            filteredMovies = filteredMovies.filter((movie) =>
                movie.name.toLowerCase().includes(filter)
            );
        }

        // SORT
        if (sortKey) {
            filteredMovies = filteredMovies.sort((a: any, b: any) => {
                if (a[sortKey] < b[sortKey]) return -1;
                if (a[sortKey] > b[sortKey]) return 1;
                return 0;
            });
        }

        res.render("movies", {
            movies: filteredMovies,
            filter,
            sort: sortKey,
        });

    } catch (error) {
        console.error("Fout bij ophalen van data:", error);
        res.status(500).send("Kon data niet ophalen.");
    }
});
app.get("/movies/:id", async (req, res) => {
    const movieId = req.params.id;

    try {
        // Fetch alle movies van GitHub
        const response = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/refs/heads/main/jsonfiles/movies.json");
        const movies: Movie[] = await response.json();

        // Zoek de juiste movie
        const movie = movies.find((m) => m.id === movieId);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        res.render("movie-detail", { movie });

    } catch (error) {
        console.error("Error fetching movie data:", error);
        res.status(500).send("Kon film niet ophalen.");
    }
});

app.get("/directors/:id", async (req, res) => {
    const directorId = req.params.id;

    try {
        // Directors ophalen
        const response = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/refs/heads/main/jsonfiles/directors.json");
        const directors: Director[] = await response.json();

        // Zoek juiste director
        const director = directors.find((d) => d.id === directorId);

        if (!director) {
            return res.status(404).send("Director not found");
        }

        // Extra: alle films van deze director zoeken
        const moviesResponse = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/refs/heads/main/jsonfiles/movies.json");
        const allMovies: Movie[] = await moviesResponse.json();
        const directedMovies = allMovies.filter((movie) => movie.director.id === directorId);

        res.render("director-detail", {
            director,
            movies: directedMovies
        });

    } catch (error) {
        console.error("Error loading director:", error);
        res.status(500).send("Kon regisseur niet ophalen.");
    }
});

app.get("/directors", async (req, res) => {
    const filter = req.query.filter?.toString().toLowerCase() || "";
    const sortKey = req.query.sort?.toString() || "";

    try {
        const response = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/refs/heads/main/jsonfiles/directors.json");
        let directors: Director[] = await response.json();

        // Filteren op naam
        if (filter) {
            directors = directors.filter((d) =>
                d.name.toLowerCase().includes(filter)
            );
        }

        // Sorteren op veld
        if (sortKey) {
            directors = directors.sort((a: any, b: any) => {
                if (a[sortKey] < b[sortKey]) return -1;
                if (a[sortKey] > b[sortKey]) return 1;
                return 0;
            });
        }

        res.render("directors", {
            directors,
            filter,
            sort: sortKey,
        });

    } catch (error) {
        console.error("Fout bij ophalen van directors:", error);
        res.status(500).send("Kon regisseurs niet ophalen.");
    }
});



app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});