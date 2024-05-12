import {GridValueGetter} from "@mui/x-data-grid";

export const getWinner: GridValueGetter<(typeof data)[number], unknown> = (
    value,
) => {
    return `${value.row.winner ? 'Winner' : 'Nominee'}`;
};

export const getNomineeLink: GridValueGetter<(typeof data)[string], string> = (value,) => {
    let name = value.row.name.split(';')
    let imdb_id;
    let imdb_id_val;
    let urls = [];
    if (value.row.imdb_id === null) {
        return name;
    } else {
        try {
            imdb_id = value.row.imdb_id.split(';');
            name.map((name, index) => (
                imdb_id_val = imdb_id[index].trim(),
                    urls.push(<div><a
                        href={`../../nominee/` + imdb_id_val}
                        style={{color: 'black'}}>{name.trim()}</a><span>&nbsp;</span>
                    </div>)
            ))
        } catch (error) {
            console.log(error);
            return name;
        }

        return urls;
    }

}