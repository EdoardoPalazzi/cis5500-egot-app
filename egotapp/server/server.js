const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/author/:type', routes.author);
app.get('/egots', routes.egots);
app.get('/nominee/:imdb_id', routes.nominee_detail);
app.get('/nominations/:award/:year', routes.nominations);
app.get('/trivia', routes.nominations);
app.get('/egots/youngest_fastest', routes.egots_youngest_fastest);

app.get('/recent_nominees',routes.recent_nominees);
app.get('/losses_before_first_win',routes.losses_before_first_win);
app.get('/nominee_most_categories',routes.nominee_most_categories);
app.get('/nominee_longest_year_span',routes.nominee_longest_year_span);
app.get('/losses_with_no_win',routes.losses_with_no_win);
app.get('/missing_one_award',routes.missing_one_award);
app.get('/hardest_categories',routes.hardest_categories)
app.get('/common_combos',routes.common_combos)
app.get('/egot_paths',routes.egot_paths);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
