import {useEffect, useState} from 'react';
import {Container,Divider, Checkbox, FormControlLabel,Slider} from '@mui/material';
import {DataGrid, GridColDef} from "@mui/x-data-grid";


const config = require('../config.json');

const columnsForYoungestFastest: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'age', headerName: 'Age', width: 300},
    {field: 'years_to_egot', headerName: 'Years to EGOT', width: 250},
]

const columnsForRecent: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'amount', headerName: 'Award Amount', width: 250},
]

const columnsForLossesBeforeFirstWin: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'losses_before_first_win', headerName: 'Lost Nomination Amount', width: 250},
]

const columnsForNomineeMostCategories: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'amount', headerName: 'Category Amount', width: 250},
]

const columnsForLongestYearSpan: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'years', headerName: 'Years', width: 250},
]

const columnsForLossesWithNoWin: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'amount', headerName: 'Lost Nomination Amount', width: 250},
]

const columnsForMissingOneAward: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 300, maxWidth: 300},
    {field: 'missing_award', headerName: 'Missing Award', width: 250},
    {field: 'path', headerName: 'Award Path', minWidth: 800, maxWidth: 1000},
]

const columnsForHardestCategories: GridColDef[] = [
    {field: 'award', headerName: 'Award', minWidth: 400, maxWidth: 600},
    {field: 'category', headerName: 'Award Category', minWidth: 400, maxWidth: 600},
    {field: 'avg_previous_losses', headerName: 'Average Amount of Previous Lost Nominations', width: 250},
]

const columnsForCommonCombos: GridColDef[] = [
    {field: 'combo', headerName: 'Award Combination', minWidth: 400, maxWidth: 600},
    {field: 'amount', headerName: 'Amount', minWidth: 400, maxWidth: 600},
]

const columnsForEgotPaths: GridColDef[] = [
    {field: 'name', headerName: 'Name', minWidth: 400, maxWidth: 400},
    {field: 'path', headerName: 'EGOT-Path', minWidth: 800, maxWidth: 1000},
]

