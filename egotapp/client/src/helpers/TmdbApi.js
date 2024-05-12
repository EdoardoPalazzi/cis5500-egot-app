export function BaseUrl() {
    return 'https://api.themoviedb.org/3/find';
}

export function Options() {
    return {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + process.env.REACT_APP_TMDB_BEARER_TOKEN
        }
    }
}