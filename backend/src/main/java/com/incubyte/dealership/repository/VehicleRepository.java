package com.incubyte.dealership.repository;

import com.incubyte.dealership.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v WHERE " +
            "LOWER(v.make) LIKE LOWER(CONCAT('%', :make, '%')) AND " +
            "LOWER(v.category) LIKE LOWER(CONCAT('%', :category, '%')) AND " +
            "v.price >= :minPrice AND " +
            "v.price <= :maxPrice")
    java.util.List<Vehicle> searchVehicles(
            @org.springframework.data.repository.query.Param("make") String make,
            @org.springframework.data.repository.query.Param("category") String category,
            @org.springframework.data.repository.query.Param("minPrice") Double minPrice,
            @org.springframework.data.repository.query.Param("maxPrice") Double maxPrice);
}
