/*
 ╔══════════════════════════════════════════════════════════════╗
 ║          FLOR ARDUINO — Sketch de Control RGB                ║
 ║                                                              ║
 ║  Descripción:                                                ║
 ║    Controla 4 LEDs NeoPixel (3 pétalos + 1 centro) usando    ║
 ║    un módulo Bluetooth HM-10 (BLE) para recibir comandos     ║
 ║    desde una app móvil.                                      ║
 ║                                                              ║
 ║  Hardware requerido:                                         ║
 ║    - Arduino Uno o Nano                                      ║
 ║    - 4x LED NeoPixel WS2812B                                 ║
 ║    - Módulo Bluetooth HM-10 (BLE)                            ║
 ║    - Resistencia 470Ω (en el pin de datos de NeoPixel)      ║
 ║    - Capacitor 1000µF (entre 5V y GND, opcional)             ║
 ║                                                              ║
 ║  Conexiones:                                                 ║
 ║    NeoPixel DATA → Pin 6 (con resistencia 470Ω)             ║
 ║    NeoPixel VCC  → 5V                                        ║
 ║    NeoPixel GND  → GND                                       ║
 ║    HM-10 TX      → Pin 10 (RX del Arduino)                   ║
 ║    HM-10 RX      → Pin 11 (TX del Arduino) [3.3V tolerante]  ║
 ║    HM-10 VCC     → 3.3V                                      ║
 ║    HM-10 GND     → GND                                       ║
 ║                                                              ║
 ║  Protocolo de comandos (texto por Bluetooth):                ║
 ║    COLOR:<led>,<R>,<G>,<B>  Ejemplo: COLOR:0,255,0,0         ║
 ║    ALL:<R>,<G>,<B>          Ejemplo: ALL:255,255,0           ║
 ║    ANIM:<nombre>            Ejemplo: ANIM:RAINBOW            ║
 ║    BRIGHT:<0-255>           Ejemplo: BRIGHT:128              ║
 ║    OFF                      Apagar todos                     ║
 ║                                                              ║
 ║  Mapa de LEDs:                                               ║
 ║    LED 0 = Centro                                            ║
 ║    LED 1 = Pétalo 1                                          ║
 ║    LED 2 = Pétalo 2                                          ║
 ║    LED 3 = Pétalo 3                                          ║
 ╚══════════════════════════════════════════════════════════════╝
*/

#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>

// Configuración de pines
#define PIN_NEOPIXEL  6
#define NUM_LEDS      4
#define PIN_BT_RX     10
#define PIN_BT_TX     11

// Objetos principales
Adafruit_NeoPixel tira(NUM_LEDS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);
SoftwareSerial bluetooth(PIN_BT_RX, PIN_BT_TX);

// Colores actuales de cada LED
uint8_t coloresR[NUM_LEDS] = {255, 150, 80,  255};
uint8_t coloresG[NUM_LEDS] = {100, 80,  200, 180};
uint8_t coloresB[NUM_LEDS] = {150, 255, 255, 50};

uint8_t brillo = 150;
String animacionActiva = "";
unsigned long tiempoAnterior = 0;
int pasoAnimacion = 0;
float fasePulso = 0.0;
String comandoEntrada = "";

// ══════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(9600);
  Serial.println("=== FLOR ARDUINO iniciada ===");

  bluetooth.begin(9600);
  Serial.println("Bluetooth HM-10 listo en pines 10 y 11");

  tira.begin();
  tira.setBrightness(brillo);
  tira.show();

  animacionBienvenida();
  Serial.println("Esperando comandos por Bluetooth...");
}

// ══════════════════════════════════════════════════════════════
//  LOOP PRINCIPAL
// ══════════════════════════════════════════════════════════════

