// app.js
import express, { json, static as serveStatic } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import connectMongo from "connect-mongo";
import passport from "passport";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import loadRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import requestId from "./middlewares/requestId.js";
import { auth, serverStatus } from "./middlewares/auth.js";

export default async function createApp({ isProduction, FRONTEND_URL, MONGO_URI, SESSION_SECRET }) {
  const app = express();

  const { create } = connectMongo;
  const { urlencoded } = bodyParser;

  app.use(requestId());
  app.use(helmet({
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(compression());
  app.use(morgan(isProduction ? "combined" : "dev"));

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );

  app.set("trust proxy", 1);
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: create({
        mongoUrl: MONGO_URI,
        ttl: 14 * 24 * 60 * 60,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Public docs
  const swaggerDocument = YAML.load("./swagger/bundle.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  loadRoutes(app);

  app.use("/uploads", serveStatic("uploads"));

  // Error handler
  app.use(errorHandler);

  return app;
}
