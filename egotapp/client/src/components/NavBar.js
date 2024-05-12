import {AppBar, Container, Toolbar, Typography} from '@mui/material'
import {NavLink} from 'react-router-dom';

function NavText({href, text, isMain}) {
    return (
        <Typography
            variant={isMain ? 'h5' : 'h7'}
            noWrap
            style={{
                marginRight: '30px',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
            }}
        >
            <NavLink
                to={href}
                style={{
                    color: 'goldenrod',
                    textDecoration: 'none',
                }}
            >
                {text}
            </NavLink>
        </Typography>
    )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
    return (
        <AppBar position='static' sx={{
              background: 'black',
            }}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters>
                    <NavText href='/' text='EGOTdb' isMain/>
                    <NavText href='/egots' text='EGOTS'/>
                    <NavText href='/nominations/emmy/2023' text='EMMYS'/>
                    <NavText href='/nominations/grammy/2023' text='GRAMMYS'/>
                    <NavText href='/nominations/oscar/2023' text='OSCARS'/>
                    <NavText href='/nominations/tony/2023' text='TONYS'/>
                    <NavText href='/trivia' text='TRIVIA'/>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
