const request = require("supertest");
const app = require("../../server");

describe("Products API - Integração", () => {
  test("deve criar, buscar e excluir um produto", async () => {
    const unique = Date.now();
    const newProduct = {
      nome: `Produto Teste ${unique}`,
      qtd: 2,
      precovenda: 30.0,
      precocompra: 20.0,
      dtval: "2025-12-31",
    };

    // Create
    const createRes = await request(app).post("/api/produtos").send(newProduct);
    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty("product.id");
    const id = createRes.body.product.id;

    // Get by id
    const getRes = await request(app).get(`/api/produtos/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty("id", id);

    // Delete
    const delRes = await request(app).delete(`/api/produtos/${id}`);
    expect(delRes.status).toBe(200);

    // Confirma 404 após deleção
    const getAfterDel = await request(app).get(`/api/produtos/${id}`);
    expect(getAfterDel.status).toBe(404);
  });
});
