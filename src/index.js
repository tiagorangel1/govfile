import { Elysia, file } from "elysia";
import { staticPlugin } from "@elysiajs/static";

import api from "./api.js";

new Elysia()
  .get("/", () => file("./public/index.html"))
  .use(staticPlugin())
  .use(api)
  .listen(process.env.PORT || 3000);
