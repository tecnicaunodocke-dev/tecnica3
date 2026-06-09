/* ============================================================
   🌸 FLOR ARDUINO - app.js
   Lógica JavaScript para control Bluetooth BLE de la flor
   ============================================================ */

'use strict';

// ============================================================
//  CONSTANTES BLE - UUIDs del módulo HM-10
// ============================================================

/** UUID del servicio BLE del HM-10 */
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

/** UUID de la característica de comunicación del HM-10 */
const BLE_CHAR_UUID    = '0000ffe1-0000-1000-8000-00805f9b34fb';

// ============================================================
//  ESTADO DE LA APLICACIÓN
// ============================================================

/** Estado global de la app */
const state = {
  /** LED actualmente seleccionado (0=centro, 1-3=pétalos) */
  selectedLed: 0,

  /** Colores de cada LED en formato [r, g, b] */
  ledColors: [
    [255, 200,  80],   // LED 0: Centro (amarillo cálido)
    [255,  64, 180],   // LED 1: Pétalo 1 (rosa)
    [180,  80, 220],   // LED 2: Pétalo 2 (violeta)
    [255, 120,  40],   // LED 3: Pétalo 3 (naranja)
  ],

  /** Animación actualmente activa (null si ninguna) */
  currentAnimation: null,

  /** Brillo global (0-255) */
  brightness: 150,

  /** Objeto de dispositivo Bluetooth conectado */
  btDevice: null,

  /** Característica BLE para enviar comandos */
  btCharacteristic: null,

  /** Estado de conexión: 'disconnected' | 'connecting' | 'connected' */
  btStatus: 'disconnected',
};

// ============================================================
//  REFERENCIAS AL DOM
// ============================================================

/** Obtener elemento por ID de forma segura */
const $ = (id) => document.getElementById(id);

// Elementos Bluetooth
const btStatusDot   = $('bt-status');
const deviceNameEl  = $('device-name');
const btConnectBtn  = $('bt-connect-btn');
const btBtnText     = $('bt-btn-text');

// Elementos de la flor SVG
const svgPetal1     = $('petal-1');
const svgPetal2     = $('petal-2');
const svgPetal3     = $('petal-3');
const svgCenter     = $('center-led');
const selectionRing = $('selection-ring');
const selectedLabel = $('selected-label');

// Controles de color
const colorPicker   = $('color-picker');
const brightnessSlider = $('brightness-slider');
const brightnessValue  = $('brightness-value');
const sliderFill       = $('slider-track-fill');

// Estado inferior
const statusText    = $('status-text');
const statusIcon    = $('status-icon');

// Toast
const toastEl       = $('toast');
let toastTimeout    = null;

// ============================================================
//  MAPEO DE LEDs A ELEMENTOS SVG
// ============================================================

/** Devuelve el elemento SVG correspondiente al LED indicado */
function getSvgElement(ledIndex) {
  const map = {
    0: svgCenter,
    1: svgPetal1,
    2: svgPetal2,
    3: svgPetal3,
  };
  return map[ledIndex] || null;
}

/** Nombre legible de cada LED */
function getLedName(ledIndex) {
  const names = {
    0: '🌼 Centro seleccionado',
    1: '🌸 Pétalo 1 seleccionado',
    2: '🌺 Pétalo 2 seleccionado',
    3: '🌷 Pétalo 3 seleccionado',
  };
  return names[ledIndex] || `LED ${ledIndex} seleccionado`;
}

// ============================================================
//  FUNCIÓN: connectBluetooth()
//  Solicita el dispositivo BLE, conecta y obtiene característica
// ============================================================

