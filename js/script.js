/* ----- ----- ----- ----- VARIABLES ----- ----- ----- -----*/

/**
 * A Dictionary to store movie details by their ID.
 * This allows for quick access to movie data based on their unique ID.
 */
const moviesById = {};

/**
 * An array of genre objects. Each object represents a movie genre and its associated
 * carousel container in the UI.
 *
 * - genre: The name of the movie genre (e.g., "Comedy").
 * - container: The ID of the DOM element (carousel) where movies of this genre will be displayed.
 */
const genres = [
    { genre: "Comedy", container: "carousel_comedy" },
    { genre: "Family", container: "carousel_family" },
    { genre: "Biography", container: "carousel_biography" },
]

/* ----- ----- ----- ----- NAVBAR SCROLL ----- ----- ----- ----- */

/**
 * Initializes the behavior of the navigation bar in response to scrolling and page load events.
 * This method sets up event listeners to update the background color of the navigation bar based on scroll position.
 *
 * @function initNavbarScrollBehavior
 */
function initNavbarScrollBehavior() {
    const navbar = document.querySelector('.navbar');

    // Function to update the background color of the navbar based on scroll position
    function updateNavbarBackgroundColor() {
        const scrollThreshold = 300; // Define a scroll threshold.

        if (window.scrollY > scrollThreshold) {
            // Set the background color to black if scroll position is beyond the threshold.
            navbar.style.backgroundColor = 'black';
        } else {
            // Set the background color to transparent if scroll position is below the threshold.
            navbar.style.backgroundColor = 'transparent';
        }
    }

    // Add a scroll event listener to update the navbar background color
    window.addEventListener('scroll', updateNavbarBackgroundColor);

    // Add a load event listener to update the navbar background color when the page is fully loaded
    window.addEventListener('load', updateNavbarBackgroundColor);
}

/* ----- ----- ----- ----- MODAL ----- ----- ----- ------*/

/**
 * Initialize modal event listeners.
 * @function initializeModalListeners
 * @description Sets up event listeners for opening and closing the modal.
 */
function initializeModalListeners() {
    // Get references to the relevant DOM elements
    const openModal = document.querySelector('.modal_info_button');
    const closeModal = document.querySelector('.modal_close');
    const modal = document.querySelector('.modal');

    // Add a click event listener to the "Open Modal" button
    openModal.addEventListener('click', (e) => {
        e.preventDefault();

        // Get the element with class "best_film"
        const elementWithClass = document.querySelector(".best_film");

        // Get the movie details using the ID of the element
        const movieId = elementWithClass.id;
        const movieDetails = moviesById[movieId];

        // Update the modal content and show it
        updateModalContent(movieDetails);
        modal.classList.add('modal--show');
    });

    // Add a click event listener to the "Close Modal" button
    closeModal.addEventListener('click', (e) => {
        e.preventDefault();

        // Hide the modal
        modal.classList.remove('modal--show');
    });
}

/**
 * Updates the content of a modal with movie information.
 *
 * @param {Object} movie - An object containing details about the movie.
 */
