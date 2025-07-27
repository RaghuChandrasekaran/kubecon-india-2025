package com.ecommerce.cart.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "GST categories as per Indian tax system")
public enum GSTCategory {
    @Schema(description = "No GST - Essential items like basic food grains")
    EXEMPT(0.0f, "Exempt"),
    
    @Schema(description = "5% GST - Essential items like medicines, daily use items")
    GST_5(5.0f, "5% GST"),
    
    @Schema(description = "12% GST - Processed foods, medicines")
    GST_12(12.0f, "12% GST"),
    
    @Schema(description = "18% GST - Most goods and services")
    GST_18(18.0f, "18% GST"),
    
    @Schema(description = "28% GST - Luxury items, automobiles, tobacco")
    GST_28(28.0f, "28% GST");

    private final float rate;
    private final String description;

    GSTCategory(float rate, String description) {
        this.rate = rate;
        this.description = description;
    }

    public float getRate() {
        return rate;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Determines GST category based on product category enum
     * This provides more accurate GST classification based on structured categories
     */
    public static GSTCategory determineGSTCategory(ProductCategory productCategory) {
        if (productCategory == null) {
            return GST_18; // Default
        }
        
        switch (productCategory) {
            // Essential items - 5% GST
            case MEDICINE:
            case MEDICAL:
            case FOOD:
            case GROCERY:
                return GST_5;
            
            // Processed foods and certain services - 12% GST
            case PROCESSED_FOOD:
            case SERVICE:
                return GST_12;
            
            // Luxury items and automobiles - 28% GST
            case LUXURY:
            case PREMIUM:
            case AUTOMOBILE:
            case CAR:
            case TOBACCO:
                return GST_28;
            
            // Most goods and services - 18% GST (default)
            case SHOES:
            case ELECTRONICS:
            case MOBILES:
            case APPLIANCES:
            case FASHION:
            case TOYS:
            case GENERAL:
            default:
                return GST_18;
        }
    }
}
