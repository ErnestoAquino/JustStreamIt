/**
 * Fetches the best film data from the API based on the IMDb score.
 * @async
 * @function fetchBestFilm
 * @returns {Promise} A Promise that resolves to the best film data or null if an error occurs.
 */
async function fetchBestFilm() {
    const absolute_url = "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"

    try {
        const response = await fetch(absolute_url);
        if (response.ok) {
            return await response.json()
        }
        else {
            return null
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

/**
 * Parses the movie data object and returns a simplified movie object.
 * @function parseMovie
 * @param {object} movieData - The movie data object to be parsed.
 * @returns {object} A simplified movie object with selected properties.
 */
function parseMovie(movieData){
    return {
        id: movieData.id,
        title: movieData.title,
        year: movieData.year,
        imdb_score: movieData.imdb_score,
        votes: movieData.votes,
        image_url: movieData.image_url,
        directors: movieData.directors,
        actors: movieData.actors,
        writers: movieData.writers,
        genres: movieData.genres
    }
}

/**
 * Updates the content and background image of the "best_film" div with movie information.
 * @function updateBestFilm
 * @param {object} movie - The movie object containing the information to be displayed.
 */
function updateBestFilm(movie){

    const bestFilmDiv = document.querySelector(".best_film")
    bestFilmDiv.setAttribute("id", `${movie.id}`);

    // Get the elements inside the "best_film" div
    const titleElement = document.querySelector(".best_film_title")
    const summaryElement = document.querySelector(".best_film_summary")

    // Update the elements with the movie information
    titleElement.textContent = movie.title;
    summaryElement.textContent = `Year: ${movie.year}, IMDb Score: ${movie.imdb_score}, Votes: ${movie.votes}`
    // Update the background image property using the URL of the image in image_url.
    bestFilmDiv.style.backgroundImage = `url(${movie.image_url})`
    fetchMovieDetails(movie.id).then(r => {
        console.log("Ya esta almacenado!")
    })
}

/**
 * Fetches a list of films from the provided URL.
 * Returns an array containing up to 8 film objects.
 *
 * @param {string} url - The URL to fetch the film data from.
 * @returns {Promise<Array>} - A promise that resolves to an array of film objects.
 */
async function fetchFilms(url) {
    let films = [];
    try {
        while (films.length < 8) {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                films.push(...data.results);
                url = data.next; // Update the URL for the next call
            } else {
                // If the response is not successful, exit the loop
                break;
            }
        }

        for (const film of films) {
            await storeMovieDetails(film.id);
        }


        return films.slice(0, 8); // Return only the first 8 elements
    } catch (error) {
        console.error('Error fetching data:', error);
        return films.slice(0, 8); // Return the elements obtained so far
    }
}

/**
 * Fetches data for the best film from an API and updates the page accordingly.
 * This function fetches the data, parses the movie information, and updates the UI.
 * @returns {Promise} A Promise that resolves to the best film data.
 */
fetchBestFilm().then(data => {
    const results = data.results
    if (results && results.length > 0){
        const bestMovie = parseMovie(results[0])
        updateBestFilm(bestMovie)
        console.log("Best Film data retrieved", bestMovie)
    } else {
        console.log("No movie found.")
    }
})

/*------ ----- ----- Code for carousel ----- ----- -----*/

/**
 * Adds click event listeners to the right and left arrow buttons for a carousel.
 *
 * @param {string} containerId - The ID of the container element that holds the carousel.
 * @param {string} arrowRightId - The ID of the right arrow button element.
 * @param {string} arrowLeftId - The ID of the left arrow button element.
 */
function  addCarouselArrowEvents(containerId, arrowRightId, arrowLeftId) {
    const row = document.getElementById(containerId)
    const arrowRight = document.getElementById(arrowRightId)
    const arrowLeft = document.getElementById(arrowLeftId)

    /**
     * Adds a click event listener to the right arrow button that scrolls the carousel to the right.
     */
    arrowRight.addEventListener("click", () => {
        row.scrollLeft += row.offsetWidth;
    })

    /**
     * Adds a click event listener to the left arrow button that scrolls the carousel to the left.
     */
    arrowLeft.addEventListener("click", () => {
        row.scrollLeft -= row.offsetWidth;
    })
}

/**
 * Creates and adds a film element to a specified container.
 *
 * @param {object} film - The film object containing details such as image URL and title.
 * @param {string} containerId - The ID of the container element to which the film element will be added.
 */
function createFilmElement(film, containerId) {
    const filmsContainer = document.getElementById(containerId)
    const newFilm = document.createElement("div");
    newFilm.classList.add("pelicula");

    newFilm.setAttribute("id", `${film.id}`);
    // Start test modal
    newFilm.addEventListener('click', () => {
        updateModalContent(moviesById[newFilm.id])
        modal.classList.add('modal--show');
    })
    // End test modal
    const img = new Image();
    img.src = film.image_url;

    /**
     * Sets the background image of the film element to the film's image URL.
     */
    img.onload = () => {
        newFilm.style.backgroundImage = `url(${film.image_url})`;
    };

    /**
     * Sets a default background image if the film's image URL is not valid.
     */
    img.onerror = () => {
        newFilm.style.backgroundImage = `url("../images/best_film_test.webp")`;
    };

    const textElement = document.createElement("h3");
    textElement.textContent = film.title;
    textElement.style.color = "white";
    textElement.style.fontSize = "14px";
    textElement.style.textAlign = "left";
    textElement.style.marginTop = "auto";

    newFilm.appendChild(textElement);
    filmsContainer.appendChild(newFilm);
}

/*----- ----- ----- Get Top Rated Films ----- ----- -----*/
fetchFilms("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score").then((films) => {
    films.forEach((film) => {
        createFilmElement(film, "carousel_top_films");
    });
});

addCarouselArrowEvents("container_carousel_top_films",
    "arrow_right_top_films",
    "arrow_left_top_films")

/*----- ----- ----- Get other genres ----- ----- -----*/

const genres = [
    { genre: "Comedy", container: "carousel_comedy" },
    { genre: "Family", container: "carousel_family" },
    { genre: "Biography", container: "carousel_biography" },
]

function fetchAndCreateFilms(genre) {
    fetchFilms(`http://localhost:8000/api/v1/titles/?genre=${genre}&sort_by=-imdb_score`)
        .then((films) => {
            films.forEach((film) => {
                createFilmElement(film, `carousel_${genre.toLowerCase()}`);
            });
        });

    addCarouselArrowEvents(`container_carousel_${genre.toLowerCase()}`,
        `arrow_right_${genre.toLowerCase()}`,
        `arrow_left_${genre.toLowerCase()}`);
}

genres.forEach((genreData) => {
    fetchAndCreateFilms(genreData.genre);
});


/*----- ----- ----- Modal Test for best film----- ----- -----*/

const openModal = document.querySelector('.modal_info_button');
const closeModal = document.querySelector('.modal_close')
const modal = document.querySelector('.modal');


openModal.addEventListener('click', (e) => {
    e.preventDefault()
    const elementWithClass = document.querySelector(".best_film");
    updateModalContent(moviesById[elementWithClass.id])
    modal.classList.add('modal--show');
}) 

closeModal.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('modal--show');
})


