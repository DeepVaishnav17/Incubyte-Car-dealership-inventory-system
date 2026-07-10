package com.incubyte.dealership.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        vehicleRepository.deleteAll();
    }

    @Test
    void getVehicles_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void addVehicle_withoutToken_fails() throws Exception {
        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2023);
        vehicle.setPrice(25000.0);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/vehicles")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isUnauthorized()); // Or 403 depending on Spring Security defaults
    }

    @Test
    void addVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");

        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake("Honda");
        vehicle.setModel("Civic");
        vehicle.setYear(2024);
        vehicle.setPrice(22000.0);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/vehicles")
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.make").value("Honda"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void updateVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        
        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake("Ford");
        vehicle.setModel("Focus");
        vehicle.setYear(2020);
        vehicle.setPrice(15000.0);
        vehicle = vehicleRepository.save(vehicle);

        vehicle.setPrice(14000.0);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/vehicles/" + vehicle.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(14000.0));
    }

    @Test
    void updateVehicle_notFound() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        
        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake("Ford");
        vehicle.setModel("Focus");
        vehicle.setYear(2020);
        vehicle.setPrice(15000.0);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/vehicles/99999")
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicle)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteVehicle_withValidToken_success() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");
        
        com.incubyte.dealership.entity.Vehicle vehicle = new com.incubyte.dealership.entity.Vehicle();
        vehicle.setMake("Tesla");
        vehicle.setModel("Model 3");
        vehicle.setYear(2023);
        vehicle.setPrice(40000.0);
        vehicle = vehicleRepository.save(vehicle);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/vehicles/" + vehicle.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        org.junit.jupiter.api.Assertions.assertFalse(vehicleRepository.existsById(vehicle.getId()));
    }

    @Test
    void deleteVehicle_notFound() throws Exception {
        String token = jwtUtil.generateToken("test@example.com", "USER");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/vehicles/99999")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
