package com.incubyte.dealership.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasSize;

@SpringBootTest
@AutoConfigureMockMvc
public class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private com.incubyte.dealership.security.JwtUtil jwtUtil;

    @Autowired
    private com.incubyte.dealership.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.incubyte.dealership.service.VehicleService vehicleService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        vehicleRepository.deleteAll();
    }

    private com.incubyte.dealership.entity.Vehicle createValidVehicle(String make, String category, int quantity, double price) {
        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake(make);
        vehicle.setModel("TestModel");
        vehicle.setCategory(category);
        vehicle.setYear(2023);
        vehicle.setPrice(price);
        vehicle.setQuantity(quantity);
        return vehicle;
    }

    @Test
    void getVehicles_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void addVehicle_withoutToken_fails() throws Exception {
        com.incubyte.dealership.entity.Vehicle vehicle = createValidVehicle("Toyota", "SUV", 5, 25000.0);

        mockMvc.perform(post("/api/vehicles")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void addVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        com.incubyte.dealership.entity.Vehicle vehicle = createValidVehicle("Honda", "Sedan", 10, 22000.0);

        mockMvc.perform(post("/api/vehicles")
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.make").value("Honda"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void addVehicle_withInvalidPayload_returnsBadRequest() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        com.incubyte.dealership.entity.Vehicle invalidVehicle = createValidVehicle("", "Sedan", -5, -22000.0); // Blank make, negative quantity and price

        mockMvc.perform(post("/api/vehicles")
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidVehicle)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        com.incubyte.dealership.entity.Vehicle vehicle = vehicleRepository.save(createValidVehicle("Ford", "Hatchback", 2, 15000.0));

        vehicle.setPrice(14000.0);

        mockMvc.perform(put("/api/vehicles/" + vehicle.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(14000.0));
    }

    @Test
    void deleteVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("admin@example.com", "ADMIN");
        com.incubyte.dealership.entity.Vehicle vehicle = vehicleRepository.save(createValidVehicle("Tesla", "EV", 1, 40000.0));

        mockMvc.perform(delete("/api/vehicles/" + vehicle.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        org.junit.jupiter.api.Assertions.assertFalse(vehicleRepository.existsById(vehicle.getId()));
    }

    @Test
    void searchVehicles_withParameters_returnsMatches() throws Exception {
        vehicleRepository.save(createValidVehicle("Honda", "Sedan", 5, 18000.0));
        vehicleRepository.save(createValidVehicle("Honda", "SUV", 2, 25000.0));
        vehicleRepository.save(createValidVehicle("Toyota", "Sedan", 3, 19000.0));

        // Test filtering by Make
        mockMvc.perform(get("/api/vehicles/search?make=Honda"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // Test filtering by Category
        mockMvc.perform(get("/api/vehicles/search?category=SUV"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // Test filtering by Price Range
        mockMvc.perform(get("/api/vehicles/search?minPrice=10000&maxPrice=19500"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
                
        // Test no results
        mockMvc.perform(get("/api/vehicles/search?make=Ferrari"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void purchaseVehicle_success_decreasesQuantity() throws Exception {
        com.incubyte.dealership.entity.Vehicle v = vehicleRepository.save(createValidVehicle("Ford", "Coupe", 2, 35000.0));
        String token = jwtUtil.generateToken("test@example.com", "USER");

        mockMvc.perform(post("/api/vehicles/" + v.getId() + "/purchase")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(1));
    }

    @Test
    void purchaseVehicle_alreadyZero_fails() throws Exception {
        com.incubyte.dealership.entity.Vehicle v = vehicleRepository.save(createValidVehicle("Ford", "Coupe", 0, 35000.0));
        String token = jwtUtil.generateToken("test@example.com", "USER");

        mockMvc.perform(post("/api/vehicles/" + v.getId() + "/purchase")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void restockVehicle_nonAdmin_fails() throws Exception {
        com.incubyte.dealership.entity.Vehicle v = vehicleRepository.save(createValidVehicle("Ford", "Coupe", 0, 35000.0));
        String token = jwtUtil.generateToken("user@example.com", "USER");

        mockMvc.perform(post("/api/vehicles/" + v.getId() + "/restock?amount=5")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void restockVehicle_admin_success() throws Exception {
        com.incubyte.dealership.entity.Vehicle v = vehicleRepository.save(createValidVehicle("Ford", "Coupe", 0, 35000.0));
        String token = jwtUtil.generateToken("admin@example.com", "ADMIN");

        mockMvc.perform(post("/api/vehicles/" + v.getId() + "/restock?amount=5")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    void purchaseVehicle_concurrentAttempts_throwsOptimisticLockException() throws Exception {
        com.incubyte.dealership.entity.Vehicle v = vehicleRepository.save(createValidVehicle("Chevy", "Truck", 1, 30000.0));
        
        // Load the same vehicle twice to simulate concurrent transactions
        com.incubyte.dealership.entity.Vehicle tx1 = vehicleRepository.findById(v.getId()).get();
        com.incubyte.dealership.entity.Vehicle tx2 = vehicleRepository.findById(v.getId()).get();

        // Transaction 1 purchases
        tx1.setQuantity(tx1.getQuantity() - 1);
        vehicleRepository.saveAndFlush(tx1); // This increments version from 0 to 1

        // Transaction 2 purchases (still holding version 0)
        tx2.setQuantity(tx2.getQuantity() - 1);
        
        org.junit.jupiter.api.Assertions.assertThrows(org.springframework.orm.ObjectOptimisticLockingFailureException.class, () -> {
            vehicleRepository.saveAndFlush(tx2);
        });
    }
}
