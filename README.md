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

**Usuarios**

| Metodo | Ruta | Parametros | Que hace |
|---|---|---|---|
| GET | `/api/users` | query `role` (opcional): `admin`, `customer` o `store` | Lista usuarios. Sin `role` los trae a todos. El password nunca sale en la respuesta |
| GET | `/api/users/:uid` | `uid` en la ruta | Devuelve un usuario |
| POST | `/api/users` | body | Crea un usuario |

Body de `POST /api/users`:

    {
      "firstName": "Victor",
      "lastName": "Fama",
      "email": "victor@test.com",
      "password": "123456",
      "role": "customer"
    }

`role` es opcional, por defecto queda `customer`. El email no se puede repetir.

**Locales**

| Metodo | Ruta | Parametros | Que hace |
|---|---|---|---|
| GET | `/api/stores` | ninguno | Lista los locales activos |
| GET | `/api/stores/:sid` | `sid` en la ruta | Devuelve un local |
| POST | `/api/stores` | body | Crea un local |

Body de `POST /api/stores`:

    {
      "name": "Kiosco 24hs",
      "address": "Av. Siempreviva 742",
      "owner": "68b1f2c9a1e4d30012ab34cd"
    }

`owner` tiene que ser el id de un usuario con rol `store`.

**Pedidos**

| Metodo | Ruta | Parametros | Que hace |
|---|---|---|---|
| GET | `/api/orders` | query `customer`, `store` y `status`, todos opcionales y combinables | Lista pedidos |
| GET | `/api/orders/:oid` | `oid` en la ruta | Devuelve un pedido |
| POST | `/api/orders` | body | Crea un pedido |
| PUT | `/api/orders/:oid/status` | `oid` en la ruta + body | Cambia el estado |

- `customer` y `store` son ids de usuario y de local.
- `status` tiene que ser uno de: `created`, `assigned`, `picked_up`, `in_transit`,
  `delivered`, `cancelled`.

Se pueden combinar:

    /api/orders?status=created
    /api/orders?customer=68b1f2c9a1e4d30012ab34cd&status=delivered

Body de `POST /api/orders`:

    {
      "customer": "68b1f2c9a1e4d30012ab34cd",
      "store": "68b1f2c9a1e4d30012ab34ef",
      "deliveryAddress": "Av. Siempreviva 742",
      "items": [
        { "name": "Coca 1.5L", "quantity": 2, "price": 1800 }
      ],
      "priority": "high"
    }

`priority` es opcional (`low`, `normal` o `high`, por defecto `normal`). El `total` lo
calcula la API a partir de los items, no se manda desde afuera. El pedido nace en
estado `created`.

Body de `PUT /api/orders/:oid/status`:

    { "status": "in_transit" }

Un pedido en `delivered` o `cancelled` ya no admite cambios.

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

`qty` es opcional: por defecto son 10 usuarios y 5 pedidos. En `generateData` los tres
campos del body tambien son opcionales y arrancan en 0. El tope en todos es 100.

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

## Entrega Módulo 3 — Manejo profesional de errores

Todos los errores de la API salen por un middleware global, con el mismo formato.

### La estructura de la respuesta de error

Todas las respuestas de error tienen la misma forma:

    {
      "status": "error",
      "error": "ORDER_NOT_FOUND",
      "message": "No se encontro el pedido"
    }

- `status` siempre vale `"error"`.
- `error` es el codigo interno del problema.
- `message` es la explicacion para el usuario.

Fuera de produccion se suma un campo `details` con el detalle concreto del caso:

    {
      "status": "error",
      "error": "VALIDATION_ERROR",
      "message": "Datos invalidos o incompletos.",
      "details": "Faltan campos obligatorios: firstName, lastName, email, password"
    }
  
Cuando `NODE_ENV` vale `production` ese campo no se manda, para no exponer datos
internos del servidor.

### Los codigos de error

| Codigo | Status | Cuando aparece |
|---|---|---|
| `USER_NOT_FOUND` | 404 | el usuario que se pidio no existe |
| `USER_ALREADY_EXISTS` | 409 | ya hay un usuario con ese email |
| `INVALID_USER_ROLE` | 400 | el rol no es uno de los de `constants/userroles.js` |
| `STORE_NOT_FOUND` | 404 | el local no existe |
| `INVALID_STORE_OWNER` | 409 | el dueño existe pero no tiene rol `store` |
| `ORDER_NOT_FOUND` | 404 | el pedido no existe |
| `ORDER_ITEMS_REQUIRED` | 400 | el pedido llego sin items |
| `INVALID_ORDER_ITEM` | 400 | algun item no tiene `name`, `quantity` o `price` validos |
| `INVALID_ORDER_STATUS` | 400 | el estado no es uno de los de `constants/orderstatus.js` |
| `ORDER_ALREADY_CLOSED` | 409 | el pedido ya esta entregado o cancelado |
| `INVALID_MOCK_AMOUNT` | 400 | la cantidad es negativa, no numerica o supera el tope de 100 |
| `MOCK_DEPENDENCIES_MISSING` | 409 | faltan datos previos para generar los mocks |
| `MOCK_GENERATION_ERROR` | 500 | fallo la insercion de los mocks en MongoDB |
| `VALIDATION_ERROR` | 400 | faltan campos obligatorios en el body |
| `ROUTE_NOT_FOUND` | 404 | la ruta pedida no existe |
| `INTERNAL_SERVER_ERROR` | 500 | error inesperado |

### Como probar los casos invalidos

Con el servidor levantado, estos se abren en el navegador:

    /api/noexiste                                404 ROUTE_NOT_FOUND
    /api/users?role=hacker                       400 INVALID_USER_ROLE
    /api/users/000000000000000000000000          404 USER_NOT_FOUND
    /api/orders?status=prueba                    400 INVALID_ORDER_STATUS

