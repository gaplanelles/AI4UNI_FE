# 📊 Guía de Gráficos para el LLM

Esta guía explica cómo instruir a un LLM para que genere gráficos en la aplicación AI4UNI.

## 🎯 Formato General

Los gráficos se insertan usando la sintaxis:
```
###GRAPH{JSON_CONFIG}###ENDEND
```

**IMPORTANTE:** El delimitador de cierre es `}###ENDEND` para evitar conflictos con las llaves del JSON.

## 📈 Tipos de Gráficos

### 1. Gráficos de Funciones Matemáticas

Para graficar funciones matemáticas, usa:

```
###GRAPH{"type":"function","config":{"data":[{"fn":"FUNCION","color":"COLOR"}]}}###ENDEND
```

#### Ejemplos:

**Parábola simple:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
```

**Función cuadrática completa:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2 - 2*x - 3","color":"#667eea"}]}}###END
```

**Función seno:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"sin(x)","color":"#e53e3e"}]}}###END
```

**Múltiples funciones:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"},{"fn":"x^3","color":"#e53e3e"}]}}###END
```

**Con dominio personalizado:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"1/x","color":"#667eea"}],"xAxis":{"domain":[-10,10]},"yAxis":{"domain":[-10,10]}}}###END
```

#### Sintaxis de Funciones Matemáticas:

- Operadores: `+`, `-`, `*`, `/`, `^` (potencia)
- Funciones: `sin(x)`, `cos(x)`, `tan(x)`, `sqrt(x)`, `abs(x)`, `log(x)`, `exp(x)`
- Constantes: `PI`, `E`
- Ejemplos:
  - `x^2 + 2*x + 1`
  - `sin(x) * cos(x)`
  - `sqrt(abs(x))`
  - `exp(-x^2)`

### 2. Gráficos de Datos (Barras y Líneas)

Para graficar datos estadísticos, usa:

```
###GRAPH{"type":"chart","chartType":"TIPO","data":DATOS,"config":CONFIG}###END
```

#### Tipos disponibles:
- `bar` - Gráfico de barras
- `line` - Gráfico de líneas

#### Ejemplos:

**Gráfico de barras:**
```
###GRAPH{"type":"chart","chartType":"bar","data":[{"name":"Lunes","value":30},{"name":"Martes","value":45},{"name":"Miércoles","value":60}],"config":{"xKey":"name","yKey":"value"}}###END
```

**Gráfico de líneas:**
```
###GRAPH{"type":"chart","chartType":"line","data":[{"x":1,"y":10},{"x":2,"y":20},{"x":3,"y":15}],"config":{"xKey":"x","yKey":"y"}}###END
```

**Datos de notas de estudiantes:**
```
###GRAPH{"type":"chart","chartType":"bar","data":[{"materia":"Matemáticas","promedio":85},{"materia":"Física","promedio":78},{"materia":"Química","promedio":92}],"config":{"xKey":"materia","yKey":"promedio"}}###END
```

### 3. Dibujos de Objetos Físicos

Para dibujar objetos visuales como pelotas, cajas, etc. con sus propiedades:

```
###GRAPH{"type":"drawing","objects":ARRAY,"config":CONFIG}###END
```

#### Propiedades de objetos:

Cada objeto puede tener:
- `label` - Etiqueta del objeto
- `diameter` - Diámetro (para círculos)
- `radius` - Radio (alternativa a diameter)
- `weight` o `mass` - Peso o masa
- `unit` - Unidad de medida (por defecto "cm")
- `weightUnit` o `massUnit` - Unidad de peso (por defecto "kg")
- `color` - Color del objeto
- `shape` - "circle" (por defecto), "square", "rectangle"
- `x`, `y` - Posición específica (opcional)

#### Configuración adicional:

- `title` - Título del dibujo
- `showGrid` - Mostrar rejilla de fondo (true/false)
- `width`, `height` - Dimensiones del canvas

#### Ejemplos:

**Dos pelotas de diferentes tamaños:**
```
###GRAPH{"type":"drawing","objects":[{"label":"Pelota Pequeña","diameter":5,"weight":0.2,"color":"#667eea"},{"label":"Pelota Grande","diameter":15,"weight":1.5,"color":"#e53e3e"}],"config":{"title":"Comparación de Pelotas"}}###END
```

**Comparación de planetas:**
```
###GRAPH{"type":"drawing","objects":[{"label":"Tierra","diameter":12742,"mass":"5.97×10²⁴","unit":"km","massUnit":"kg","color":"#38b2ac"},{"label":"Marte","diameter":6779,"mass":"6.39×10²³","unit":"km","massUnit":"kg","color":"#e53e3e"}],"config":{"title":"Tierra vs Marte"}}###END
```

**Objetos de diferentes formas:**
```
###GRAPH{"type":"drawing","objects":[{"label":"Círculo","shape":"circle","diameter":10,"color":"#667eea"},{"label":"Cuadrado","shape":"square","diameter":10,"color":"#e53e3e"}],"config":{"title":"Formas Geométricas"}}###END
```

**Comparación con rejilla:**
```
###GRAPH{"type":"drawing","objects":[{"label":"A","diameter":8,"weight":0.5},{"label":"B","diameter":12,"weight":1.2},{"label":"C","diameter":16,"weight":2.0}],"config":{"title":"Tres Objetos","showGrid":true}}###END
```

## 🤖 Instrucciones para el LLM

### Prompt del Sistema Completo:

```
Eres un profesor universitario experto. Responde preguntas de estudiantes de forma clara y pedagógica.

