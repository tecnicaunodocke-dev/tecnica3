#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔════════════════════════════════════════════════════════════╗
║   🌈 JUEGO DE COLORES PRIMARIOS - Python Tkinter          ║
║                                                            ║
║  Juego educativo simple de preguntas sobre colores        ║
║  10 preguntas - Una pregunta por pantalla                 ║
║  Programación estructurada - Sin clases                   ║
╚════════════════════════════════════════════════════════════╝
"""

import tkinter as tk
from tkinter import messagebox
import random

# ══════════════════════════════════════════════════════════════
#  CONSTANTES
# ══════════════════════════════════════════════════════════════

PREGUNTAS = [
    {
        "pregunta": "¿Qué color resulta de mezclar ROJO y AZUL?",
        "opciones": ["Verde", "Violeta", "Naranja"],
        "respuesta_correcta": "Violeta"
    },
    {
        "pregunta": "¿Qué color resulta de mezclar ROJO y VERDE?",
        "opciones": ["Amarillo", "Violeta", "Naranja"],
        "respuesta_correcta": "Amarillo"
    },
    {
        "pregunta": "¿Qué color resulta de mezclar VERDE y AZUL?",
        "opciones": ["Violeta", "Cyan", "Naranja"],
        "respuesta_correcta": "Cyan"
    },
    {
        "pregunta": "¿Cuál es un color PRIMARIO entre verde, violeta y naranja?",
        "opciones": ["Violeta", "Verde", "Naranja"],
        "respuesta_correcta": "Verde"
    },
    {
        "pregunta": "¿Cuál es un color PRIMARIO entre rojo, rosa y marrón?",
        "opciones": ["Rojo", "Rosa", "Marrón"],
        "respuesta_correcta": "Rojo"
    },
    {
        "pregunta": "¿Cuál es un color PRIMARIO entre azul, celeste y turquesa?",
        "opciones": ["Azul", "Celeste", "Turquesa"],
        "respuesta_correcta": "Azul"
    },
    {
        "pregunta": "¿Qué NO es un color primario?",
        "opciones": ["Rojo", "Naranja", "Verde"],
        "respuesta_correcta": "Naranja"
    },
    {
        "pregunta": "¿Cuál es un color SECUNDARIO?",
        "opciones": ["Azul", "Violeta", "Rojo"],
        "respuesta_correcta": "Violeta"
    },
    {
        "pregunta": "Si mezclas los 3 colores primarios, ¿qué obtienes?",
        "opciones": ["Blanco", "Negro", "Gris"],
        "respuesta_correcta": "Negro"
    },
    {
        "pregunta": "¿De qué colores está formada la BANDERA ARGENTINA?",
        "opciones": ["Azul, Blanco y Rojo", "Verde, Blanco y Rojo", "Celeste, Blanco y Oro"],
        "respuesta_correcta": "Celeste, Blanco y Oro"
    },
]

COLOR_BG_DARK = "#0f172a"
COLOR_BG_MEDIUM = "#16213e"
COLOR_PRIMARY = "#6366f1"
COLOR_CORRECTO = "#10b981"
COLOR_INCORRECTO = "#ef4444"
COLOR_TEXT_PRIMARY = "white"
COLOR_TEXT_SECONDARY = "#a0aec0"

# ══════════════════════════════════════════════════════════════
#  VARIABLES GLOBALES
# ══════════════════════════════════════════════════════════════

ventana = None
label_contador = None
label_pregunta = None
frame_opciones = None
botones_opciones = []

preguntas_actuales = []
indice_actual = 0
respuestas_correctas = 0

# ══════════════════════════════════════════════════════════════
#  FUNCIONES
# ══════════════════════════════════════════════════════════════

def mezclar_opciones(opciones):
    """Mezcla aleatoriamente las opciones"""
    opciones_mezcladas = opciones.copy()
    random.shuffle(opciones_mezcladas)
    return opciones_mezcladas

def obtener_preguntas_aleatorias():
    """Retorna las preguntas mezcladas"""
    preguntas = PREGUNTAS.copy()
    random.shuffle(preguntas)
    return preguntas

def crear_interfaz():
    """Crea la interfaz gráfica"""
    global ventana, label_contador, label_pregunta, frame_opciones
    
    ventana = tk.Tk()
    ventana.title("🌈 JUEGO DE COLORES")
    ventana.geometry("600x500")
    ventana.configure(bg=COLOR_BG_DARK)
    
    # Header
    frame_header = tk.Frame(ventana, bg=COLOR_PRIMARY, height=70)
    frame_header.pack(fill=tk.X)
    frame_header.pack_propagate(False)
    
    titulo = tk.Label(
        frame_header,
        text="🌈 JUEGO DE COLORES",
        font=("Arial", 20, "bold"),
        fg=COLOR_TEXT_PRIMARY,
        bg=COLOR_PRIMARY
    )
    titulo.pack(pady=15)
    
    # Contador
    frame_contador = tk.Frame(ventana, bg=COLOR_BG_MEDIUM)
    frame_contador.pack(fill=tk.X, padx=10, pady=10)
    frame_contador.pack_propagate(False)
    frame_contador.configure(height=40)
    
    label_contador = tk.Label(
        frame_contador,
        text="Pregunta 1/10",
        fg="#60a5fa",
        bg=COLOR_BG_MEDIUM,
        font=("Arial", 12, "bold")
    )
    label_contador.pack(pady=10)
    
    # Pregunta
    frame_pregunta = tk.Frame(ventana, bg=COLOR_BG_DARK)
    frame_pregunta.pack(fill=tk.BOTH, expand=False, padx=10, pady=20)
    
    label_pregunta = tk.Label(
        frame_pregunta,
        text="Cargando pregunta...",
        fg=COLOR_TEXT_PRIMARY,
        bg=COLOR_BG_DARK,
        font=("Arial", 14, "bold"),
        wraplength=550,
        justify=tk.CENTER,
        height=2
    )
    label_pregunta.pack()
    
    # Opciones
    frame_opciones = tk.Frame(ventana, bg=COLOR_BG_DARK)
    frame_opciones.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    return ventana, label_contador, label_pregunta, frame_opciones

def limpiar_opciones():
    """Limpia los botones de opciones anteriores"""
    global botones_opciones
    for widget in frame_opciones.winfo_children():
        widget.destroy()
    botones_opciones = []

def mostrar_pregunta():
    """Muestra la pregunta actual"""
    global indice_actual, preguntas_actuales, label_contador, label_pregunta
    
    if indice_actual >= len(preguntas_actuales):
        return
    
    pregunta = preguntas_actuales[indice_actual]
    pregunta['opciones'] = mezclar_opciones(pregunta['opciones'])
    
    label_contador.config(text=f"Pregunta {indice_actual + 1}/10")
    label_pregunta.config(text=pregunta['pregunta'])
    
    limpiar_opciones()
    crear_botones_opciones(pregunta['opciones'])

def crear_botones_opciones(opciones):
    """Crea los botones de opciones"""
    global botones_opciones
    
    for opcion in opciones:
        btn = tk.Button(
            frame_opciones,
            text=opcion,
            command=lambda opt=opcion: procesar_respuesta(opt),
            bg=COLOR_BG_MEDIUM,
            fg=COLOR_TEXT_PRIMARY,
            font=("Arial", 12, "bold"),
            height=2,
            activebackground=COLOR_PRIMARY,
            relief=tk.RAISED,
            bd=2,
            cursor="hand2"
        )
        btn.pack(fill=tk.BOTH, expand=True, pady=5)
        botones_opciones.append(btn)

def procesar_respuesta(respuesta_usuario):
    """Procesa la respuesta del usuario"""
    global indice_actual, respuestas_correctas, preguntas_actuales
    
    pregunta = preguntas_actuales[indice_actual]
    respuesta_correcta = pregunta['respuesta_correcta']
    
    # Deshabilitar botones
    for btn in botones_opciones:
        btn.config(state=tk.DISABLED)
    
    if respuesta_usuario == respuesta_correcta:
        # Correcto
        for btn in botones_opciones:
            if btn.cget('text') == respuesta_correcta:
                btn.config(bg=COLOR_CORRECTO)
        
        respuestas_correctas += 1
        messagebox.showinfo("✅ ¡Correcto!", "¡Bien sabes de los colores!")
    else:
        # Incorrecto
        for btn in botones_opciones:
            if btn.cget('text') == respuesta_usuario:
                btn.config(bg=COLOR_INCORRECTO)
            elif btn.cget('text') == respuesta_correcta:
                btn.config(bg=COLOR_CORRECTO)
        
        messagebox.showwarning("❌ Incorrecto", "Estudia un poco sobre los colores")
    
    indice_actual += 1
    
    if indice_actual >= len(preguntas_actuales):
        mostrar_resultado_final()
    else:
        ventana.after(500, mostrar_pregunta)

def mostrar_resultado_final():
    """Muestra el resultado final"""
    global respuestas_correctas, indice_actual
    
    correctas = respuestas_correctas
    total = indice_actual
    porcentaje = int((correctas / total) * 100)
    
    if porcentaje >= 80:
        emoji = "🏆"
        mensaje = f"{emoji} ¡EXCELENTE!\nAcertaste {correctas}/{total} preguntas"
    elif porcentaje >= 60:
        emoji = "👍"
        mensaje = f"{emoji} ¡BIEN!\nAcertaste {correctas}/{total} preguntas"
    else:
        emoji = "📚"
        mensaje = f"{emoji} Necesitas estudiar más\nAcertaste {correctas}/{total} preguntas"
    
    messagebox.showinfo("RESULTADO FINAL", mensaje)
    reiniciar_juego()

def reiniciar_juego():
    """Reinicia el juego"""
    global preguntas_actuales, indice_actual, respuestas_correctas
    
    preguntas_actuales = obtener_preguntas_aleatorias()
    indice_actual = 0
    respuestas_correctas = 0
    
    mostrar_pregunta()

def iniciar_juego():
    """Inicia el juego"""
    global preguntas_actuales, indice_actual, respuestas_correctas
    
    preguntas_actuales = obtener_preguntas_aleatorias()
    indice_actual = 0
    respuestas_correctas = 0
    
    mostrar_pregunta()
    ventana.mainloop()

# ══════════════════════════════════════════════════════════════
#  PUNTO DE ENTRADA
# ══════════════════════════════════════════════════════════════

crear_interfaz()
iniciar_juego()
