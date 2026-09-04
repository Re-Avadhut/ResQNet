/* Captive portal implementation - STUB
 * 
 * Sets up Wi-Fi AP mode and HTTP server for:
 * - Node configuration (SSID, gateway URL, node ID)
 * - Capability discovery endpoint
 * - Network diagnostics
 * 
 * TODO: Implement Wi-Fi AP init, HTTP handlers, DNS redirect.
 */

#ifndef CAPTIVE_PORTAL_H
#define CAPTIVE_PORTAL_H

#include "esp_err.h"

/* Initialize Wi-Fi in AP mode with captive portal */
esp_err_t captive_portal_init(void);

/* Start HTTP server with captive portal handlers */
esp_err_t captive_portal_start(void);

/* Stop HTTP server */
esp_err_t captive_portal_stop(void);

#endif /* CAPTIVE_PORTAL_H */