void loop() {
  // Leer comandos por Bluetooth
  while (bluetooth.available()) {
    char c = (char)bluetooth.read();
    if (c == '\n') {
      comandoEntrada.trim();
      if (comandoEntrada.length() > 0) {
        Serial.print("Cmd: ");
        Serial.println(comandoEntrada);
        procesarComando(comandoEntrada);
      }
      comandoEntrada = "";
    } else {
      comandoEntrada += c;
    }
  }

  // Ejecutar animación activa
  if (animacionActiva.length() > 0) {
    unsigned long t = millis();
    if (t - tiempoAnterior >= 50) {
      tiempoAnterior = t;
      if      (animacionActiva == "RAINBOW") animRainbow();
      else if (animacionActiva == "PULSE")   animPulso();
      else if (animacionActiva == "SUNSET")  animAtardecer();
      else if (animacionActiva == "OCEAN")   animOceano();
      else if (animacionActiva == "SPARKLE") animCentelleo();
      else if (animacionActiva == "FIRE")    animFuego();
      pasoAnimacion++;
      if (pasoAnimacion >= 360) pasoAnimacion = 0;
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  PROCESADOR DE COMANDOS
// ══════════════════════════════════════════════════════════════

void procesarComando(String cmd) {

  // COLOR:<led>,<R>,<G>,<B>  →  Cambia un LED individual
  if (cmd.startsWith("COLOR:")) {
    animacionActiva = "";
    String p = cmd.substring(6);
    int c1 = p.indexOf(',');
    int c2 = p.indexOf(',', c1 + 1);
    int c3 = p.indexOf(',', c2 + 1);
    if (c1 > 0 && c2 > 0 && c3 > 0) {
      int led = p.substring(0, c1).toInt();
      int r   = p.substring(c1 + 1, c2).toInt();
      int g   = p.substring(c2 + 1, c3).toInt();
      int b   = p.substring(c3 + 1).toInt();
      if (led >= 0 && led < NUM_LEDS) {
        coloresR[led] = constrain(r, 0, 255);
        coloresG[led] = constrain(g, 0, 255);
        coloresB[led] = constrain(b, 0, 255);
        aplicarColores();
      }
    }
  }

  // ALL:<R>,<G>,<B>  →  Todos los LEDs al mismo color
  else if (cmd.startsWith("ALL:")) {
    animacionActiva = "";
    String p = cmd.substring(4);
    int c1 = p.indexOf(',');
    int c2 = p.indexOf(',', c1 + 1);
    if (c1 > 0 && c2 > 0) {
      int r = p.substring(0, c1).toInt();
      int g = p.substring(c1 + 1, c2).toInt();
      int b = p.substring(c2 + 1).toInt();
      for (int i = 0; i < NUM_LEDS; i++) {
        coloresR[i] = constrain(r, 0, 255);
        coloresG[i] = constrain(g, 0, 255);
        coloresB[i] = constrain(b, 0, 255);
      }
      aplicarColores();
    }
  }

  // ANIM:<nombre>  →  Inicia animación
  else if (cmd.startsWith("ANIM:")) {
    String nombre = cmd.substring(5);
    nombre.toUpperCase();
    if (nombre == "RAINBOW" || nombre == "PULSE"   ||
        nombre == "SUNSET"  || nombre == "OCEAN"   ||
        nombre == "SPARKLE" || nombre == "FIRE") {
      animacionActiva = nombre;
      pasoAnimacion = 0;
      fasePulso = 0.0;
    }
  }

  // BRIGHT:<0-255>  →  Ajusta brillo global
  else if (cmd.startsWith("BRIGHT:")) {
    brillo = constrain(cmd.substring(7).toInt(), 0, 255);
    tira.setBrightness(brillo);
    tira.show();
  }

  // OFF  →  Apagar todo
  else if (cmd == "OFF") {
    animacionActiva = "";
    for (int i = 0; i < NUM_LEDS; i++) {
      coloresR[i] = coloresG[i] = coloresB[i] = 0;
    }
    tira.clear();
    tira.show();
  }
}

// ══════════════════════════════════════════════════════════════
//  APLICAR COLORES A LOS LEDS
// ══════════════════════════════════════════════════════════════

void aplicarColores() {
  for (int i = 0; i < NUM_LEDS; i++) {
    tira.setPixelColor(i, tira.Color(coloresR[i], coloresG[i], coloresB[i]));
  }
  tira.show();
}

// ══════════════════════════════════════════════════════════════
//  ANIMACIONES
// ══════════════════════════════════════════════════════════════

// 🌈 Arco iris — cada LED tiene un tono diferente que rota
void animRainbow() {
  for (int i = 0; i < NUM_LEDS; i++) {
    uint16_t hue = (pasoAnimacion * 182 + i * 16384) % 65536;
    tira.setPixelColor(i, tira.gamma32(tira.ColorHSV(hue)));
  }
  tira.show();
}

// 💓 Pulso — todos los LEDs suben y bajan de brillo suavemente
void animPulso() {
  fasePulso += 0.1;
  if (fasePulso > 2 * PI) fasePulso = 0;
  float intensidad = (sin(fasePulso) + 1.0) / 2.0;
  for (int i = 0; i < NUM_LEDS; i++) {
    tira.setPixelColor(i, tira.Color(
      (uint8_t)(coloresR[i] * intensidad),
      (uint8_t)(coloresG[i] * intensidad),
      (uint8_t)(coloresB[i] * intensidad)
    ));
  }
  tira.show();
}

// 🌅 Atardecer — colores cálidos: naranja → rosa → violeta
void animAtardecer() {
  uint8_t palR[] = {255, 255, 200, 120, 60};
  uint8_t palG[] = {80,  30,  10,  0,   0};
  uint8_t palB[] = {20,  80,  120, 160, 180};
  for (int i = 0; i < NUM_LEDS; i++) {
    int idx = ((pasoAnimacion / 5) + i) % 5;
    tira.setPixelColor(i, tira.Color(palR[idx], palG[idx], palB[idx]));
  }
  tira.show();
}

// 🌊 Océano — colores fríos: cyan → azul → verde agua
void animOceano() {
  uint8_t palR[] = {0,  0,   0,  20,  0};
  uint8_t palG[] = {180, 120, 80, 200, 160};
  uint8_t palB[] = {255, 200, 160, 180, 255};
  for (int i = 0; i < NUM_LEDS; i++) {
    int idx = ((pasoAnimacion / 5) + i) % 5;
    tira.setPixelColor(i, tira.Color(palR[idx], palG[idx], palB[idx]));
  }
  tira.show();
}

// ✨ Centelleo — LEDs aleatorios destellan en blanco
void animCentelleo() {
  tira.clear();
  for (int i = 0; i < NUM_LEDS; i++) {
    if (random(100) < 30) {
      int v = random(150, 255);
      tira.setPixelColor(i, tira.Color(v, v, v));
    }
  }
  tira.show();
}

// 🔥 Fuego — llamarada con rojo y naranja aleatorio
void animFuego() {
  for (int i = 0; i < NUM_LEDS; i++) {
    tira.setPixelColor(i, tira.Color(random(180, 255), random(20, 100), 0));
  }
  tira.show();
}

// ══════════════════════════════════════════════════════════════
//  ANIMACIÓN DE BIENVENIDA (al encender)
// ══════════════════════════════════════════════════════════════

void animacionBienvenida() {
  uint32_t colores[] = {
    tira.Color(255, 0,   0),   // Rojo
    tira.Color(0,   255, 0),   // Verde
    tira.Color(0,   0,   255), // Azul
    tira.Color(255, 255, 255), // Blanco
    tira.Color(0,   0,   0)    // Apagado
  };
  for (int c = 0; c < 5; c++) {
    for (int i = 0; i < NUM_LEDS; i++) tira.setPixelColor(i, colores[c]);
    tira.show();
    delay(400);
  }
  // Mostrar colores iniciales
  for (int i = 0; i < NUM_LEDS; i++) {
    tira.setPixelColor(i, tira.Color(coloresR[i], coloresG[i], coloresB[i]));
  }
  tira.show();
}
