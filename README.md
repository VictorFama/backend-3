# ShipNow API

API REST para la gestion de logistica y envios: usuarios, locales y pedidos, con
seguimiento de estados y carga de documentos y comprobantes.

Proyecto integrador del curso de Desarrollo Backend III. Se construyo en ocho entregas,
cada una sumando una capa sobre la anterior: arquitectura, mocks, errores, logging,
documentacion, testing, archivos y Docker.

## Tecnologias

| | |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 4 |
| Base de datos | MongoDB con Mongoose 8 |
| Datos de prueba | Faker |
| Logging | Winston + winston-daily-rotate-file |
| Documentacion | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing | Mocha, Chai y Supertest |
| Archivos | Multer |
| Contenedores | Docker y Docker Compose |

## Arquitectura

Arquitectura por capas. Cada peticion recorre siempre el mismo camino y ninguna capa
saltea a la siguiente:

```
Router → Controller → Service → Repository → Model → MongoDB
```

| Capa | Responsabilidad | Que NO hace |
|---|---|---|
| Router | conecta la ruta con el controller | no tiene logica |
| Controller | lee `req`, arma la respuesta | no importa Mongoose |
| Service | reglas de negocio y validaciones | no toca `req` ni `res` |
| Repository | unica capa que habla con Mongoose | no decide reglas |
| Model | el esquema de la coleccion | |

```
src/
├── config/         variables de entorno validadas, conexion y logger
├── constants/      roles, estados, prioridades y tipos de documento
├── controllers/
├── docs/           swagger.config.js y un YAML por modulo
├── middlewares/    errores, 404, logging HTTP y carga de archivos
├── mock/           generadores con Faker
├── models/
├── repositories/
├── routes/
├── services/
├── utils/          AppError y el diccionario de errores
├── app.js          la app de Express, sin levantar el servidor
└── server.js       conecta a Mongo, escucha, y cierra ordenado con SIGTERM
tests/              la suite, con setup.js aparte
```

## Variables de entorno

Estan todas en `.env.example`. El proyecto **no arranca** si falta alguna de las
obligatorias: `config/env.js` las valida al inicio y corta con un mensaje que dice cual.

| Variable | Obligatoria | Que es |
|---|---|---|
| `PORT` | si | puerto donde escucha la API. Tiene que ser un entero positivo |
| `MONGODB_URI` | si | string de conexion de MongoDB |
| `NODE_ENV` | si | `development`, `production` o `test`. Cualquier otro valor corta el arranque |
| `LOG_LEVEL` | no | nivel minimo que publica el logger: `fatal`, `error`, `warning`, `info`, `http` o `debug`. Vacio: `info` en produccion, `debug` en el resto |

`process.env` se lee en un solo archivo, `src/config/env.js`. El resto del proyecto importa
`envConfig` desde ahi.

Para los tests hay un segundo archivo, `.env.test`, con las mismas variables y
`NODE_ENV=test`. El modelo es `.env.test.example`.

## Instalacion

```bash
git clone https://github.com/VictorFama/backend-3.git
cd backend-3
npm install
```

Copiar `.env.example` a `.env` y completar los valores:

```bash
cp .env.example .env
```

## Ejecucion local

Necesita una base de MongoDB accesible (Atlas o local) en `MONGODB_URI`.

```bash
npm run dev     # con nodemon, reinicia al guardar
npm start       # sin nodemon
```

La API queda en `http://localhost:8080`. Para comprobar que esta viva:

```bash
curl http://localhost:8080/health
```

Si no tenes una base a mano, la forma mas rapida de levantar todo es Docker Compose, que
trae su propia instancia de MongoDB. Esta mas abajo.

## Tests

```bash
npm test
```

Mocha organiza y ejecuta, Chai valida y Supertest hace las peticiones HTTP contra la app
importada, sin abrir un puerto.

