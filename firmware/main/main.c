/* ResQNet Rescue Node Firmware - ESP-IDF (C)
 * 
 * Main entry point for ESP32-WROOM rescue node.
 * 
 * Responsibilities:
 * - Initialize Wi-Fi AP mode
 * - Start captive portal for configuration
 * - Discover hardware capabilities
 * - Generate capability descriptor JSON
 * - Send heartbeats to gateway
 * - Handle sync events via WebSocket/HTTP
 */

#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

#include "captive_portal.h"
#include "heartbeat.h"

/* TODO: Implement main initialization */
void app_main(void) {
    /* 1. Initialize NVS for persistent storage */
    nvs_flash_init();
    
    /* 2. Initialize networking stack */
    esp_netif_init();
    esp_event_loop_create_default();
    
    /* 3. Initialize Wi-Fi in AP mode */
    /* TODO: wifi_init_ap() - see captive_portal.c */
    
    /* 4. Discover hardware capabilities (GPS, camera, IMU, LoRa, etc.) */
    /* TODO: capabilities_discover() - build JSON descriptor */
    
    /* 5. Start captive portal HTTP server */
    /* TODO: captive_portal_start() - see captive_portal.c */
    
    /* 6. Start heartbeat task (sends capability descriptor + status) */
    /* TODO: heartbeat_start() - see heartbeat.c */
    
    printf("ResQNet Rescue Node initialized.\n");
}
