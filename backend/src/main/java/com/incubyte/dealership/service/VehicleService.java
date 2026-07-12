package com.incubyte.dealership.service;

import com.incubyte.dealership.entity.Purchase;
import com.incubyte.dealership.entity.Vehicle;
import com.incubyte.dealership.repository.PurchaseRepository;
import com.incubyte.dealership.repository.UserRepository;
import com.incubyte.dealership.repository.VehicleRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          PurchaseRepository purchaseRepository,
                          UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> searchVehicles(String make, String category, Double minPrice, Double maxPrice) {
        if (make == null) make = "";
        if (category == null) category = "";
        if (minPrice == null) minPrice = 0.0;
        if (maxPrice == null) maxPrice = Double.MAX_VALUE;
        return vehicleRepository.searchVehicles(make, category, minPrice, maxPrice);
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));
        existing.setMake(updatedVehicle.getMake());
        existing.setModel(updatedVehicle.getModel());
        existing.setCategory(updatedVehicle.getCategory());
        existing.setYear(updatedVehicle.getYear());
        existing.setPrice(updatedVehicle.getPrice());
        existing.setQuantity(updatedVehicle.getQuantity());
        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    public Vehicle purchaseVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));

        if (vehicle.getQuantity() <= 0) {
            throw new com.incubyte.dealership.exception.BadRequestException("Vehicle is out of stock");
        }

        vehicle.setQuantity(vehicle.getQuantity() - 1);
        Vehicle saved = vehicleRepository.save(vehicle);

        // Record purchase — get logged-in user's email from JWT context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            Purchase purchase = new Purchase();
            purchase.setVehicle(saved);
            purchase.setUser(user);
            purchase.setPurchasePrice(saved.getPrice());
            purchase.setPurchaseDate(LocalDateTime.now());
            purchase.setPaymentStatus("PAID");
            purchase.setOrderStatus("CONFIRMED");
            purchaseRepository.save(purchase);
        });

        return saved;
    }

    public Vehicle restockVehicle(Long id, int amount) {
        if (amount <= 0) {
            throw new com.incubyte.dealership.exception.BadRequestException("Restock amount must be positive");
        }
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));
        vehicle.setQuantity(vehicle.getQuantity() + amount);
        return vehicleRepository.save(vehicle);
    }
}
