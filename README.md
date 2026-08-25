# ShipNow API 

API de logistica hecha con Node, Express y MongoDB.

## Entrega del Modulo 1: base profesional de ShipNow con capas y entorno

### Como correr el proyecto

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` copiando `.env.example` y completar estas tres variables:

- `PORT` - puerto de la API, por ejemplo 8080
- `MONGODB_URI` - la cadena de conexion de MongoDB
- `NODE_ENV` - development, production o test

Si falta alguna la app no arranca y avisa cual falta.

Levantar el servidor:

```bash
npm run dev
```

Para probar que anda: `GET http://localhost:8080/health`

### Estructura

```
src/
├── config/         db.js y env.js
├── constants/      roles, estados y prioridades
├── models/         esquemas de Mongoose
├── repositories/   acceso a datos
├── services/       reglas de negocio
├── controllers/    req y res
├── routes/         paths
├── app.js
└── server.js
```

Una request pasa por: Router → Controller → Service → Repository → MongoDB

### Endpoints

- `/api/users` - listar, ver por id y crear usuarios
- `/api/stores` - listar, ver por id y crear locales
- `/api/orders` - listar, ver por id, crear y cambiar el estado de pedidos

### Por que separe Service y Repository

El Repository es el unico lugar donde se usa Mongoose. Si maniana cambio de base de
datos, reescribo esa carpeta y el resto del proyecto queda igual. Por eso sus metodos
no son un pasamanos: `usersRepository.findAll()` ya excluye el password y
`storesRepository.findAll()` filtra los locales inactivos, sin que el resto del
proyecto tenga que saberlo.

El Service tiene las reglas del negocio: que el total de un pedido lo calcule la API
y no llegue desde afuera, que un pedido entregado no cambie mas de estado, que un
local solo lo pueda tener un usuario con rol store. Como no recibe req ni res, no
depende de Express y se puede probar sin levantar el servidor.

Asi cada cambio toca un archivo solo: como se guardan los datos es del repository, las
reglas son del service y las respuestas HTTP son del controller.

## Entrega Módulo 2 — Mocking y carga de datos de prueba en ShipNow

El proyecto incluye un modulo que genera datos falsos con Faker, para no tener que
cargarlos a mano. Hay dos tipos de endpoint y la diferencia entre ellos es importante:

- Los GET devuelven datos inventados pero no los guardan.
- El POST inserta los registros en MongoDB.

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/api/mocks/mockingusers?qty=5` | Devuelve 5 usuarios falsos sin guardarlos |
| GET | `/api/mocks/mockingorders?qty=3` | Devuelve 3 pedidos falsos sin guardarlos |
| POST | `/api/mocks/generateData` | Inserta usuarios, locales y pedidos en la base |

### Como probarlos

Los dos GET se pueden abrir directo en el navegador con el servidor levantado:

    http://localhost:8080/api/mocks/mockingusers?qty=5
    http://localhost:8080/api/mocks/mockingorders?qty=3


El POST se prueba desde postman

    Metodo: POST
    URL:    http://localhost:8080/api/mocks/generateData
    Body:

    {
      "users": 10,
      "stores": 4,
      "orders": 20
    }

Y responde con cuantos registros creo:

    {
      "status": "success",
      "message": "Datos generados",
      "payload": { "users": 10, "stores": 4, "orders": 20 }
    }

Despues de correrlo, `/api/users`, `/api/stores` y `/api/orders` van a tener esos
registros nuevos.

### Que datos se generan

- Usuarios: nombre, apellido, email y password generados con Faker. La mitad se
  crean con rol `customer` y la mitad con rol `store`, porque un local necesita un
  dueño con ese rol. 
- Locales: nombre y direccion, asignados a uno de los usuarios con rol `store`.
- Pedidos: entre 1 y 3 items con nombre, cantidad y precio. El total se calcula
  a partir de los items, igual que en el service real. Apuntan a un cliente y un
  local que existen de verdad.

Los estados y prioridades salen de los archivos de `src/constants/`, no estan
escritos a mano.

### El orden de creacion

    1. usuarios   no dependen de nada
    2. locales    necesitan un usuario con rol store
    3. pedidos    necesitan un cliente y un local


### Limites

Ninguna cantidad puede superar 100 por request. Si se manda un valor negativo, no
numerico o mayor al tope, la API responde 400 con el detalle de cual campo esta mal.
