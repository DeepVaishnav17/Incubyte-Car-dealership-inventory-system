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

    public java.util.List<Vehicle> searchVehicles(String make, String model, Integer year) {
        Vehicle probe = new Vehicle();
        probe.setMake(make);
        probe.setModel(model);
        probe.setYear(year);

        org.springframework.data.domain.ExampleMatcher matcher = org.springframework.data.domain.ExampleMatcher.matching()
                .withIgnoreNullValues()
                .withStringMatcher(org.springframework.data.domain.ExampleMatcher.StringMatcher.CONTAINING)
                .withIgnoreCase();

        return vehicleRepository.findAll(org.springframework.data.domain.Example.of(probe, matcher));
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found"));
        existingVehicle.setMake(updatedVehicle.getMake());
        existingVehicle.setModel(updatedVehicle.getModel());
        existingVehicle.setYear(updatedVehicle.getYear());
        existingVehicle.setPrice(updatedVehicle.getPrice());
        return vehicleRepository.save(existingVehicle);
    }

    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new com.incubyte.dealership.exception.ResourceNotFoundException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
    }
}
