package com.ecommerce.cart.model;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Schema(description = "Shopping cart information")
public class Cart {
    @Schema(description = "Customer ID associated with the cart", example = "customer123")
    private String customerId;
    
    @Schema(description = "List of items in the cart")
    private List<CartItem> items;
    
    @Schema(description = "Subtotal price of all items before tax", example = "145.0")
    private float subtotal;
    
    @Schema(description = "Total tax amount (GST)", example = "26.1")
    private float taxAmount;
    
    @Schema(description = "Total price including tax", example = "171.1")
    private float total;
    
    @Schema(description = "Currency for the cart", example = "INR")
    private String currency;
    
    @Schema(description = "Shipping method selected", example = "standard")
    private String shippingMethod;
    
    @Schema(description = "Shipping cost", example = "99.0")
    private float shippingCost;
}
