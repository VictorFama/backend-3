import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);

describe("Testing de los endpoints", () => {

  it("GET /loggerTest genera los logs y responde 200", async () => {
    const response = await requester.get("/loggerTest");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.message).to.equal("Logs generados correctamente");
  });

  it("GET /health responde 200 con el estado de la API", async () => {
    const response = await requester.get("/health");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body).to.have.property("environment");
    expect(response.body).to.have.property("uptime");
    expect(response.body).to.have.property("timestamp");
  });

  it("GET /api/docs/ para la documentacion de Swagger", async () => {
    const response = await requester.get("/api/docs/");

    expect(response.status).to.be.oneOf([200, 301, 302]);
  });

  it("GET a una ruta inexistente responde 404 y avisa", async () => {
    const response = await requester.get("/api/testing");

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("ROUTE_NOT_FOUND");
    expect(response.body).to.have.property("message");
  });

});