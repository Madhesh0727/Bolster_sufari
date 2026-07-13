const axios = require('axios');
const client = axios.create({ baseURL: 'https://bolster-sufari.onrender.com/api' });
console.log(client.getUri({ url: '/settings/public/' }));
console.log(client.getUri({ url: 'settings/public/' }));