**Necesita una base de datos de testing separada.** Los tests borran datos, asi que hay dos
candados en `tests/setup.js`: corta si `NODE_ENV` no es `test`, y corta de nuevo si el nombre
de la base a la que se conecto no contiene `test`.

Para correrlos hay que crear `.env.test` a partir de `.env.test.example`, con `NODE_ENV=test`
y un `MONGODB_URI` que apunte a una base terminada en `-test`.

Son 41 tests repartidos asi:

| Archivo | Tests | Que cubre |
|---|---|---|
| `app.test.js` | 4 | `/loggerTest`, `/health`, la ruta de Swagger y el 404 de una ruta inexistente |
| `users.test.js` | 7 | listado, creacion, 400 por campos faltantes, 409 por email repetido, 404 y 400 por id invalido |
| `stores.test.js` | 6 | listado, creacion, validaciones y 404 |
| `orders.test.js` | 12 | listado, creacion, consulta por id, cambio de estado, cancelacion y sus errores |
| `mocks.test.js` | 6 | generacion de usuarios y pedidos, e inserción en la base |
| `uploads.test.js` | 6 | carga de un documento y de un comprobante, archivo faltante, tipo de archivo invalido, tipo de documento invalido y entidad inexistente |

Cada grupo limpia lo que crea. No dependen del orden de ejecucion ni de datos cargados a mano.

## Swagger

Con el servidor levantado:

```
http://localhost:8080/api/docs
```

Documenta 14 endpoints agrupados por tag: **Users**, **Stores**, **Orders**, **Mocks**,
**Logger** y **Health**. Incluye los schemas de usuario, local, pedido, item, documento y
las dos respuestas estandar (`SuccessResponse` y `ErrorResponse`), los parametros de
paginacion, los bodies, las respuestas exitosas y las de error de cada operacion. Los dos
endpoints de carga de archivos estan documentados como `multipart/form-data`.

Se puede probar cada endpoint desde la misma pagina con **Try it out**.

**Sobre el tag "Deliveries":** la consigna nombra un modulo de *entregas* que en ShipNow no
existe como entidad propia. El dominio es `User`, `Store` y `Order`, y el seguimiento de una
entrega son los estados de un pedido (`created`, `assigned`, `picked_up`, `in_transit`,
`delivered`, `cancelled`), que se consultan y actualizan por los endpoints de Orders.
Documentar un schema de "entrega" seria documentar algo que la API no devuelve, y la propia
consigna pide que Swagger coincida con las rutas reales.

**En produccion Swagger queda accesible**, a diferencia de `/api/mocks` y `/loggerTest`. Es
una decision deliberada: la documentacion no expone datos ni permite operaciones que los
endpoints no permitan por si solos, y sirve para que un tercero entienda como consumir la API.

## Docker

### Con Docker Compose (recomendado)

Levanta la API **y su propia instancia de MongoDB**. No hace falta `.env` ni una base
externa: las variables estan en el `docker-compose.yml`.

```bash
docker compose up --build
```

La API espera a que Mongo este listo antes de arrancar: el servicio `mongo` tiene un
`healthcheck` y el servicio `api` depende de el con `condition: service_healthy`. Por eso
entre que arranca Mongo y aparece el log de la API pasan unos segundos.

Queda en `http://localhost:8080`, con Swagger en `/api/docs`.

**La base arranca vacia.** Para cargarle datos de prueba:

```bash
curl -X POST http://localhost:8080/api/mocks/generateData \
  -H "Content-Type: application/json" \
  -d '{"users":5,"stores":2,"orders":5}'
```

Para bajar todo:

```bash
docker compose down        # conserva los datos
docker compose down -v     # borra tambien el volumen de Mongo
```

Variables que usa el compose:

| Variable | Valor | Por que |
|---|---|---|
| `PORT` | `8080` | el puerto publicado |
| `NODE_ENV` | `development` | para que `/api/mocks` y `/loggerTest` queden accesibles y la consola muestre los logs |
| `MONGODB_URI` | `mongodb://mongo:27017/shipnow` | `mongo` es el nombre del servicio, Docker lo resuelve en su red interna |
| `LOG_LEVEL` | `debug` | para ver toda la actividad al levantar |

### Solo la imagen de la API

Si preferis usar tu propia base (Atlas, por ejemplo):

```bash
docker build -t shipnow-api .
docker run -p 8080:8080 --env-file .env shipnow-api
```

El `Dockerfile` es **multi-stage**: la primera etapa instala las dependencias con
`npm ci --omit=dev` y la segunda se queda solo con `node_modules`, `package.json` y `src/`.
La imagen final no lleva las herramientas de desarrollo (163 paquetes contra 246) ni los
tests, el README o los dotfiles.

El `.dockerignore` deja afuera `node_modules`, `.env`, `.env.test`, `.git`, `logs`,
`uploads` y `coverage`: ningun archivo con credenciales entra a la imagen.

Para verificarlo:

```bash
docker run --rm shipnow-api ls -a /app
```

## Logs y uploads

### Logs

Logger centralizado con Winston, en `src/config/logger.js`, con seis niveles propios
ordenados de mas grave a menos: `fatal`, `error`, `warning`, `info`, `http`, `debug`.

Tres transportes:

| Transporte | Que guarda |
|---|---|
| Consola | todo, **solo fuera de produccion**. Con `NODE_ENV=production` no publica una sola linea |
| `logs/error-%DATE%.log` | unicamente `error` y `fatal` |
| `logs/combined-%DATE%.log` | toda la actividad, incluidas las peticiones HTTP |

Son el `error.log` y el `combined.log` que pide la consigna, con la rotacion diaria que pide
el modulo de logging: un archivo por dia, y se borran a los 14.

**Los logs no se suben al repositorio.** La carpeta `logs/` esta en `.gitignore` y en
`.dockerignore`, y se crea sola al arrancar.

### Uploads

Los archivos se guardan en el disco del servidor; **en la base van solo los metadatos**
(nombre original, nombre generado, ruta, tipo MIME, tamano, tipo de documento y fecha).

```
uploads/
├── documents/   documentos de usuario (campo `document`)
└── proofs/      comprobantes de pedido (campo `proof`)
```

Se aceptan PDF, JPEG, PNG y WEBP, hasta 5 MB. Cualquier otro tipo, un archivo faltante o un
campo con otro nombre devuelven un error del diccionario con el formato estandar de la API.

**Los archivos subidos no se suben al repositorio.** El `.gitignore` tiene `uploads/*` con una
excepcion para los `.gitkeep`, de modo que la estructura de carpetas queda versionada y el
contenido no.

**Dentro de un contenedor, `logs/` y `uploads/` son efimeros**: viven mientras viva el
contenedor y se pierden al recrearlo. Para conservarlos habria que montarlos como volumen.

## Manejo de errores

Todos los errores salen con la misma forma, sin importar el endpoint:

```json
{
  "status": "error",
  "error": "ORDER_NOT_FOUND",
  "message": "No se encontro el pedido"
}
```

El `error` es un codigo del diccionario (`src/utils/errorDictionary.js`), que ademas define
el status HTTP de cada uno. Un middleware global (`src/middlewares/errorHandler.js`) captura
cualquier excepcion, la traduce y la registra en el logger: `warning` si es 4xx, `error` si
es 5xx.

Fuera de produccion la respuesta puede traer un campo `details` con informacion de contexto.
En produccion no se manda.

## Endpoints principales

La referencia completa, con parametros, bodies y respuestas, esta en Swagger
(`http://localhost:8080/api/docs`). Este es el resumen:

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/health` | estado de la API |
| GET | `/api/users` | lista usuarios. Acepta `role`, `page` y `limit` |
| GET | `/api/users/:uid` | un usuario |
| POST | `/api/users` | crea un usuario |
| POST | `/api/users/:uid/documents` | sube un documento y lo asocia al usuario |
| GET | `/api/stores` | lista locales. Acepta `page` y `limit` |
| GET | `/api/stores/:sid` | un local |
| POST | `/api/stores` | crea un local |
| GET | `/api/orders` | lista pedidos. Acepta `customer`, `store`, `status`, `page` y `limit` |
| GET | `/api/orders/:oid` | un pedido |
| POST | `/api/orders` | crea un pedido |
| PUT | `/api/orders/:oid/status` | cambia el estado de un pedido |
| DELETE | `/api/orders/:oid` | cancela el pedido (baja logica, no lo borra) |
| POST | `/api/orders/:oid/proof` | sube el comprobante de entrega |
| GET | `/api/docs` | documentacion Swagger |

Los tres listados paginan con `page` y `limit`. `limit` vale 10 por defecto y **no puede
superar 100**: un valor mayor devuelve `400 VALIDATION_ERROR`. Es el tope que protege a la
base de consultas que traigan colecciones enteras.

**Solo fuera de produccion** (con `NODE_ENV=production` responden 404):

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/api/mocks/mockingusers` | genera usuarios falsos sin guardarlos |
| GET | `/api/mocks/mockingorders` | genera pedidos falsos sin guardarlos |
| POST | `/api/mocks/generateData` | genera e inserta usuarios, locales y pedidos |
| GET | `/loggerTest` | dispara un log de cada nivel |

---

## Historial de las pre-entregas

El detalle de como se construyo el proyecto, entrega por entrega, con las decisiones
tomadas en cada una.


### Entrega del Modulo 1: base profesional de ShipNow con capas y entorno

#### Como correr el proyecto

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

#### Estructura

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

#### Endpoints

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

#### Por que separe Service y Repository

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

### Entrega Módulo 2 — Mocking y carga de datos de prueba en ShipNow

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

#### Como probarlos

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

#### Que datos se generan

- Usuarios: nombre, apellido, email y password generados con Faker. La mitad se
  crean con rol `customer` y la mitad con rol `store`, porque un local necesita un
  dueño con ese rol. 
- Locales: nombre y direccion, asignados a uno de los usuarios con rol `store`.
- Pedidos: entre 1 y 3 items con nombre, cantidad y precio. El total se calcula
  a partir de los items, igual que en el service real. Apuntan a un cliente y un
  local que existen de verdad.

Los estados y prioridades salen de los archivos de `src/constants/`, no estan
escritos a mano.

#### El orden de creacion

    1. usuarios   no dependen de nada
    2. locales    necesitan un usuario con rol store
    3. pedidos    necesitan un cliente y un local


#### Limites

Ninguna cantidad puede superar 100 por request. Si se manda un valor negativo, no
numerico o mayor al tope, la API responde 400 con el detalle de cual campo esta mal.

### Entrega Módulo 3 — Manejo profesional de errores

Todos los errores de la API salen por un middleware global, con el mismo formato.

#### La estructura de la respuesta de error

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

#### Los codigos de error

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

#### Como probar los casos invalidos

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

### Entrega Módulo 4 — Logging y monitoreo basico
El proyecto deja de usar `console.log` y ahora todos los mensajes salen por un logger centralizado con el formato de fecha, nivel y mensaje

#### Que herramienta se usa

- **Winston** para el logger y los niveles.
- **winston-daily-rotate-file** para partir el archivo de errores por dia.

#### Los niveles

| Nivel | Numero | Cuando se usa | Va al archivo de logs |
|---|---|---|---|
| `fatal` | 0 | el servidor no pudo arrancar | si |
| `error` | 1 | una operacion fallo (5xx) | si |
| `warning` | 2 | error esperado del cliente (4xx) | no |
| `info` | 3 | arranque, conexion a Mongo, pedido creado, cambio de estado | no |
| `http` | 4 | una linea por cada peticion que entra | no |
| `debug` | 5 | detalle de desarrollo y stack traces | no |

En Winston el numero mas bajo es el mas importante.

#### Como probar el logger

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


#### Ejemplos de cada nivel

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

#### Donde se guardan los logs

En la carpeta `logs/`, un archivo por dia:

    logs/error-2026-08-26.log
    logs/error-2026-08-27.log
    logs/combined-2026-08-26.log
    logs/combined-2026-08-27.log

- `error-*.log` guarda solo los niveles `error` y `fatal`.
- `combined-*.log` guarda toda la actividad, incluidas las peticiones HTTP.
- Quedan por 14 dias y los mas viejos se borran solos, para que la carpeta no crezca.

#### Que se ignora en Git

Los archivos de log los genera la aplicacion en cada ejecucion, asi que no van al repositorio:

    logs/
    *.log

La carpeta `logs/` se crea sola la primera vez que el logger escribe, no hace falta crearla a mano. Los archivos pueden contener detalles internos del sistema, por eso
quedan afuera del repo.

#### El comportamiento segun el entorno

El nivel minimo con el que arranca el logger sale de `NODE_ENV`, y se resuelve en
`src/config/env.js`:

| NODE_ENV | Nivel minimo | Que se registra |
|---|---|---|
| `development` | `debug` | `debug`, `http`, `info`, `warning`, `error` y `fatal` |
| `production` | `info` | `info`, `warning`, `error` y `fatal` |

En produccion no se generan los `debug` ni los `http`, para no llenar de ruido el servidor real.

El archivo de errores no cambia con el entorno, tanto el dev y prod guardan en el mismo archivo y solo guardan `error` y `fatal`.


### Entrega Módulo 5 — Documentación de API con Swagger

La API está documentada con Swagger. Con el servidor levantado se puede ver la documentacion en:

    http://localhost:8080/api/docs

Para levantar el servidor: `npm run dev` desde la carpeta del proyecto.

#### Que modulos estan documentados

Catorce endpoints agrupados en cinco tags:

| Tag | Endpoints | Que hace |
|---|---|---|
| Users | 3 | lista con filtro por rol, busca por id, crea |
| Stores | 3 | lista, busca por id, crea |
| Orders | 4 | lista con filtros, busca por id, crea, cambia el estado |
| Mocks | 3 | genera sin guardar, genera pedidos, inserta en mongo |
| Logger | 1 | dispara los seis niveles |

Cada endpoint documenta metodo, ruta, descripcion, parametros, body esperado, la respuesta exitosa y los errores que puede devolver.


#### Como esta organizada la documentacion

La configuracion de Swagger esta en `src/docs/swagger.config.js`, separada de las rutas:
no hay ni un comentario de Swagger dentro de los routers ni de los controllers.

Cada modulo tiene su archivo YAML en `src/docs/`:

    swagger.config.js    la configuracion general
    schemas.yaml         los 6 schemas 
    users.yaml           
    stores.yaml
    orders.yaml          
    mocks.yaml          
    logger.yaml

Los schemas se definen una vez y se referencian con `$ref` desde todos los endpoints que
los necesitan. Los errores se documentan siempre con el schema `ErrorResponse`.

#### Como probar los endpoints

En Swagger, todos se prueban igual, desplegar el endpoint, apretar **Try it out** completar lo que pida y apretar **Execute**. La respuesta aparece abajo, con el status y
el body.


**Users**

- `GET /api/users` — elegir un rol en el desplegable o dejarlo vacio para traer todos y Execute. De aca salen los ids de usuario para el resto.
- `GET /api/users/{uid}` — pegar un id de usuario en el campo `uid` y Execute.
- `POST /api/users` — completar el Request body, que viene con un ejemplo cargado y Execute. El email no se puede repetir: si se manda dos veces, responde 409.

**Stores**

- `GET /api/stores` — Execute directo no lleva parametros.
- `GET /api/stores/{sid}` — pegar un id de local y Execute.
- `POST /api/stores` — completar el body. El `owner` tiene que ser el id de un usuario con rol `store`, que se saca de `GET /api/users?role=store`. Si se manda un cliente
  devuelve 409.

**Orders**

- `GET /api/orders` — los filtros son opcionales `customer`, `store` y `status` se pueden completar o dejarlos vacios. El `status` es un combo. Execute.
- `GET /api/orders/{oid}` — pegar un id de pedido y Execute.
- `POST /api/orders` — completar el body con un `customer` y un `store` que existan, la direccion y los items. El `total` no se manda: lo calcula la API.
- `PUT /api/orders/{oid}/status` — pegar el id del pedido arriba y en el body dejar solo el estado nuevo. Un pedido `delivered` o `cancelled` ya no cambia: responde 409.

**Mocks**

- `GET /api/mocks/mockingusers` — poner un `qty` o dejarlo vacio (10 por defecto) y Execute. No guarda nada, solo muestra.
- `GET /api/mocks/mockingorders` — igual, 5 por defecto. Necesita clientes y locales ya cargados; sino responde 409.
- `POST /api/mocks/generateData` — completar cuantos usuarios, locales y pedidos y Execute. Es la forma mas rapida de llenar la base la primera vez ya que esto si escribe y la base 
  va a estar vacia.

**Logger**

- `GET /loggerTest` — Execute directo. Ademas de la respuesta, en la consola del servidor aparecen las seis lineas de log, una por nivel.

### Entrega Módulo 6 — Testing funcional con Mocha, Chai y Supertest

La API tiene 30 tests que validan los endpoints principales, tanto en los casos exitosos como en los errores esperados.

#### Que herramientas se usan

- **Mocha** — organiza y ejecuta las pruebas (`describe`, `it`, hooks).
- **Chai** — valida los resultados (`expect`).
- **Supertest** — hace las peticiones HTTP contra la app de Express.

Las tres estan en `devDependencies`.

#### Como ejecutar los tests

    npm test

No hace falta levantar el servidor: Supertest importa la app desde `src/app.js`, que esta
separado de `src/server.js`.

#### Que modulos estan cubiertos

| Archivo | Tests | Que cubre |
|---|---|---|
| `tests/users.test.js` | 6 | listar, valida la estructura de la respuesta, crear, datos incompletos, email repetido, usuario inexistente |
| `tests/stores.test.js` | 6 | listar, valida la estructura de la respuesta, crear, datos incompletos, dueño con rol incorrecto, local inexistente |
| `tests/orders.test.js` | 9 | listar, crear, buscar por id, cambiar estado y los errores de cada uno |
| `tests/mocks.test.js` | 6 | mockingusers, mockingorders, generateData y cantidades invalidas |
| `tests/app.test.js` | 3 | `/loggerTest`, la ruta de Swagger y el 404 de ruta inexistente |


#### La base de datos de testing

Se utiliza una base de datos separada ya que los tests crean y borran datos.

Usa el mismo cluster de Atlas que usa el proyecto, apuntando a la base `shipnow-test`. No
hay que crearla Mongo la crea sola la primera vez que se escribe algo. 
Los datos que generan los tests se borran solos en los hooks `afterEach`.

`tests/setup.js` corta la ejecucion si `NODE_ENV` no es `test` o si la base a la que se
conecto no es de testing.

#### Que variables de entorno son necesarias

Un archivo `.env.test` en la raiz del proyecto, con las mismas tres variables que el `.env`:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `test` |
| `PORT` | `8081` |
| `MONGODB_URI` | la URI del cluster con la base `shipnow-test` al final |

Esta la plantilla en `.env.test.example` copiarla a `.env.test` y completar usuario y
password. El `.env.test` no se sube al repo igual que el `.env`.


### Entrega Módulo 7 — Carga de archivos, documentos y comprobantes con Multer

La API recibe archivos por
`multipart/form-data`, los guarda en carpetas del servidor y en MongoDB deja solo sus
metadatos, asociados a la entidad correspondiente.

