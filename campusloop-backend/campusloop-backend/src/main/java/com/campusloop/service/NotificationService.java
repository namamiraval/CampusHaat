package com.campusloop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    @Async
    public void logNewListing(String title, String sellerEmail) {
        // Prototype demonstration of a background task. Replace with email/in-app notifications later.
        log.info("[ASYNC NOTIFICATION] New listing '{}' created by {}", title, sellerEmail);
    }
}
