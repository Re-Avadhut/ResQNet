# Components Directory

This directory contains ESP-IDF components for the ResQNet firmware project.

ESP-IDF components are modular libraries that can be reused across projects.
Each component typically has its own `CMakeLists.txt` and source files.

## Planned Components

- `capability_descriptor/` - Hardware discovery and JSON generation
- `wifi_manager/` - Wi-Fi AP/STA mode management
- `http_server/` - Captive portal HTTP server
- `mqtt_client/` - Optional MQTT bridge to gateway
- `lora_driver/` - LoRa module driver (SX1276, etc.)
- `gps_driver/` - GPS module driver (NMEA parsing)
- `sensors/` - IMU, temperature, pressure sensor drivers

## Adding a Component

1. Create a directory under `components/`
2. Add `CMakeLists.txt` to the component directory
3. Add source files and headers
4. The component is automatically included by the main CMakeLists.txt
