import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'odontApp API',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema odontológico',
    },
    servers: [
        {
            url: process.env.API_URL || 'http://localhost:4000/api',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/routes/*.js', './src/modules/**/controllers/*.js'], // ajustar según estructura
};
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
