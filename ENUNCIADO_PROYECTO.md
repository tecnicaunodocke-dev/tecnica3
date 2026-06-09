# 🌈 PROYECTO IoT: Control de LEDs RGB por Bluetooth

## 📋 Enunciado del Proyecto

---

### **OBJETIVO GENERAL**

Desarrollar un sistema completo de control IoT que permita gestionar 3 LEDs RGB mediante comunicación Bluetooth, utilizando múltiples interfaces (App Inventor, Python y Web) con propósito educativo.

---

### **OBJETIVOS ESPECÍFICOS**

1. ✅ Diseñar y programar firmware Arduino para control de LEDs RGB
2. ✅ Crear aplicación móvil en MIT App Inventor con 12 combinaciones de colores
3. ✅ Implementar juego educativo de preguntas sobre colores en Python
4. ✅ Desarrollar página web HTML/CSS/JS explicativa del proyecto
5. ✅ Establecer protocolo de comunicación Bluetooth simple y didáctico
6. ✅ Documentar completamente el proyecto para reproducción educativa

---

## 🔧 **DESCRIPCIÓN TÉCNICA**

### **Componentes Hardware**

| Componente | Cantidad | Función |
|-----------|----------|---------|
| Arduino Uno | 1 | Microcontrolador principal |
| LED RGB WS2812B / Tira NeoPixel | 3 | Luces RGB programables independientes |
| Módulo Bluetooth HC-05 o HM-10 | 1 | Comunicación inalámbrica |
| Resistencia 220Ω | 9 | Limitador de corriente por patita de LED |
| Cables Dupont | 20+ | Conexiones |
| Protoboard | 1 | Base de construcción |
| Cable USB | 1 | Programación del Arduino |

### **Especificación de Conexiones**

```
Arduino Uno → Conexiones
├─ Pin 6 (PWM)  ──────> LED 1 - Rojo
├─ Pin 5 (PWM)  ──────> LED 1 - Verde
├─ Pin 3 (PWM)  ──────> LED 1 - Azul
│
├─ Pin 9 (PWM)  ──────> LED 2 - Rojo
├─ Pin 10 (PWM) ──────> LED 2 - Verde
├─ Pin 11 (PWM) ──────> LED 2 - Azul
│
├─ Pin A0 ──────────> LED 3 - Rojo
├─ Pin A1 ──────────> LED 3 - Verde
├─ Pin A2 ──────────> LED 3 - Azul
│
├─ Pin 0 (RX) ──────> Bluetooth TX (HC-05 TX)
├─ Pin 1 (TX) ──────> Bluetooth RX (HC-05 RX)
│
├─ 5V  ─────────────> Bluetooth VCC + LEDs Ánodo
├─ GND ─────────────> GND común (Bluetooth + LEDs)
```

### **Software Requerido**

| Software | Versión | Uso |
|----------|---------|-----|
| Arduino IDE | 1.8.13+ | Programación microcontrolador |
| MIT App Inventor | Online | Desarrollo app móvil |
| Python | 3.7+ | Juego educativo |
| Navegador Web | Cualquiera | Acceso a documentación |

---

## 💻 **FUNCIONALIDAD POR INTERFAZ**

### **1. Arduino Firmware**

**Características:**
- Recibe comandos por puerto Serial del Bluetooth
- Controla 3 LEDs RGB independientes (0-255 cada color)
- Parsea comandos en formato texto
- Responde estado actual de LEDs

**Comandos Soportados:**
```
LED1:<R>,<G>,<B>    → Controla LED 1 (valores 0-255)
LED2:<R>,<G>,<B>    → Controla LED 2
LED3:<R>,<G>,<B>    → Controla LED 3
STATUS              → Devuelve estado actual de todos
OFF                 → Apaga todos los LEDs
```

**Ejemplo:**
```
LED1:255,0,0    → LED 1 rojo puro
LED2:0,255,0    → LED 2 verde puro
LED3:0,0,255    → LED 3 azul puro
STATUS          → Responde: LED1:255,0,0;LED2:0,255,0;LED3:0,0,255
OFF             → Todos apagados: 0,0,0
```