async function connectBluetooth() {
  // Verificar soporte de Web Bluetooth API
  if (!navigator.bluetooth) {
    showWarningModal();
    return;
  }

  // Si ya está conectado, desconectar
  if (state.btStatus === 'connected' && state.btDevice) {
    disconnectBluetooth();
    return;
  }

  // Cambiar estado a "conectando"
  setBtStatus('connecting');
  showToast('🔍 Buscando dispositivos BLE...', 'info');

  try {
    // Solicitar dispositivo Bluetooth con el servicio del HM-10
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [BLE_SERVICE_UUID] },
        { namePrefix: 'HM' },        // Dispositivos HM-10 comunes
        { namePrefix: 'MLT' },       // Variantes del HM-10
        { namePrefix: 'Flor' },      // Nombre personalizado
      ],
      optionalServices: [BLE_SERVICE_UUID],
    });

    state.btDevice = device;

    // Escuchar desconexiones inesperadas
    device.addEventListener('gattserverdisconnected', onBtDisconnected);

    showToast('🔗 Conectando al dispositivo...', 'info');

    // Conectar al servidor GATT del dispositivo
    const server = await device.gatt.connect();

    // Obtener el servicio BLE
    const service = await server.getPrimaryService(BLE_SERVICE_UUID);

    // Obtener la característica de escritura
    const characteristic = await service.getCharacteristic(BLE_CHAR_UUID);
    state.btCharacteristic = characteristic;

    // Actualizar interfaz: CONECTADO
    setBtStatus('connected');
    deviceNameEl.textContent = device.name || 'HM-10 BLE';
    showToast(`✅ Conectado a "${device.name || 'HM-10'}"`, 'success');

    // Enviar brillo inicial
    sendCommand(`BRIGHT:${state.brightness}\n`);

  } catch (error) {
    console.error('Error de conexión Bluetooth:', error);

    // El usuario canceló la solicitud: no es un error real
    if (error.name === 'NotFoundError' || error.message.includes('cancelled')) {
      showToast('❌ Conexión cancelada', 'error');
    } else {
      showToast(`⚠️ Error: ${error.message}`, 'error');
    }

    setBtStatus('disconnected');
    state.btDevice = null;
    state.btCharacteristic = null;
  }
}

// ============================================================
//  FUNCIÓN: disconnectBluetooth()
//  Desconecta el dispositivo BLE activo
// ============================================================

function disconnectBluetooth() {
  if (state.btDevice && state.btDevice.gatt.connected) {
    state.btDevice.gatt.disconnect();
  }
  onBtDisconnected();
}

// ============================================================
//  FUNCIÓN: onBtDisconnected()
//  Manejador de desconexión (esperada o inesperada)
// ============================================================

function onBtDisconnected() {
  state.btDevice         = null;
  state.btCharacteristic = null;
  setBtStatus('disconnected');
  showToast('📡 Bluetooth desconectado', 'info');
}

// ============================================================
//  FUNCIÓN: sendCommand(cmd)
//  Codifica el string y lo envía via BLE al HM-10
// ============================================================

async function sendCommand(cmd) {
  if (!state.btCharacteristic) {
    // Sin conexión: modo demo (solo actualizar SVG)
    console.log('[Demo] Comando:', cmd.trim());
    return;
  }

  try {
    // Codificar el string a bytes (UTF-8)
    const encoder = new TextEncoder();
    const data    = encoder.encode(cmd);
    await state.btCharacteristic.writeValue(data);
    console.log('✅ Enviado:', cmd.trim());
  } catch (error) {
    console.error('Error al enviar comando:', error);
    showToast('⚠️ Error al enviar comando', 'error');

    // Verificar si la conexión se perdió
    if (!state.btDevice?.gatt.connected) {
      onBtDisconnected();
    }
  }
}

// ============================================================
//  FUNCIÓN: applyColor()
//  Lee el color picker, convierte a RGB y aplica al LED seleccionado
// ============================================================

function applyColor() {
  const hex = colorPicker.value;
  const rgb = hexToRgb(hex);
  if (!rgb) return;

  const led = state.selectedLed;

  // Actualizar estado
  state.ledColors[led] = [rgb.r, rgb.g, rgb.b];

  // Enviar comando Bluetooth
  sendCommand(`COLOR:${led},${rgb.r},${rgb.g},${rgb.b}\n`);

  // Actualizar el SVG
  updateSvgColor(led, rgb.r, rgb.g, rgb.b);

  showToast(`🎨 Color aplicado a ${getLedName(led).split(' ')[1]}`, 'success');
}

// ============================================================
//  FUNCIÓN: applyColorAll()
//  Aplica el color del picker a TODOS los LEDs
// ============================================================

function applyColorAll() {
  const hex = colorPicker.value;
  const rgb = hexToRgb(hex);
  if (!rgb) return;

  // Actualizar estado y SVG para todos los LEDs
  setAllColor(rgb.r, rgb.g, rgb.b);

  showToast(`🌸 Color aplicado a todos los LEDs`, 'success');
}

// ============================================================
//  FUNCIÓN: selectLed(id)
//  Selecciona un LED y actualiza la UI de la flor
// ============================================================

function selectLed(ledIndex) {
  // Quitar selección anterior
  deselectAllSvg();

  state.selectedLed = ledIndex;

  // Actualizar etiqueta
  selectedLabel.textContent = getLedName(ledIndex);

  // Aplicar clase selected al elemento SVG
  const el = getSvgElement(ledIndex);
  if (el) {
    el.classList.add('selected');
  }

  // Activar anillo de selección
  selectionRing.classList.add('active');

  // Sincronizar el color picker con el color actual del LED seleccionado
  const [r, g, b] = state.ledColors[ledIndex];
  colorPicker.value = rgbToHex(r, g, b);

  // Animación de feedback táctil (vibración en mobile)
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  console.log(`💡 LED ${ledIndex} seleccionado`);
}