FORMATO DE CONTENIDO:

1. FÓRMULAS MATEMÁTICAS (usa sintaxis LaTeX):
   - Inline: $formula$ (ejemplo: $E = mc^2$)
   - Bloque: $$formula$$ (ejemplo: $$\int_a^b f(x)dx$$)

2. GRÁFICOS DE FUNCIONES:
   Sintaxis: ###GRAPH{"type":"function","config":{"data":[{"fn":"FUNCION","color":"COLOR"}]}}###END
   
   Ejemplos:
   - Parábola: ###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
   - Seno: ###GRAPH{"type":"function","config":{"data":[{"fn":"sin(x)","color":"#e53e3e"}]}}###END
   - Múltiples: ###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"blue"},{"fn":"2*x","color":"red"}]}}###END

3. GRÁFICOS DE DATOS:
   Sintaxis: ###GRAPH{"type":"chart","chartType":"TIPO","data":ARRAY,"config":{"xKey":"x","yKey":"y"}}###END
   
   Ejemplos:
   - Barras: ###GRAPH{"type":"chart","chartType":"bar","data":[{"name":"A","value":30},{"name":"B","value":45}],"config":{"xKey":"name","yKey":"value"}}###END
   - Líneas: ###GRAPH{"type":"chart","chartType":"line","data":[{"x":1,"y":10},{"x":2,"y":20}],"config":{"xKey":"x","yKey":"y"}}###END

4. DIBUJOS DE OBJETOS FÍSICOS:
   Sintaxis: ###GRAPH{"type":"drawing","objects":ARRAY,"config":CONFIG}###END
   
   Ejemplos:
   - Pelotas: ###GRAPH{"type":"drawing","objects":[{"label":"Pelota A","diameter":10,"weight":0.5,"color":"#667eea"},{"label":"Pelota B","diameter":20,"weight":2,"color":"#e53e3e"}],"config":{"title":"Comparación"}}###END
   - Planetas: ###GRAPH{"type":"drawing","objects":[{"label":"Tierra","diameter":12742,"unit":"km"},{"label":"Luna","diameter":3474,"unit":"km"}]}###END

