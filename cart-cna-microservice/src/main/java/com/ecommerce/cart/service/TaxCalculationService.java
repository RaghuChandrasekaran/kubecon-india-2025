package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.model.GSTCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TaxCalculationService {

    private static final Logger LOG = LoggerFactory.getLogger(TaxCalculationService.class);

    /**
     * Calculates tax breakdown for the entire cart
     */
    public TaxBreakdown calculateTaxForCart(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return new TaxBreakdown(0.0f, 0.0f, 0.0f);
        }

        float totalSubtotal = 0.0f;
        float totalTax = 0.0f;

        LOG.info("Calculating tax for cart with {} items", cart.getItems().size());

        for (CartItem item : cart.getItems()) {
            float itemSubtotal = item.getPrice() * item.getQuantity();
            GSTCategory gstCategory = item.getGstCategory() != null ? item.getGstCategory() : GSTCategory.determineGSTCategory(item.getCategory());

            float itemTax = calculateGST(itemSubtotal, gstCategory.getRate());
            totalSubtotal += itemSubtotal;
            totalTax += itemTax;

            LOG.debug("Item: {}, Category: {}, Subtotal: ₹{}, GST Category: {}, Tax: ₹{}", 
                     item.getTitle(), item.getCategory(), itemSubtotal, gstCategory.getDescription(), itemTax);
        }

        float grandTotal = totalSubtotal + totalTax;

        LOG.info("Tax calculation completed - Subtotal: ₹{}, Tax: ₹{}, Total: ₹{}", 
                totalSubtotal, totalTax, grandTotal);

        return new TaxBreakdown(
                roundToTwoDecimalPlaces(totalSubtotal),
                roundToTwoDecimalPlaces(totalTax),
                roundToTwoDecimalPlaces(grandTotal)
        );
    }

    /**
     * Calculates GST for a given amount and rate
     */
    private float calculateGST(float amount, float gstRate) {
        if (gstRate <= 0) {
            return 0.0f;
        }
        return (amount * gstRate) / 100.0f;
    }

    /**
     * Rounds amount to 2 decimal places
     */
    private float roundToTwoDecimalPlaces(float amount) {
        BigDecimal bd = new BigDecimal(Float.toString(amount));
        bd = bd.setScale(2, RoundingMode.HALF_UP);
        return bd.floatValue();
    }

    /**
     * Inner class to hold tax calculation results
     */
    public static class TaxBreakdown {
        private final float subtotal;
        private final float taxAmount;
        private final float total;

        public TaxBreakdown(float subtotal, float taxAmount, float total) {
            this.subtotal = subtotal;
            this.taxAmount = taxAmount;
            this.total = total;
        }

        public float getSubtotal() {
            return subtotal;
        }

        public float getTaxAmount() {
            return taxAmount;
        }

        public float getTotal() {
            return total;
        }

        @Override
        public String toString() {
            return String.format("TaxBreakdown{subtotal=₹%.2f, taxAmount=₹%.2f, total=₹%.2f}", 
                               subtotal, taxAmount, total);
        }
    }
}
