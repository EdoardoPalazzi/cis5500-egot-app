function ProfileImage({imagePath}) {
    return (
        <div>
            {imagePath.length > 1 ? (<img src={`https://image.tmdb.org/t/p/original/${imagePath}`} alt="Profile"
                               style={{width: 150}}/>) : 'No image available for this nominee.'}
        </div>
    );
}

function KnownForDepartment({knownFor}) {
    return (
        <div>{knownFor.length > 1 ? (<p>Known for their excellent work in the {knownFor} department.</p>) : ('')}</div>
    )
}

function Popularity({popularity}) {
    return (
        <div>{popularity && <p>Popularity: {popularity} of 100</p>}</div>
    )
}


export default function Profile({person, imagePath, knownFor, popularity}) {
    return (
        <section>
            <h1>{person}</h1>
            <ProfileImage imagePath={imagePath}/>
            <KnownForDepartment knownFor={knownFor}/>
            <Popularity popularity={popularity}/>
        </section>
    )
}