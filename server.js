"use strict";

require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const MOVIES = require("./movie-data-small.json");

let genres = MOVIES.reduce((acc, curr) => {
    return acc.includes(curr.genre.toLowerCase())
        ? acc
        : [...acc, curr.genre.toLowerCase()];
}, []);

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get("Authorization");
    if (!authToken || authToken.split(" ")[1] !== apiToken) {
        return res.status(401).json({ error: "Unauthorized request" });
    }
    next();
});

app.get("/movie", (req, res) => {
    const query = req.query;
    const genre = query.genre;
    const country = query.country;
    const avg_vote = query.avg_vote;

    let output = MOVIES;
    if (genre) {
        let selected = (output = output.filter((item) =>
            item.genre.toLowerCase().includes(genre.toLowerCase())
        ));
    }
    if (country) {
        output = output.filter((item) =>
            item.country.toLowerCase().includes(country.toLowerCase())
        );
    }
    if (avg_vote) {
        output = output.filter((item) => item.avg_vote >= avg_vote);
    }
    if (output.length === 0) {
        return res.status(404).json("No entries found");
    }

    return res.status(200).json(output);
});

app.listen(8000, () => {
    console.log("Server is listening at PORT 8000");
});
