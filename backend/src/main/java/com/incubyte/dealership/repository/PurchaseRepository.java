package com.incubyte.dealership.repository;

import com.incubyte.dealership.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    // All purchases (for admin)
    List<Purchase> findAllByOrderByPurchaseDateDesc();
    // Purchases by a specific user (for user's own history)
    List<Purchase> findByUserEmailOrderByPurchaseDateDesc(String email);
}
