import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './App';
import * as api from './api';

// Mock the API module
vi.mock('./api', () => ({
    login: vi.fn(),
    register: vi.fn(),
    getVehicles: vi.fn(() => Promise.resolve([])),
    searchVehicles: vi.fn(),
    getUserRole: vi.fn(() => 'USER'),
}));

describe('App Login Form', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the login form by default', () => {
        render(<App />);
        expect(screen.getByText('Incubyte Dealership')).toBeDefined();
        expect(screen.getByPlaceholderText('Email address')).toBeDefined();
        expect(screen.getByPlaceholderText('Password')).toBeDefined();
    });

    it('requires email and password for login', () => {
        render(<App />);
        const emailInput = screen.getByPlaceholderText('Email address');
        const passwordInput = screen.getByPlaceholderText('Password');
        
        expect(emailInput.hasAttribute('required')).toBe(true);
        expect(passwordInput.hasAttribute('required')).toBe(true);
    });

    it('displays error on failed login', async () => {
        api.login.mockRejectedValueOnce(new Error('Invalid credentials'));
        render(<App />);
        
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeDefined();
        });
    });
});