---

### **2. Aplicación MIT App Inventor - 12 COMBINACIONES**

**Pantalla Principal:**

```
┌─────────────────────────────┐
│ 🌈 Control RGB - LEDs       │
├─────────────────────────────┤
│ 📡 Bluetooth  [Conectar]    │
│ 🔴 Desconectado             │
├─────────────────────────────┤
│ 🌈 COMBINACIONES DE COLORES │
├─────────────────────────────┤
│ [🔴 ROJO] [🟢 VERDE] [🔵 AZUL]    │
│                             │
│ [🟡 AMARILLO] [🟣 VIOLETA] [🟦 CYAN]  │
│                             │
│ [⚪ BLANCO] [🟫 NARANJA] [🩷 ROSA]  │
│                             │
│ [🌈 ARCO IRIS] [⚫ NEGRO] [🎲 RANDOM]│
└─────────────────────────────┘
```

**12 Botones con Combinaciones de Colores:**

| # | Botón | Color | Comando | RGB |
|---|-------|-------|---------|-----|
| 1 | 🔴 ROJO PURO | Rojo puro | LED1:255,0,0 | (255, 0, 0) |
| 2 | 🟢 VERDE PURO | Verde puro | LED2:0,255,0 | (0, 255, 0) |
| 3 | 🔵 AZUL PURO | Azul puro | LED3:0,0,255 | (0, 0, 255) |
| 4 | 🟡 AMARILLO | Amarillo | LED1:255,255,0 | (255, 255, 0) |
| 5 | 🟣 VIOLETA | Violeta | LED2:255,0,255 | (255, 0, 255) |
| 6 | 🟦 CYAN | Cyan | LED3:0,255,255 | (0, 255, 255) |
| 7 | ⚪ BLANCO | Blanco | LED1:255,255,255 | (255, 255, 255) |
| 8 | 🟫 NARANJA | Naranja | LED2:255,165,0 | (255, 165, 0) |
| 9 | 🩷 ROSA | Rosa | LED3:255,192,203 | (255, 192, 203) |
| 10 | 🌈 ARCO IRIS | Secuencia | Todos diferentes | Variados |
| 11 | ⚫ NEGRO | Apagado | OFF | (0, 0, 0) |
| 12 | 🎲 RANDOM | Aleatorio | Colores random | Random |

**Funcionalidades:**
- Escaneo y conexión a dispositivos Bluetooth
- 12 botones de combinaciones de colores predefinidas
- Visualización del estado de conexión
- Envío de comandos en tiempo real
- Interfaz táctil intuitiva
- Funciona en Android 4.0+

**Pasos para crear en MIT App Inventor:**

1. Ir a https://ai2.appinventor.mit.edu
2. Crear nueva app
3. Diseñador: Agregar componentes
   - BluetoothClient para conexión
   - Label para estado
   - 12 Botones con colores de fondo
4. Bloques: Programar click en cada botón
5. Exportar como .apk
6. Instalar en teléfono Android

---

### **3. Juego Educativo Python - Preguntas sobre Colores**

**Características:**
- 10 preguntas aleatorias sobre colores primarios y secundarios
- Una pregunta por pantalla
- Feedback inmediato
- Sistema de puntuación
- Programación estructurada (sin clases)

**10 Preguntas del Quiz:**

