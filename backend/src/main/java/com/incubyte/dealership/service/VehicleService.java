package com.incubyte.dealership.service;

import com.incubyte.dealership.entity.Vehicle;
import com.incubyte.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public java.util.List<Vehicle> searchVehicles(String make, String category, Double minPrice, Double maxPrice) {
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
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));
        existingVehicle.setMake(updatedVehicle.getMake());
        existingVehicle.setModel(updatedVehicle.getModel());
        existingVehicle.setCategory(updatedVehicle.getCategory());
        existingVehicle.setYear(updatedVehicle.getYear());
        existingVehicle.setPrice(updatedVehicle.getPrice());
        existingVehicle.setQuantity(updatedVehicle.getQuantity());
        return vehicleRepository.save(existingVehicle);
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
        return vehicleRepository.save(vehicle);
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
