import fs from "fs";
import path from "path";
import { Router } from "express";
import { fileURLToPath, pathToFileURL } from "url";
import AppError from "#utils/AppError.js";
import { auth } from "#middlewares/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadRoutes = async (app) => {
  const routesDir = __dirname;

  const versions = fs
    .readdirSync(routesDir)
    .filter((dir) => fs.lstatSync(path.join(routesDir, dir)).isDirectory());

  const versionRouters = {};

  for (const [idx, version] of versions.entries()) {
    const router = Router();
    const versionPath = path.join(routesDir, version);

    const files = fs
      .readdirSync(versionPath)
      .filter((file) => file.endsWith("Routes.js"));

    for (const file of files) {
      const filePath = path.join(versionPath, file);

      // ✅ ESM-safe dynamic import
      const routeModule = await import(pathToFileURL(filePath));

      const route =
        routeModule.default || routeModule.router || routeModule;

      if (!route || typeof route.use !== "function") {
        throw new Error(
          `Invalid route export in ${file}. Must export an Express Router instance.`
        );
      }

      const routePath = `/${file.replace("Routes.js", "").toLowerCase()}`;
      const isPublic = routeModule.isPublic === true;

      if (isPublic) {
        router.use(routePath, route);
      } else {
        router.use(routePath, auth, route);
      }
    }

    versionRouters[version] = router;

    router.use((req, res, next) => {
      next(
        new AppError(
          `Cannot find ${req.originalUrl} on this server (version ${version})`,
          404
        )
      );
    });

    app.use(`/api/${version}`, router);
  }

  app.use("/api", (req, res, next) => {
    next(new AppError(`API route not found: ${req.originalUrl}`, 404));
  });
};

export default loadRoutes;
