import {useEffect, useState} from 'react';
import {Container, ImageList, ImageListItem, ImageListItemBar} from '@mui/material';
import {BaseUrl, Options} from '../helpers/TmdbApi.js'


const config = require('../config.json');

export default function EgotsPage() {
    const [localEgotData, setLocalEgotData] = useState([]);
    const [theMovieDBData, setTheMovieDBData] = useState([])

    const baseUrl = BaseUrl()
    const options = Options()

    // Fetch data from our internal query, and then iterate over each egot to retrieve data from tmdb API
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/egots`)
            .then(res => res.json())
            .then(data => {
                setLocalEgotData(data)
                Promise.all(
                    data.map(egot =>
                        fetch(`${baseUrl}/${egot.imdb_id}?external_source=imdb_id`, options)
                            .then((res) => res.json())
                            // Merge our local data with response from tmdb API
                            .then(mergedData => ({
                                ...egot,
                                movieDbData: mergedData
                            }))
                    )
                ).then(mergedData => {
                    setTheMovieDBData(mergedData)
                });
            })
            .catch(error => console.error('Error fetching data: ', error))
    }, []);

    return (
        <Container maxWidth={false}>
            <ImageList cols={7}>
                {theMovieDBData.map((itemData, index) => (
                        <a href={`/nominee/${itemData.imdb_id}`}>
                            <ImageListItem key={itemData.imdb_id}>
                                <img
                                    src={`https://image.tmdb.org/t/p/original${itemData.movieDbData['person_results'][0].profile_path}`}
                                    alt={`https://image.tmdb.org/t/p/original${itemData.movieDbData['person_results'][0].name}`}
                                    loading="lazy"

                                />
                                <ImageListItemBar
                                    title={itemData.movieDbData['person_results'][0].name}
                                    subtitle={'Year: ' + itemData.year}
                                />
                            </ImageListItem>
                        </a>
                    )
                )
                }
            </ImageList>
        </Container>
    );
}