// ---------------Recuperar perlicula -------------------//
const topFilmsDetails = [];
const moviesById = {};

async function fetchMovieDetails(movieId) {
    const response = await fetch(`http://localhost:8000/api/v1/titles/${movieId}`);
    return await response.json();
}

async function storeMovieDetails(movieId) {
    try {
        const movieData = await fetchMovieDetails(movieId);

        const movie = {
            image: movieData.image_url,
            title: movieData.title,
            genre: movieData.genres.join(', '),
            releaseDate: movieData.date_published,
            rated: movieData.rated,
            imdbScore: movieData.imdb_score,
            director: movieData.directors.join(', '),
            actors: movieData.actors.join(', '),
            duration: movieData.duration,
            country: movieData.countries.join(', '),
            boxOffice: movieData.worldwide_gross_income,
            summary: movieData.description
        };

        // Aggregate el objeto 'movie' a la lista de películas
        topFilmsDetails.push(movie);
        moviesById[movieId] = movie;

        console.log('Película almacenada:', movie);
    } catch (error) {
        console.error('Error al almacenar la película:', error);
    }
}
async function fetchAndStoreFilms(url) {
    let films = [];
    try {
        while (films.length < 8) {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                films.push(...data.results);
                url = data.next; // Update the URL for the next call
            } else {
                // If the response is not successful, exit the loop
                break;
            }
        }

        // Recorrer la lista de películas y almacenar sus detalles
        for (const film of films) {
            await storeMovieDetails(film.id);
        }

        console.log('Películas almacenadas con éxito');
    } catch (error) {
        console.error('Error fetching and storing data:', error);
    }
}

fetchAndStoreFilms("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score");
console.log(topFilmsDetails)

//---- Update modal -----//

function updateModalContent(movie) {
    const modal = document.getElementById('modal');
    const modalImage = modal.querySelector('.modal_image');
    const modalTitle = modal.querySelector('.modal_title');
    const modalParagraph = modal.querySelector('.modal_paragraph');

    // Actualizar los elementos del modal con la información de la película
    modalImage.src = movie.image;
    modalTitle.textContent = movie.title;
    modalParagraph.innerHTML = `
        <ul>
            <li>Title: ${movie.title}</li>
            <li>Genres: ${movie.genre}</li>
            <li>Date published: ${movie.releaseDate}</li>
            <li>Rated: ${movie.rated}</li>
            <li>Score IMBd: ${movie.imdbScore}</li>
            <li>Directors: ${movie.director}</li>
            <li>Actors: ${movie.actors}</li>
            <li>Duration: ${movie.duration}</li>
            <li>Countries: ${movie.country}</li>
            <li>Box Office: ${movie.boxOffice}</li>
            <li>Description: ${movie.summary}</li>
        </ul>
    `;
}



// ----- ----- ----- Navbar scroll ----- ----- -----//

const navbar = document.querySelector('.navbar');
const navbarHeight = navbar.offsetHeight;
const scrollThreshold = 100; // Cambia esto según la cantidad de desplazamiento que desees antes de cambiar el fondo

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
        navbar.style.backgroundColor = 'black';
    } else {
        navbar.style.backgroundColor = 'transparent';
    }
});

// Establecer el color de fondo inicial al cargar la página
window.addEventListener('load', () => {
    if (window.scrollY > scrollThreshold) {
        navbar.style.backgroundColor = 'black';
    } else {
        navbar.style.backgroundColor = 'transparent';
    }
});