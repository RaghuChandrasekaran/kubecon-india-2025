package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.model.GSTCategory;
import com.ecommerce.cart.model.ProductCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceShippingTest {

    @Mock
    private ReactiveRedisTemplate<String, Cart> redisTemplate;

    @Mock
    private ReactiveValueOperations<String, Cart> valueOperations;

    @Mock
    private TaxCalculationService taxCalculationService;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        cartService = new CartService(redisTemplate);
        // Use reflection to inject the tax service
        try {
            var field = CartService.class.getDeclaredField("taxCalculationService");
            field.setAccessible(true);
            field.set(cartService, taxCalculationService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void testUpdateShippingMethod_Success() {
        // Given
        String customerId = "customer123";
        String shippingMethod = "standard";
        float shippingCost = 99.0f;

        Cart existingCart = new Cart();
        existingCart.setCustomerId(customerId);
        existingCart.setItems(List.of(
            createCartItem("product1", 2, 100.0f)
        ));

        TaxCalculationService.TaxBreakdown taxBreakdown = 
            new TaxCalculationService.TaxBreakdown(200.0f, 36.0f, 236.0f);

        when(valueOperations.get(customerId)).thenReturn(Mono.just(existingCart));
        when(taxCalculationService.calculateTaxForCart(any(Cart.class))).thenReturn(taxBreakdown);
        when(valueOperations.set(eq(customerId), any(Cart.class))).thenReturn(Mono.just(true));

        // When & Then
        StepVerifier.create(cartService.updateShippingMethod(customerId, shippingMethod, shippingCost))
                .expectNextMatches(cart -> {
                    return cart.getShippingMethod().equals(shippingMethod) &&
                           cart.getShippingCost() == shippingCost &&
                           cart.getSubtotal() == 200.0f &&
                           cart.getTaxAmount() == 36.0f &&
                           cart.getTotal() == 335.0f; // 236 + 99
                })
                .verifyComplete();
    }

    @Test
    void testUpdateShippingMethod_CartNotFound() {
        // Given
        String customerId = "nonexistent";
        String shippingMethod = "standard";
        float shippingCost = 99.0f;

        when(valueOperations.get(customerId)).thenReturn(Mono.empty());

        // When & Then
        StepVerifier.create(cartService.updateShippingMethod(customerId, shippingMethod, shippingCost))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Cart not found"))
                .verify();
    }

    @Test
    void testUpdateShippingMethod_InvalidInput() {
        // Test null customer ID
        StepVerifier.create(cartService.updateShippingMethod(null, "standard", 99.0f))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Customer ID is required"))
                .verify();

        // Test empty shipping method
        StepVerifier.create(cartService.updateShippingMethod("customer123", "", 99.0f))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Shipping method is required"))
                .verify();

        // Test negative shipping cost
        StepVerifier.create(cartService.updateShippingMethod("customer123", "standard", -10.0f))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Shipping cost cannot be negative"))
                .verify();
    }

    private CartItem createCartItem(String productId, int quantity, float price) {
        CartItem item = new CartItem();
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setPrice(price);
        item.setCategory(ProductCategory.GENERAL);
        item.setGstCategory(GSTCategory.GST_18);
        item.setCurrency("INR");
        return item;
    }
}
