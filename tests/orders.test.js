import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import StoreModel from "../src/models/store.model.js";
import OrderModel from "../src/models/order.model.js";
import { USER_ROLES } from "../src/constants/userroles.js";
import { ORDER_STATUS } from "../src/constants/orderstatus.js";

const requester = supertest(app);

const ID_INEXISTENTE = "665f4d0a8f9a1b001234abcd";
const NOMBRE_LOCAL = "Test Local";

const ITEMS = [
  { name: "Empanadas de carne", quantity: 12, price: 1500 }
];

describe("Testing orders", () => {
  let cliente;
  let local;

  // cada test arranca con un cliente y un local recien creados sino no hay ordenes posibles
  beforeEach(async () => {
    cliente = await UserModel.create({
      firstName: "Test",
      lastName: "Customer",
      email: `test-${Date.now()}@shipnow.test`,
      password: "coder123",
      role: USER_ROLES.CUSTOMER
    });

    local = await StoreModel.create({
      name: NOMBRE_LOCAL,
      address: "Av. Siempre Viva 742",
      owner: cliente._id
    });
  });

   afterEach(async () => {
    await OrderModel.deleteMany({});
    await StoreModel.deleteMany({ name: NOMBRE_LOCAL });
    await UserModel.deleteMany({ email: /^test-/ });
  });

  // datos validos para crear un pedido desp del beforeEach
  const pedidoValido = () => ({
    customer: cliente._id.toString(),
    store: local._id.toString(),
    deliveryAddress: "Av. Siempre Viva 742",
    items: ITEMS
  });

  it("GET /api/orders devuelve la lista de pedidos", async () => {
    await requester.post("/api/orders").send(pedidoValido());

    const response = await requester.get("/api/orders");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.not.be.empty;
  });

  it("POST /api/orders crea el pedido le calcula el total y lo deja en created", async () => {
    const response = await requester.post("/api/orders").send(pedidoValido());

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.have.property("_id");
    expect(response.body.payload.total).to.equal(18000);
    expect(response.body.payload.status).to.equal(ORDER_STATUS.CREATED);
    expect(response.body.payload.items).to.be.an("array").with.lengthOf(1);
  });

  it("GET /api/orders/:oid devuelve el pedido con el cliente y el local", async () => {
    const creado = await requester.post("/api/orders").send(pedidoValido());
    const oid = creado.body.payload._id;

    const response = await requester.get(`/api/orders/${oid}`);

    expect(response.status).to.equal(200);
    expect(response.body.payload._id).to.equal(oid);
    expect(response.body.payload.customer).to.be.an("object");
    expect(response.body.payload.customer.email).to.equal(cliente.email);
    expect(response.body.payload.store.name).to.equal(NOMBRE_LOCAL);
  });

  it("PUT /api/orders/:oid/status cambia el estado del pedido", async () => {
    const creado = await requester.post("/api/orders").send(pedidoValido());
    const oid = creado.body.payload._id;

    const response = await requester
      .put(`/api/orders/${oid}/status`)
      .send({ status: ORDER_STATUS.ASSIGNED });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload.status).to.equal(ORDER_STATUS.ASSIGNED);
  });

  it("POST /api/orders responde 400 por si faltan campos obligatorios", async () => {
    const { deliveryAddress, ...sinDireccion } = pedidoValido();

    const response = await requester.post("/api/orders").send(sinDireccion);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("VALIDATION_ERROR");
    expect(response.body).to.have.property("message");
  });

  it("POST /api/orders responde 400 si el pedido no tiene items", async () => {
    const response = await requester.post("/api/orders").send({ ...pedidoValido(), items: [] });

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal("ORDER_ITEMS_REQUIRED");
  });

  it("POST /api/orders responde 404 si el cliente no existe", async () => {
    const response = await requester
      .post("/api/orders")
      .send({ ...pedidoValido(), customer: ID_INEXISTENTE });

    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal("USER_NOT_FOUND");
  });

  it("GET /api/orders/:oid responde 404 si el pedido no existe", async () => {
    const response = await requester.get(`/api/orders/${ID_INEXISTENTE}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("ORDER_NOT_FOUND");
  });

  it("PUT /api/orders/:oid/status responde 400 si el estado no es valido", async () => {
    const creado = await requester.post("/api/orders").send(pedidoValido());
    const oid = creado.body.payload._id;

    const response = await requester
      .put(`/api/orders/${oid}/status`)
      .send({ status: "yendo" });

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal("INVALID_ORDER_STATUS");
  });

});