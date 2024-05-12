import {useEffect, useState} from 'react';
import {Container} from '@mui/material';
import {useParams} from "react-router-dom";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {getWinner} from "../helpers/util";
import {BaseUrl, Options} from '../helpers/TmdbApi.js'
import Profile from "../components/NomineeProfile";

const config = require('../config.json');

const columns: GridColDef[] = [
    {field: 'year', headerName: 'Year', width: 100},
    {field: 'award', headerName: 'Award', width: 150},
    {field: 'category', headerName: 'Category', minWidth: 400, maxWidth: 400},
    {field: 'title', headerName: 'Title', width: 450},
    {
        field: 'winner',
        headerName: 'Winner',
        width: 160,
        valueGetter: getWinner,
    },
]

export default function NomineePage() {
    const [pageSize, setPageSize] = useState(25);
    const [data, setData] = useState([]);
    const {imdb_id} = useParams();
    const [nomineeName, setNomineeName] = useState();
    const [imagePath, setImagePath] = useState([]);
    const [knownForDepartment, setKnownForDepartment] = useState([]);
    const [popularity, setPopularity] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/nominee/${imdb_id}`)
            .then(res => res.json())
            .then(resJson => setData(resJson));
    }, [imdb_id]);


    const baseUrl = BaseUrl()
    const options = Options()

    useEffect(() => {
        const fetchTmdbData = async () => {
            const tmdbData = await fetch(
                fetch(`${baseUrl}/${imdb_id}?external_source=imdb_id`, options)
                    .then((res) => res.json())
                    .then((data => {
                                setNomineeName(data.person_results[0].name)
                                setImagePath(data.person_results[0].profile_path);
                                setKnownForDepartment(data.person_results[0].known_for_department);
                                setPopularity(data.person_results[0].popularity);
                            }
                        )
                    )
            );
        }

        fetchTmdbData()
            .catch(console.error)
    }, []);

    const keys = Object.keys(data);
    let name = ''
    if (keys.length > 1) {
        name = data[0].name;
    } else {
        name = nomineeName
    }

    if (data.length >= 1) {
        return (
            <Container>
                <Profile person={name}
                         imagePath={imagePath}
                         knownFor={knownForDepartment}
                         popularity={popularity}>
                </Profile>
                <h2>Award Nominations</h2>
                <DataGrid
                    getRowId={(row: any) => row.year + '-' + row.category + '-'  + row.title + '-'  + row.winner}
                    rows={data}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...data}
                />
            </Container>
        );
    }
}