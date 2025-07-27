package com.ecommerce.cart.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Product categories for e-commerce items")
public enum ProductCategory {
    @Schema(description = "Medicines and medical supplies")
    MEDICINE("Medicine"),
    
    @Schema(description = "Medical equipment and devices")
    MEDICAL("Medical"),
    
    @Schema(description = "Food items and groceries")
    FOOD("Food"),
    
    @Schema(description = "Grocery items")
    GROCERY("Grocery"),
    
    @Schema(description = "Footwear including shoes, sandals, etc.")
    SHOES("Shoes"),
    
    @Schema(description = "Electronics and electronic devices")
    ELECTRONICS("Electronics"),
    
    @Schema(description = "Mobile phones and accessories")
    MOBILES("Mobiles"),
    
    @Schema(description = "Home appliances")
    APPLIANCES("Appliances"),
    
    @Schema(description = "Fashion items including clothing, accessories")
    FASHION("Fashion"),
    
    @Schema(description = "Toys and games")
    TOYS("Toys"),
    
    @Schema(description = "Automobiles and automotive parts")
    AUTOMOBILE("Automobile"),
    
    @Schema(description = "Cars and vehicles")
    CAR("Car"),
    
    @Schema(description = "Luxury items and premium products")
    LUXURY("Luxury"),
    
    @Schema(description = "Premium branded products")
    PREMIUM("Premium"),
    
    @Schema(description = "Tobacco products")
    TOBACCO("Tobacco"),
    
    @Schema(description = "Processed food items")
    PROCESSED_FOOD("Processed Food"),
    
    @Schema(description = "Services")
    SERVICE("Service"),
    
    @Schema(description = "General items not falling under specific categories")
    GENERAL("General");

    private final String displayName;

    ProductCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
