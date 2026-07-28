import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.config.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Jeet Clinic Management API",
      version: "1.0.0",
      description:
        "Doctor Appointment & Clinic Management System — API documentation covering Auth, Clinic, Doctor, Receptionist, Patient, Appointment, Queue, Announcement, Admin, Dashboard, and Reports modules.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.js"],
};

export const swaggerSpec = swaggerJSDoc(options);