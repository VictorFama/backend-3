// listas de los errores con el codigo y el mensaje que ve el cliente
export const ERROR_DICTIONARY = Object.freeze({
  // usuario
  USER_NOT_FOUND: { statusCode: 404, message: "El usuario no existe." },
  USER_ALREADY_EXISTS: { statusCode: 409, message: "Ya existe un usuario con ese email." },
  INVALID_USER_ROLE: { statusCode: 400, message: "El rol indicado no es valido." },

  // local
  STORE_NOT_FOUND: { statusCode: 404, message: "El local no existe" },
  INVALID_STORE_OWNER: { statusCode: 409, message: "El usuario no tiene rol de local" },

  // pedido
  ORDER_NOT_FOUND: { statusCode: 404, message: "No se encontro el pedido" },
  ORDER_ITEMS_REQUIRED: { statusCode: 400, message: "El pedido tiene que incluir al menos un item" },
  INVALID_ORDER_ITEM: { statusCode: 400, message: "Alguno de los items del pedido es invalido" },
  INVALID_ORDER_STATUS: { statusCode: 400, message: "El estado indicado no es valido para un pedido" },
  ORDER_ALREADY_CLOSED: { statusCode: 409, message: "El pedido ya esta cerrado" },

  // mock
  INVALID_MOCK_AMOUNT: { statusCode: 400, message: "La cantidad de registros a generar es invalida" },
  MOCK_DEPENDENCIES_MISSING: { statusCode: 409, message: "Faltan datos previos para generar los mocks" },
  MOCK_GENERATION_ERROR: { statusCode: 500, message: "No se pudieron generar los datos de prueba" },

  // archivo
  FILE_REQUIRED: { statusCode: 400, message: "Hay que adjuntar un archivo" },
  INVALID_FILE_TYPE: { statusCode: 400, message: "El tipo de archivo no esta permitido" },
  FILE_TOO_LARGE: { statusCode: 400, message: "El archivo supera el tamano maximo de 5 MB" },
  INVALID_FILE_FIELD: { statusCode: 400, message: "El campo del archivo no es el esperado" },
  INVALID_DOCUMENT_TYPE: { statusCode: 400, message: "El tipo de documento no es valido" },
  UPLOAD_ERROR: { statusCode: 500, message: "No se pudo guardar el archivo" },

  // errore generales
  VALIDATION_ERROR: { statusCode: 400, message: "Datos invalidos o incompletos." },
  ROUTE_NOT_FOUND: { statusCode: 404, message: "La ruta solicitada no existe." },
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Error interno del servidor." }
});