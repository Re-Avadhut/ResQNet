/* Heartbeat & sync task - STUB
 * 
 * Periodically sends capability descriptor and status to gateway.
 * Handles incoming sync commands from gateway.
 * 
 * TODO: Implement HTTP POST to gateway with JSON descriptor.
 * TODO: Implement retry logic with exponential backoff.
 */

#ifndef HEARTBEAT_H
#define HEARTBEAT_H

#include "esp_err.h"

/* Start heartbeat task */
esp_err_t heartbeat_start(void);

/* Stop heartbeat task */
esp_err_t heartbeat_stop(void);

#endif /* HEARTBEAT_H */
