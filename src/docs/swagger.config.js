import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description: "Documentacion de la API de ShipNow: usuarios, locales, pedidos, mocks y logger."
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor local"
      }
    ]
  },
  // donde va a buscar la documentacion de los endpoints
  apis: ["./src/docs/**/*.yaml"]
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions);