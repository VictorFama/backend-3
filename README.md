# ShipNow API

API de logistica hecha con Node, Express y MongoDB.
Entrega del Modulo 1: el proyecto queda organizado en capas y la configuracion
de entorno se valida al arrancar.

## Como correr el proyecto

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

## Estructura

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

## Endpoints

- `/api/users` - listar, ver por id y crear usuarios
- `/api/stores` - listar, ver por id y crear locales
- `/api/orders` - listar, ver por id, crear y cambiar el estado de pedidos

## Por que separe Service y Repository

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