```
1. ¿Qué color resulta de mezclar ROJO y AZUL?
   Opciones: Verde, Violeta, Naranja
   Respuesta: Violeta

2. ¿Qué color resulta de mezclar ROJO y VERDE?
   Opciones: Amarillo, Violeta, Naranja
   Respuesta: Amarillo

3. ¿Qué color resulta de mezclar VERDE y AZUL?
   Opciones: Violeta, Cyan, Naranja
   Respuesta: Cyan

4. ¿Cuál es un color PRIMARIO entre verde, violeta y naranja?
   Opciones: Violeta, Verde, Naranja
   Respuesta: Verde

5. ¿Cuál es un color PRIMARIO entre rojo, rosa y marrón?
   Opciones: Rojo, Rosa, Marrón
   Respuesta: Rojo

6. ¿Cuál es un color PRIMARIO entre azul, celeste y turquesa?
   Opciones: Azul, Celeste, Turquesa
   Respuesta: Azul

7. ¿Qué NO es un color primario?
   Opciones: Rojo, Naranja, Verde
   Respuesta: Naranja

8. ¿Cuál es un color SECUNDARIO?
   Opciones: Azul, Violeta, Rojo
   Respuesta: Violeta

9. Si mezclas los 3 colores primarios, ¿qué obtienes?
   Opciones: Blanco, Negro, Gris
   Respuesta: Negro

10. ¿De qué colores está formada la BANDERA ARGENTINA?
    Opciones: Azul, Blanco y Rojo | Verde, Blanco y Rojo | Celeste, Blanco y Oro
    Respuesta: Celeste, Blanco y Oro
```

**Flujo del Juego:**
```
1. Se muestra Pregunta 1/10
2. Usuario responde
3. Feedback inmediato:
   - ✅ Correcto → "¡Bien sabes de los colores!"
   - ❌ Incorrecto → "Estudia un poco sobre los colores"
4. Siguiente pregunta
5. Después de 10: Resultado final
   - 🏆 ≥80%: "¡EXCELENTE!"
   - 👍 ≥60%: "¡BIEN!"
   - 📚 <60%: "Necesitas estudiar más"
6. Reinicia automáticamente
```

**Ejecución:**
```bash
python juego_colores.py
```

---

### **4. Página Web HTML - Documentación y Información**

**Estructura de Secciones:**

1. **Encabezado y Presentación**
   - Título del proyecto
   - Descripción general
   - Objetivos

2. **Especificación Técnica**
   - Componentes utilizados
   - Esquema de conexiones
   - Protocolo Bluetooth

3. **Guía de Construcción**
   - Paso a paso del armado
   - Fotos/esquemas
   - Lista de materiales

4. **Guía de Programación**
   - Código Arduino explicado
   - Instrucciones Arduino IDE
   - Carga del firmware

5. **Manual de Uso**
   - Cómo usar App Inventor
   - Cómo usar Juego Python
   - Comandos disponibles

6. **Protocolo de Comunicación**
   - Formato de comandos
   - Ejemplos
   - Tabla de referencia

7. **Video Demostrativo** (opcional)
   - Funcionamiento en vivo

8. **Contacto y Recursos**
   - GitHub
   - Referencias bibliográficas

---

## 📡 **PROTOCOLO DE COMUNICACIÓN BLUETOOTH**

### **Especificación:**

```
Velocidad: 9600 baud
Formato: ASCII texto + \n
Máx. comando: 19 caracteres

Estructura: COMANDO:PARAM1,PARAM2,...\n

Ejemplos:
  LED1:255,0,0\n      → LED 1 = Rojo
  LED2:0,255,0\n      → LED 2 = Verde  
  LED3:0,0,255\n      → LED 3 = Azul
  STATUS\n            → Consulta estado
  OFF\n               → Apaga todos
```

### **Tabla de Respuestas:**

| Comando | Respuesta | Significado |
|---------|-----------|-------------|
| `LED1:255,0,0` | OK | Color aplicado |
| `STATUS` | `LED1:255,0,0;LED2:0,255,0;LED3:0,0,255` | Estado actual |
| `OFF` | OK | Apagado |
| Desconocido | UNKNOWN | Comando no reconocido |

---

## 📅 **CRONOGRAMA DE DESARROLLO**

| Fase | Actividad | Duración |
|------|-----------|----------|
| 1 | Diseño y especificación | 2 días |
| 2 | Programación Arduino | 3 días |
| 3 | App MIT App Inventor | 4 días |
| 4 | Juego Python | 2 días |
| 5 | Página Web HTML | 3 días |
| 6 | Testing e integración | 2 días |
| 7 | Documentación | 2 días |
| 8 | Presentación | 1 día |
| **TOTAL** | | **19 días** |

---

## 🎓 **COMPETENCIAS A DESARROLLAR**