// ============================================================
//  FUNCIÓN: deselectAllSvg()
//  Quita la clase 'selected' de todos los elementos SVG
// ============================================================

function deselectAllSvg() {
  [svgCenter, svgPetal1, svgPetal2, svgPetal3].forEach((el) => {
    if (el) el.classList.remove('selected');
  });
  selectionRing.classList.remove('active');
}

// ============================================================
//  FUNCIÓN: setAnimation(name)
//  Envía el comando de animación y actualiza botones
// ============================================================

function setAnimation(name) {
  state.currentAnimation = name;

  // Enviar comando
  sendCommand(`ANIM:${name}\n`);

  // Actualizar estilos de botones
  document.querySelectorAll('.anim-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Activar el botón correspondiente
  const animMap = {
    RAINBOW: 'anim-rainbow',
    PULSE:   'anim-pulse',
    SUNSET:  'anim-sunset',
    OCEAN:   'anim-ocean',
    SPARKLE: 'anim-sparkle',
    FIRE:    'anim-fire',
  };

  const btnId = animMap[name];
  if (btnId) {
    const btn = $(btnId);
    if (btn) btn.classList.add('active');
  }

  // Mostrar animación en la flor SVG (efecto demo)
  startSvgAnimation(name);

  const animNames = {
    RAINBOW: '🌈 Arco Iris',
    PULSE:   '💓 Pulso',
    SUNSET:  '🌅 Atardecer',
    OCEAN:   '🌊 Océano',
    SPARKLE: '✨ Centelleo',
    FIRE:    '🔥 Fuego',
  };

  showToast(`${animNames[name] || name} activado`, 'info');
}

// ============================================================
//  FUNCIÓN: setBrightness(val)
//  Ajusta el brillo y envía el comando Bluetooth
// ============================================================

function setBrightness(val) {
  const value = parseInt(val, 10);
  state.brightness = value;

  // Actualizar display del valor
  brightnessValue.textContent = value;

  // Actualizar barra de progreso del slider
  updateSliderFill(value);

  // Enviar comando (con debounce implícito por evento oninput)
  sendCommand(`BRIGHT:${value}\n`);
}

// ============================================================
//  FUNCIÓN: setAllColor(r, g, b)
//  Aplica el mismo color a todos los LEDs
// ============================================================

function setAllColor(r, g, b) {
  // Actualizar estado
  for (let i = 0; i < 4; i++) {
    state.ledColors[i] = [r, g, b];
  }

  // Enviar comando ALL
  sendCommand(`ALL:${r},${g},${b}\n`);

  // Actualizar SVG
  updateSvgColor(0, r, g, b);
  updateSvgColor(1, r, g, b);
  updateSvgColor(2, r, g, b);
  updateSvgColor(3, r, g, b);
}

// ============================================================
//  FUNCIÓN: turnOff()
//  Apaga todos los LEDs
// ============================================================

function turnOff() {
  state.currentAnimation = null;

  // Desactivar todos los botones de animación
  document.querySelectorAll('.anim-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Detener animación SVG demo
  stopSvgAnimation();

  // Enviar comando de apagado
  sendCommand('OFF\n');

  // Oscurecer SVG
  [0, 1, 2, 3].forEach((i) => updateSvgColor(i, 30, 30, 40));

  showToast('⚫ LEDs apagados', 'info');
}

// ============================================================
//  FUNCIÓN: quickColor(hex)
//  Aplica un color de la paleta rápida al LED seleccionado
// ============================================================

function quickColor(hex) {
  colorPicker.value = hex;
  applyColor();
}

// ============================================================
//  FUNCIÓN: updateSvgColor(led, r, g, b)
//  Actualiza el color de un elemento SVG de la flor
// ============================================================

function updateSvgColor(ledIndex, r, g, b) {
  const el = getSvgElement(ledIndex);
  if (!el) return;

  const color = `rgb(${r}, ${g}, ${b})`;

  // Para los pétalos (ellipse), reemplazar el gradiente con color sólido
  el.setAttribute('fill', color);

  // Actualizar resplandor ambiental del SVG según el color dominante
  if (ledIndex === 0) {
    // El centro afecta el glow general de la flor
    const flowerSvg = $('flower-svg');
    if (flowerSvg) {
      flowerSvg.style.filter = `
        drop-shadow(0 0 20px rgba(${r}, ${g}, ${b}, 0.3))
        drop-shadow(0 0 40px rgba(${r}, ${g}, ${b}, 0.15))
      `;
    }
  }
}

// ============================================================
//  FUNCIONES DE ANIMACIÓN SVG (modo demo sin BLE)
// ============================================================

let svgAnimInterval = null;

/** Inicia una animación de demostración en el SVG */
function startSvgAnimation(name) {
  stopSvgAnimation();

  const elements = [svgCenter, svgPetal1, svgPetal2, svgPetal3];
  let frame = 0;

  svgAnimInterval = setInterval(() => {
    frame++;

    switch (name) {
      case 'RAINBOW': {
        elements.forEach((el, i) => {
          if (!el) return;
          const hue = ((frame * 3) + i * 90) % 360;
          el.setAttribute('fill', `hsl(${hue}, 90%, 60%)`);
        });
        break;
      }
      case 'PULSE': {
        const brightness = (Math.sin(frame * 0.08) + 1) / 2;
        elements.forEach((el, i) => {
          if (!el) return;
          const [r, g, b] = state.ledColors[i];
          el.setAttribute('fill', `rgb(${Math.round(r * brightness)}, ${Math.round(g * brightness)}, ${Math.round(b * brightness)})`);
        });
        break;
      }
      case 'SUNSET': {
        const palette = [
          [255, 100, 20],
          [255, 140, 60],
          [255, 80, 120],
          [220, 60, 180],
          [150, 40, 220],
        ];
        elements.forEach((el, i) => {
          if (!el) return;
          const t   = ((frame * 0.5 + i * 20) % 100) / 100;
          const idx = Math.floor(t * (palette.length - 1));
          const frac = t * (palette.length - 1) - idx;
          const c1  = palette[idx];
          const c2  = palette[Math.min(idx + 1, palette.length - 1)];
          const r   = Math.round(c1[0] * (1 - frac) + c2[0] * frac);
          const g   = Math.round(c1[1] * (1 - frac) + c2[1] * frac);
          const b   = Math.round(c1[2] * (1 - frac) + c2[2] * frac);
          el.setAttribute('fill', `rgb(${r},${g},${b})`);
        });
        break;
      }
      case 'OCEAN': {
        const palette = [
          [0, 200, 220],
          [0, 120, 255],
          [0, 200, 160],
          [20, 180, 200],
        ];
        elements.forEach((el, i) => {
          if (!el) return;
          const t   = ((frame * 0.4 + i * 25) % 100) / 100;
          const idx = Math.floor(t * (palette.length - 1));
          const frac = t * (palette.length - 1) - idx;
          const c1  = palette[idx];
          const c2  = palette[Math.min(idx + 1, palette.length - 1)];
          const r   = Math.round(c1[0] * (1 - frac) + c2[0] * frac);
          const g   = Math.round(c1[1] * (1 - frac) + c2[1] * frac);
          const b   = Math.round(c1[2] * (1 - frac) + c2[2] * frac);
          el.setAttribute('fill', `rgb(${r},${g},${b})`);
        });
        break;
      }
      case 'SPARKLE': {
        elements.forEach((el) => {
          if (!el) return;
          el.setAttribute('fill', 'rgb(10,10,20)');
        });
        const rndEl = elements[Math.floor(Math.random() * elements.length)];
        if (rndEl) rndEl.setAttribute('fill', 'rgb(255,255,255)');
        break;
      }
      case 'FIRE': {
        elements.forEach((el) => {
          if (!el) return;
          const r = Math.floor(Math.random() * 80 + 170);
          const g = Math.floor(Math.random() * 60 + 20);
          el.setAttribute('fill', `rgb(${r},${g},0)`);
        });
        break;
      }
    }
  }, 50); // ~20fps para la demo SVG
}

/** Detiene la animación SVG demo */
function stopSvgAnimation() {
  if (svgAnimInterval) {
    clearInterval(svgAnimInterval);
    svgAnimInterval = null;
  }
}

// ============================================================
//  FUNCIÓN: hexToRgb(hex)
//  Convierte un color hex (#rrggbb) a objeto {r, g, b}
// ============================================================

function hexToRgb(hex) {
  // Normalizar: quitar el # y expandir hex corto (#abc → #aabbcc)
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return null;

  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >>  8) & 255,
    b:  num        & 255,
  };
}