Dos endpoints nuevos, los dos documentados en Swagger con el detalle de cada campo,
cada tipo permitido y cada error posible:

| Metodo | Ruta | Campo del archivo | Que hace |
|---|---|---|---|
| POST | `/api/users/:uid/documents` | `document` | Asocia un documento a un usuario |
| POST | `/api/orders/:oid/proof` | `proof` | Asocia el comprobante de entrega a un pedido |

#### Donde se guardan los archivos

    uploads/
      documents/    los documentos de usuario
      proofs/       los comprobantes de entrega

La carpeta se elige por el nombre del campo del archivo. Se crean solas la primera vez
que llega un archivo, asi que no hay que crearlas a mano despues de clonar el repo.

`uploads/` esta en el `.gitignore` desde la primera entrega: **los archivos subidos no
van al repositorio**. En la base se guardan solo los metadatos, nunca el archivo.

El nombre lo pone la API, nunca se usa el original, para que dos archivos con el mismo
nombre no se pisen:

    <timestamp>-<numero al azar><extension>     ej: 1756431234567-482910375.pdf

#### Los tipos de documento

Estan en `src/constants/documentTypes.js`: `user_document`, `driver_license` y
`delivery_proof`. El endpoint de documentos exige uno de los tres en el campo `type`.
El de comprobantes usa siempre `delivery_proof`, no hay que enviarlo.

#### Los tests

`tests/uploads.test.js` agrega 4 tests, carga correcta, archivo faltante, tipo de documento invalido y entidad inexistente. El PDF que suben esta en `tests/archivos/document.pdf` va al repositorio sin el, los tests no corren.


### Entrega Módulo 8 — Performance, escalabilidad y Docker

Esta entrega prepara la API para un entorno más cercano a producción: los listados dejan de
devolver la colección completa, el health check informa el estado real del proceso, las
herramientas internas se apagan en producción y la API se puede levantar dentro de un
contenedor Docker.

#### Qué cambió en performance

| | Antes | Ahora |
|---|---|---|
| `GET /api/users` | devolvía todos los usuarios | paginado, 10 por página |
| `GET /api/stores` | devolvía todos los locales activos | paginado, 10 por página |
| `GET /api/orders` | devolvía todos los pedidos | paginado, 10 por página |

Los tres aceptan `?page=` y `?limit=`, y se pueden combinar con los filtros que ya existían:

```
GET /api/users?role=store&page=2&limit=5
GET /api/orders?status=delivered&limit=20
```

La respuesta informa en qué página estás:

```json
{ "status": "success", "page": 2, "limit": 5, "payload": [] }
```

Si `page` o `limit` no son enteros mayores a cero, la API responde 400 `VALIDATION_ERROR`.

El resto de los puntos de performance ya estaban resueltos en entregas anteriores: la carga de
archivos tiene tope de 5 MB y cuatro tipos permitidos (Módulo 7), las consultas piden solo los
campos que muestran (`select("-password")` y los `populate` con proyección), y los logs de
peticiones HTTP no se publican en producción porque el logger arranca en nivel `info`.

#### Variables de entorno

Copiá `.env.example` a `.env` y completá los valores.

| Variable | Obligatoria | Qué es |
|---|---|---|
| `PORT` | sí | puerto en el que escucha la API |
| `MONGODB_URI` | sí | string de conexión de MongoDB Atlas |
| `NODE_ENV` | sí | `development`, `production` o `test` |
| `LOG_LEVEL` | no | nivel mínimo que publica el logger. Si se deja vacío: `info` en producción, `debug` en el resto |

La app valida las tres obligatorias al arrancar y no levanta si falta alguna: corta con un
mensaje que dice cuáles faltan. También valida que `NODE_ENV` sea uno de los tres valores
permitidos y que `PORT` sea un entero positivo.

