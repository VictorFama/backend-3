import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import StoreModel from "../src/models/store.model.js";
import OrderModel from "../src/models/order.model.js";
import { USER_ROLES } from "../src/constants/userroles.js";

const requester = supertest(app);

describe("Testing mocks", () => {

  // mockingorders necesita clientes y locales reales en la base
  beforeEach(async () => {
    const cliente = await UserModel.create({
      firstName: "Test",
      lastName: "Customer",
      email: `test-${Date.now()}@shipnow.test`,
      password: "coder123",
      role: USER_ROLES.CUSTOMER
    });

    await StoreModel.create({
      name: "Test Local",
      address: "Av Siempre Viva 742",
      owner: cliente._id
    });
  });

  // generateData inserta usuarios con emails de faker
  afterEach(async () => {
    await OrderModel.deleteMany({});
    await StoreModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it("GET /api/mocks/mockingusers devuelve 10 usuarios", async () => {
    const response = await requester.get("/api/mocks/mockingusers");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array").with.lengthOf(10);
  });

  it("GET /api/mocks/mockingusers?qty=3 devuelve la cantidad ingresada", async () => {
    const response = await requester.get("/api/mocks/mockingusers?qty=3");

    expect(response.body.payload).to.have.lengthOf(3);

    response.body.payload.forEach((usuario) => {
      expect(usuario).to.have.property("firstName");
      expect(usuario).to.have.property("email");
      expect(usuario).to.have.property("role");
      expect(usuario).to.not.have.property("_id");
    });
  });

  it("GET /api/mocks/mockingorders devuelve pedidos", async () => {
    const response = await requester.get("/api/mocks/mockingorders");

    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an("array").with.lengthOf(5);

    response.body.payload.forEach((order) => {
      expect(order).to.have.property("customer");
      expect(order).to.have.property("store");
      expect(order).to.have.property("items");
      expect(order).to.have.property("total");
    });
  });

  it("GET /api/mocks/mockingusers?qty=-1 responde 400 INVALID_MOCK_AMOUNT", async () => {
    const response = await requester.get("/api/mocks/mockingusers?qty=-1");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
  });

  it("POST /api/mocks/generateData inserta los datos en la base", async () => {
    const response = await requester
      .post("/api/mocks/generateData")
      .send({ users: 4, stores: 2, orders: 3 });

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.message).to.equal("Datos generados");
    expect(response.body.payload).to.deep.equal({ users: 4, stores: 2, orders: 3 });

    expect(await OrderModel.countDocuments()).to.equal(3);
  });

  it("POST /api/mocks/generateData responde 400 si la cantidad es invalida", async () => {
    const response = await requester
      .post("/api/mocks/generateData")
      .send({ users: -1, stores: 0, orders: 0 });

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
  });

});