REGLAS IMPORTANTES:
- Usa gráficos cuando sean útiles para la comprensión
- Siempre explica el gráfico antes o después de mostrarlo
- Combina fórmulas y gráficos para mejor pedagogía
- El JSON de los gráficos debe estar en una sola línea, sin saltos
```

## 📝 Ejemplos de Respuestas Completas

### Ejemplo 1: Función Cuadrática

**Pregunta del estudiante:** "¿Qué es una función cuadrática?"

**Respuesta del LLM:**
```
Una función cuadrática es una función polinómica de grado 2, que tiene la forma:

$$f(x) = ax^2 + bx + c$$

donde $a \neq 0$. Su gráfica es una parábola.

Veamos un ejemplo con $f(x) = x^2 - 2x - 3$:

###GRAPH{"type":"function","config":{"data":[{"fn":"x^2 - 2*x - 3","color":"#667eea"}]}}###END

Las raíces de esta función se pueden encontrar usando la fórmula cuadrática:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

### Ejemplo 2: Funciones Trigonométricas

**Pregunta:** "Muéstrame las funciones seno y coseno"

**Respuesta:**
```
Las funciones trigonométricas seno y coseno son fundamentales. El seno está dado por $y = \sin(x)$ y el coseno por $y = \cos(x)$.

Aquí están graficadas:

###GRAPH{"type":"function","config":{"data":[{"fn":"sin(x)","color":"#667eea"},{"fn":"cos(x)","color":"#e53e3e"}]}}###END

Nota que están desfasadas por $\frac{\pi}{2}$ radianes.
```

### Ejemplo 3: Datos Estadísticos

**Pregunta:** "¿Cuál fue el rendimiento por mes?"

**Respuesta:**
```
El rendimiento mensual fue el siguiente:

###GRAPH{"type":"chart","chartType":"bar","data":[{"mes":"Enero","ventas":120},{"mes":"Febrero","ventas":150},{"mes":"Marzo","ventas":180},{"mes":"Abril","ventas":165}],"config":{"xKey":"mes","yKey":"ventas"}}###END

Como puedes ver, hubo un crecimiento constante de Enero a Marzo, con una ligera disminución en Abril.
```

## ⚠️ Errores Comunes a Evitar

### ❌ INCORRECTO:
```
###GRAPH{
  "type": "function",
  "config": {
    "data": [{"fn": "x^2"}]
  }
}###END
```
**Problema:** Saltos de línea en el JSON

### ✅ CORRECTO:
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
```

### ❌ INCORRECTO:
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x**2"}]}}###END
```
**Problema:** Usar `**` en lugar de `^` para potencias

### ✅ CORRECTO:
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
```

## 🎨 Colores Recomendados

- `#667eea` - Púrpura/Azul (color principal)
- `#e53e3e` - Rojo
- `#38b2ac` - Verde azulado
- `#ed8936` - Naranja
- `#9f7aea` - Púrpura
- `#48bb78` - Verde

## 🔧 Configuraciones Avanzadas

### Ajustar el rango de visualización:

```json
{
  "type": "function",
  "config": {
    "data": [{"fn": "1/x", "color": "#667eea"}],
    "xAxis": {"domain": [-5, 5]},
    "yAxis": {"domain": [-5, 5]},
    "width": 600,
    "height": 400
  }
}
```

### Ejemplo en una línea:
```
###GRAPH{"type":"function","config":{"data":[{"fn":"1/x","color":"#667eea"}],"xAxis":{"domain":[-5,5]},"yAxis":{"domain":[-5,5]}}}###END
```

## 📚 Casos de Uso Educativos

1. **Álgebra:** Funciones lineales, cuadráticas, polinómicas
2. **Cálculo:** Derivadas, integrales, límites
3. **Trigonometría:** Seno, coseno, tangente
4. **Estadística:** Distribuciones, tendencias
5. **Física:** Movimiento, fuerzas, energía

---

**Nota:** El LLM debe generar el JSON en una sola línea sin espacios innecesarios para evitar errores de parseo.

