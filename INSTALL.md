# Instalación Rápida - Matrix Builder Panel

## 🚀 Instalación Sin Compilar (Plug and Play)

El plugin ya está compilado y listo para usar en la **versión 1.0.3**. Solo necesitas copiar el directorio `COMPILADO/` a tu instalación de Grafana.

**Versión actual: 1.0.3** - Corrige error de inicialización que causaba "Cannot read properties of undefined"

### Método 1: Clonar y copiar

```bash
# 1. Clonar el repositorio
git clone https://github.com/davidcmcest/grafana_zabbix_table.git
cd grafana_zabbix_table

# 2. Cambiar a la rama con el plugin compilado
git checkout claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX

# 3. Copiar a Grafana (ajusta la ruta según tu instalación)
sudo cp -r COMPILADO /var/lib/grafana/plugins/matrix-builder-panel

# 4. Reiniciar Grafana
sudo systemctl restart grafana-server
```

### Método 2: Descargar solo el directorio COMPILADO/

```bash
# Descargar archivos compilados directamente
mkdir -p /tmp/matrix-builder
cd /tmp/matrix-builder

# Descargar los archivos
wget https://raw.githubusercontent.com/davidcmcest/grafana_zabbix_table/claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX/COMPILADO/module.js
wget https://raw.githubusercontent.com/davidcmcest/grafana_zabbix_table/claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX/COMPILADO/plugin.json
wget https://raw.githubusercontent.com/davidcmcest/grafana_zabbix_table/claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX/COMPILADO/README.md
wget https://raw.githubusercontent.com/davidcmcest/grafana_zabbix_table/claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX/COMPILADO/LICENSE

# Crear directorio de imágenes
mkdir -p img
cd img
wget https://raw.githubusercontent.com/davidcmcest/grafana_zabbix_table/claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX/COMPILADO/img/logo.svg
cd ..

# Copiar a Grafana
sudo cp -r . /var/lib/grafana/plugins/matrix-builder-panel

# Reiniciar Grafana
sudo systemctl restart grafana-server
```

### Método 3: Docker

Si usas Grafana en Docker:

```bash
# 1. Clonar el repo
git clone https://github.com/davidcmcest/grafana_zabbix_table.git
cd grafana_zabbix_table
git checkout claude/matrix-builder-panel-011CUXcSoGRMfWuArpMEeDCX

# 2. Montar el directorio en el contenedor
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/COMPILADO:/var/lib/grafana/plugins/matrix-builder-panel \
  --name=grafana \
  grafana/grafana:10.0.0
```

O en tu `docker-compose.yml`:

```yaml
version: '3'
services:
  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    volumes:
      - ./COMPILADO:/var/lib/grafana/plugins/matrix-builder-panel
```

## 🔍 Verificar la Instalación

1. Abrir Grafana en tu navegador (http://localhost:3000)
2. Ir a **Configuration** → **Plugins**
3. Buscar "Matrix Builder Panel"
4. Debería aparecer en la lista de plugins instalados

## 📝 Uso Rápido

1. Crear o editar un dashboard
2. Agregar un nuevo panel
3. En la lista de visualizaciones, seleccionar **"Matrix Builder Panel"**
4. Configurar tus queries (Zabbix, Prometheus, etc.)
5. En las opciones del panel:
   - Configurar el grid (filas × columnas)
   - Agregar celdas
   - Configurar binding de datos
   - Configurar thresholds

## 📂 Contenido del Directorio COMPILADO/

```
COMPILADO/
├── module.js          # Plugin compilado (29.6 KB)
├── plugin.json        # Manifest del plugin
├── README.md          # Documentación
├── LICENSE            # Licencia MIT
└── img/
    └── logo.svg       # Logo del plugin
```

## ⚙️ Configuración de Grafana

Si Grafana no carga plugins unsigned, necesitas configurar:

### grafana.ini

```ini
[plugins]
allow_loading_unsigned_plugins = davidcmcest-matrix-builder-panel
```

O como variable de entorno en Docker:

```bash
-e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=davidcmcest-matrix-builder-panel"
```

## 🐛 Troubleshooting

### El plugin no aparece en la lista

1. Verificar que los archivos están en `/var/lib/grafana/plugins/matrix-builder-panel/`
2. Verificar permisos: `sudo chown -R grafana:grafana /var/lib/grafana/plugins/`
3. Reiniciar Grafana: `sudo systemctl restart grafana-server`
4. Revisar logs: `sudo tail -f /var/log/grafana/grafana.log`

### Error "Plugin not signed"

Agregar a `/etc/grafana/grafana.ini`:

```ini
[plugins]
allow_loading_unsigned_plugins = davidcmcest-matrix-builder-panel
```

### El panel aparece en blanco

1. Abrir la consola del navegador (F12)
2. Buscar errores JavaScript
3. Verificar que `module.js` se cargó correctamente
4. Limpiar caché del navegador

## 📚 Documentación Completa

Para documentación detallada, ejemplos y configuración avanzada, ver:
- [README.md](README.md) - Documentación completa
- [examples/](examples/) - Ejemplos de configuración

## 🆘 Soporte

- GitHub Issues: https://github.com/davidcmcest/grafana_zabbix_table/issues
- Autor: David Castro Moreno

## ✅ Requisitos

- Grafana 10.x
- No requiere dependencias adicionales
- Compatible con cualquier datasource de Grafana (Zabbix, Prometheus, InfluxDB, etc.)
