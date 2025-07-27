package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.model.GSTCategory;
import com.ecommerce.cart.model.ProductCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TaxCalculationServiceTest {

    private TaxCalculationService taxCalculationService;

    @BeforeEach
    void setUp() {
        taxCalculationService = new TaxCalculationService();
    }

    @Test
    void testCalculateTaxForCart_WithMixedItems() {
        // Arrange
        CartItem medicineItem = new CartItem("med-1", "MED001", "Medicine Tablet", ProductCategory.MEDICINE, 2, 100.0f, "INR", GSTCategory.GST_5);
        CartItem shoesItem = new CartItem("shoe-1", "SHOE001", "Nike Shoes", ProductCategory.SHOES, 1, 5000.0f, "INR", GSTCategory.GST_18);
        CartItem luxuryItem = new CartItem("lux-1", "LUX001", "Luxury Watch", ProductCategory.LUXURY, 1, 50000.0f, "INR", GSTCategory.GST_28);

        List<CartItem> items = Arrays.asList(medicineItem, shoesItem, luxuryItem);
        Cart cart = new Cart("customer123", items, 0.0f, 0.0f, 0.0f, "INR");

        // Act
        TaxCalculationService.TaxBreakdown result = taxCalculationService.calculateTaxForCart(cart);

        // Assert
        float expectedSubtotal = (100.0f * 2) + (5000.0f * 1) + (50000.0f * 1); // 55200
        float expectedTax = (200.0f * 0.05f) + (5000.0f * 0.18f) + (50000.0f * 0.28f); // 10 + 900 + 14000 = 14910
        float expectedTotal = expectedSubtotal + expectedTax; // 70110

        assertEquals(expectedSubtotal, result.getSubtotal(), 0.01f);
        assertEquals(expectedTax, result.getTaxAmount(), 0.01f);
        assertEquals(expectedTotal, result.getTotal(), 0.01f);
    }

    @Test
    void testCalculateTaxForCart_WithExemptItems() {
        // Arrange
        CartItem exemptItem = new CartItem("food-1", "FOOD001", "Rice", ProductCategory.FOOD, 5, 50.0f, "INR", GSTCategory.EXEMPT);

        List<CartItem> items = Arrays.asList(exemptItem);
        Cart cart = new Cart("customer123", items, 0.0f, 0.0f, 0.0f, "INR");

        // Act
        TaxCalculationService.TaxBreakdown result = taxCalculationService.calculateTaxForCart(cart);

        // Assert
        float expectedSubtotal = 50.0f * 5; // 250
        float expectedTax = 0.0f; // No tax for exempt items
        float expectedTotal = expectedSubtotal; // 250

        assertEquals(expectedSubtotal, result.getSubtotal(), 0.01f);
        assertEquals(expectedTax, result.getTaxAmount(), 0.01f);
        assertEquals(expectedTotal, result.getTotal(), 0.01f);
    }

    @Test
    void testCalculateTaxForCart_EmptyCart() {
        // Arrange
        Cart cart = new Cart("customer123", Arrays.asList(), 0.0f, 0.0f, 0.0f, "INR");

        // Act
        TaxCalculationService.TaxBreakdown result = taxCalculationService.calculateTaxForCart(cart);

        // Assert
        assertEquals(0.0f, result.getSubtotal(), 0.01f);
        assertEquals(0.0f, result.getTaxAmount(), 0.01f);
        assertEquals(0.0f, result.getTotal(), 0.01f);
    }

    @Test
    void testGSTCategoryDetermination() {
        // Test medicine category
        assertEquals(GSTCategory.GST_5, GSTCategory.determineGSTCategory(ProductCategory.MEDICINE));
        assertEquals(GSTCategory.GST_5, GSTCategory.determineGSTCategory(ProductCategory.FOOD));

        // Test luxury category
        assertEquals(GSTCategory.GST_28, GSTCategory.determineGSTCategory(ProductCategory.LUXURY));
        assertEquals(GSTCategory.GST_28, GSTCategory.determineGSTCategory(ProductCategory.PREMIUM));

        // Test default category
        assertEquals(GSTCategory.GST_18, GSTCategory.determineGSTCategory(ProductCategory.SHOES));
        assertEquals(GSTCategory.GST_18, GSTCategory.determineGSTCategory(ProductCategory.GENERAL));
        
        // Test processed food category
        assertEquals(GSTCategory.GST_12, GSTCategory.determineGSTCategory(ProductCategory.PROCESSED_FOOD));
        assertEquals(GSTCategory.GST_12, GSTCategory.determineGSTCategory(ProductCategory.SERVICE));
    }

}
