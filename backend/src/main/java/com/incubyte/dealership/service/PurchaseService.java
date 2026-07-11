package com.incubyte.dealership.service;

import com.incubyte.dealership.entity.Purchase;
import com.incubyte.dealership.repository.PurchaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;

    public PurchaseService(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    /** Admin: all purchases, newest first */
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAllByOrderByPurchaseDateDesc();
    }

    /** User: only their own purchases */
    public List<Purchase> getPurchasesByUser(String email) {
        return purchaseRepository.findByUserEmailOrderByPurchaseDateDesc(email);
    }
}
