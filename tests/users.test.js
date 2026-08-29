import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import { USER_ROLES } from "../src/constants/userroles.js";

const requester = supertest(app);

// id con forma valida de ObjectId que no existe en la base
const ID_INEXISTENTE = "665f4d0a8f9a1b001234abcd";

// todos los usuarios que creados aca empiezan por test-
const usuarioDePrueba = () => ({
  firstName: "Test",
  lastName: "User",
  email: `test-${Date.now()}@shipnow.test`,
  password: "coder123",
  role: USER_ROLES.CUSTOMER
});

describe("Testing users", () => {

  // cada test arranca con la base vacia de usuarios de prueba
  afterEach(async () => {
    await UserModel.deleteMany({ email: /^test-/ });
  });

  it("GET /api/users devuelve la lista de usuarios", async () => {
    await UserModel.create(usuarioDePrueba());

    const response = await requester.get("/api/users");

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("object");
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.not.be.empty;
  });

  it("GET /api/users devuelve usuarios con sus campos y sin el password", async () => {
    const creado = await UserModel.create(usuarioDePrueba());

    const response = await requester.get("/api/users");
    const usuario = response.body.payload.find((u) => u._id === creado._id.toString());

    expect(usuario).to.have.property("_id");
    expect(usuario).to.have.property("firstName");
    expect(usuario).to.have.property("lastName");
    expect(usuario).to.have.property("email");
    expect(usuario).to.have.property("role");
    expect(usuario).to.not.have.property("password");
  });

  it("POST /api/users crea un usuario y responde 201", async () => {
    const datos = usuarioDePrueba();

    const response = await requester.post("/api/users").send(datos);

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.have.property("_id");
    expect(response.body.payload.email).to.equal(datos.email);
    expect(response.body.payload.role).to.equal(USER_ROLES.CUSTOMER);
    expect(response.body.payload).to.not.have.property("password");
  });

  it("POST /api/users responde 400 si faltan campos obligatorios", async () => {
    const response = await requester.post("/api/users").send({ firstName: "Test" });

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("VALIDATION_ERROR");
    expect(response.body).to.have.property("message");
  });

  it("POST /api/users responde 409 si el email es repetido", async () => {
    const datos = usuarioDePrueba();
    await UserModel.create(datos);

    const response = await requester.post("/api/users").send(datos);

    expect(response.status).to.equal(409);
    expect(response.body.error).to.equal("USER_ALREADY_EXISTS");
  });

  it("GET /api/users/:uid responde 404 si no existe el usuario", async () => {
    const response = await requester.get(`/api/users/${ID_INEXISTENTE}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("USER_NOT_FOUND");
  });

});