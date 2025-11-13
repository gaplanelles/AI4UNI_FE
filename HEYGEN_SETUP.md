# 🎭 Configuración de HeyGen Avatar

Esta guía te ayudará a configurar el avatar de HeyGen en tu aplicación.

## 🔑 **Paso 1: Obtener API Key de HeyGen**

1. Ve a [HeyGen](https://www.heygen.com/)
2. Crea una cuenta o inicia sesión
3. Ve a tu **Dashboard** → **API Keys**
4. Genera una nueva API key
5. Copia la API key (¡guárdala en un lugar seguro!)

## ⚙️ **Paso 2: Configurar Variables de Entorno**

1. En la raíz del proyecto, crea un archivo `.env`:

```bash
cp env.example .env
```

2. Abre el archivo `.env` y agrega tu API key:

```env
VITE_HEYGEN_API_KEY=tu-api-key-real-aqui
VITE_HEYGEN_API_URL=https://api.heygen.com/v1
VITE_HEYGEN_AVATAR_NAME=default
```

### **Configuración de avatares:**

HeyGen ofrece varios avatares. Para usar uno específico:

1. Ve a tu [HeyGen Dashboard](https://app.heygen.com/)
2. Ve a **Avatars**
3. Copia el **Avatar ID** del avatar que quieras usar
4. Actualiza `VITE_HEYGEN_AVATAR_NAME` en tu `.env`:

```env
VITE_HEYGEN_AVATAR_NAME=tu-avatar-id-aqui
```

**Avatares populares:**
- `default` - Avatar por defecto
- Consulta la [documentación de HeyGen](https://docs.heygen.com/docs/streaming-avatar) para más opciones

## 🚀 **Paso 3: Iniciar la Aplicación**

```bash
npm run dev
```

La aplicación iniciará el avatar automáticamente cuando cargue la página.

## 🎤 **Configuración de Voz**

Puedes personalizar la voz del avatar editando `src/components/HeyGenAvatar.jsx`:

```javascript
voice: {
  rate: 0.9,              // Velocidad (0.5 - 2.0)
  emotion: VoiceEmotion.FRIENDLY,  // Emoción
  // voiceId: "tu-voice-id"  // ID de voz específico (opcional)
}
```

**Emociones disponibles:**
- `VoiceEmotion.FRIENDLY` - Amigable
- `VoiceEmotion.SERIOUS` - Serio
- `VoiceEmotion.SOOTHING` - Calmado
- `VoiceEmotion.BROADCASTER` - Locutor

## 🌍 **Idiomas**

Para configurar el idioma, puedes especificar un `voiceId` específico del idioma que desees:

```javascript
voice: {
  rate: 0.9,
  emotion: VoiceEmotion.FRIENDLY,
  voiceId: "a78e0a4dbbe247d0a704b91175e6d987"  // Español
}
```

**IDs de voces comunes:**
- Inglés: `"default"` o consulta la documentación
- Español: `"a78e0a4dbbe247d0a704b91175e6d987"`
- Consulta [HeyGen Voices](https://docs.heygen.com/docs/list-voices-v2) para más opciones

## 🔧 **Solución de Problemas**

### **Avatar no se carga**

1. **Verifica tu API key:**
   - Asegúrate de que esté correctamente copiada en `.env`
   - Verifica que el archivo se llame exactamente `.env` (no `.env.txt`)

2. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C) y reinícialo
   npm run dev
   ```

3. **Verifica la consola del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Busca mensajes de error

### **Error de autenticación**

Si ves un error como "Unauthorized" o "Invalid API key":

1. Verifica que tu API key sea válida en el dashboard de HeyGen
2. Asegúrate de que no haya espacios al inicio o final de la API key
3. Verifica que tengas créditos suficientes en tu cuenta de HeyGen

### **Avatar no habla**

1. Verifica que el audio del navegador no esté silenciado
2. Comprueba que el navegador tenga permisos de audio
3. Verifica en la consola si hay errores de reproducción

### **Video no se muestra**

1. Verifica tu conexión a internet
2. Algunos firewalls o VPNs pueden bloquear el streaming
3. Intenta con otro navegador (Chrome recomendado)

## 💰 **Costos**

HeyGen es un servicio de pago que cobra por:
- **Créditos por minuto** de uso del avatar
- Consulta la [página de precios de HeyGen](https://www.heygen.com/pricing) para detalles

**Recomendaciones:**
- Monitorea tu uso en el dashboard
- Considera implementar límites de uso en producción
- Para desarrollo, HeyGen suele ofrecer créditos de prueba

## 📚 **Recursos Adicionales**

- [Documentación oficial de HeyGen](https://docs.heygen.com/)
- [API Reference](https://docs.heygen.com/reference/streaming-avatar-api)
- [Lista de avatares](https://app.heygen.com/avatars)
- [Lista de voces](https://docs.heygen.com/docs/list-voices-v2)

## 🎯 **Funcionalidades Implementadas**

✅ Inicialización automática del avatar
✅ Reproducción de texto (text-to-speech)
✅ Detección de inicio/fin de habla
✅ Manejo de desconexiones
✅ Loading states
✅ Responsive design

## 🔄 **Integración con LLM**

Cuando integres con un LLM (OpenAI, Claude, etc.), el avatar automáticamente:

1. Recibirá la respuesta del LLM
2. Filtrará las fórmulas y gráficos (solo hablará el texto)
3. Convertirá el texto a voz
4. Sincronizará labios con el audio

**Ejemplo de integración:**

```javascript
const handleSubmit = async (text) => {
  const response = await fetch('tu-llm-endpoint', {
    method: 'POST',
    body: JSON.stringify({ question: text })
  })
  const data = await response.json()
  
  // Mostrar en pizarra
  setBlackboardContent(data.answer)
  
  // Avatar hablará (sin fórmulas/gráficos)
  const textOnly = data.answer.replace(/###GRAPH\{.+?\}###END/gs, '')
  setTextToSpeak(textOnly)
}
```

## 🎨 **Personalización del Avatar**

Para personalizar la apariencia del contenedor del avatar, edita:
- `src/components/HeyGenAvatar.css` - Estilos del contenedor
- `src/App.css` - Layout de la aplicación

---

¿Necesitas ayuda? Consulta la [documentación de HeyGen](https://docs.heygen.com/) o abre un issue en el repositorio.

