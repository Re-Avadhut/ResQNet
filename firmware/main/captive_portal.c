/* Captive portal implementation - STUB */

#include "captive_portal.h"
#include "esp_log.h"

static const char *TAG = "captive_portal";

/* TODO: Implement Wi-Fi AP initialization */
esp_err_t captive_portal_init(void) {
    ESP_LOGI(TAG, "TODO: Wi-Fi AP mode initialization");
    return ESP_OK;
}

/* TODO: Implement HTTP server with portal handlers */
esp_err_t captive_portal_start(void) {
    ESP_LOGI(TAG, "TODO: Start HTTP captive portal");
    return ESP_OK;
}

/* TODO: Implement HTTP server stop */
esp_err_t captive_portal_stop(void) {
    ESP_LOGI(TAG, "TODO: Stop HTTP captive portal");
    return ESP_OK;
}
