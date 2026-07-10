package com.incubyte.dealership.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "Make is required")
    private String make;
    
    @jakarta.validation.constraints.NotBlank(message = "Model is required")
    private String model;
    
    @jakarta.validation.constraints.NotBlank(message = "Category is required")
    private String category;
    
    @jakarta.validation.constraints.NotNull(message = "Year is required")
    @jakarta.validation.constraints.Min(value = 1886, message = "Invalid year")
    private Integer year;
    
    @jakarta.validation.constraints.NotNull(message = "Price is required")
    @jakarta.validation.constraints.Min(value = 0, message = "Price must be positive")
    private Double price;

    @jakarta.validation.constraints.NotNull(message = "Quantity is required")
    @jakarta.validation.constraints.Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Version
    private Long version;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
