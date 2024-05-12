import {useEffect, useState} from 'react';
import {Container} from '@mui/material';

const config = require('../config.json');

export default function HomePage() {
    const [appAuthor, setAppAuthor] = useState('')

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/author/name`)
            .then(res => res.text())
            .then(resText => setAppAuthor(resText))
    }, []);

    return (
        <Container>
            <h2>EGOTdb</h2>
            <p>An <b>EGOT</b> refers to an individual who has won each of the four major American performing art awards:
                Emmy, Grammy, Oscar, Tony.</p>
            <p>Each of these four awards represent outstanding achievement in television,
                recording, film, and Broadway theater. Being nominated for just <i>one</i> of these awards is a major honor for
                an artist. <i>Winning</i> any one of these awards cements you into the annals of entertainment. Winning <i>all
                four</i> of these awards, however, elevates an artist into a legend.</p>
            <p>{appAuthor}</p>
        </Container>
    );
};