export default function TriviaPage() {

    const [pageSize, setPageSize] = useState(100);

    const [youngest_fastest_data, setYoungestFastestData] = useState([]);
    const [recent_data, setRecentData] = useState([]);
    const [losses_before_first_win_data, setLossesBeforeFirstWinData] = useState([]);
    const [nominee_most_categories, setNomineeMostCategories] = useState([]);
    const [nominee_longest_year_span, setLongestYearSpan] = useState([]);
    const [losses_with_no_win,setLossesWithNoWin] = useState([]);
    const [missing_one_award,setMissingOneAward] = useState([]);
    const [hardest_categories,setHardestCategories] = useState([]);
    const [common_combos,setCommonCombos] = useState([]);
    const [egot_paths,setEgotPaths]=useState([]);

    const [onlyWinnersForRecentData, setOnlyWinnersForRecentData] = useState(false);
    const [onlyWinnersForMostCategories, setOnlyWinnersForMostCategories] = useState(false);
    const [onlyWinnersForLongestYearSpan, setOnlyWinnersForLongestYearSpan] = useState(false);

    const [year, setYear] = useState(2010);


    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/egots/youngest_fastest`)
            .then(res => res.json())
            .then(resJson => setYoungestFastestData(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/recent_nominees?onlyWinners=${onlyWinnersForRecentData}&year=${year}`)
            .then(res => res.json())
            .then(resJson => setRecentData(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/losses_before_first_win`)
            .then(res => res.json())
            .then(resJson => setLossesBeforeFirstWinData(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/nominee_most_categories?onlyWinners=${onlyWinnersForMostCategories}`)
            .then(res => res.json())
            .then(resJson => setNomineeMostCategories(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/nominee_longest_year_span?onlyWinners=${onlyWinnersForLongestYearSpan}`)
            .then(res => res.json())
            .then(resJson => setLongestYearSpan(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/losses_with_no_win`)
            .then(res => res.json())
            .then(resJson => setLossesWithNoWin(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/missing_one_award`)
            .then(res => res.json())
            .then(resJson => setMissingOneAward(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/hardest_categories`)
            .then(res => res.json())
            .then(resJson => setHardestCategories(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/common_combos`)
            .then(res => res.json())
            .then(resJson => setCommonCombos(resJson));
        fetch(`http://${config.server_host}:${config.server_port}/egot_paths`)
            .then(res => res.json())
            .then(resJson => setEgotPaths(resJson));
    }, [onlyWinnersForRecentData,onlyWinnersForMostCategories,onlyWinnersForLongestYearSpan,year]);

    const handleCheckboxChangeForRecentData = (event) => {
        setOnlyWinnersForRecentData(event.target.checked);
    };

    const handleCheckboxChangeForMostCategories = (event) => {
        setOnlyWinnersForMostCategories(event.target.checked);
    };

    const handleCheckboxChangeForLongestYearSpan = (event) => {
        setOnlyWinnersForLongestYearSpan(event.target.checked);
    };

        return (
            <Container>
                <h1>Trivia</h1>
                <h2>EGOTS</h2>
                <h3>Who was youngest? Who was fastest?</h3>
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={youngest_fastest_data}
                    columns={columnsForYoungestFastest}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...youngest_fastest_data}
                />
                <Divider />
                <h2> Recent Nominations </h2>
                <h3>Nominations Since Year {year}</h3>
                <p>Year:</p>
                <Slider
                    value={year}
                    min={2000}
                    max={2023}
                    step={1}
                    onChange={(e, newValue) => setYear(newValue)}
                    valueLabelDisplay='auto'
                    //valueLabelFormat={value => <div>{formatDuration(value)}</div>}
                  />
                <FormControlLabel
                    control={<Checkbox checked={onlyWinnersForRecentData} onChange={handleCheckboxChangeForRecentData} />}
                    label="Only Winners"
                />
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={recent_data}
                    columns={columnsForRecent}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...recent_data}
                />
                <Divider />
                <h2> Most Losses Before First Win </h2>
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={losses_before_first_win_data}
                    columns={columnsForLossesBeforeFirstWin}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...losses_before_first_win_data}
                />
                 <h2> Nominees Who Won the Most Amount Of Award Categories </h2>
                <FormControlLabel
                    control={<Checkbox checked={onlyWinnersForMostCategories} onChange={handleCheckboxChangeForMostCategories} />}
                    label="Only Winners"
                />
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={nominee_most_categories}
                    columns={columnsForNomineeMostCategories}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...nominee_most_categories}
                />
                <Divider />
                <h2> Nominees With The Longest Nominated Year Span </h2>
                <FormControlLabel
                    control={<Checkbox checked={onlyWinnersForLongestYearSpan} onChange={handleCheckboxChangeForLongestYearSpan} />}
                    label="Only Winners"
                />
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={nominee_longest_year_span}
                    columns={columnsForLongestYearSpan}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...nominee_most_categories}
                />
                <Divider />
                <h2> Nominees With The Most Amount Of Nominations With No Win </h2>
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={losses_with_no_win}
                    columns={columnsForLossesWithNoWin}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...losses_with_no_win}
                />
                <Divider />
                <h2> Nominees Who Have Won Three of The Four Awards </h2>
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={missing_one_award}
                    columns={columnsForMissingOneAward}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...losses_with_no_win}
                />
                 <Divider />
                <h2> Hardest Categories To Win </h2>
                <h3> Average Amount of Lost Nominations Before First Win For Each Award Category </h3>
                <DataGrid
                    getRowId={(row: any) => row.category}
                    rows={hardest_categories}
                    columns={columnsForHardestCategories}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...hardest_categories}
                /> 
                <Divider />
                <h2> Common Combinations of Awards </h2>
                <h3> Combinations of Awards With Corresponding Amount Of Nominees </h3>
                <DataGrid
                    getRowId={(row: any) => row.combo}
                    rows={common_combos}
                    columns={columnsForCommonCombos}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...common_combos}
                /> 
                <Divider />
                <h2> EGOT Paths </h2>
                <h3> In What Order Did the EGOTS Win Their Awards </h3>
                <DataGrid
                    getRowId={(row: any) => row.name}
                    rows={egot_paths}
                    columns={columnsForEgotPaths}
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight {...egot_paths}
                /> 
            </Container>
        );

}