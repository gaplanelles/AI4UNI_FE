# 🎨 Ejemplos de Dibujos Físicos

Ejemplos prácticos de cómo usar el componente de dibujo para visualizar objetos físicos.

## 📊 Casos de Uso

### 1. Física - Comparación de Masas

**Pregunta del estudiante:** "Compara el tamaño y masa de una pelota de tenis y una de baloncesto"

**Respuesta del LLM:**
```
Las pelotas tienen diferentes características:

###GRAPH{"type":"drawing","objects":[{"label":"Pelota de Tenis","diameter":6.7,"weight":0.058,"unit":"cm","weightUnit":"kg","color":"#9ACD32"},{"label":"Pelota de Baloncesto","diameter":24,"weight":0.624,"unit":"cm","weightUnit":"kg","color":"#FF8C00"}],"config":{"title":"Comparación: Tenis vs Baloncesto","showGrid":false}}###END

Como puedes ver, la pelota de baloncesto es aproximadamente 3.6 veces más grande en diámetro y pesa cerca de 10 veces más que la pelota de tenis.
```

### 2. Astronomía - Planetas del Sistema Solar

**Pregunta:** "Muéstrame el tamaño relativo de la Tierra y Marte"

**Respuesta:**
```
Aquí está la comparación de tamaños entre la Tierra y Marte:

###GRAPH{"type":"drawing","objects":[{"label":"Tierra","diameter":12742,"mass":"5.97×10²⁴","unit":"km","massUnit":"kg","color":"#38b2ac"},{"label":"Marte","diameter":6779,"mass":"6.39×10²³","unit":"km","massUnit":"kg","color":"#e53e3e"}],"config":{"title":"Tierra vs Marte","width":600,"height":400}}###END

Marte tiene aproximadamente la mitad del diámetro de la Tierra y solo el 11% de su masa.
```

### 3. Química - Átomos y Moléculas

**Pregunta:** "Compara el tamaño de diferentes átomos"

**Respuesta:**
```
Los átomos tienen diferentes radios atómicos:

###GRAPH{"type":"drawing","objects":[{"label":"Hidrógeno","diameter":1.2,"unit":"Å","color":"#E0E0E0"},{"label":"Carbono","diameter":1.7,"unit":"Å","color":"#404040"},{"label":"Oxígeno","diameter":1.52,"unit":"Å","color":"#FF0000"},{"label":"Nitrógeno","diameter":1.55,"unit":"Å","color":"#0000FF"}],"config":{"title":"Radios Atómicos (Angstroms)","showGrid":true}}###END

El carbono es el átomo más grande de estos elementos comunes en moléculas orgánicas.
```

### 4. Biología - Células

**Pregunta:** "¿Cómo se comparan los tamaños de diferentes células?"

**Respuesta:**
```
Las células tienen tamaños muy variados:

###GRAPH{"type":"drawing","objects":[{"label":"Bacteria","diameter":2,"unit":"μm","color":"#4CAF50"},{"label":"Glóbulo Rojo","diameter":7,"unit":"μm","color":"#F44336"},{"label":"Célula Animal","diameter":20,"unit":"μm","color":"#2196F3"}],"config":{"title":"Tamaños Celulares (micrómetros)","showGrid":false}}###END

Las bacterias son significativamente más pequeñas que las células eucariotas.
```

### 5. Ingeniería - Comparación de Tornillos

**Pregunta:** "Compara diferentes tamaños de tornillos"

**Respuesta:**
```
Aquí están los tamaños estándar de tornillos:

###GRAPH{"type":"drawing","objects":[{"label":"M4","diameter":4,"unit":"mm","color":"#757575"},{"label":"M6","diameter":6,"unit":"mm","color":"#616161"},{"label":"M8","diameter":8,"unit":"mm","color":"#424242"},{"label":"M10","diameter":10,"unit":"mm","color":"#212121"}],"config":{"title":"Tornillos Métricos","showGrid":true}}###END

M10 es 2.5 veces más grande que M4 en diámetro.
```

### 6. Deportes - Balones de Diferentes Deportes

**Pregunta:** "¿Qué deporte usa el balón más grande?"

**Respuesta:**
```
Comparemos los balones de diferentes deportes:

###GRAPH{"type":"drawing","objects":[{"label":"Golf","diameter":4.27,"weight":0.046,"unit":"cm","weightUnit":"kg","color":"#FFFFFF"},{"label":"Tenis","diameter":6.7,"weight":0.058,"unit":"cm","weightUnit":"kg","color":"#9ACD32"},{"label":"Béisbol","diameter":7.3,"weight":0.145,"unit":"cm","weightUnit":"kg","color":"#FFFFFF"},{"label":"Fútbol","diameter":22,"weight":0.43,"unit":"cm","weightUnit":"kg","color":"#000000"},{"label":"Baloncesto","diameter":24,"weight":0.624,"unit":"cm","weightUnit":"kg","color":"#FF8C00"}],"config":{"title":"Balones Deportivos","showGrid":false}}###END

El balón de baloncesto es el más grande, seguido del de fútbol.
```

