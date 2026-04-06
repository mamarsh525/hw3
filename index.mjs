import express from 'express';
import axios from 'axios';
import csc from 'country-state-city';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Route 1: Home page
app.get('/', (req, res) => {
  res.render('home');
});

// Route 2: Search by character name - GET
app.get('/search-name', (req, res) => {
  res.render('search-name', {
    results: null,
    error: null,
    searchTerm: ''
  });
});

// Route 3: Search by character name - POST (form input)
app.post('/search-name', async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.render('search-name', {
      results: null,
      error: 'Please enter a character name',
      searchTerm: ''
    });
  }

  try {
    const response = await axios.get(`https://rickandmortyapi.com/api/character/?name=${name}`);
    const results = response.data.results;

    res.render('search-name', {
      results,
      error: null,
      searchTerm: name
    });
  } catch (error) {
    res.render('search-name', {
      results: null,
      error: `No characters found matching "${name}"`,
      searchTerm: name
    });
  }
});

// Route 4: Search by species - GET
app.get('/search-species', (req, res) => {
  res.render('search-species', {
    results: null,
    error: null,
    searchSpecies: ''
  });
});

// Route 5: Search by species - POST (form input)
app.post('/search-species', async (req, res) => {
  const { species } = req.body;

  if (!species || species.trim() === '') {
    return res.render('search-species', {
      results: null,
      error: 'Please enter a species name',
      searchSpecies: ''
    });
  }

  try {
    const response = await axios.get(`https://rickandmortyapi.com/api/character/?species=${species}`);
    const results = response.data.results;

    res.render('search-species', {
      results,
      error: null,
      searchSpecies: species
    });
  } catch (error) {
    res.render('search-species', {
      results: null,
      error: `No characters found with species "${species}"`,
      searchSpecies: species
    });
  }
});

// Route 6: Random character
app.get('/random', async (req, res) => {
  try {
    const randomId = Math.floor(Math.random() * 826) + 1;
    const response = await axios.get(`https://rickandmortyapi.com/api/character/${randomId}`);
    const character = response.data;

    res.render('random', { character, error: null });
  } catch (error) {
    res.render('random', { character: null, error: 'Could not fetch random character' });
  }
});

// Route 7: Locations - search real countries and Rick and Morty locations
app.get('/locations', async (req, res) => {
  const showAll = req.query.all === 'true';

  if (showAll) {
    try {
      const countries = csc.Country.getAllCountries();
      const response = await axios.get('https://rickandmortyapi.com/api/location');
      const rickmortylocs = response.data.results;

      res.render('locations', {
        countries,
        rickmortylocs,
        searchTerm: '',
        error: null,
        showAll: true
      });
    } catch (error) {
      res.render('locations', {
        countries: [],
        rickmortylocs: [],
        searchTerm: '',
        error: 'Could not load locations',
        showAll: true
      });
    }
  } else {
    res.render('locations', {
      countries: null,
      rickmortylocs: null,
      searchTerm: '',
      error: null,
      showAll: false
    });
  }
});

app.post('/locations', async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm || searchTerm.trim() === '') {
    return res.render('locations', {
      countries: null,
      rickmortylocs: null,
      searchTerm: '',
      error: 'Please enter a search term'
    });
  }

  try {
    // Search real countries
    const allCountries = csc.Country.getAllCountries();
    const countries = allCountries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Search Rick and Morty locations
    const response = await axios.get('https://rickandmortyapi.com/api/location');
    const allLocations = response.data.results;
    const rickmortylocs = allLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.render('locations', {
      countries,
      rickmortylocs,
      searchTerm,
      error: null
    });
  } catch (error) {
    res.render('locations', {
      countries: null,
      rickmortylocs: null,
      searchTerm,
      error: 'Could not search locations'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using Rick and Morty API for character data`);
  console.log(`Using country-state-city package for location data`);
});
