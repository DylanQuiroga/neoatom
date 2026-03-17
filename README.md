# NeoAtom - Simulador y Visualizador Atómico

NeoAtom es una aplicación web interactiva desarrollada en React y Three.js que permite a los usuarios construir átomos partícula por partícula y visualizar su estructura de forma dinámica tanto en 3D como en 2D. Es una herramienta poderosa diseñada para la exploración visual de los elementos químicos, sus isótopos e iones.

## 🚀 Características Principales

*   **Visualización Dual (3D y 2D):**
    *   **Vista 3D:** Renderizado avanzado utilizando `react-three-fiber` con postprocesamiento (efectos luminosos tipo Bloom) para un atractivo visual estelar. Las órbitas de los electrones, la rotación global y el núcleo animado interactúan físicamente en tiempo real.
    *   **Vista 2D:** Renderizado esquemático y optimizado en SVG, que presenta una comprensión plana, estructurada e intuitiva de las capas electrónicas y el núcleo, que incluye autoescalado y zoom inteligente con la rueda del ratón (Scroll).
*   **Constructor Interactivo Inmersivo:**
    *   Suma y resta protones, neutrones y electrones libremente.
    *   Mecánica Drag-and-Drop (Arrastrar y Soltar) para lanzar partículas al lienzo y añadirlas fluidamente.
    *   El sistema calcula en directo la carga neta, número másico e identifica automáticamente el elemento actual de la tabla periódica, así como iones y estados exóticos (ej. *Partícula Alfa*, *Neutrón Libre*).
*   **HUD Frontal "Glassmorphism":**
    *   Botones ocultables automáticamente mediante doble toque o botón directo ("Ocultar UI") para obtener una captura de pantalla limpia o uso en presentaciones.
    *   Lista unificada de elementos prediseñados para cargar átomos de un solo clic.
    *   Ventana modal informativa enriquecida que abre en detalle todos los datos del elemento (`ElementDetailsModal`).
*   **Alertas de Peligrosidad (Hazards):** Una vez formado un elemento representativo, el sistema muestra visualmente alertas GHS (Inflamable, Corrosivo, Tóxico y Radiactivo) si aplica, reaccionando al estado actual.
*   **Control Total del Motor:** A través del panel de ajustes, el usuario puede pausar las simulaciones, acelerar y ralentizar la velocidad orbital, y forzar la alineación en "órbitas planas" para una previsualización de Bohr estática en 3D.

## 🛠️ Tecnologías y Librerías Utilizadas

*   **Core / Marco:** React 18, TypeScript, y Vite.
*   **Renderizado de Gráficos 3D:**
    *   Three.js
    *   `@react-three/fiber` (Adaptador imperativo de Three hacia la arquitectura declarativa de React)
    *   `@react-three/drei` (Adiciones de utilidad como `OrbitControls` y el `PerformanceMonitor`).
    *   `@react-three/postprocessing` (Para el Bloom reactivo y brillante basado en la luminancia).
*   **Gestión del Estado Global:** Zustand. Encargado de mantener la persistencia y predictibilidad del núcleo atómico a través del árbol de componentes.
*   **CSS y Estilización:** Tailwind CSS para la interfaz tipo "Glass" responsive y transiciones CSS optimizadas.
*   **Iconografía:** Lucide-React.

## 📂 Estructura Principal del Proyecto

*   `src/store/useAtomStore.ts`: Núcleo lógico de la aplicación (Zustand). Define la tipología, el estado en bruto de las partículas y los disparadores de cambio de estado (Pausar, velocidad, cargar átomo, resetear).
*   `src/components/3d/scene.tsx`: Componente principal del Canvas 3D. Calcula y dibuja los componentes atómicos en el espacio tridimensional mediante el empaquetamiento optimizado de las esferas de nucleones y determina las mallas instanciadas (InstancedMesh) para mantener 60fps constantes independientemente de los protones.
*   `src/components/ui/Atom2D.tsx`: Esquema paramétrico en SVG que mapea las capas atómicas bidimensionales utilizando fórmulas de capacidad electrónica máxima (2n²).
*   `src/components/ui/overlayhud.tsx`: Interfaz gráfica interactiva y distribuidores de partículas anclados. Interpreta variables del almacén de Zustand y provee de feedback en tiempo alfanumérico al usuario.
*   `src/utils/elements.ts` & `src/data/`: Proveedores de datos duros que actúan como la Wikipedia integrada, conteniendo diccionarios sobre información atómica masiva y peligros.
*   `src/App.tsx`: Contenedor "Wrapper" raíz, orquestador de Layouts alternando un fondo flexbox negro que contiene al motor de render activo e inyecta la capa de vista HUD.

## 💻 Instalación y Ejecución Local

Para ejecutar tu propia instancia de NeoAtom de forma local:

1.  Asegúrate de tener Node.js instalado (v18 o superior recomendado) junto a `npm` o `yarn`.
2.  Desde la raíz del repositorio, instala recursivamente las dependencias del proyecto:
    ```bash
    yarn install
    # o si prefieres npm:
    npm install
    ```
3.  Arranca el servidor local de desarrollo impulsado por Vite:
    ```bash
    yarn dev
    # npm run dev
    ```
4.  Tu terminal te indicará una IP de red local o puerto local (por defecto `http://localhost:5173`). Haz click sobre ella para probar el sistema en tu navegador.
5.  _(Opcional)_ Para construcción a producción, ejecuta `yarn build`, lo que compilará un paquete optimizado en la carpeta `/dist/`.

## 🎮 Guía de Controles
*   **Agregar partículas (Click):** Haz click en los polos [+] y [-] de los dispensadores rojo, azul y amarillo de la interfaz.
*   **Agregar partículas (Drag):** Arrastra el centro de las esferas grandes desde cada dispensador dentro de la propia pantalla al vacío para soltar y que el sistema procese un DROP de nueva partícula.
*   **Navegación espacial (Vista 3D):** Mantén pulsado y arrastra el Click Derecho de tu ratón para orbitar dinámicamente el núcleo. Utiliza la rueda del ratón (Scroll) para alejarte de la molécula generada.
*   **Retorno automático:** Dispone de un mecanismo que previene quedarte estancado; si ocultas los botones, pulsa **dos veces la pantalla (Doble Tap/Click)** o presiona literalmente cualquier tecla para que los módulos reaparezcan a la vista.
