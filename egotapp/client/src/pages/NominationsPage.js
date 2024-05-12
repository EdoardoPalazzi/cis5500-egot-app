import {useEffect, useState} from 'react';
import {Checkbox, Container, FormControlLabel, Slider} from '@mui/material';
import {useParams} from 'react-router-dom'
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {getNomineeLink, getWinner} from "../helpers/util";

const config = require('../config.json');

const columns: GridColDef[] = [
    {field: 'category', headerName: 'Category', minWidth: 400, maxWidth: 400},
    {field: 'title', headerName: 'Title', width: 300},
    {
        field: 'name',
        headerName: 'Nominee',
        width: 250,
        flex: 5,
        renderCell: getNomineeLink,
    },
    {
        field: 'winner',
        headerName: 'Winner',
        width: 160,
        valueGetter: getWinner,
    },
]

export default function NominationsPage() {

    const [pageSize, setPageSize] = useState(100);
    const {award} = useParams();
    const [year, setYear] = useState(2023);
    const [data, setData] = useState([]);
    const [onlyWinners, setOnlyWinners] = useState(false);
    const [minYear, setMinYear] = useState(2000);

    let maxYear = 2023;

    useEffect(() => {
        if (award === "grammy") {
            setMinYear(1959);
            maxYear = 2024;
        } else if (award === "oscar") {
            setMinYear(1929);
        } else if (award === "emmy") {
            setMinYear(1949);
        } else if (award === "tony") {
            setMinYear(1947);
        }

        // Make sure the year is within the valid range for the selected award
        if (year < minYear) {
            setYear(minYear);
        } else if (year > maxYear) {
            setYear(maxYear);
        }

        if (year >= minYear && year <= maxYear) {
            fetch(`http://${config.server_host}:${config.server_port}/nominations/${award}/${year}?onlyWinners=${onlyWinners}`)
                .then(res => res.json())
                .then(resJson => setData(resJson));
        } else {
            setData([]);
        }
    }, [award, year, onlyWinners, minYear]);


    const handleCheckboxChange = (event) => {
        setOnlyWinners(event.target.checked);
    };

    if (data.length >= 1) {
        return (
            <Container>
                <p>Year:</p>
                <Slider
                    value={year}
                    min={minYear}
                    max={maxYear}
                    step={1}
                    onChange={(e, newValue) => setYear(newValue)}
                    valueLabelDisplay='auto'
                />
                <FormControlLabel
                    control={<Checkbox checked={onlyWinners} onChange={handleCheckboxChange}/>}
                    label="Only Winners"
                />
                <h1>{award} Award Nominations for {year}</h1>
                <DataGrid
                    getRowId={(row: any) => year + '-' + row.category + '-' + row.title + '-' + row.name + '-' + row.winner}
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