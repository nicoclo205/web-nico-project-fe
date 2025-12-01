/**
 * Convierte cualquier error de API a una única cadena de texto para mostrar al usuario
 * Priorizando el primer error encontrado
 * @param error Error capturado en el catch
 * @returns String con el primer mensaje de error encontrado
 */
export const errorToString = (error: any): string => {
  // Si no hay respuesta, probablemente sea un error de red
  if (!error.response) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }

  console.log("Error response data:", error.response.data);
  
  try {
    // Si es un string directamente, retornarlo
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    
    // Si tiene un campo de error específico
    if (error.response.data && error.response.data.error) {
      return String(error.response.data.error);
    }
    
    // Si tiene un campo de mensaje
    if (error.response.data && error.response.data.message) {
      return String(error.response.data.message);
    }
    
    // Si tiene un campo detail (común en Django Rest Framework)
    if (error.response.data && error.response.data.detail) {
      return String(error.response.data.detail);
    }
    
    // Si es un objeto con errores por campo (común en validaciones)
    if (error.response.data && typeof error.response.data === 'object') {
      // Extraer solo el primer error del primer campo con errores
      for (const [field, messages] of Object.entries(error.response.data)) {
        if (Array.isArray(messages) && messages.length > 0) {
          return `${field}: ${messages[0]}`;
        } else if (typeof messages === 'string') {
          return `${field}: ${messages}`;
        }
      }
      
      // Si no se pudo extraer un mensaje específico, tomar solo el primer 
      // campo y valor como mensaje (en lugar del objeto completo)
      const firstField = Object.keys(error.response.data)[0];
      if (firstField) {
        const value = error.response.data[firstField];
        if (value !== undefined && value !== null) {
          return `${firstField}: ${value}`;
        }
      }
      
      // Si todo lo anterior falla, pero hay datos, retornar un mensaje genérico
      return "Error en los datos proporcionados";
    }
    
    // Mensaje con código de estado HTTP
    return `Error ${error.response.status}: No se pudo completar la operación`;
  } catch (conversionError) {
    // Si ocurre algún error al procesar el error
    console.error('Error al procesar el mensaje de error:', conversionError);
    return "Ocurrió un error inesperado. Intente nuevamente.";
  }
};