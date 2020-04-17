// config.js
const config = {
    main: {
        host: process.env.NOW_URL,
        port: 443,
        restdb: 'https://signalbotdb-7661.restdb.io'
    },
    token: {
        tgtoken: '1171260649:AAEp4pMzUNOfcyJ9B9TE1l5xHeQPgpzGfCY',
        restdbtoken: 'fea127ead250ecd4f10575443a9564520d07c',
    }
};

module.exports = config;