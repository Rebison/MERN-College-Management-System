// swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation with versioning and role-based endpoints",
    },
    components: {
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
        },
        ForbiddenError: {
          description: "You do not have permission to access this resource",
        },
        NotImplementedError: {
          description: "Method not available in this version",
        },
      },
      schemas: {
        User: {

        }
      },
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
    security: [{ cookieAuth: [] }],
    servers: [
      {
        url: "http://localhost:3000/",
        description: "Development server",
      },
      {
        url: "https://api.bharathuniv.ac.in/",
        description: "Production server",
      },
    ],
  },
  apis: ["./routes/**/*.js"], // reads all route files
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;