// ============================================================
//  FUNCIÓN: rgbToHex(r, g, b)
//  Convierte valores RGB a string hex (#rrggbb)
// ============================================================

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================
//  FUNCIÓN: setBtStatus(status)
//  Actualiza la interfaz de Bluetooth
// ============================================================

function setBtStatus(status) {
  state.btStatus = status;

  // Actualizar el punto de estado
  btStatusDot.className = 'bt-status-dot';
  btConnectBtn.className = 'bt-connect-btn';

  switch (status) {
    case 'connected':
      btStatusDot.classList.add('connected');
      btConnectBtn.classList.add('connected');
      btBtnText.textContent = 'Desconectar';
      btConnectBtn.setAttribute('aria-label', 'Desconectar dispositivo Bluetooth');
      statusIcon.textContent = '🟢';
      statusText.textContent = `Conectado${state.btDevice ? ' a ' + (state.btDevice.name || 'HM-10') : ''}`;
      break;

    case 'connecting':
      btStatusDot.classList.add('connecting');
      btConnectBtn.classList.add('connecting');
      btBtnText.textContent = 'Conectando...';
      statusIcon.textContent = '🟡';
      statusText.textContent = 'Conectando...';
      break;

    case 'disconnected':
    default:
      btBtnText.textContent = 'Conectar';
      btConnectBtn.setAttribute('aria-label', 'Conectar dispositivo Bluetooth');
      deviceNameEl.textContent = 'Sin conectar';
      statusIcon.textContent = '🔴';
      statusText.textContent = 'Sin conexión Bluetooth';
      break;
  }
}

