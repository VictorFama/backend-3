import { expect } from "chai";
import supertest from "supertest";
import fs from "fs";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import { USER_ROLES } from "../src/constants/userroles.js";
import { DOCUMENT_TYPES } from "../src/constants/documentTypes.js";

const requester = supertest(app);

// el archivo que se sube en los tests
const ARCHIVO_DE_PRUEBA = "tests/archivos/document.pdf";

const ID_INEXISTENTE = "665f4d0a8f9a1b001234abcd";

const usuarioDePrueba = () => ({
  firstName: "Test",
  lastName: "Upload",
  email: `test-${Date.now()}@shipnow.test`,
  password: "coder123",
  role: USER_ROLES.CUSTOMER
});

describe("Testing carga de archivos", () => {
  let usuario;

  // los archivos que quedan en uploads/ se borran al terminar cada test
  const subidos = [];

  beforeEach(async () => {
    usuario = await UserModel.create(usuarioDePrueba());
  });

  afterEach(async () => {
    await UserModel.deleteMany({ email: /^test-/ });

    while (subidos.length > 0) {
      await fs.promises.rm(subidos.pop(), { force: true });
    }
  });

  it("POST /api/users/:uid/documents sube un documento y lo asocia al usuario", async () => {
    const response = await requester
      .post(`/api/users/${usuario._id}/documents`)
      .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
      .attach("document", ARCHIVO_DE_PRUEBA);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload.documents).to.be.an("array").with.lengthOf(1);

    const documento = response.body.payload.documents[0];
    subidos.push(documento.path);

    expect(documento.originalName).to.equal("document.pdf");
    expect(documento.fileName).to.be.a("string").and.to.not.equal("document.pdf");
    expect(documento.mimeType).to.equal("application/pdf");
    expect(documento.size).to.be.a("number").and.to.be.above(0);
    expect(documento.type).to.equal(DOCUMENT_TYPES.USER_DOCUMENT);
    expect(documento).to.have.property("uploadedAt");

    // el archivo esta en el disco no en la base
    expect(fs.existsSync(documento.path)).to.equal(true);
  });

  it("POST /api/users/:uid/documents responde 400 si no llega el archivo", async () => {
    const response = await requester
      .post(`/api/users/${usuario._id}/documents`)
      .field("type", DOCUMENT_TYPES.USER_DOCUMENT);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("FILE_REQUIRED");
    expect(response.body).to.have.property("message");
  });

  it("POST /api/users/:uid/documents responde 400 si el tipo de documento es invalido", async () => {
    const response = await requester
      .post(`/api/users/${usuario._id}/documents`)
      .field("type", "pasaporte")
      .attach("document", ARCHIVO_DE_PRUEBA);

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal("INVALID_DOCUMENT_TYPE");

    // el usuario no quedo con el documento pegado
    const enLaBase = await UserModel.findById(usuario._id);
    expect(enLaBase.documents).to.be.an("array").that.is.empty;
  });

  it("POST /api/orders/:oid/proof responde 404 si el pedido no existe", async () => {
    const response = await requester
      .post(`/api/orders/${ID_INEXISTENTE}/proof`)
      .attach("proof", ARCHIVO_DE_PRUEBA);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.error).to.equal("ORDER_NOT_FOUND");
  });

});

    