**Hardware:**
- ✅ Electrónica básica (LEDs RGB)
- ✅ Protocolos de comunicación (Serial, Bluetooth)
- ✅ Microcontroladores (Arduino)

**Software:**
- ✅ Programación C++ (Arduino)
- ✅ Programación Visual (MIT App Inventor)
- ✅ Programación Python
- ✅ Desarrollo Web (HTML/CSS/JS)

**Blandas:**
- ✅ Trabajo en equipo
- ✅ Documentación técnica
- ✅ Presentación de proyectos
- ✅ Resolución de problemas

---

## ✅ **CRITERIOS DE EVALUACIÓN**

| Aspecto | Excelente (10) | Bueno (8) | Regular (6) | Insuficiente (<6) |
|---------|---|---|---|---|
| **Hardware** | Conexiones correctas, bien organizado | Funciona con minores ajustes | Requiere reparaciones | No funciona |
| **Arduino** | Código optimizado, comentado | Código funcional | Código con errores | Código no funciona |
| **App Inventor** | 12 botones, funcionales | Funciona pero interfaz mejorable | Funciona con limitaciones | No funciona |
| **Juego Python** | 10 preguntas, feedback completo | Juego funcional | Juego incompleto | No funciona |
| **Web HTML** | Página completa, responsive, visual | Página funcional, clara | Página incompleta | Página ausente |
| **Documentación** | Completa, clara, profesional | Adecuada | Superficial | Ausente |
| **Presentación** | Fluida, clara, convincente | Organizada, correcta | Desorganizada | Pobre |

---

## 📦 **ENTREGABLES**

1. ✅ **Código Arduino** (.ino)
2. ✅ **App MIT App Inventor** (.aia y .apk)
3. ✅ **Script Python Juego** (.py)
4. ✅ **Página Web** (HTML/CSS/JS)
5. ✅ **Documentación Técnica** (PDF/MD)
6. ✅ **Manual de Usuario** (PDF)
7. ✅ **Video Demostrativo** (MP4)
8. ✅ **Presentación** (PPTX)
9. ✅ **Código fuente** en GitHub

---

## ⚠️ **OBSERVACIONES IMPORTANTES**

**Seguridad:**
- Verificar voltajes antes de conectar
- No invertir polaridad en LEDs
- Usar cables en buen estado
- Soldar con precaución

**Compatibilidad:**
- Arduino Uno, Nano o compatible
- HC-05 o HM-10 (adaptar pins si es necesario)
- Python 3.7+ requerido
- Android 4.0+ para App Inventor

**Funcionalidad:**
- Posible latencia Bluetooth 50-200ms
- PWM Arduino limitado a 6 pines
- Para más LEDs, usar multiplexing
- Rango de comunicación: 10-100 metros (según HC-05/HM-10)

---

## 🚀 **PASOS PARA EJECUTAR TODO**

### **1. Montar Hardware** (2-3 horas)
```
☑️ Conectar Arduino a protoboard
☑️ Soldar/conectar 3 LEDs RGB
☑️ Conectar resistencias 220Ω en serie
☑️ Montar módulo Bluetooth HC-05
☑️ Verificar continuidad con multímetro
```

### **2. Programar Arduino** (30 minutos)
```
☑️ Descargar Arduino IDE
☑️ Cargar código flor_arduino.ino
☑️ Seleccionar puerto COM
☑️ Upload
☑️ Probar en Serial Monitor
```

### **3. Crear App Inventor** (variable)
```
☑️ Ir a ai2.appinventor.mit.edu
☑️ Crear UI con 12 botones
☑️ Programar bloques de Bluetooth
☑️ Exportar .apk
☑️ Instalar en Android
```

### **4. Ejecutar Juego Python** (5 minutos)
```
☑️ python juego_colores.py
☑️ Responder 10 preguntas
☑️ ¡Ganar!
```

### **5. Ver Documentación** (2 minutos)
```
☑️ Abrir index_proyecto.html en navegador
☑️ Explorar todas las secciones
```

---

**Versión:** 1.0  
**Última actualización:** Junio 2026  
**Autor:** TecnicaUnodocke-Dev  
**Estado:** Listo para implementación educativa