// ============================================================
//  FUNCIÓN: showToast(msg, type)
//  Muestra una notificación temporal
// ============================================================

function showToast(msg, type = 'info') {
  // Cancelar toast anterior si existe
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastEl.textContent = msg;
  toastEl.className   = `toast ${type} show`;

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

// ============================================================
//  FUNCIÓN: showWarningModal()
//  Muestra el modal de advertencia de compatibilidad
// ============================================================

function showWarningModal() {
  $('warning-modal').style.display  = 'block';
  $('modal-overlay').style.display  = 'block';
  $('warning-modal').setAttribute('aria-hidden', 'false');
}

// ============================================================
//  FUNCIÓN: updateSliderFill(value)
//  Actualiza la barra de progreso del slider de brillo
// ============================================================

function updateSliderFill(value) {
  const pct = (value / 255) * 100;
  if (sliderFill) {
    sliderFill.style.width = `${pct}%`;
  }
}

// ============================================================
//  INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Verificar soporte de Web Bluetooth ──
  if (!navigator.bluetooth) {
    console.warn('⚠️ Web Bluetooth API no está disponible en este navegador.');

    // Mostrar advertencia después de un pequeño delay para mejor UX
    setTimeout(() => {
      showWarningModal();
      showToast('⚠️ Bluetooth no compatible con este navegador', 'error');
    }, 800);

    // Deshabilitar botón de conexión
    btConnectBtn.disabled = true;
    deviceNameEl.textContent = 'No compatible';
  } else {
    console.log('✅ Web Bluetooth API disponible');
    showToast('🌸 Flor Arduino lista. Conecta tu dispositivo!', 'info');
  }

  // ── Seleccionar el centro por defecto ──
  selectLed(0);

  // ── Inicializar brillo ──
  updateSliderFill(state.brightness);
  brightnessValue.textContent = state.brightness;
  brightnessSlider.value = state.brightness;

  // ── Aplicar colores iniciales al SVG ──
  state.ledColors.forEach(([r, g, b], i) => {
    updateSvgColor(i, r, g, b);
  });

  // ── Evento: Slider de brillo ──
  brightnessSlider.addEventListener('input', (e) => {
    setBrightness(e.target.value);
  });

  // ── Eventos de teclado para accesibilidad en los pétalos SVG ──
  document.querySelectorAll('.petal-group').forEach((group) => {
    group.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const ledId = group.id.replace('petal-', '').replace('-group', '');
        selectLed(parseInt(ledId, 10));
      }
    });
  });

  // ── Sincronizar color picker al cambiar (sin enviar, solo vista previa) ──
  colorPicker.addEventListener('input', () => {
    // Actualizar el SVG del LED seleccionado como preview en tiempo real
    const rgb = hexToRgb(colorPicker.value);
    if (rgb) {
      const el = getSvgElement(state.selectedLed);
      if (el) {
        el.setAttribute('fill', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      }
    }
  });

  // Si el usuario presiona 'change' (suelta el picker) → aplicar color
  colorPicker.addEventListener('change', () => {
    applyColor();
  });

  console.log('🌸 Flor Arduino JS inicializado correctamente');
});

// ── Limpiar recursos al cerrar la página ──
window.addEventListener('beforeunload', () => {
  stopSvgAnimation();
  if (state.btDevice && state.btDevice.gatt.connected) {
    state.btDevice.gatt.disconnect();
  }
});
