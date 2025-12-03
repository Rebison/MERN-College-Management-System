import fs from "fs";
import path from "path";
import { Router } from "express";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import AppError from "#utils/AppError.js";
import { auth } from "#middlewares/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const loadRoutes = (app) => {
  const routesDir = path.join(__dirname);

  // Get all version folders (v1, v2, ...)
  const versions = fs
    .readdirSync(routesDir)
    .filter((dir) => fs.lstatSync(path.join(routesDir, dir)).isDirectory());

  // Map of version -> router
  const versionRouters = {};

  versions.forEach((version, idx) => {
    const router = Router();
    const versionPath = path.join(routesDir, version);

    // Load each route file in this version
    fs.readdirSync(versionPath).forEach((file) => {
      if (file.endsWith("Routes.js")) {
        const filePath = path.join(versionPath, file);
        const routeModule = require(filePath);

        const route = routeModule?.default || routeModule?.router || routeModule;
        if (!route || typeof route.use !== "function") {
          throw new Error(
            `Invalid route export in ${file}. Must export an Express Router instance.`
          );
        }

        const routePath = `/${file.replace("Routes.js", "").toLowerCase()}`;
        const isPublic = routeModule.isPublic === true;

        // Public vs Protected
        if (isPublic) {
          router.use(routePath, route);
        } else {
          router.use(routePath, auth, route);
        }
      }
    });

    // Store router for potential fallback
    versionRouters[version] = router;

    // Internal fallback: call previous version router if route not found
    router.all("*", (req, res, next) => {
      // const fallbackVersion = versions[idx - 1];
      // if (fallbackVersion && versionRouters[fallbackVersion]) {
      //   return versionRouters[fallbackVersion].handle(req, res, next);
      // }
      next(
        new AppError(
          `Cannot find ${req.originalUrl} on this server (version ${version})`,
          404
        )
      );
    });

    // Mount this version router
    app.use(`/api/${version}`, router);
  });

  // Global fallback for any /api/* route
  app.all("/api/*", (req, res, next) => {
    next(new AppError(`API route not found: ${req.originalUrl}`, 404));
  });
};

export default loadRoutes;