Los del modulo de mocks, tambien desde el navegador:

    /api/mocks/mockingusers?qty=-5               400 INVALID_MOCK_AMOUNT
    /api/mocks/mockingusers?qty=diez             400 INVALID_MOCK_AMOUNT
    /api/mocks/mockingusers?qty=99999            400 INVALID_MOCK_AMOUNT

Desde Postman:

    POST /api/users               body {}                  400 VALIDATION_ERROR
    POST /api/mocks/generateData  body { "users": -3 }     400 INVALID_MOCK_AMOUNT
    POST /api/mocks/generateData  body { "users": "diez" } 400 INVALID_MOCK_AMOUNT

## Entrega Módulo 4 — Logging y monitoreo basico
El proyecto deja de usar `console.log` y ahora todos los mensajes salen por un logger centralizado con el formato de fecha, nivel y mensaje

### Que herramienta se usa

- **Winston** para el logger y los niveles.
- **winston-daily-rotate-file** para partir el archivo de errores por dia.

### Los niveles

| Nivel | Numero | Cuando se usa | Va al archivo de logs |
|---|---|---|---|
| `fatal` | 0 | el servidor no pudo arrancar | si |
| `error` | 1 | una operacion fallo (5xx) | si |
| `warning` | 2 | error esperado del cliente (4xx) | no |
| `info` | 3 | arranque, conexion a Mongo, pedido creado, cambio de estado | no |
| `http` | 4 | una linea por cada peticion que entra | no |
| `debug` | 5 | detalle de desarrollo y stack traces | no |

En Winston el numero mas bajo es el mas importante.

### Como probar el logger

Con el servidor levantado:

    GET http://localhost:8080/loggerTest

Tambien responde en `/api/loggerTest`. Dispara los seis niveles de una sola vez y
devuelve:

    {
      "status": "success",
      "message": "Logs generados correctamente"
    }

En la consola salen las seis lineas:

    2026-08-27 15:41:02 [debug]    debug - informacion detallada para pruebas
    2026-08-27 15:41:02 [http]     http - registro de una solicitud HTTP
    2026-08-27 15:41:02 [info]     info - informacion general del sistema
    2026-08-27 15:41:02 [warning]  warning - algo merece atencion
    2026-08-27 15:41:02 [error]    error - una operacion fallo
    2026-08-27 15:41:02 [fatal]    fatal - error critico del sistema

Y en el archivo de Logs se registran los error y fatal.


### Ejemplos de cada nivel

**debug** — detalle de desarrollo:

    GET http://localhost:8080/api/mocks/mockingusers?qty=3

    2026-08-27 17:06:56 [debug]    Generando 3 usuarios falsos (no se guardan)

**http** — una linea por cada peticion que entra:

    GET http://localhost:8080/health

    2026-08-27 17:09:44 [http]     GET /health -> 200 (1ms)

**info** — evento normal e importante:

    POST http://localhost:8080/api/orders

    {
      "customer": "6a8d8a04f9f39b9cc4149b04",
      "store": "6a8d8a04f9f39b9cc4149b09",
      "deliveryAddress": "Zeballos 1281",
      "items": [
        { "name": "Empanadas de carne", "quantity": 12, "price": 800 },
        { "name": "Gaseosa 1.5L", "quantity": 1, "price": 2200 }
      ]
    }

    2026-08-27 17:15:54 [info]     Pedido 6a909afa7e25565871155f7c creado para el cliente 6a8d8a04f9f39b9cc4149b04 (2 items, total 11800)

**warning** — error esperado, el cliente pidio algo que no existe:

    GET http://localhost:8080/api/orders/000000000000000000000000

    2026-08-27 17:20:35 [warning]  ORDER_NOT_FOUND - GET /api/orders/000000000000000000000000 -> No se encontro el pedido

**error** — error inesperado del servidor (5xx):

    GET http://localhost:8080/api/users/error

    2026-08-27 17:21:35 [error]    INTERNAL_SERVER_ERROR - GET /api/users/error -> Cast to ObjectId failed for value "error" (type string) at path "_id" for model "User"

**fatal** — el sistema no puede funcionar, por ejemplo si falla la conexion a Mongo. no dispara Http.

    2026-08-27 17:24:22 [fatal]    No se pudo iniciar el servidor: bad auth : Authentication failed.

### Donde se guardan los logs

En la carpeta `logs/`, un archivo por dia:

    logs/errors-2026-08-27.log
    logs/errors-2026-08-28.log

- Se guardan los niveles `error` y `fatal`. Los `info`, `warning`, `http` y `debug` se ven en consola pero no quedan en disco.
- Quedan por 14 dias y los mas viejos se borran solos, para que la carpeta no crezca.

### Que se ignora en Git

Los archivos de log los genera la aplicacion en cada ejecucion, asi que no van al repositorio:

    logs/
    *.log

La carpeta `logs/` se crea sola la primera vez que el logger escribe, no hace falta crearla a mano. Los archivos pueden contener detalles internos del sistema, por eso
quedan afuera del repo.

### El comportamiento segun el entorno

El nivel minimo con el que arranca el logger sale de `NODE_ENV`, y se resuelve en
`src/config/env.js`:

| NODE_ENV | Nivel minimo | Que se registra |
|---|---|---|
| `development` | `debug` | `debug`, `http`, `info`, `warning`, `error` y `fatal` |
| `production` | `info` | `info`, `warning`, `error` y `fatal` |

En produccion no se generan los `debug` ni los `http`, para no llenar de ruido el servidor real.

El archivo de errores no cambia con el entorno, tanto el dev y prod guardan en el mismo archivo y solo guardan `error` y `fatal`.