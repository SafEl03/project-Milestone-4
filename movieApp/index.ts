declare module "express-session" {
    interface SessionData {
        user?: {
            id: string;
            username: string;
            role: "ADMIN" | "USER";
        };
    }
}

import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import session from "express-session";
import bcrypt from "bcryptjs";

import { MovieModel } from "./models/movie.model";
import { DirectorModel } from "./models/director.model";
import { UserModel } from "./models/user.model";
import { Movie, Director } from "./interfaces";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);


app.use(
    session({
        secret: process.env.SESSION_SECRET || "geheim123",
        resave: false,
        saveUninitialized: false,
    })
);


app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});


function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) return next();
    res.redirect("/login");
}


function isAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.session.user?.role === "ADMIN") return next();
    res.status(403).send("Toegang geweigerd. Alleen ADMIN mag deze pagina bekijken.");
}


mongoose
    .connect(process.env.MONGODB_URI!)
    .then(async () => {
        console.log("Verbonden met MongoDB");
        await seedDataIfNeeded();
        await createDefaultUsers();
    })
    .catch((err) => {
        console.error("Fout bij verbinden met MongoDB:", err);
    });

async function seedDataIfNeeded() {
    const movieCount = await MovieModel.countDocuments();
    const directorCount = await DirectorModel.countDocuments();

    if (movieCount === 0) {
        const res = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/main/jsonfiles/movies.json");
        const movies: Movie[] = await res.json();
        await MovieModel.insertMany(movies);
        console.log("Movies toegevoegd aan MongoDB");
    }

    if (directorCount === 0) {
        const res = await fetch("https://raw.githubusercontent.com/SafEl03/project-json1/main/jsonfiles/directors.json");
        const directors: Director[] = await res.json();
        await DirectorModel.insertMany(directors);
        console.log("Directors toegevoegd aan MongoDB");
    }
}

async function createDefaultUsers() {
    const userCount = await UserModel.countDocuments();

    if (userCount === 0) {
        const adminHashedPw = await bcrypt.hash("admin123", 10);
        const userHashedPw = await bcrypt.hash("user123", 10);

        await UserModel.create([
            { username: "admin", password: adminHashedPw, role: "ADMIN" },
            { username: "user", password: userHashedPw, role: "USER" },
        ]);

        console.log("Default users toegevoegd (admin & user)");
    }
}


app.get("/", (req, res) => {
    res.redirect("/movies");
});


interface LoginUser {
    _id: any;
    username: string;
    password: string;
    role: "ADMIN" | "USER";
}

app.get("/login", (req, res) => {
    if (req.session.user) return res.redirect("/movies");
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username }) as LoginUser;

    if (!user || !user.password) {
        return res.render("login", { error: "Gebruiker niet gevonden" });
    }

    const pwMatch = await bcrypt.compare(password, user.password);
    if (!pwMatch) {
        return res.render("login", { error: "Wachtwoord onjuist" });
    }

    req.session.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
    };

    res.redirect("/movies");
});

app.get("/register", (req, res) => {
    if (req.session.user) return res.redirect("/movies");
    res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const existing = await UserModel.findOne({ username });
    if (existing) {
        return res.render("register", { error: "Gebruikersnaam is al in gebruik" });
    }

    const hash = await bcrypt.hash(password, 10);
    await UserModel.create({ username, password: hash, role: "USER" });

    res.redirect("/login");
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Uitloggen mislukt.");
        res.redirect("/login");
    });
});


app.get("/movies", isAuthenticated, async (req, res) => {
    const filter = req.query.filter?.toString().toLowerCase() || "";
    const sortKey = req.query.sort?.toString() || "";

    try {
        let query = MovieModel.find();

        if (filter) {
            query = query.where("name").regex(new RegExp(filter, "i"));
        }

        if (sortKey) {
            query = query.sort({ [sortKey]: 1 });
        }

        const movies = await query.exec();

        res.render("movies", {
            movies,
            filter,
            sort: sortKey,
        });

    } catch (error) {
        console.error("Fout bij laden van films:", error);
        res.status(500).send("Kon films niet laden.");
    }
});

app.get("/movies/:id", isAuthenticated, async (req, res) => {
    try {
        const movie = await MovieModel.findOne({ id: req.params.id });
        if (!movie) return res.status(404).send("Movie not found");

        res.render("movie-detail", { movie });
    } catch (err) {
        console.error("Fout bij laden film:", err);
        res.status(500).send("Serverfout.");
    }
});

app.get("/movies/:id/edit", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const movie = await MovieModel.findOne({ id: req.params.id });
        if (!movie) return res.status(404).send("Film niet gevonden");

        res.render("movie-edit", { movie });
    } catch (err) {
        console.error("Fout bij laden editpagina:", err);
        res.status(500).send("Kon editpagina niet laden");
    }
});

app.post("/movies/:id/edit", isAuthenticated, isAdmin, async (req, res) => {
    const movieId = req.params.id;
    const { name, releaseYear, genre, isPopular } = req.body;

    try {
        await MovieModel.findOneAndUpdate(
            { id: movieId },
            {
                name,
                releaseYear: parseInt(releaseYear),
                genre,
                isPopular: isPopular === "true",
            },
            { new: true }
        );

        res.redirect("/movies");

    } catch (err) {
        console.error("Fout bij updaten film:", err);
        res.status(500).send("Updaten mislukt");
    }
});


app.get("/directors", isAuthenticated, async (req, res) => {
    const filter = req.query.filter?.toString().toLowerCase() || "";
    const sortKey = req.query.sort?.toString() || "";

    try {
        let query = DirectorModel.find();

        if (filter) {
            query = query.where("name").regex(new RegExp(filter, "i"));
        }

        if (sortKey) {
            query = query.sort({ [sortKey]: 1 });
        }

        const directors = await query.exec();

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

app.get("/directors/:id", isAuthenticated, async (req, res) => {
    const directorId = req.params.id;

    try {
        const director = await DirectorModel.findOne({ id: directorId });
        if (!director) return res.status(404).send("Director not found");

        const movies = await MovieModel.find({ "director.id": directorId });

        res.render("director-detail", {
            director,
            movies,
        });

    } catch (error) {
        console.error("Fout bij ophalen director:", error);
        res.status(500).send("Kon regisseur niet ophalen.");
    }
});


app.listen(app.get("port"), () => {
    console.log("Server gestart op http://localhost:" + app.get("port"));
});
