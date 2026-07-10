package com.incubyte.dealership.service;

import com.incubyte.dealership.entity.User;
import com.incubyte.dealership.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_hashesPassword() {
        User user = new User();
        user.setEmail("test@example.com");
        String rawPassword = "securePassword";
        user.setPassword(rawPassword);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        User savedUser = authService.register(user);

        verify(passwordEncoder).encode(rawPassword);
        assertEquals("hashedPassword", savedUser.getPassword());
        assertNotEquals(rawPassword, savedUser.getPassword());
    }
}
