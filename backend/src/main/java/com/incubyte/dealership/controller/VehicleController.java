package com.incubyte.dealership.controller;

import com.incubyte.dealership.entity.Vehicle;
import com.incubyte.dealership.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@Tag(name = "Vehicles", description = "Vehicle management APIs")
public class VehicleController {
    
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    @Operation(summary = "Get all vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @org.springframework.web.bind.annotation.GetMapping("/search")
    public ResponseEntity<java.util.List<Vehicle>> searchVehicles(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String make,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Double minPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Double maxPrice) {
        return ResponseEntity.ok(vehicleService.searchVehicles(make, category, minPrice, maxPrice));
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<Vehicle> addVehicle(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody Vehicle vehicle) {
        Vehicle savedVehicle = vehicleService.addVehicle(vehicle);
        return new ResponseEntity<>(savedVehicle, org.springframework.http.HttpStatus.CREATED);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@org.springframework.web.bind.annotation.PathVariable Long id, @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@org.springframework.web.bind.annotation.PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/purchase")
    public ResponseEntity<Vehicle> purchaseVehicle(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.purchaseVehicle(id));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/restock")
    public ResponseEntity<Vehicle> restockVehicle(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam int amount) {
        return ResponseEntity.ok(vehicleService.restockVehicle(id, amount));
    }
}
