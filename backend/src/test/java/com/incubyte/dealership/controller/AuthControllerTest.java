package com.incubyte.dealership.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incubyte.dealership.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.incubyte.dealership.repository.UserRepository userRepository;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerUser_success() throws Exception {
        User user = new User();
        user.setEmail("newuser@example.com");
        user.setPassword("secure123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated());
    }

    @Test
    void registerUser_duplicateEmail_fails() throws Exception {
        User user = new User();
        user.setEmail("duplicate@example.com");
        user.setPassword("secure123");

        // Register first time
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated());

        // Register second time
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginUser_success() throws Exception {
        User user = new User();
        user.setEmail("login@example.com");
        user.setPassword("secure123");

        // Pre-register user for login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated());

        // Login user
        User loginUser = new User();
        loginUser.setEmail("login@example.com");
        loginUser.setPassword("secure123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk());
    }

    @Test
    void loginUser_invalidCreds_fails() throws Exception {
        User loginUser = new User();
        loginUser.setEmail("nonexistent@example.com");
        loginUser.setPassword("wrong123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isUnauthorized());
    }
}