### 7. Geometría - Formas con Áreas

**Pregunta:** "Muestra círculos con diferentes áreas"

**Respuesta:**
```
Círculos con áreas proporcionales:

###GRAPH{"type":"drawing","objects":[{"label":"A = πr² = 79 cm²","diameter":10,"unit":"cm","color":"#667eea"},{"label":"A = πr² = 314 cm²","diameter":20,"unit":"cm","color":"#e53e3e"},{"label":"A = πr² = 707 cm²","diameter":30,"unit":"cm","color":"#38b2ac"}],"config":{"title":"Áreas de Círculos","showGrid":true}}###END

Recuerda que el área de un círculo es $A = \pi r^2$, por lo que duplicar el radio cuadruplica el área.
```

### 8. Medicina - Comparación de Píldoras

**Pregunta:** "Compara el tamaño de diferentes dosis"

**Respuesta:**
```
Tamaños comunes de píldoras:

###GRAPH{"type":"drawing","objects":[{"label":"5 mg","diameter":3,"unit":"mm","color":"#FFD700"},{"label":"10 mg","diameter":5,"unit":"mm","color":"#FFA500"},{"label":"25 mg","diameter":8,"unit":"mm","color":"#FF6347"}],"config":{"title":"Tamaños de Píldoras","showGrid":false}}###END

El tamaño de la píldora no siempre se correlaciona linealmente con la dosis.
```

### 9. Materiales - Densidad Visual

**Pregunta:** "¿Cómo se ve la diferencia de densidad?"

**Respuesta:**
```
Objetos del mismo volumen pero diferentes masas (densidades):

###GRAPH{"type":"drawing","objects":[{"label":"Aluminio","diameter":10,"weight":2.7,"unit":"cm","weightUnit":"kg","color":"#C0C0C0"},{"label":"Hierro","diameter":10,"weight":7.87,"unit":"cm","weightUnit":"kg","color":"#696969"},{"label":"Plomo","diameter":10,"weight":11.34,"unit":"cm","weightUnit":"kg","color":"#2F4F4F"}],"config":{"title":"Misma Forma, Diferente Densidad","showGrid":false}}###END

Todos tienen el mismo tamaño pero el plomo es 4.2 veces más pesado que el aluminio.
```

### 10. Economía - Visualización de Proporciones

**Pregunta:** "Compara inversiones en diferentes áreas"

**Respuesta:**
```
Distribución del presupuesto:

###GRAPH{"type":"drawing","objects":[{"label":"Investigación","diameter":30,"weight":30,"unit":"%","weightUnit":"M€","color":"#667eea"},{"label":"Desarrollo","diameter":45,"weight":45,"unit":"%","weightUnit":"M€","color":"#e53e3e"},{"label":"Marketing","diameter":25,"weight":25,"unit":"%","weightUnit":"M€","color":"#38b2ac"}],"config":{"title":"Distribución del Presupuesto","showGrid":false}}###END

El desarrollo recibe la mayor parte del presupuesto con un 45%.
```

## 🎯 Consejos para el LLM

1. **Usa unidades apropiadas**: km para planetas, μm para células, cm para objetos cotidianos
2. **Colores significativos**: Rojo para Marte, azul para agua, etc.
3. **Títulos descriptivos**: Ayudan a entender el contexto
4. **Combina con fórmulas**: Usa LaTeX para ecuaciones relacionadas
5. **Explica las proporciones**: Menciona las relaciones numéricas
6. **Grid cuando sea útil**: Para comparaciones cuantitativas precisas

## 🔧 Propiedades Avanzadas

### Formas Alternativas

```json
{
  "type": "drawing",
  "objects": [
    {"label": "Círculo", "shape": "circle", "diameter": 10},
    {"label": "Cuadrado", "shape": "square", "diameter": 10},
    {"label": "Rectángulo", "shape": "rectangle", "diameter": 10, "height": 15}
  ]
}
```

### Posicionamiento Personalizado

```json
{
  "type": "drawing",
  "objects": [
    {"label": "A", "diameter": 10, "x": 100, "y": 200},
    {"label": "B", "diameter": 15, "x": 300, "y": 200},
    {"label": "C", "diameter": 8, "x": 500, "y": 200}
  ]
}
```

### Dimensiones del Canvas

```json
{
  "type": "drawing",
  "objects": [...],
  "config": {
    "width": 800,
    "height": 600,
    "title": "Mi Dibujo Grande"
  }
}
```

---

**Nota:** Todos estos ejemplos pueden combinarse con fórmulas matemáticas y otros tipos de gráficos para crear explicaciones más completas.

