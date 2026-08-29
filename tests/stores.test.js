import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import StoreModel from "../src/models/store.model.js";
import { USER_ROLES } from "../src/constants/userroles.js";

const requester = supertest(app);

const ID_INEXISTENTE = "665f4d0a8f9a1b001234abcd";
const NOMBRE_LOCAL = "Test Local";

// un local solo lo puede tener un usuario con rol store
const duenioDePrueba = () => ({
  firstName: "Test",
  lastName: "Owner",
  email: `test-owner-${Date.now()}@shipnow.test`,
  password: "coder123",
  role: USER_ROLES.STORE
});

const clienteDePrueba = () => ({
  firstName: "Test",
  lastName: "Customer",
  email: `test-customer-${Date.now()}@shipnow.test`,
  password: "coder123",
  role: USER_ROLES.CUSTOMER
});

describe("Testing stores", () => {
  let duenio;
  let local;

  // cada test arranca con un dueño y un local}
  beforeEach(async () => {
    duenio = await UserModel.create(duenioDePrueba());

    local = await StoreModel.create({
      name: NOMBRE_LOCAL,
      address: "Av. Siempre Viva 742",
      owner: duenio._id
    });
  });

  afterEach(async () => {
    await StoreModel.deleteMany({ name: NOMBRE_LOCAL });
    await UserModel.deleteMany({ email: /^test-/ });
  });

  it("GET /api/stores devuelve la lista de locales", async () => {
    const response = await requester.get("/api/stores");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.not.be.empty;
  });

  it("GET /api/stores devuelve los locales con el dueño", async () => {
    const response = await requester.get("/api/stores");
    const store = response.body.payload.find((s) => s._id === local._id.toString());

    expect(store).to.have.property("name", NOMBRE_LOCAL);
    expect(store).to.have.property("address");
    expect(store).to.have.property("isActive", true);
    expect(store.owner).to.be.an("object");
    expect(store.owner.email).to.equal(duenio.email);
  });

  it("POST /api/stores crea un local y responde 201", async () => {
    const response = await requester.post("/api/stores").send({
      name: NOMBRE_LOCAL,
      address: "Av. Siempre Viva 742",
      owner: duenio._id.toString()
    });

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.have.property("_id");
    expect(response.body.payload.name).to.equal(NOMBRE_LOCAL);
    expect(response.body.payload.isActive).to.equal(true);
  });

  it("POST /api/stores responde 400 si faltan campos obligatorios", async () => {
    const response = await requester.post("/api/stores").send({ name: NOMBRE_LOCAL });

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("VALIDATION_ERROR");
    expect(response.body).to.have.property("message");
  });

  it("POST /api/stores responde 409 si el dueño no tiene rol store", async () => {
    const cliente = await UserModel.create(clienteDePrueba());

    const response = await requester.post("/api/stores").send({
      name: NOMBRE_LOCAL,
      address: "Av. Siempre Viva 742",
      owner: cliente._id.toString()
    });

    expect(response.status).to.equal(409);
    expect(response.body.error).to.equal("INVALID_STORE_OWNER");
  });

  it("GET /api/stores/:sid responde 404 si no existe el local", async () => {
    const response = await requester.get(`/api/stores/${ID_INEXISTENTE}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("STORE_NOT_FOUND");
  });

});