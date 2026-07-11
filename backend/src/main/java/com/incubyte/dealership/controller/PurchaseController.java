package com.incubyte.dealership.controller;

import com.incubyte.dealership.entity.Purchase;
import com.incubyte.dealership.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@Tag(name = "Purchases", description = "Purchase history APIs")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    /**
     * ADMIN: see ALL purchases across all customers.
     * USER:  see only their own purchases.
     * The JWT role check is handled by Spring Security in SecurityConfig.
     */
    @GetMapping
    @Operation(summary = "Get purchases (Admin: all, User: own)")
    public ResponseEntity<List<Purchase>> getPurchases() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Purchase> purchases = isAdmin
                ? purchaseService.getAllPurchases()
                : purchaseService.getPurchasesByUser(auth.getName());

        return ResponseEntity.ok(purchases);
    }
}
