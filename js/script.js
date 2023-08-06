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
    }
}

fetchBestFilm().then(data => {
    console.log("Best Film data retrieved", data)
})