No hay `JWT_SECRET` ni URLs de servicios externos porque el proyecto no tiene autenticación ni
integraciones con servicios de terceros.

Para los tests hay un archivo aparte, `.env.test`, con la base de testing (Módulo 6).

#### Cómo correr la API localmente

```bash
npm install
npm run dev        # con nodemon, para desarrollar
npm start          # sin nodemon, es el comando que usa el contenedor
```

La API queda en `http://localhost:8080` (o el puerto que tenga `PORT`).

#### Cómo correr los tests

```bash
npm test
```

Corre 34 tests con Mocha, Chai y Supertest contra la base de testing definida en `.env.test`.
Los tests no se corren dentro del contenedor: `.env.test` no se copia a la imagen.

#### Cómo acceder a Swagger

Con la API levantada: `http://localhost:8080/api/docs`

Están documentados los cinco módulos (Users, Stores, Orders, Mocks y Logger), incluidos los
parámetros de paginación.

#### Health check

```
GET /health
```

```json
{
  "status": "success",
  "message": "API funcionando",
  "environment": "production",
  "uptime": 12.53,
  "timestamp": "2026-09-04T12:35:16.580Z"
}
```

Devuelve el estado, el entorno, hace cuántos segundos arrancó el proceso y la hora del servidor.
No expone la URI de la base ni ninguna credencial.

#### Endpoints internos en producción

Con `NODE_ENV=production` no se montan `/api/mocks/*` ni `/loggerTest`: responden 404
`ROUTE_NOT_FOUND` como cualquier ruta inexistente.

Swagger (`/api/docs`) queda disponible en producción: es la documentación de la API y no
expone nada que la API no devuelva igual.

#### Docker

Construir la imagen (desde la raíz del proyecto, donde está el `Dockerfile`):

```bash
docker build -t shipnow-api .
```

Ejecutar el contenedor pasándole las variables de entorno:

```bash
docker run -p 8080:8080 --env-file .env shipnow-api
```

La API queda en `http://localhost:8080`. Para probar que levantó:

```
GET  http://localhost:8080/health
GET  http://localhost:8080/api/docs
GET  http://localhost:8080/api/users
```

El `.env` no está dentro de la imagen (está en el `.dockerignore`), por eso las variables se
pasan con `--env-file` al ejecutar. Si corrés el contenedor sin `--env-file`, la app corta al
arrancar avisando qué variables faltan.

Para pararlo:

```bash
docker ps
docker stop <id>
```

Docker manda `SIGTERM` y la app cierra el servidor antes de terminar, sin cortar las peticiones
en curso. Se ve en `docker logs <id>`.

#### Qué puerto usa la API

`8080` por defecto, definido en `PORT` y declarado en el `Dockerfile` con `EXPOSE 8080`. El
`-p 8080:8080` del `docker run` conecta el puerto de la máquina con el del contenedor: si
cambiás `PORT`, cambiá los dos.

#### Qué no se sube al repositorio

En `.gitignore`: `node_modules/`, `.env`, `.env.test`, `logs/`, `*.log`, `uploads/`, `coverage/`.

En `.dockerignore` (lo que no entra a la imagen): `node_modules`, `.env`, `.env.test`, `.git`,
`logs`, `uploads`, `coverage`, `npm-debug.log`.

`.env` y `.env.test` tienen la contraseña de la base y nunca se comparten. Lo que sí se
versiona es `.env.example`, con las claves vacías.

#### Logs y uploads dentro del contenedor

Los dos se generan adentro del contenedor y se pierden cuando el contenedor se elimina:

- los logs se escriben en `logs/error-YYYY-MM-DD.log` y `logs/combined-YYYY-MM-DD.log` (se guardan 14 días);
- los archivos que suben los usuarios van a `uploads/documents/` y `uploads/proofs/`.

Para producción de verdad habría que usar volúmenes de Docker o un servicio externo de
almacenamiento (S3, Cloudinary). En esta etapa el contenedor no es almacenamiento permanente.