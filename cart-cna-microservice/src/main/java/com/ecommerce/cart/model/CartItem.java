package com.ecommerce.cart.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Shopping cart item details")
public class CartItem  {
    @Schema(description = "Unique identifier for the cart item", example = "cart-1-1")
    private String productId;
    
    @Schema(description = "Product SKU", example = "sku1")
    private String sku;
    
    @Schema(description = "Product title", example = "Nike Shoes")
    private String title;
    
    @Schema(description = "Quantity of the product", example = "1")
    private int quantity;
    
    @Schema(description = "Price per unit", example = "145.0")
    private float price;
    
    @Schema(description = "Currency for the price", example = "USD")
    private String currency;
}
