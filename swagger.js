const swaggerAutogen = require('swagger-autogen')()

const outputFile = './autogened-swagger.json'
const endpointsFiles = ['./routes/admin.routes.js', './routes/voter.routes.js']
const doc = {
    info: {
        version: "1.0.0",
        title: "EDS API",
        description: "Made with ♥ by Roggy"
    },
    host: 'localhost:5000',
    basePath: '/',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'Admin',
            description: 'Admin operations',
        },
        {
            name: 'Voter',
            description: 'Voter operations',
        },
    ],

}

swaggerAutogen(outputFile, endpointsFiles, doc)
    .then(() => {
        console.log('Swagger file generated successfully');
        require("./server")
    })
    .catch((error) => {
        console.error('Error generating Swagger file:', error);
    });

// (async () => {
//     await swaggerAutogen(outputFile, endpointsFiles, doc);
//     console.log('Swagger JSON file has been generated');
//   })();