function updateModalContent(movie) {

    // Get the modal element and its child elements
    const modal = document.getElementById('modal');
    const modalImage = modal.querySelector('.modal_image');
    const modalTitle = modal.querySelector('.modal_title');
    const modalParagraph = modal.querySelector('.modal_paragraph');

    // Update the modal's child elements with the movie information
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

/* ----- ----- ----- -----  MOVIES RETRIEVALS  ----- ----- ----- ----- */

/**
 * Fetches the best film based on the highest IMDB score from the provided API endpoint.
 *
 * @returns {Object|null} Returns the best film's data as an object or null if any error occurs.
 * @throws {Error} If there is an issue fetching the data, the error will be thrown for the caller to handle.
 */
async function fetchBestFilm() {
    const absoluteUrl = "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"

    try {
        const response = await fetch(absoluteUrl);

        if (!response.ok) {
            console.log(`Failed to fetch data Best Film. HTTP status: ${response.status}`);
            return null
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data Best Film:', error);
        throw error;
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
async function updateBestFilm(movie) {

    const bestFilmDiv = document.querySelector(".best_film")

    // Set the "id" attribute of the "best_film" div to the movie's ID
    bestFilmDiv.setAttribute("id", `${movie.id}`);
    await storeMovieDetails(movie.id)

    // Get the elements inside the "best_film" div
    const titleElement = document.querySelector(".best_film_title")
    const summaryElement = document.querySelector(".best_film_summary")

    // Update the elements with the movie information
    titleElement.textContent = movie.title;
    summaryElement.textContent = `Year: ${movie.year}, IMDb Score: ${movie.imdb_score}, Votes: ${movie.votes}`

    // Update the background image property using the URL of the image in image_url
    bestFilmDiv.style.backgroundImage = `url(${movie.image_url})`

    // Fetch additional movie details using the movie's ID and log a message when the details are stored
    fetchMovieDetails(movie.id).then(() => {
        console.log("The information of the best movie has been stored successfully.")
    })
}

/**
 * Fetches a list of films from the provided URL.
 * Returns an array containing up to 7 film objects.
 *
 * @param {string} url - The URL to fetch the film data from.
 * @param {boolean} skipFirstFilm - Whether to skip the first film when retrieving data.
 * @returns {Promise<Array>} - A promise that resolves to an array of film objects.
 * @throws {Error} - If there is an error during the fetch operation or processing.
 */
async function fetchFilms(url, skipFirstFilm = false) {
    let films = []; // Array to store fetched film data.
    try {
        while (films.length < 8) {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (skipFirstFilm){
                    films.push(...data.results.slice(1));
                } else {
                    films.push(...data.results);
                }
                url = data.next; // Update the URL for the next call
            } else {
                // If the response is not successful, exit the loop
                break;
            }
        }

        // Iterate through the fetched films and store their details.
        for (const film of films) {
            await storeMovieDetails(film.id);
        }

        return films.slice(0, 7); // Return only the first 7 elements
    } catch (error) {
        console.error('Error fetching films data:', error);
        return films.slice(0, 7); // Return the elements obtained so far
    }
}

/**
 * Retrieves the best film data asynchronously, processes it, and updates the display.
 *
 * @throws {Error} - If there's an error during data retrieval or processing.
 */
async function getBestFilm(){
    try {
        // Fetch the best film data
        const data = await fetchBestFilm();
        if (!data) {
            console.error("Failed to retrieved best film data");
            return
        }
        const results = data.results;
        // If there are results and at least one film is available, process and update the display.
        if (results && results.length > 0){
            const bestFilm = parseMovie(results[0]);
            await updateBestFilm(bestFilm);
        }
    } catch (error) {
        console.error("Error fetching best film:", error);
    }
}

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

    // Adds a click event listener to the right arrow button that scrolls the carousel to the right.
    arrowRight.addEventListener("click", () => {
        row.scrollLeft += row.offsetWidth;
    })

    // Adds a click event listener to the left arrow button that scrolls the carousel to the left.
    arrowLeft.addEventListener("click", () => {
        row.scrollLeft -= row.offsetWidth;
    })
}

/**
 * Creates a text element (h3 tag) for displaying a film title.
 *
 * @param {string} filmTitle - The title of the film.
 * @returns {HTMLElement} - Returns a h3 element with the film's title and a CSS class 'film_title'.
 */
function createTextElement(filmTitle) {
    const textElement = document.createElement("h3");
    textElement.textContent = filmTitle;
    textElement.classList.add('film_title');
    return textElement;
}


/**
 * Sets the background image of a given film element. If the provided image URL
 * is valid, it will be set as the background. Otherwise, a default image will be used.
 *
 * @param {HTMLElement} newFilm - The film element to which the background image will be applied.
 * @param {string} imageUrl - The URL of the image intended to be set as the background.
 */
function setBackgroundImage(newFilm, imageUrl) {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        newFilm.style.backgroundImage = `url(${imageUrl})`;
    };
    img.onerror = () => {
        newFilm.style.backgroundImage = `url("../images/image_default.jpg")`;
    };
}

/**
 * Creates and adds a film element to a specified container.
 *
 * @param {object} film - The film object containing details such as image URL and title.
 * @param {string} containerId - The ID of the container element to which the film element will be added.
 */
function createFilmElement(film, containerId) {
    // Get the films container element by its ID
    const filmsContainer = document.getElementById(containerId);

    // Create a new film element and add appropriate CSS class
    const newFilm = document.createElement("div");
    newFilm.classList.add("pelicula");

    // Set the "id" attribute of the film element to the film's ID
    newFilm.setAttribute("id", `${film.id}`);

    const modal = document.querySelector('.modal');
    newFilm.addEventListener('click', () => {
        updateModalContent(moviesById[newFilm.id])
        modal.classList.add('modal--show');
    })

    setBackgroundImage(newFilm, film.image_url);
    const textElement = createTextElement(film.title);
    // Append the text element to the film element and the film element to the films container
    newFilm.appendChild(textElement);
    filmsContainer.appendChild(newFilm);
}

/**
 * Asynchronously fetches films based on genre data and then creates and displays film elements.
 *
 * This function does the following:
 * 1. Fetches films based on a specific genre, sorted by IMDb score.
 * 2. For each fetched film, it creates a film element and displays it in the specified container.
 * 3. Adds carousel arrow event listeners for the specified genre container.
 *
 * @param {Object} genreData - An object containing information about the genre.
 * @param {string} genreData.genre - The name of the genre (e.g., "Comedy").
 * @param {string} genreData.container - The ID of the DOM element (carousel) where movies of this genre will be displayed.
 */
async function fetchAndCreateFilms(genreData) {
    try {
        const films = await fetchFilms(`http://localhost:8000/api/v1/titles/?genre=${genreData.genre}&sort_by=-imdb_score`);

        for (const film of films) {
            createFilmElement(film, genreData.container);
        }

        addCarouselArrowEvents(
            `container_${genreData.container}`,
            `arrow_right_${genreData.genre.toLowerCase()}`,
            `arrow_left_${genreData.genre.toLowerCase()}`
        );
    } catch (error) {
        console.error(`Error fetching films for genre ${genreData.genre}:`, error);
    }
}

/* ----- ----- ----- ----- Retrieve and store the movie details ----- ----- ----- ------ */

/**
 * Fetches the details of a movie from the API based on its ID.
 * @async
 * @function fetchMovieDetails
 * @param {string} movieId - The ID of the movie to fetch details for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the details of the movie.
 */
async function fetchMovieDetails(movieId) {
    const response = await fetch(`http://localhost:8000/api/v1/titles/${movieId}`);
    return await response.json();
}

/**
 * Fetches and stores the details of a movie based on its ID.
 * @async
 * @function storeMovieDetails
 * @param {string} movieId - The ID of the movie to fetch and store details for.
 * @throws {Error} - If there's an error during the fetch operation or data processing.
 */
async function storeMovieDetails(movieId) {
    try {
        // Fetch movie details using the provided movie ID
        const movieData = await fetchMovieDetails(movieId);

        // Create a movie object with extracted details
        const movie = {
            image: movieData.image_url || "Unknown",
            title: movieData.title|| "Unknown",
            genre: movieData.genres && movieData.genres.length > 0 ? movieData.genres.join(', ') : "Unknown",
            releaseDate: movieData.date_published || "Unknown",
            rated: movieData.rated || "Unknown",
            imdbScore: movieData.imdb_score || "Unknown",
            director: movieData.directors && movieData.directors.length > 0 ? movieData.directors.join(', ') : "Unknown",
            actors: movieData.actors && movieData.actors.length > 0 ? movieData.actors.join(', ') : "Unknown",
            duration: movieData.duration || "Unknown",
            country: movieData.countries && movieData.countries.length > 0 ? movieData.countries.join(', ') : "Unknown",
            boxOffice: movieData.worldwide_gross_income  || "Unknown",
            summary: movieData.description || "Unknown"
        };

        // Store the movie object using its ID as the key
        moviesById[movieId] = movie;

        console.log('Stored movie details:', movie);
    } catch (error) {
        console.error('Error storing movie details:', error);
    }
}

/*---- ----- ----- -----  FUNCTIONS CALLS ----- ----- ----- -----*/

// Initialize the behavior of the navigation bar when scrolling
initNavbarScrollBehavior()
// Initialize event listeners for modals in the application
initializeModalListeners();


/**
 * Immediately Invoked Function Expression (IIFE) to fetch and display the best film.
 * If there's an error during the fetch, it will be logged to the console.
 */
(async function() {
    try {
        await getBestFilm();
    } catch (error) {
        console.log("Error in call getBestFilm:", error)
    }
})();

/**
 * Immediately Invoked Function Expression (IIFE) to fetch and display the top-rated films.
 * After fetching, each film is added to the carousel and event listeners are attached
 * to the carousel arrows for smooth scrolling.
 * If there's an error during the fetch, it will be logged to the console.
 */
(async function() {
    try {
        const films = await fetchFilms("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score", true);

        films.forEach((film) => {
            createFilmElement(film, "carousel_top_films");
        });
        // Add event listeners to carousel arrows to handle left and right scrolling
        addCarouselArrowEvents("container_carousel_top_films",
            "arrow_right_top_films",
            "arrow_left_top_films")
    } catch (error) {
        console.error("Error fetching films:", error);
    }
})();

/**
 * Immediately Invoked Function Expression (IIFE) to fetch and display films for each genre.
 * Each genre will have its own set of films fetched and displayed.
 */
(async function() {
    for (const genreData of genres) {
        await fetchAndCreateFilms(genreData);
    }
})();
