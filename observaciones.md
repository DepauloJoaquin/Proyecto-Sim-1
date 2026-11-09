### 1. Observación previa a Spatial Hashing

Al superar las 3700 partículas activas, la detección directa de interacciones y los recorridos anidados, como la actualización de temperatura, generaron más de 560.000 comparaciones por frame. Esto elevó el tiempo de procesamiento a aproximadamente 48 ms y redujo el rendimiento a 20 FPS, evidenciando problemas de escalabilidad.

### 2. Observación posterior a Spatial Hashing

Tras implementar Spatial Hashing, las comprobaciones de interacción entre agua y lava disminuyeron de más de 560.000 a solo 33 por frame, con 3780 partículas activas, representando una reducción superior al 99,99 %. Sin embargo, el rendimiento global se mantuvo limitado a aproximadamente 15 FPS y 53,50 ms por frame, lo que indica la presencia de otros procesos costosos dentro de la simulación.